// Imports

const express = require('express')
const fs = require('fs');
const url = require('url')
const app = express()
const bodyParser = require('body-parser');
const jwt_decode = require('jwt-decode')
const cors = require('cors')
const admin = require("firebase-admin");
const { google } = require('googleapis');
const moment = require('moment');

// Middlewares

app.use(bodyParser.json());

app.use(cors({origin: '*'}))

/// Firebase Admin

const serviceAccount = JSON.parse(fs.readFileSync('credentials/firebase_service_account.json').toString())
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Google APIs

const credentials = JSON.parse(fs.readFileSync('credentials/oauth2_client.json').toString())
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "postmessage");

// Endpoints

app.get('/api/login', async (req, res, next) => {
  try {
    let q = url.parse(req.url, true).query;
    let { tokens } = await oAuth2Client.getToken(q.code);
    oAuth2Client.setCredentials(tokens);

    const user = jwt_decode(tokens.id_token)
    if('refresh_token' in tokens){
      await admin.firestore().doc(`users/${user.email}`).create({
        'refreshToken': tokens.refresh_token
      })
    }

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    gmail.users.watch(params = {
      topicName: "projects/hackitba-5868f/topics/gmail",
      labelIds: ["INBOX"],
      userId: 'me'
    })

    res.send(user)
  } catch (e) {
    next(e)
  }
})

app.post('/api/pubsub', async (req, res) => {
  try {
    const encodedData = req.body.message.data
    const {emailAddress: userEmail, historyId} = JSON.parse(
      new Buffer(encodedData, encoding='base64'
    ).toString('ascii'))

    const doc = await admin.firestore().doc(`users/${userEmail}`).get()
    const refresh_token = doc.data()['refreshToken']
    const last_date = doc.data()['lastRefreshDate'].toDate()

    oAuth2Client.setCredentials({refresh_token});
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const messages = (await gmail.users.messages.list(params = {
      userId: 'me', maxResults: 10
    })).data.messages

    for(let msg of (messages ?? [])) {
      const message = await gmail.users.messages.get(params = {
        userId: 'me', id: msg.id
      })

      const mail_date = new Date(Number(message.data.internalDate))
      if(mail_date > last_date) {
        let senderEmail = "", subject = ""
        for(let header of message.data.payload.headers) {
          if(header.name == "From")
            senderEmail = header.value.split("<")[1].split(">")[0]
          if(header.name == "Subject")
            subject = header.value
        }
        
        console.log({'from': senderEmail, 'to': userEmail, 'subject': subject, 'message': message.data.snippet})
        await parseEmail(senderEmail, userEmail , subject, message.data.snippet)
      }
    }

    await doc.ref.update({'lastRefreshDate': new Date()})
  } catch (e) {
    console.log(e)
  }

  res.status(200).send('')
})

// Assignment functions

const BEGIN_OF_WORKDAY = 9;
const END_OF_WORKDAY = 18;

async function parseEmail(from, to, subject, message) {
  let contactPriority = await getContactPriority(from, to)
  let parsedMessage = JSON.parse(message)
  parsedMessage.start_date = new Date(parsedMessage.start_date)
  parsedMessage.end_date = new Date(parsedMessage.end_date)
  parsedMessage.requested_by = from

  await saveAndReorder(contactPriority, parsedMessage)
}

async function getContactPriority(contact_email, user_email){
  const user = (await admin.firestore().doc(`users/${user_email}`).get()).data()
  
  for(let contact of (user.contacts ?? []))
    if(contact.email == contact_email)
      return contact.priority

  return 1
}

async function saveAndReorder(contactPriority, newAssignment){
  // Find today assignments

  var now = new Date();
  var todayAssignments = [];

  const querySnapshot = await admin.firestore().collection('activities').orderBy('start_date').get()
  querySnapshot.forEach((doc) => {
    // Skip unassigned tasks
    if(doc.data().start_date != null && doc.data().end_date != null) {
      var start = doc.data().start_date.toDate()
      var end = doc.data().end_date.toDate()

      if(start <= now && now <= end )
        todayAssignments.push(doc.data());
    }
  });

  // Propose to put task on the given date or ASAP if none was given

  let candidateDate
  if(newAssignment.start_date != null && newAssignment.start_date > now)
    candidateDate = newAssignment.start_date
  else
    candidateDate = new Date()

  if(candidateDate.getHours() > END_OF_WORKDAY) {
    candidateDate.setHours(BEGIN_OF_WORKDAY)
    candidateDate.setDate(candidateDate.getDate() + 1)
  }
  candidateDate.setSeconds(0)
  candidateDate.setMilliseconds(0)

  // Iterate all days and hours until a place is found
    
  let foundPlace = false;
  while(!foundPlace){
    var candidateMoment = moment(candidateDate)
    
    // If Friday, skip to monday
    if(candidateMoment.day() == 5)
      candidateMoment.add(2,'days');

    // Iterate hours

    while(candidateMoment.hours() < END_OF_WORKDAY){

      // Check if there is an assignment in the proposed moment
        
      let currentAssignment = await getAssignmentInMoment(todayAssignments, candidateMoment);
      if(currentAssignment == null){
        // If no, allocate it here
        await admin.firestore().collection('activities').add(newAssignment)
        foundPlace = true;
        console.log(`Allocated at free space ${candidateMoment}`)
        break;
      }

      // Check if the current assignment can be displaced

      if((await getContactPriority(currentAssignment.requested_by) < contactPriority)
        || (await getContactPriority(currentAssignment.requested_by) == contactPriority
          && currentAssignment.inherent_priority < newAssignment.inherent_priority)
      ){
        // If so, displace it
        let aux = currentAssignment.start_date;
        currentAssignment.start_date = newAssignment.start_date;
        newAssignment.start_date = aux;

        aux = currentAssignment.end_date;
        currentAssignment.end_date = newAssignment.end_date;
        newAssignment.end_date = aux;

        await admin.firestore().collection('activities').doc(currentAssignment.id).set(aux)
        await admin.firestore().collection('activities').add(newAssignment)

        console.log(`Allocated at ${candidateMoment}, displaced ${currentAssignment.id}`)

        foundPlace = true;
        break;
      }
        
      candidateMoment = candidateMoment.add(moment(currentAssignment.end_date).diff(candidateMoment)); 
    }
  
    candidateMoment.add(1,'days');
  }

}

function getAssignmentInMoment(todayAssignments, inMoment){
  for(let i=0; i<todayAssignments.length; i++){
    let assignment = todayAssignments[i];
    if(inMoment.isBetween(moment(assignment.start_date), moment(assignment.end_date)))
      return assignment;
  }
  return null;
}

// Listen

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

// parseEmail("mapablaza@itba.edu.ar", "matiapa98@gmail.com", "Test", `{
//   "original": "Debes realizar la tarea",
//   "type": "TASK",
//   "title":"Test",
//   "description": "Test",
//   "start_date": "04/04/2022 20:00:00",
//   "end_date": "04/04/2022 22:00:00",
//   "inherent_priority": 2
// }`
// )


// Debugging endpoints

app.get('/api/subscribe', async (req, res) => {
  oAuth2Client.setCredentials({'refresh_token': '1//0h85TrSRO0AwRCgYIARAAGBESNwF-L9IraH-qo1IdtTgnr2v6DZ3AM7cf8sSn35mtKfOWVXfXIc1bwOMAecYQP7Z_aEnM-YjZVcs'});
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  console.log(await gmail.users.watch(params = {
    userId: 'me',
    topicName: "projects/hackitba-5868f/topics/gmail",
    labelIds: ["INBOX"]
  }))
  res.send("OK")
})

// app.get('/api/authenticate', async (req, res) => {
//   const authorizationUrl = oAuth2Client.generateAuthUrl({
//     access_type: 'offline',
//     scope: ['https://www.googleapis.com/auth/gmail.readonly'],
//     include_granted_scopes: true
//   });
//   res.redirect(authorizationUrl);
// })

// app.get('/__/auth/handler', async (req, res) => {
//   const url = require('url');
//   let q = url.parse(req.url, true).query;
//   let { tokens } = await oAuth2Client.getToken(q.code);
//   res.send(tokens)
// })

// app.post('/events/:calendarId', (req, res) => {
//   let path = "/calendars/" + req.params.calendarId +"/events"
//   console.log(req)
//   let event = {

//     'summary': req.body.title,
//     'location': req.body.location,
//     'start': req.body.start,
//     'end': req.body.end,
//     'attendees': req.body.attendees

//   }
//   axios.post(path, event,{
//     headers:{'Authorization': 'Bearer ' + 'ya29.A0ARrdaM_Oz8TITVdBLn433Yo_TyaFcnrmZ8np-2K966Lw5Zk56fk0-DO3IL2qwE8d0a6JT-rOYGVDo26itFwiIswQz3tdHk8PqwgXkEDw4l1JlVY6fqadAMF9-hrB65OKAh4mf3BRs8Uu8PF7IYuKJoUwJDJ2errKCEE'},
//   }).then(async (response)=>{
//     const docRef = db.collection('prueba').doc('probando');


//     await docRef.set({
//       first: 'Ada',
//       last: 'Lovelace',
//       born: 1815
//     });
//     res.sendStatus(201);
//   }).catch((error)=>{
//     console.log(error)
//   })
// });