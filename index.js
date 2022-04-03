const express = require('express')
const fs = require('fs');
const url = require('url')
const app = express()
const bodyParser = require('body-parser');
const jwt_decode = require('jwt-decode')

app.use(bodyParser.json());

const port = process.env.PORT || 8080

const admin = require("firebase-admin");
const serviceAccount = JSON.parse(fs.readFileSync('admin_key.json').toString())
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const { google } = require('googleapis');
const credentials = JSON.parse(fs.readFileSync('credentials.json').toString())
const { client_secret, client_id, redirect_uris } = credentials.web;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, "postmessage");


app.get('/api/login', async (req, res) => {
  let q = url.parse(req.url, true).query;
  let { tokens } = await oAuth2Client.getToken(q.code);
  oAuth2Client.setCredentials(tokens);

  console.log(tokens)
  const user = jwt_decode(tokens.id_token)
  console.log(user)

  if('refresh_token' in tokens){
    await admin.firestore().doc(`users/${user.email}`).create({
      'refreshToken': tokens.refresh_token
    })
  }

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  gmail.users.watch(params = {
    topicName: "projects/hackitba-5868f/topics/gmail",
    labelIds: ["INBOX"]
  })

  res.send("OK")
})

app.post('/api/pubsub', async (req, res) => {
  try {
    const encodedData = req.body.message.data
    const {emailAddress, historyId} = JSON.parse(new Buffer(encodedData, encoding='base64').toString('ascii'))

    const doc = await admin.firestore().doc(`users/${emailAddress}`).get()
    const refresh_token = doc.data()['refreshToken']
    oAuth2Client.setCredentials({refresh_token});

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const data = await gmail.users.history.list(params = {
      userId: 'me', startHistoryId: historyId
    })

    for(let history of (data.data.history ?? [])) {
      for(let msg of (history.messages ?? [])) {
        const message = await gmail.users.messages.get(params = {
          userId: 'me', id: msg.id
        })
        console.log(message.data.snippet)
      }
    }
  } catch (e) {
    console.log(e)
  }
  
  res.status(200).send('')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
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