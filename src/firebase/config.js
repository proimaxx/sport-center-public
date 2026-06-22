import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

// App cliente (sport-center-public)
const firebaseConfigPublic = {
  apiKey: "AIzaSyBTzzbsY0FN5YC78uB2LxoPgxD9qAGPBlQ",
  authDomain: "sport-center-public.firebaseapp.com",
  projectId: "sport-center-public",
  storageBucket: "sport-center-public.firebasestorage.app",
  messagingSenderId: "643579394507",
  appId: "1:643579394507:web:e1cd39c2c0b5c6e5f6de4e"
}

// App admin (sport-center-admin) — solo lettura campi
const firebaseConfigAdmin = {
  apiKey: "AIzaSyAxB5TB1UGQew1ZtXv3By0vNy7E3KXFG98",
  authDomain: "sport-center-admin.firebaseapp.com",
  projectId: "sport-center-admin",
  storageBucket: "sport-center-admin.firebasestorage.app",
  messagingSenderId: "452970127107",
  appId: "1:452970127107:web:c1e38d011af2378fc81336"
}

const publicApp = initializeApp(firebaseConfigPublic, 'public')
const adminApp = initializeApp(firebaseConfigAdmin, 'admin')

export const db = getFirestore(publicApp)
export const dbAdmin = getFirestore(adminApp)
export const auth = getAuth(publicApp)
