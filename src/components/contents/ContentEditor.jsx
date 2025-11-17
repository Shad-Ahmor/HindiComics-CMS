import React, { useState, useEffect, useMemo, useRef } from "react";
// 🛑 FIX: Add the missing import for ReactMarkdown
import ReactMarkdown from 'react-markdown'; 
// Assuming api, uuidv4 are available either globally or imported elsewhere

// ✅ FIX: Import categories from the external file
import { 
  jokesCategories, 
  storyCategories, 
  shayariCategories 
} from './categories.js'; 


const ContentEditor = ({ database, items, setItems, token, userName, fetchItems, editingItem, setEditingItem }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [title, setTitle] = useState("");
  const [writername, setWritername] = useState("");
  const [shayarname, setShayarname] = useState("");
  const [tag, setTag] = useState("");
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [postedBy, setPostedBy] = useState(userName);
  const contentRef = useRef(null);

  const getCategoryList = () => {
    if (database === "shayri") return shayariCategories;
    if (database === "stories") return storyCategories;
    return jokesCategories;
  };

  const resetForm = () => {
    setTitle("");
    setWritername("");
    setImage("");
    setCategory("");
    setShayarname("");
    setTag("");
    setContent("");
    setPostedBy(userName); // Reset to current user
    setSelectedId(null);
    setEditingItem(null);
  };

  // Populate form if editingItem changes and reset postedBy logic
  useEffect(() => {
    // FIX 2: Ensure postedBy is correctly set. Use editingItem's postedBy for edits, else current userName.
    setPostedBy(editingItem?.postedBy || userName);
    
    if (editingItem) {
      const isJoke = database === "jokes";
      const isStory = database === "stories";
      const isShayari = database === "shayri";

      setSelectedId(editingItem.jokeId || editingItem.storyId || editingItem.shayriId);
      setCategory(editingItem.category || "");
      
      if (isStory) {
        setTitle(editingItem.title || "");
        setWritername(editingItem.writername || "");
        setImage(editingItem.image || "");
        setContent(editingItem.story || "");
      } else if (isShayari) {
        setShayarname(editingItem.shayarname || "");
        setTag(editingItem.tag || "");
        setContent(editingItem.shayri || "");
      } else if (isJoke) {
        setWritername(editingItem.writername || "");
        setContent(editingItem.jokeText || ""); // Note: use jokeText from state payload
      }
      setOpenDialog(true);
    } else {
      // Only reset the rest of the form fields if we're not currently editing
      // and editingItem becomes null (e.g., after save/cancel).
      // We don't call resetForm here directly to avoid conflicts with state updates.
      if (!openDialog) {
          setTitle("");
          setWritername("");
          setImage("");
          setCategory("");
          setShayarname("");
          setTag("");
          setContent("");
          setSelectedId(null);
      }
    }
  }, [editingItem, database, userName, setEditingItem, openDialog]); // Added openDialog dependency

  const handleBoldClick = () => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    const selectedText = value.slice(selectionStart, selectionEnd);
    const newText =
      value.slice(0, selectionStart) + `**${selectedText || "bold"}**` + value.slice(selectionEnd);
    setContent(newText);
  };

  const handleNewLineClick = () => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd, value } = textarea;
    // Add two backslashes for a hard line break in ReactMarkdown (when rendered as \\n in source)
    const newText = value.slice(0, selectionStart) + "\\n" + value.slice(selectionEnd);
    setContent(newText);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    // Assuming uuidv4 and api functions are correctly scoped or imported outside
    const newId = selectedId || uuidv4(); 
    let payload;

    if (database === "jokes") {
      payload = { jokeId: newId, category, writername, jokeText: content, postedBy, createdAt: new Date().toISOString() };
    } else if (database === "stories") {
      payload = { storyId: newId, title, writername, image, story: content, postedBy, createdAt: new Date().toISOString() };
    } else { // shayri
      payload = { shayriId: newId, category, shayarname, tag, shayri: content, postedBy, createdAt: new Date().toISOString() };
    }

    try {
      if (selectedId) {
        // PUT URL को डायनामिक '/${database}/${newId}' पर बदलें
        await api.put(`/${database}/${newId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // POST URL को डायनामिक '/${database}/create' पर बदलें
        await api.post(`/${database}/create`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      fetchItems();
      resetForm();
      setOpenDialog(false);
    } catch (error) {
      console.error("Save error:", error.response?.data || error.message);
      // In a real app, you'd show a user-friendly error message here
    }
  };

  const modalTitle = `${selectedId ? "Edit" : "Create"} ${
    database === "jokes" ? "Joke" : database === "stories" ? "Story" : "Shayari"
  }`;

  // Helper to handle closing the dialog
  const handleCloseDialog = () => {
      resetForm();
      setOpenDialog(false);
  }

  return (
    <>
      <button
        className="vision-button primary"
        onClick={() => {
            // Ensure form is reset before opening for a new item
            if (!editingItem) resetForm(); 
            setOpenDialog(true)
        }}
        style={{ marginBottom: '20px', width: '180px' }}
      >
        <i className="lucide-icon lucide-plus" style={{ marginRight: '5px' }}></i> Add{" "}
        {database === "jokes" ? "Joke" : database === "stories" ? "Story" : "Shayari"}
      </button>

      {/* Modal / Dialog Implementation */}
      {openDialog && (
        <div className="vision-modal-backdrop" onClick={handleCloseDialog}>
          <div 
            className={`vision-modal-panel ${database === 'stories' ? 'large' : ''}`}
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
          >
            <button className="vision-close-button" onClick={handleCloseDialog}>
              &times;
            </button>
            <h2 className="vision-text-secondary" style={{marginBottom: '20px'}}>{modalTitle}</h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: '15px' }}>
              
              {/* Category Dropdown (Replacing Autocomplete) */}
              <div className="vision-form-group">
                <label htmlFor="category-select" className="vision-label">Category</label>
                <select
                    id="category-select"
                    className="vision-input vision-select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="" disabled>Select a Category</option>
                    {getCategoryList().map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
              </div>

              {database === "stories" && (
                <>
                  <input type="text" className="vision-input" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  <input type="text" className="vision-input" placeholder="Writer Name" value={writername} onChange={(e) => setWritername(e.target.value)} required />
                  <input type="url" className="vision-input" placeholder="Image URL (Optional)" value={image} onChange={(e) => setImage(e.target.value)} />
                </>
              )}

              {database === "shayri" && (
                <>
                  <input type="text" className="vision-input" placeholder="Shayar Name" value={shayarname} onChange={(e) => setShayarname(e.target.value)} required />
                  <input type="text" className="vision-input" placeholder="Tag (e.g. ishq, dard)" value={tag} onChange={(e) => setTag(e.target.value)} />
                </>
              )}

              {database === "jokes" && (
                <input type="text" className="vision-input" placeholder="Writer Name" value={writername} onChange={(e) => setWritername(e.target.value)} required />
              )}

              {/* Formatting Toolbar */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '5px 0' }}>
                <button type="button" onClick={handleBoldClick} className="vision-button-icon" title="Bold">
                    <i className="lucide-icon lucide-bold"></i>
                </button>
                <button type="button" onClick={handleNewLineClick} className="vision-button-icon" title="New Line (\n)">
                    <i className="lucide-icon lucide-corner-down-left"></i>
                </button>
              </div>

              <textarea
                className="vision-textarea"
                placeholder={database === "jokes" ? "Enter the Joke content" : database === "stories" ? "Write the Story content" : "Write the Shayari content"}
                rows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                ref={contentRef}
                required
              />

              <div className="vision-text-tertiary">Preview:</div>
              <div 
                className="vision-panel" 
                style={{ 
                    padding: '15px', 
                    minHeight: '100px', 
                    fontSize: '0.9rem',
                    border: '1px solid var(--color-border)'
                }}
              >
                {/* We replace \\n with \n for ReactMarkdown to treat it as a newline */}
                <ReactMarkdown>{content.replace(/\\n/g, "\n")}</ReactMarkdown>
              </div>

              <input type="text" className="vision-input" placeholder="Posted By" value={postedBy} readOnly disabled style={{cursor: 'default', opacity: 0.7}} />

              <div className="modal-actions">
                <button type="button" className="vision-button secondary" onClick={handleCloseDialog}>
                  Cancel
                </button>
                <button type="submit" className="vision-button primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ContentEditor;