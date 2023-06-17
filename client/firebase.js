// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getStorage} from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlxaclLSEVucJgjONFDZDTQYo9FKVoVZA",
  authDomain: "conquertheworld-10cb6.firebaseapp.com",
  projectId: "conquertheworld-10cb6",
  storageBucket: "conquertheworld-10cb6.appspot.com",
  messagingSenderId: "138877248712",
  appId: "1:138877248712:web:375fbc1763d2d9083131fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);