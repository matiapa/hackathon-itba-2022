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
    const {emailAddress, historyId} = JSON.parse(
      new Buffer(encodedData, encoding='base64'
    ).toString('ascii'))

    const doc = await admin.firestore().doc(`users/${emailAddress}`).get()
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
        let email = "", subject = ""
        for(let header of message.data.payload.headers) {
          if(header.name == "From")
            email = header.value.split("<")[1].split(">")[0]
          if(header.name == "Subject")
            subject = header.value
        }
        
        console.log({
          'from': email,
          'subject': subject,
          'message': message.data.snippet
        })
      }
    }

    await doc.ref.update({'lastRefreshDate': new Date()})
  } catch (e) {
    console.log(e)
  }

  res.status(200).send('')
})

// Listen

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Listening on port ${port}`)
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

// app.get('/api/subscribe', async (req, res) => {
//   oAuth2Client.setCredentials({'refresh_token': '1//0h85TrSRO0AwRCgYIARAAGBESNwF-L9IraH-qo1IdtTgnr2v6DZ3AM7cf8sSn35mtKfOWVXfXIc1bwOMAecYQP7Z_aEnM-YjZVcs'});
//   const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
//   console.log(await gmail.users.watch(params = {
//     userId: 'me',
//     topicName: "projects/hackitba-5868f/topics/gmail",
//     labelIds: ["INBOX"]
//   }))
//   res.send("OK")
// })


const BEGIN_OF_WORKDAY = 9;
const END_OF_WORKDAY = 18;
/*
var event = {
  'summary': 'YENDO NO LLEEEEEGANDO',
  'location': '800 Howard St., San Francisco, CA 94103',
  'description': 'A chance to hear more about Google\'s developer products.',
  'start': {
    'dateTime': '2022-04-28T09:00:00-07:00',
    'timeZone': 'America/Los_Angeles'
  },
  'end': {
    'dateTime': '2022-04-28T17:00:00-07:00',
    'timeZone': 'America/Los_Angeles'
  },
  'recurrence': [
    'RRULE:FREQ=DAILY;COUNT=2'
  ],
  'attendees': [
    {'email': 'lpage@example.com'},
    {'email': 'sbrin@example.com'}
  ],
  'reminders': {
    'useDefault': false,
    'overrides': [
      {'method': 'email', 'minutes': 24 * 60},
      {'method': 'popup', 'minutes': 10}
    ]
  }
};

*/  




app.post('/events/:calendarId', (req, res) => {

  /*
  let path = "/calendars/" + req.params.calendarId +"/events"
  console.log(req)
  let event = {

    'summary': req.body.title,
    'location': req.body.location,
    'start': req.body.start,
    'end': req.body.end,
    'attendees': req.body.attendees

  }
  axios.post(path, event,{
    headers:{'Authorization': 'Bearer ' + 'ya29.A0ARrdaM_Oz8TITVdBLn433Yo_TyaFcnrmZ8np-2K966Lw5Zk56fk0-DO3IL2qwE8d0a6JT-rOYGVDo26itFwiIswQz3tdHk8PqwgXkEDw4l1JlVY6fqadAMF9-hrB65OKAh4mf3BRs8Uu8PF7IYuKJoUwJDJ2errKCEE'},
  }).then(async (response)=>{
    const docRef = db.collection('prueba').doc('probando');


    await docRef.set({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815
    });
    res.sendStatus(201);
  }).catch((error)=>{
    console.log(error)
  })
*/

  addAssignment({
    type:"TASK",
    description:"Tarea de prueba",
    priority:1,
    title:"probanding",
    owner_id:"5e9f8f9f-f8c9-4f7f-b8f8-f8f8f8f8f8f8",
    start_date:"2022-04-2T09:00:00-07:00",
    end_date:"2022-04-2T13:00:00-07:00",
    requested_by:"pepe@gmail.com"
  })

});








function addAssignment(mail){

  //ASUMIMOS QUE YA LLEGA LA INFO PARSEADA

  let contact = mail.from
  let contactPriority = getContactPriority(contact)
  let assignmentPriority = mail.message.priority;


  saveAndReorder(assignmentPriority,contactPriority,mail.message)



}

//tarea -> individual
//evento -> implica más gentu


//TODO hace bien la consulta
async function getContactPriority(contact_info,user_email){
  //firebase
  const snaphot = await admin.firebase().collection('users').doc(user_email).get().contacts
  return snaphot.priority;
}



//duraciones van variando de a 30 min
async function saveAndReorder(assignmentPriority,contactPriority,assignment){
  
  var now = new Date();

  var todayAssignments = [];
  const assignments = await admin.firestore().collection('activities')
      .orderBy('start_date').get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {

          var start = doc.data().start_date.toDate()
          var end = doc.data().end_date.toDate()


 
          if(start <= now && now <= end )
            todayAssignments.push(doc.data());
        });
    })
    .catch((error) => {
        console.log("Error getting documents: ", error);
    });
    


  let foundPlace = false;
  let i=0;
  while(!foundPlace){
    //let dayToPutAssignment = new Date(2022,3,4,BEGIN_OF_WORKDAY,0,0,0);
    let dayToPutAssignment = new Date();
    dayToPutAssignment.setHours(BEGIN_OF_WORKDAY);
    dayToPutAssignment.setMinutes(0);
    dayToPutAssignment.setSeconds(0);
    dayToPutAssignment.setMilliseconds(0);
    var moment1 = moment(dayToPutAssignment)
    
    //esto es para ir buscando en el proximo dia en caso de q no encuentre lugarcito
    if(moment1.day()==5)
      i+=2;
    moment1 = moment1.add(i,'days');  
    //dayToPutAssignment.setDate(dayToPutAssignment.getDate() + i++)

    //const assignments = await admin.firestore().collection('activities').
    //where('start_date','<=',dayToPutAssignment).orderBy('start_date').get()

    //const todayAssignments = assignments.filter(a=>a.end_date >=dayToPutAssignment)


        //let auxi = new Date(dayToPutAssignment);

        //var moment0 = moment(auxi);

        while(moment1.hours() < END_OF_WORKDAY){
            
          let as = getAssignmentInRange(todayAssignments,moment1);
          if(as == null){
            foundPlace = true;
            break;
          }

          if(getContactPriority(as.contact) < contactPriority){
            let aux = as.start_date;
            aux.start_date = assignment.start_date;
            assignment.start_date = aux;
            await admin.firestore().collection('activities').doc(as.id).set(aux)
            await admin.firestore().collection('activities').create(assignment)
            foundPlace = true;
            break;
          }else if(getContactPriority(as.contact) == contactPriority
                  && as.priority < assignmentPriority){
            let aux = as.start_date;
            aux.start_date = assignment.start_date;
            assignment.start_date = aux;
            await admin.firestore().collection('activities').doc(as.id).set(aux)
            await admin.firestore().collection('activities').create(assignment)
            foundPlace = true;
            break;
          
          }
           
          moment1 = moment1.add(as.end_date - as.start_date); 
        }
      
      }



  }

  

  function getAssignmentInRange(todayAssignments,momentAs){
    
    for(let i=0;i<todayAssignments.length;i++){
      let assignment = todayAssignments[i];

      var auxMoment1 = moment(assignment.start_date)
      var auxMoment2 = moment(assignment.end_date)
      var duration = moment.duration(auxMoment1.diff(auxMoment2))
      var half = duration.asMinutes()/2;

      momentAs.add(duration)
      if(moment.isBetween(assignment.start_date,assignment.end_date))
        return assignment;
    }
    return null;
  }
