import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid"; 
import ContentEditor from './ContentEditor';
import ContentDisplay from './ContentDisplay';
import '../../styles/Content.css';
import api from "../common/api.js";
const shayariCategories = ["Love Shayari","Dard Bhari Shayari","Attitude Shayari","Zindagi Shayari","Dosti Shayari","Nature Shayari","Funny Shayari","Festival Shayari","Bhagwan Shayari","Bollywood Shayari"]; 
const jokesCategories = ["Funny Jokes","Husband Wife Jokes","IT Jokes","Teacher Student Jokes","Pappu Jokes","Office Jokes","Doctor Patient Jokes"];
const storyCategories = ["Moral Stories","Motivational Stories","Inspiration Stories","Love Stories","Sad Stories","Adventure Stories","Fantasy Stories","Folk Tales","Children Stories"];

const useNavigate = () => (path) => console.log(`Navigating to: ${path}`);

const ContentManager = ({ token, user, uid, userrole }) => {
  const [items, setItems] = useState([]);
  const [database, setDatabase] = useState("jokes");
  const [userName, setUserName] = useState(user || "Admin");
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();
const fetchItems = async () => {
  if (!token) return;

  try {
    const res = await api.post(
      `/content?database=${database}`,
      {}, // body can be empty for fetch
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const data = res.data || [];
    setItems(data);
  } catch (err) {
    console.error(`Fetch error for ${database}:`, err.message);
    setItems([]);
  }
};


  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchItems();
    setEditingItem(null);
  }, [token, database]);

const handleEdit = (item) => {
  console.log("Editing:", item);
  setEditingItem(item);
};

  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    const id = item.jokeId || item.storyId || item.shayriId || item.id || null;
    try {
      await api.delete(`content/${database}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchItems();
    } catch (error) {
      console.error("Delete error:", error.response?.data || error.message);
    }
  };

  return (
    <div className="vision-container">
      <div className="card">
        <div className="vision-panel header-panel" style={{ marginBottom: '20px' }}>
          <h1 className="vision-text-primary">Content Manager</h1>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div className="vision-form-group">
              <label htmlFor="database-select" className="vision-label" style={{ marginBottom: '4px' }}>Database</label>
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

        <ContentDisplay 
          items={items}
          database={database}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default ContentManager;
