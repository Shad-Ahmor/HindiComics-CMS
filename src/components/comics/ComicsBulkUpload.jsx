import React, { useState } from "react";
// import api from '../common/api'; // Removed external import
// import { useNavigate } from 'react-router-dom'; // Using mock navigate for single file environment
// import { decryptData } from "../../utils/encryption.jsx"; // Removed external import

// Component ko self-contained banane ke liye mock implementations
// Mocking decryptData function:
const decryptData = (data) => {
  // Production environment ke liye, yeh asal decryption function hoga.
  // Abhi hum data ko seedhe return kar rahe hain ya default 'admin' de rahe hain.
  if (!data) return 'admin'; 
  return data;
};

// Mocking the 'api' object and 'post' method
const api = {
  post: async (url, data, config) => {
    console.log(`Mock API POST request to: ${url}`);
    console.log("Mock data payload:", data);
    // Real API call ko simulate karne ke liye successful response return karna
    return { status: 200, data: { message: 'Upload successful (Mock)' } };
  },
};

// Mocking useNavigate since we are in a single-file environment
const useNavigate = () => {
    return (path) => {
        console.log(`Navigation mocked: trying to go to ${path}`);
    };
};


const ComicsBulkUpload = () => {
  const [jsonData, setJsonData] = useState(""); 
  const [message, setMessage] = useState(""); 
  
  // Handling localStorage access for robustness in the immersive environment
  const storedRole = typeof localStorage !== 'undefined' ? localStorage.getItem('role') : 'admin';
  const rolelocal = decryptData(storedRole); 
  
  const defaultDatabase = rolelocal === "intern" ? "ComicsDemo" : "Comics";
  const [selectedDatabase, setSelectedDatabase] = useState(defaultDatabase);
  
  const navigate = useNavigate();
  const defaultDatabases = rolelocal === "intern" ? ["ComicsDemo", "EducationDemo", "ReligiousDemo"] : ["Comics", "Education", "Religious"];

  const handleDatabaseChange = (e) => setSelectedDatabase(e.target.value);
  const handleJsonChange = (e) => setJsonData(e.target.value);

  const handleBulkUpload = async () => {
    if (!jsonData) return setMessage("Please paste valid JSON data.");
    try {
      const parsedData = JSON.parse(jsonData);
      if (!Array.isArray(parsedData)) return setMessage("Invalid JSON format. Expected an array of comics.");
      
      // Checking token (mocked)
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : 'mock-token';
      if (!token) {
        console.warn("Authentication token missing. Mocking navigation to login.");
        navigate('/login');
        return; 
      }

      // Mocked API call structure
      const response = await api.post(
        `/comics/upload/${selectedDatabase}`,
        { comics: parsedData },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setMessage("Bulk comics uploaded successfully.");
        setJsonData("");
      } else setMessage("Error uploading comics.");
    } catch (error) {
      console.error(error);
      setMessage("Error uploading comics. Check the JSON format or network issues.");
    }
  };

  return (
    // Vision OS Panel for the main container (Glassmorphism effect)
    <div className="vision-panel p-6"> 
      <h2 className="vision-text-primary mb-3">Bulk Upload Comics</h2>
      <p className="vision-text-tertiary mb-5">
        Paste your comics JSON below. Make sure it’s an array of objects with all required fields.
      </p>

      {/* Database selection */}
      <div className="mb-4">
        {/* vision-text-tertiary provides secondary text color for labels */}
        <label className="vision-text-tertiary block mb-2">Choose Database</label>
        {/* vision-input is used for both input and select elements */}
        <select className="vision-input" value={selectedDatabase} onChange={handleDatabaseChange}>
          {defaultDatabases.map(db => <option key={db} value={db}>{db}</option>)}
        </select>
      </div>

      {/* JSON textarea */}
      <div className="mb-4">
        <label className="vision-text-tertiary block mb-2">Paste JSON</label>
        {/* vision-textarea for the multi-line input */}
        <textarea
          className="vision-textarea"
          rows={10}
          placeholder='Paste JSON here, e.g., [{"name": "Comic Name", "Date": "2025-02-02", ...}]'
          value={jsonData}
          onChange={handleJsonChange}
        />
      </div>

      {/* Upload Message (Uses the custom 'upload-message' class styled in CSS) */}
      {message && <div className="upload-message">{message}</div>}

      {/* Action Buttons (Using modal-actions flex layout and vision-button classes) */}
      <div className="modal-actions">
        <button className="vision-button cancel" onClick={() => { setJsonData(""); setMessage(""); }}>Clear</button>
        <button className="vision-button primary" onClick={handleBulkUpload}>Upload Comics</button>
      </div>

      {/* JSON Example (Uses the custom 'json-example' class styled in CSS) */}
      <div className="json-example">
        <strong>Example JSON format:</strong>
        <pre>{`[{
  "name": "Comic Name",
  "Date": "2025-02-02",
  "Discription": "Description of the comic",
  "Premium": true,
  "Tag": "Action",
  "category": "Adventure",
  "filename": "comic-1",
  "fileurl": "https://example.com/comic-1.pdf",
  "imageurl": "https://example.com/comic-1.jpg",
  "imgurl": "https://example.com/comic-1-small.jpg",
  "nov": 100
}]`}</pre>
      </div>
    </div>
  );
};

export default ComicsBulkUpload;
