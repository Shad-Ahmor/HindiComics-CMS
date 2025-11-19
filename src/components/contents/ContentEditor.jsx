import React, { useState, useEffect, useRef } from "react";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";

import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from "uuid";
import { 
  RiBookOpenLine,
  RiUser3Line,
  RiImageAddLine,
  RiBold,
    RiItalic,
  RiUnderline,
  RiStrikethrough,
  RiDoubleQuotesL,
  RiCodeSSlashLine,
  RiSeparator,
  RiArrowGoBackLine
} from "react-icons/ri";


import { jokesCategories, storyCategories, shayariCategories } from './categories.js';
import api from "../common/api.js";
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
setPostedBy(userName);
setSelectedId(null);
setEditingItem(null);
};

useEffect(() => {
setPostedBy(editingItem?.postedBy || userName);


if (editingItem) {  
  setSelectedId(editingItem.jokeId || editingItem.storyId || editingItem.shayriId);  
  setCategory(editingItem.category || "");  

  if (database === "stories") {  
    setTitle(editingItem.title || "");  
    setWritername(editingItem.writername || "");  
    setImage(editingItem.image || "");  
    setContent(editingItem.story || "");  
  } else if (database === "shayri") {  
    setShayarname(editingItem.shayarname || "");  
    setTag(editingItem.tag || "");  
    setContent(editingItem.shayri || "");  
  } else {  
    setWritername(editingItem.writername || "");  
    setContent(editingItem.joke || "");  // backend me field 'joke' hai  
  }  
  setOpenDialog(true);  
} else if (!openDialog) {  
  resetForm();  
}  


}, [editingItem, database, userName, setEditingItem, openDialog]);

const insertBeforeAfter = (symbol) => {
  const textarea = contentRef.current;
  if (!textarea) return;

  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);

  const newText =
    value.slice(0, selectionStart) +
    symbol +
    (selected || "text") +
    symbol +
    value.slice(selectionEnd);

  setContent(newText);
};

const insertLine = (prefix, wrap = false) => {
  const textarea = contentRef.current;
  if (!textarea) return;

  const { selectionStart, selectionEnd, value } = textarea;
  const selected = value.slice(selectionStart, selectionEnd);

  const newText =
    value.slice(0, selectionStart) +
    (wrap ? prefix + selected + prefix : prefix + selected) +
    value.slice(selectionEnd);

  setContent(newText);
};

const handleNewLineClick = () => {
const textarea = contentRef.current;
if (!textarea) return;
const { selectionStart, selectionEnd, value } = textarea;
const newText = value.slice(0, selectionStart) + "\n" + value.slice(selectionEnd);
setContent(newText);
};

const handleSubmit = async (e) => {
e.preventDefault();
if (!token) return;


const newId = selectedId || uuidv4();  
let payload;  

if (database === "jokes") {  
  payload = { jokeId: newId, category, joke: content, postedBy };  
} else if (database === "stories") {  
  payload = { storyId: newId, title, writername, image, story: content, category, postedBy };  
} else {  
  payload = { shayriId: newId, category, shayri: content, shayarname, tag, postedBy };  
}  

try {  
  if (selectedId) {  
    await api.put(`/content/${database}/${newId}`, payload, { headers: { Authorization: `Bearer ${token}` } });  
  } else {  
    await api.post(`/content/create/${database}`, payload, { headers: { Authorization: `Bearer ${token}` } });  
  }  
  fetchItems();  
  resetForm();  
  setOpenDialog(false);  
} catch (error) {  
  console.error("Save error:", error.response?.data || error.message);  
}  


};

const modalTitle = `${selectedId ? "Edit" : "Create"} ${database === "jokes" ? "Joke" : database === "stories" ? "Story" : "Shayari"}`;

const handleCloseDialog = () => {
resetForm();
setOpenDialog(false);
};

return (
<>
<button className="vision-button primary" onClick={() => { if (!editingItem) resetForm(); setOpenDialog(true); }} style={{ marginBottom: '20px', width: '180px' }}>
<i className="lucide-icon lucide-plus" style={{ marginRight: '5px' }}></i> Add {database === "jokes" ? "Joke" : database === "stories" ? "Story" : "Shayari"} </button>


  {openDialog && (  
    <div className="vision-modal-backdrop" onClick={handleCloseDialog}>  
      <div className={`vision-modal-panel ${database === 'stories' ? 'large' : ''}`} onClick={(e) => e.stopPropagation()}>  
        <button className="vision-close-button" onClick={handleCloseDialog}>&times;</button>  
        <h2 className="vision-text-secondary" style={{marginBottom: '20px'}}>{modalTitle}</h2>  

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: '15px' }}>  
          <div className="vision-form-group">  
            <label htmlFor="category-select" className="vision-label">Category</label>  
            <select id="category-select" className="vision-input vision-select" value={category} onChange={(e) => setCategory(e.target.value)} required>  
              <option value="" disabled>Select a Category</option>  
              {getCategoryList().map((cat) => <option key={cat} value={cat}>{cat}</option>)}  
            </select>  
          </div>  

 {database === "stories" && (
  <div className="story-fields">

    {/* Title */}
    <div className="input-wrapper">
      <RiBookOpenLine className="input-icon" />
      <input
        type="text"
        className="vision-input"
        placeholder="Story Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
    </div>

    {/* Writer Name */}
    <div className="input-wrapper">
      <RiUser3Line className="input-icon" />
      <input
        type="text"
        className="vision-input"
        placeholder="Writer Name"
        value={writername}
        onChange={(e) => setWritername(e.target.value)}
        required
      />
    </div>

    {/* Image URL */}
    <div className="input-wrapper">
      <RiImageAddLine className="input-icon" />
      <input
        type="url"
        className="vision-input"
        placeholder="Image URL (Optional)"
        value={image}
        onChange={(e) => setImage(e.target.value)}
      />
    </div>
  </div>
)}

          {database === "shayri" && (<>  
            <input type="text" className="vision-input" placeholder="Shayar Name" value={shayarname} onChange={(e) => setShayarname(e.target.value)} required />  
            <input type="text" className="vision-input" placeholder="Tag" value={tag} onChange={(e) => setTag(e.target.value)} />  
          </>)}  

          {database === "jokes" && (  
            <input type="text" className="vision-input" placeholder="Writer Name" value={writername} onChange={(e) => setWritername(e.target.value)} required />  
          )}  

          <div className="editor-toolbar">
  <button type="button" onClick={() => insertBeforeAfter("**")} title="Bold">
    <RiBold size={18} />
  </button>

  <button type="button" onClick={() => insertBeforeAfter("*")} title="Italic">
    <RiItalic size={18} />
  </button>

  <button type="button" onClick={() => insertBeforeAfter("~~")} title="Strikethrough">
    <RiStrikethrough size={18} />
  </button>

  <button type="button" onClick={() => insertLine("> ")} title="Quote">
    <RiDoubleQuotesL size={18} />
  </button>

  <button type="button" onClick={() => insertLine("`", true)} title="Code">
    <RiCodeSSlashLine size={18} />
  </button>

  <button type="button" onClick={() => insertLine("\n---\n")} title="Divider">
    <RiSeparator size={18} />
  </button>

  <button type="button" onClick={handleNewLineClick} title="New Line">
    <RiArrowGoBackLine size={18} />
  </button>
</div>



          <textarea className="vision-textarea" placeholder={database === "jokes" ? "Enter the Joke content" : database === "stories" ? "Write the Story content" : "Write the Shayari content"} rows={6} value={content} onChange={(e) => setContent(e.target.value)} ref={contentRef} required />  

          <div className="vision-text-tertiary">Preview:</div>  
          <div className="vision-panel" style={{ padding: '15px', minHeight: '100px', fontSize: '0.9rem', border: '1px solid var(--color-border)' }}>  
   

       <ReactMarkdown
  remarkPlugins={[remarkGfm, remarkBreaks]}
  rehypePlugins={[rehypeRaw, rehypeHighlight]}
>
  {content}
</ReactMarkdown>


          </div>  

{selectedId && (
  <input
    type="text"
    className="vision-input"
    placeholder="Posted By"
    value={postedBy}
    readOnly
    disabled
    style={{ cursor: "default", opacity: 0.7 }}
  />
)}

          <div className="modal-actions">  
            <button type="button" className="vision-button secondary" onClick={handleCloseDialog}>Cancel</button>  
            <button type="submit" className="vision-button primary">Save</button>  
          </div>  
        </form>  
      </div>  
    </div>  
  )}  
</>  


);
};

export default ContentEditor;
