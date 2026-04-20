"use client";

import { useEffect, useState } from "react"; import { initializeApp } from "firebase/app"; import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore"; import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from "firebase/auth";

// ---------------- FIREBASE ---------------- const firebaseConfig = { apiKey: "YOUR_API_KEY", authDomain: "YOUR_AUTH_DOMAIN", projectId: "YOUR_PROJECT_ID", storageBucket: "YOUR_STORAGE_BUCKET", messagingSenderId: "YOUR_SENDER_ID", appId: "YOUR_APP_ID" };

const app = initializeApp(firebaseConfig); const db = getFirestore(app); const auth = getAuth(app);

// ---------------- SIMPLE CATEGORIES ---------------- const categories = ["Blogs", "Stories", "Quotes", "Invitations", "Posters"];

export default function Inkvira() { const [user, setUser] = useState(null); const [view, setView] = useState("home");

const [posts, setPosts] = useState([]); const [title, setTitle] = useState(""); const [content, setContent] = useState(""); const [category, setCategory] = useState("Blogs");

useEffect(() => { signInAnonymously(auth); const unsub = onAuthStateChanged(auth, setUser); fetchPosts(); return () => unsub(); }, []);

async function fetchPosts() { const snap = await getDocs(collection(db, "posts")); setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() }))); }

async function createPost() { if (!title || !content) return;

await addDoc(collection(db, "posts"), {
  title,
  content,
  category,
  createdAt: serverTimestamp()
});

setTitle("");
setContent("");
fetchPosts();

}

function logout() { signOut(auth); }

const founderBio = "Haniya Ali is a 16-year-old student and emerging leader. Alongside her studies, she has worked in HR, project execution, marketing, and communication roles across multiple organizations including IMUN, ESIP, Gao Tek, Nourish Women Health Society, and She’s Beyond. She is also the founder of Blooming Women and has experience in hosting, writing, and creative leadership work. She continues to grow through learning, responsibility, and real-world experience.";

return ( <div className="min-h-screen bg-[#070a12] text-white font-sans">

{/* HEADER */}
  <header className="flex justify-between items-center px-6 py-4 border-b border-white/10">
    <h1 className="text-sm tracking-widest text-gray-300">INKVIRA</h1>

    <div className="flex gap-3 text-xs">
      <button onClick={() => setView("home")}>Home</button>
      <button onClick={() => setView("cms")}>CMS</button>
      <button onClick={logout}>Logout</button>
    </div>
  </header>

  {/* HOME */}
  {view === "home" && (
    <main className="max-w-4xl mx-auto px-6 py-16">

      {/* HERO */}
      <section className="text-center py-16">
        <h1 className="text-4xl font-semibold">
          Build Digital Identity
        </h1>
        <p className="text-gray-400 mt-3 text-sm">
          Blogs • Stories • Quotes • Invitations • Creative Content
        </p>
      </section>

      {/* FOUNDER */}
      <section className="py-10">
        <p className="text-gray-300 text-sm leading-relaxed text-center">
          {founderBio}
        </p>
      </section>

      {/* POSTS */}
      <section className="grid md:grid-cols-2 gap-4 mt-10">
        {posts.map(p => (
          <div key={p.id} className="p-4 border border-white/10 rounded">
            <h3 className="font-medium">{p.title}</h3>
            <p className="text-gray-400 text-sm mt-2">{p.content}</p>
            <span className="text-xs text-gray-500">{p.category}</span>
          </div>
        ))}
      </section>

    </main>
  )}

  {/* CMS */}
  {view === "cms" && (
    <main className="max-w-xl mx-auto px-6 py-16">

      <h2 className="text-lg mb-6">Create Post</h2>

      <input
        className="w-full p-2 mb-2 bg-white/5 border border-white/10"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <textarea
        className="w-full p-2 mb-2 bg-white/5 border border-white/10"
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
      />

      <select
        className="w-full p-2 mb-3 bg-white/5 border border-white/10"
        value={category}
        onChange={e => setCategory(e.target.value)}
      >
        {categories.map(c => (
          <option key={c}>{c}</option>
        ))}
      </select>

      <button
        onClick={createPost}
        className="w-full p-2 bg-white text-black"
      >
        Publish
      </button>

      <p className="text-xs text-gray-500 mt-6">
        Posts: {posts.length} | Status: Active
      </p>

    </main>
  )}

</div>

); }
