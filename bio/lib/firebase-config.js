/* Shared Firebase Web App config for Study Hub (project geo-hub-96426).
   Powers one single Google sign-in across Bio Hub, Eco Hub, Geology Hub and the Study Hub subject picker.
   Geology Hub stores progress at users/{uid}; Bio Hub and Eco Hub store progress at users/{uid}/hubs/{bio|eco}. */
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAqjXtqdiRvx-_ObogpKAcW87uwmfSkqBg",
  authDomain: "geo-hub-96426.firebaseapp.com",
  projectId: "geo-hub-96426",
  storageBucket: "geo-hub-96426.firebasestorage.app",
  messagingSenderId: "277961334941",
  appId: "1:277961334941:web:535e1ed30a6c57f9d2f474"
,
  hubDoc: "bio"
};
