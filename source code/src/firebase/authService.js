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
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { showError } from '../utils/alerts.js';

function capitalizeName(name) {
    return name
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
}

const applyPersistence = (remember) => {
    setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
    )
}

//? Email/password
export const register = async (email, password, firstName, lastName) => {
    await applyPersistence(false)
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

export const login = async (email, password, remember = false) => {
    await applyPersistence(remember);
    return signInWithEmailAndPassword(auth, email, password)
}

//? Gmail auth
export const loginWithGoogle = async (remember = false) => {
    await applyPersistence(remember);
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    const user = result.user

    const nameParts = user.displayName?.trim() || []:
    
    const firstName = capitalizeName(nameParts[0])
    const lastName  = capitalizeName(nameParts.slice(1).join(" "))

    await setDoc(
        doc(db, "users", user.uid),
        {
            uid: user.uid,
            firstName,
            lastName,
            email: user.email || "",
            createdAt: serverTimestamp(),
        },
        { merge: true }
    );

    return result;
}

const handleForgetPassword = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent!");
    } catch (error) {
        console.error("Error resetting password:", error.message);
        showError("Failed to send reset email");
    }

}

export const logout = () => {
    return signOut(auth)
}
