import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';//importing firebase/app and firebase/firestore.
import { getAuth } from "firebase/auth";//importing for authorization

const firebaseConfig = {//Then we define our firebase config in firebaseConfig. This information points to the exact web application that we created within the Firebase Help Queue project.
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID 
}

const app = initializeApp(firebaseConfig);//call the initializeApp function, passing in our firebaseConfig as the argument. The initializeApp function creates and initializes an instance of our Firebase web app, which we save in the variable app. We can then use app to access a variety of services that are connected to our web app, like our Firestore database.
const auth = getAuth(app);
const db = getFirestore(app); //call the getFirestore function, passing in app. This function returns the Firestore database instance that's associated with our app. We store our firestore database instance in the variable db.

export { db, auth };
