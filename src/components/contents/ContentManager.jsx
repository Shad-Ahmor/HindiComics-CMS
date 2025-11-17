import React, { useState, useEffect, useMemo, useRef } from "react";
// External dependencies (assuming they are available in the environment)
// import { useNavigate } from "react-router-dom";
// import api from "../api"; 
// import { decryptData, encryptData } from "../Security/cryptoUtils";
import { v4 as uuidv4 } from "uuid"; // ✅ FIX: uuidv4 को आयात किया गया है
import ReactMarkdown from "react-markdown";
import ContentEditor from './ContentEditor'
import ContentDisplay from './ContentDisplay'
import '../../styles/Content.css'
// **********************************************
// ✅ FIX: Mocking Dependencies/Imports for ContentEditor/Display Context
// चूंकि ContentEditor और ContentDisplay को categories.js से डेटा की आवश्यकता होगी,
// इसलिए यहाँ भी category data को उपलब्ध कराना आवश्यक है
// (आपके वास्तविक प्रोजेक्ट में, आप 'categories.js' से import करेंगे)
const shayariCategories = ["Love Shayari", "Dard Bhari Shayari", "Attitude Shayari", "Zindagi Shayari", "Dosti Shayari", "Nature Shayari", "Funny Shayari", "Festival Shayari", "Bhagwan Shayari", "Bollywood Shayari"]; 
const jokesCategories = ["Funny Jokes", "Husband Wife Jokes", "IT Jokes", "Teacher Student Jokes", "Pappu Jokes", "Office Jokes", "Doctor Patient Jokes"];
const storyCategories = ["Moral Stories", "Motivational Stories", "Inspiration Stories", "Love Stories", "Sad Stories", "Adventure Stories", "Fantasy Stories", "Folk Tales", "Children Stories"];

// Mocking dependencies for a runnable single file environment
const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);
const api = {
  get: async (url, config) => {
    console.log(`API GET: ${url}`, config);
    // Mock data based on database selection
    if (url.includes("jokes")) {
        return { data: [
            { jokeId: 'j1', category: 'Funny Jokes', writername: 'Ravi', jokeText: 'Why did the coffee file a police report? It got mugged.', postedBy: 'Admin' },
            { jokeId: 'j2', category: 'IT Jokes', writername: 'Priya', jokeText: 'There are 10 kinds of people: those who know binary and those who don\'t.', postedBy: 'Admin' },
            { jokeId: 'j3', category: 'Husband Wife Jokes', writername: 'Mohan', jokeText: 'Wife: Where are you? Husband: I am at office. Wife: Who is there? Husband: Me, my computer, and the coffee machine. Wife: Say Hi to all 3.', postedBy: 'Admin' },
        ]};
    } else if (url.includes("stories")) {
        return { data: [
            { storyId: 's1', category: 'Motivational Stories', title: 'The Two Wolves', writername: 'Arjun', story: 'An old Cherokee is teaching his grandson about life...\\n\\n"A fight is going on inside me," he said to the boy. "It is a terrible fight and it is between two wolves. One is evil - he is fear, anger, envy, sorrow, regret, greed, arrogance, self-pity, guilt, resentment, inferiority, lies, false pride, superiority, and ego."\\n\\nHe continued, "The other is good - he is joy, peace, love, hope, serenity, humility, kindness, benevolence, empathy, generosity, truth, compassion, and faith. The same fight is going on inside you – and inside every other person, too."\\n\\nThe grandson thought about it for a minute and then asked his grandfather, "Which wolf will win?"\\n\\nThe old Cherokee simply replied, "The one you feed."', image: 'https://placehold.co/400x200/5cb85c/ffffff?text=Inspiration', postedBy: 'Admin' },
        ]};
    } else if (url.includes("shayri")) {
        return { data: [
            { shayriId: 'sh1', category: 'Love Shayari', shayarname: 'Ghalib', tag: 'ishq', shayri: 'Hazaaron khwahishen aisi ke har khwahish pe dum nikle.\\nBohat niklay mere armaan, phir bhi kam nikle.', postedBy: 'Admin' },
        ]};
    }
    return { data: [] };
  },
  post: async (url, payload, config) => { console.log("API POST:", url, payload); },
  put: async (url, payload, config) => { console.log("API PUT:", url, payload); },
  delete: async (url, config) => { console.log("API DELETE:", url); },
};
const decryptData = (data) => data ? data : "Admin"; 
// **********************************************


const ContentManager = () => {
  const [items, setItems] = useState([]);
  const [database, setDatabase] = useState("jokes");
  const [token, setToken] = useState("mock-token-123"); // Mocked token
  const [userName, setUserName] = useState("Admin"); // Mocked user
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  const fetchItems = async () => {
    if (!token) return;
    try {
      // ✅ FIX 1: API URL को डायनामिक '/${database}' पर बदलें (यह पहले से ही सही लग रहा था)
      // `?database=${database}` query parameter को हटाना बेहतर है यदि यह redundant है।
      const res = await api.get(`/${database}`, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Correcting the key if it came as jokeText instead of joke
      const data = res.data.map(item => ({
        ...item,
        joke: item.jokeText || item.joke // ensure joke or jokeText exists
      }));
      setItems(data || []);
    } catch (err) {
      console.error(`Fetch error for ${database}:`, err.message);
      setItems([]);
    }
  };

  useEffect(() => {
    // Mocking Auth logic
    const storedToken = localStorage.getItem("token") || "mock-token-123";
    const storedUser = decryptData(localStorage.getItem("name")) || "Admin";
    if (!storedToken) {
      navigate("/login");
      return;
    }
    setToken(storedToken);
    setUserName(storedUser);
  }, [navigate]);

  useEffect(() => {
    // यह effect 'token' या 'database' बदलने पर चलता है, जिससे fetchItems कॉल होता है।
    if (token) fetchItems();
    // Reset editing state on database change
    setEditingItem(null);
  }, [token, database]);


  // Handlers for ContentDisplay
  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    const id = item.jokeId || item.storyId || item.shayriId;
    
    try {
        // ✅ FIX 2: Delete URL को डायनामिक '/${database}/${id}' पर बदलें (यह पहले से ही सही है)
        await api.delete(`/${database}/${id}`, { 
            headers: { Authorization: `Bearer ${token}` },
        });
        fetchItems();
    } catch (error) {
        console.error("Delete error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="vision-container">
      {/* Header Panel */}
      <div className="vision-panel header-panel" style={{marginBottom: '20px'}}>
        <h1 className="vision-text-primary">Content Manager</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          {/* Database Selector (MUI FormControl replacement) */}
          <div className="vision-form-group">
            <label htmlFor="database-select" className="vision-label" style={{marginBottom: '4px'}}>Database</label>
            <select 
              id="database-select" 
              className="vision-input vision-select" 
              value={database} 
              onChange={(e) => setDatabase(e.target.value)}
              style={{ minWidth: '150px' }}
            >
              <option value="jokes">Jokes</option>
              <option value="stories">Stories</option>
              <option value="shayri">Shayari</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Editor (Add/Edit Modal Trigger) */}
      {/* Note: ContentEditor अब आपके द्वारा प्रदान किए गए नवीनतम कोड का उपयोग करेगा 
          जिसमें ReactMarkdown import और category logic सही है। */}
      <ContentEditor
        database={database}
        items={items}
        setItems={setItems}
        token={token}
        userName={userName}
        fetchItems={fetchItems}
        editingItem={editingItem}
        setEditingItem={setEditingItem}
      />

      {/* Display (Search, Filter, Cards) */}
      <ContentDisplay 
        items={items} 
        database={database} 
        handleEdit={handleEdit} 
        handleDelete={handleDelete} 
      />
    </div>
  );
};

export default ContentManager;