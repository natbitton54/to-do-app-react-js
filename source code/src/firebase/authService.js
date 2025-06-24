import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile
} from 'firebase/auth'

import { auth, db } from './config.js'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'

//? Email/password
export const register = async (email, password, firstName, lastName) => {
    const userCredentials = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredentials.user
    const displayName = `${capitalizeName(firstName)} ${capitalizeName(lastName)}`;

    await updateProfile(user, {
        displayName
    })

    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName: capitalizeName(firstName),
        lastName: capitalizeName(lastName),
        email: user.email,
        createdAt: serverTimestamp()
    })

    return userCredentials;
}

function capitalizeName(name) {
    return name.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
}

export const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
}

//? Gmail auth
export const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    const nameParts = user.displayName?.split(' ') || [];
    const firstName = capitalizeName(nameParts[0] || '');
    const lastName = capitalizeName(nameParts.slice(1).join(' ') || '');

    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email,
        createdAt: serverTimestamp()
    }, { merge: true })

    return result;
}

export const logout = () => {
    return signOut(auth)
}