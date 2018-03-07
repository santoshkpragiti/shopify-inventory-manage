import * as firebase from "firebase";

var config = {
  apiKey: "AIzaSyCY_lYxSdKCpO-tC6l8GrB6HlXKH1-Gmp8",
  authDomain: "shopify-inventory-32304.firebaseapp.com",
  databaseURL: "https://shopify-inventory-32304.firebaseio.com",
  storageBucket: "shopify-inventory-32304.appspot.com",
};
firebase.initializeApp(config);

export const fireRef = firebase.database().ref();
