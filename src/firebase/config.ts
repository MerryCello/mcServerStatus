import { initializeApp, getApp } from "firebase/app";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

//! POOR ENV CONFIG, works for now
const PROD = "prod";
const DEV = "dev";
const LOCAL = "local";
const env = PROD;

/**
 * TODO: Firebase rules:
 *  1. Only access data if authenticated AND UID equals what's stored in user doc
 *  3. Only create new doc if authenticated
 */
const initializeFirebase = () => {
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  // Connects to "Prod firebase instance"
  const firebaseConfigProd = {
    apiKey: "AIzaSyByGie9WLiLwJWBXwTmdw4n2PmqhNGvKLo",
    authDomain: "mc-server-status-256.firebaseapp.com",
    projectId: "mc-server-status-256",
    storageBucket: "mc-server-status-256.appspot.com",
    messagingSenderId: "416340134508",
    appId: "1:416340134508:web:44849f19c955562441a649",
    measurementId: "G-Q2W3XCMWZW",
  };

  // Connects to "Dev firebase instance"
  //! Currently same as PROD firebase
  const firebaseConfigDev = firebaseConfigProd || {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
  };

  // Connects to "Local firebase instance"
  const firebaseConfigLocal = {
    apiKey: firebaseConfigDev.apiKey,
    authDomain: "http://localhost:4400",
    databaseURL: "http://localhost:4400",
    projectId: "local",
    storageBucket: firebaseConfigDev.storageBucket,
    appId: "1:123456789011:web:blahblahblahblahblahbl",
    measurementId: "G-BLAHBLAHBL",
  };

  let configToUse;
  if (env === PROD) {
    configToUse = firebaseConfigProd;
  } else if (env === DEV) {
    configToUse = firebaseConfigDev;
  } else {
    // local env
    configToUse = firebaseConfigLocal;
  }

  let firebase: ReturnType<typeof initializeApp>,
    analytics,
    firestore: ReturnType<typeof getFirestore>,
    auth: ReturnType<typeof getAuth>;

  // Only initialize firebase once
  try {
    firebase = initializeApp(configToUse);
    firestore = getFirestore(firebase);
    auth = getAuth(firebase);
    // @ts-ignore
    if (env === DEV) {
      analytics = undefined;
    } else {
      analytics = isAnalyticsSupported().then((isSupported) =>
        isSupported ? getAnalytics(firebase) : undefined
      );
    }

    // @ts-ignore
    if (env === LOCAL) {
      connectFirestoreEmulator(firestore, "http://localhost", 8080); // or whatever port you have it set to
      connectAuthEmulator(auth, "http://localhost:8080");
    }

    return { firebase, analytics, firestore, auth };
  } catch (e: any) {
    if (!/already exists/.test(e.message)) {
      console.error("Firebase initialization error", e.stack);
    }

    // Try to return the instances anyways
    const app = getApp();
    return {
      firebase: app,
      // @ts-ignore
      analytics: env === DEV ? undefined : getAnalytics(),
      firestore: getFirestore(app),
      auth: getAuth(),
    };
  }
};

const { firebase, analytics, firestore, auth } = initializeFirebase();

export { initializeFirebase, firebase, analytics, firestore as db, auth };
