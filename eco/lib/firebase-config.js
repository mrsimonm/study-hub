/* Firebase Web App config for Eco Hub (needs its own Firebase project, separate from the other hubs).
   These values are public by design; access is protected by Firestore rules and authorized domains.
   While apiKey is empty, Eco Hub runs locally using browser storage only (no Google sign-in). */
window.FIREBASE_CONFIG = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: ""
};
