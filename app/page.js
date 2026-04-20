'use client';

import { useEffect, useRef, useState } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut
} from "firebase/auth";

// ---------------- FIREBASE CONFIG ----------------
const firebaseConfig = {
  apiKey: "AIzaSyCA6JJ8ooiY9Me0bTKhcXR8p1cB2BQKpmk",
  authDomain: "inkvira-6d959.firebaseapp.com",
  projectId: "inkvira-6d959",
  storageBucket: "inkvira-6d959.firebasestorage.app",
  messagingSenderId: "31088677848",
  appId: "1:31088677848:web:56f179fa71286d3881d8ad",
  measurementId: "G-S44MN0BHKF"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();

// 🔐 CHANGE THIS TO YOUR EMAIL
const ADMIN_EMAIL = "yourgmail@gmail.com";

export default function Inkvira() {
  const canvasRef = useRef(null);

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [view, setView] = useState("home");

  // ---------------- AUTH ----------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    fetchPosts();
    init3D();

    return () => unsub();
  }, []);

  function login() {
    signInWithPopup(auth, provider);
  }

  function logout() {
    signOut(auth);
  }

  // ---------------- FIRESTORE ----------------
  async function fetchPosts() {
    const snap = await getDocs(collection(db, "posts"));
    setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function createPost() {
    if (!title || !content) return;

    await addDoc(collection(db, "posts"), {
      title,
      content,
      createdAt: serverTimestamp(),
      author: user?.displayName || "Unknown"
    });

    setTitle("");
    setContent("");
    fetchPosts();
  }

  // ---------------- THREE.JS ----------------
  function init3D() {
    if (typeof window === "undefined") return;

    import("three").then((THREE) => {
      const scene = new THREE.Scene();

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true
      });

      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.position.z = 5;

      const geometry = new THREE.IcosahedronGeometry(2, 1);
      const material = new THREE.PointsMaterial({
        color: 0x7c5cff,
        size: 0.02
      });

      const mesh = new THREE.Points(geometry, material);
      scene.add(mesh);

      function animate() {
        requestAnimationFrame(animate);
        mesh.rotation.x += 0.002;
        mesh.rotation.y += 0.003;
        renderer.render(scene, camera);
      }

      animate();
    });
  }

  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <div style={{ background: "#070a12", color: "white", minHeight: "100vh" }}>

      <canvas
        ref={canvasRef}
        style={{ position: "fixed", top: 0, left: 0, zIndex: -2 }}
      />

      {/* HEADER */}
      <header style={{
        position: "fixed",
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        padding: "20px 40px",
        backdropFilter: "blur(15px)",
        background: "rgba(0,0,0,0.3)"
      }}>
        <h2 style={{ color: "#7c5cff" }}>INKVIRA</h2>

        <div>
          <button onClick={() => setView("home")}>Home</button>
          {isAdmin && (
            <button onClick={() => setView("dashboard")}>Dashboard</button>
          )}

          {!user ? (
            <button onClick={login}>Login</button>
          ) : (
            <button onClick={logout}>Logout</button>
          )}
        </div>
      </header>

      {/* HOME */}
      {view === "home" && (
        <>
          <section style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            textAlign: "center"
          }}>
            <h1 style={{
              fontSize: "70px",
              background: "linear-gradient(90deg,#7c5cff,#00d4ff)",
              WebkitBackgroundClip: "text",
              color: "transparent"
            }}>
              Build Future Web
            </h1>

            <p style={{ color: "#aaa", maxWidth: "600px" }}>
              Elite digital platform with CMS, 3D visuals, and scalable architecture.
            </p>
          </section>

          <section style={{ padding: "80px", textAlign: "center" }}>
            <h2>Live Blog</h2>

            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
              gap: "20px"
            }}>
              {posts.map(p => (
                <div key={p.id} style={{
                  padding: "20px",
                  background: "rgba(255,255,255,0.05)",
                  borderRadius: "12px"
                }}>
                  <h3>{p.title}</h3>
                  <p>{p.content}</p>
                  <small>By {p.author}</small>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* DASHBOARD (ADMIN ONLY) */}
      {view === "dashboard" && isAdmin && (
        <section style={{ padding: "120px 40px" }}>
          <h2>Admin Dashboard (CMS)</h2>

          <div style={{ maxWidth: "500px", margin: "auto" }}>
            <input
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            <textarea
              placeholder="Content"
              value={content}
              onChange={e => setContent(e.target.value)}
            />

            <button
              onClick={createPost}
              style={{
                marginTop: "10px",
                padding: "10px 20px",
                background: "linear-gradient(90deg,#7c5cff,#00d4ff)",
                border: "none",
                color: "white"
              }}
            >
              Publish Post
            </button>
          </div>

          <div style={{ marginTop: "40px", textAlign: "center" }}>
            <h3>Analytics</h3>
            <p>Posts: {posts.length}</p>
            <p>User: {user?.displayName}</p>
            <p>Email: {user?.email}</p>
            <p>Status: Live 🚀</p>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer style={{
        textAlign: "center",
        padding: "40px",
        color: "gray"
      }}>
        INKVIRA Platform • Powered by Firebase + Three.js
      </footer>

    </div>
  );
}
