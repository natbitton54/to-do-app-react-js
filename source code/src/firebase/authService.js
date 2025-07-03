import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    updateProfile,
    setPersistence,
    browserSessionPersistence,
    sendPasswordResetEmail,
    browserLocalPersistence
} from 'firebase/auth'

import { auth, db } from './config.js'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { showError } from '../utils/alerts.js';

function capitalizeName(name) {
    return name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

const applyPersistence = async (remember) => {
    await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
    )
}

//? Email/password
export const register = async (email, password, firstName, lastName) => {
    await applyPersistence(false)
    const normalizedEmail = email.trim().toLowerCase();
    const userCredentials = await createUserWithEmailAndPassword(auth, normalizedEmail, password)
    const user = userCredentials.user
    const capFirstName = capitalizeName(firstName);
    const capLastName = capitalizeName(lastName);
    const displayName = `${capFirstName} ${capLastName}`;

    await updateProfile(user, {
        displayName
    })

    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName: capFirstName,
        lastName: capLastName,
        email: user.email,
        createdAt: serverTimestamp()
    })

    return userCredentials;
}

export const login = async (email, password, remember = false) => {
    await applyPersistence(remember);
    const normalizedEmail = email.trim().toLowerCase();
    return signInWithEmailAndPassword(auth, normalizedEmail, password)
}

//? Gmail auth
export const loginWithGoogle = async (remember = false) => {
    await applyPersistence(remember);
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    const nameParts = user.displayName?.trim().split(/\s+/) || [];

    const firstName = capitalizeName(nameParts[0] || '')
    const lastName = capitalizeName(nameParts.slice(1).join(" ") || '')

    const userRef = doc(db, 'users', user.uid)
    const snapshot = await getDoc(userRef)

    if (!snapshot.exists()) {
        await setDoc(
            userRef,
            {
                uid: user.uid,
                firstName,
                lastName,
                email: user.email || "",
                createdAt: serverTimestamp(),
            },
        );
    } else {
        // already registered → leave createdAt untouched
        await updateDoc(userRef, {
            firstName,
            lastName,
            email: user.email || ''
        })
    }

    return result;
}

export const handleForgetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email.trim().toLowerCase());
        alert("Password reset email sent!");
    } catch (error) {
        console.error("Error resetting password:", error.message);
        showError("Failed to send reset email");
    }

}

export const logout = () => signOut(auth);