import { db, dbAdmin, auth } from './config'
import {
  collection, doc, addDoc, onSnapshot,
  query, where, orderBy, serverTimestamp, getDocs, getDoc, setDoc
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, onAuthStateChanged,
  sendPasswordResetEmail, updateProfile,
  GoogleAuthProvider, signInWithPopup
} from 'firebase/auth'

export const registra = async ({ email, password, nome, cognome, telefono }) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: `${nome} ${cognome}` })
  await setDoc(doc(db, 'utenti', cred.user.uid), {
    uid: cred.user.uid, email, nome, cognome, telefono,
    createdAt: serverTimestamp()
  })
  return cred.user
}

export const accedi = (email, password) =>
  signInWithEmailAndPassword(auth, email, password)

export const accediConGoogle = async () => {
  const provider = new GoogleAuthProvider()
  const cred = await signInWithPopup(auth, provider)
  const user = cred.user
  const ref = doc(db, 'utenti', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    const [nome, ...rest] = (user.displayName || 'Utente').split(' ')
    await setDoc(ref, {
      uid: user.uid, email: user.email, nome,
      cognome: rest.join(' '), telefono: '',
      createdAt: serverTimestamp()
    })
  }
  return user
}

export const esci = () => signOut(auth)
export const resetPassword = (email) => sendPasswordResetEmail(auth, email)
export const onAuth = (callback) => onAuthStateChanged(auth, callback)

export const subscribeCampi = (callback) => {
  const q = query(
    collection(dbAdmin, 'campi'),
    where('attivo', '==', true)
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const getConfig = async () => {
  const snap = await getDocs(collection(dbAdmin, 'config'))
  const d = snap.docs.find(d => d.id === 'centro')
  return d ? d.data() : { oraApertura: '08:00', oraChiusura: '22:00', finestraMinOre: 48, slotSingolo: 60, slotDoppio: 90 }
}

export const addPrenotazione = (data) =>
  addDoc(collection(db, 'prenotazioni'), {
    ...data, stato: 'confermata', createdAt: serverTimestamp()
  })

export const subscribePrenotazioniUtente = (uid, callback) => {
  const q = query(
    collection(db, 'prenotazioni'),
    where('uid', '==', uid),
    orderBy('data', 'desc')
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}

export const subscribePrenotazioniByData = (data, callback) => {
  const q = query(
    collection(db, 'prenotazioni'),
    where('data', '==', data),
    where('stato', '==', 'confermata')
  )
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  )
}
