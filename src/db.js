// Conveniently import this file anywhere to use db

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export const db = firebase
    .initializeApp({ projectId: 'hackitba-5868f' })
    .firestore()


// Export types that exists in Firestore - Uncomment if you need them in your app
const { Timestamp, GeoPoint } = firebase.firestore
export { Timestamp, GeoPoint }
