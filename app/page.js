'use client';

import { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

// ---------------- FIREBASE CONFIG ----------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// ---------------- INITIALIZE FIREBASE ----------------
const app = initializeApp(firebaseConfig);
let analytics;

if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

const db = getFirestore(app);
const auth = getAuth(app);

// ---------------- COMPONENT ----------------
export default function Page() {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const inputRef = useRef("");

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Anonymous login
  const login = async () => {
    await signInAnonymously(auth);
  };

  const logout = async () => {
    await signOut(auth);
  };

  // Add data to Firestore
  const addData = async () => {
    if (!inputRef.current.value) return;

    await addDoc(collection(db, "messages"), {
      text: inputRef.current.value,
      createdAt: serverTimestamp()
    });

    inputRef.current.value = "";
    fetchData();
  };

  // Fetch data
  const fetchData = async () => {
    const snap = await getDocs(collection(db, "messages"));
    const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setData(list);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main style={{ padding: 20 }}>
      <h1>INKVIRA</h1>

      {!user ? (
        <button onClick={login}>Login Anonymously</button>
      ) : (
        <>
          <p>Logged in</p>
          <button onClick={logout}>Logout</button>

          <br /><br />

          <input ref={inputRef} placeholder="Enter message" />
          <button onClick={addData}>Add</button>

          <h3>Messages</h3>
          <ul>
            {data.map(item => (
              <li key={item.id}>{item.text}</li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
                                     }
