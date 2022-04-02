const express = require('express')
const fs = require('fs');
const url = require('url')
const app = express()
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

  if('refresh_token' in tokens){
    await admin.firestore().doc(`users/NIi1zszOQzfX5nedE0kJ`).create({
      'refreshToken': tokens.refreshToken
    })
  }

  res.send("OK")
})

app.get('/api/labels', async (req, res) => {
  const doc = await admin.firestore().doc(`users/NIi1zszOQzfX5nedE0kJ`).get()
  const refresh_token = doc.data()['refreshToken']

  oAuth2Client.setCredentials({refresh_token});

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  gmail.users.labels.list({
    userId: 'me',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const labels = res.data.labels;
    if (labels.length) {
      console.log('Labels:');
      labels.forEach((label) => {
        console.log(`- ${label.name}`);
      });
    } else {
      console.log('No labels found.');
    }
  });

  res.send('OK')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})