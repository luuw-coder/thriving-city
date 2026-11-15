import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getDatabase,ref,set,get,push,update,remove,onValue,onChildAdded,onDisconnect,query,limitToLast} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
export const db=getDatabase(initializeApp({
 apiKey:"AIzaSyDkaX1YtX9Z9JV0RPrnk5eV1Y0woNKkHF4",authDomain:"thriving-f624a.firebaseapp.com",
 databaseURL:"https://thriving-f624a-default-rtdb.asia-southeast1.firebasedatabase.app",
 projectId:"thriving-f624a",storageBucket:"thriving-f624a.firebasestorage.app",
 messagingSenderId:"417384165725",appId:"1:417384165725:web:5d1d6bf53a27610b7478b4"}));
export {ref,set,get,push,update,remove,onValue,onChildAdded,onDisconnect,query,limitToLast};
