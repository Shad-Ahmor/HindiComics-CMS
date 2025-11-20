import React, { useState, useEffect,useRef } from "react";
import api from '../common/api';
import { useNavigate } from "react-router-dom";
import ComicsBulkUpload from "./ComicsBulkUpload";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { decryptData } from "../../utils/encryption.jsx";
import "../../styles/ComicsTheme.css"; // This will contain the actual Vision OS styles
import { Database } from "lucide-react";

const Comics = ({user,userrole,designation,token,uid}) => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openBulkUpload, setOpenBulkUpload] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedRows, setExpandedRows] = useState({});
 const [categories, setCategories] = useState([ 
    "HindiBooks",
    "HindiComics",
    "HindiDubbed",
    "HinduBooks",
    "IslamicBooks",
    "Btech",
"BA",
"BCom",
"Bsc",
"HigherSecondary",
"Intermediate",
"MangaComics",
"Medical",
"PrimaryEducation",
"SecondaryEducation"
  ]); 

  const [newComic, setNewComic] = useState({
    name: "", Date: null, Discription: "", Premium: false, Tag: "",
    category: "", filename: "", fileurl: "", imageurl: "", imgurl: "", nov: 0, database: ""
  });

  const navigate = useNavigate();
  const demoDatabases = ["ComicsDemo", "EducationDemo", "ReligiousDemo"];
  const liveDatabases = ["Comics", "Education", "Religious"];
  const defaultDatabases =
  userrole === "admin"
    ? [...demoDatabases, ...liveDatabases]
    : demoDatabases; 

  const fetchRef = useRef(false);





useEffect(() => {
  if (!selectedDatabase) {
    setSelectedDatabase(defaultDatabases[0]);
    return;
  }

  fetchComics();
}, [selectedDatabase]);

  
  const fetchComics = async () => {
    setLoading(true);
    try {
      if (!token) {
        console.warn("Token missing, redirecting to login...");
        return navigate("/login");
      }

      const response = await api.post(
        "/comics",
        {
          database: selectedDatabase,
          role: userrole,
          designation:designation,
          userId: uid,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const comicsData = response.data;
      setComics(
        comicsData ? Object.keys(comicsData).map(id => ({ id, ...comicsData[id] })) : []
      );
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        console.warn("Unauthorized. Token expired or invalid, redirecting to login...");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };
const toggleExpand = (id) => {
  setExpandedRows(prev => ({
    ...prev,
    [id]: !prev[id]
  }));
};
  const handleDatabaseChange = (e) => {
    setSelectedDatabase(e.target.value); // Update the selected database
  };
  
  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    setNewComic(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

    const handleViewPdf = (fileurl) => {
    if (fileurl) {
      const newfileurl = `https://drive.google.com/file/d/${fileurl}`; // Create the full URL
      window.open(newfileurl, "_blank"); // Open in a new tab
    }
  };
  
  const handleViewImage = (imgurl) => {
    if (imgurl) {
      window.open(imgurl, "_blank"); // Open in a new tab
    }
  };
const handleAddEditComic = async () => {
  try {
    if (!token) return navigate('/login');

    const endpoint = isEditing
      ? `/comics/${selectedDatabase}/${newComic.filename}`
      : `/comics/${selectedDatabase}`;

    const payload = { ...newComic };

    const method = isEditing ? api.put : api.post;

    const response = await method(endpoint, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 200 || response.status === 201) {
      fetchComics();
      setOpenForm(false);
      setIsEditing(false);
      setNewComic({
        name: "", Date: null, Discription: "", Premium: false, Tag: "",
        category: "", filename: "", fileurl: "", imageurl: "", imgurl: "", nov: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};


  const handleEdit = comic => {
    setNewComic({ ...comic });
    setIsEditing(true);
    setOpenForm(true);
  };
const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this comic?")) return;

  try {
    if (!token) return navigate('/login');

    await api.delete(`/comics/${selectedDatabase}/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchComics();

  } catch (err) {
    console.error("Failed to delete comic:", err);
  }
};
const handleApprove = async (comic) => {
  try {
    await api.post(
      `/comics/moderate/${selectedDatabase}/${comic.filename}`,
      { status: "approved" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchComics();
  } catch (err) {
    console.error("Approve error:", err);
  }
};
const handleReject = async (comic) => {
  try {
    await api.post(
      `/comics/moderate/${selectedDatabase}/${comic.filename}`,
      { status: "rejected" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchComics();
  } catch (err) {
    console.error("Reject error:", err);
  }
};




const filteredComics = comics.filter(c =>
  c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  c.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (c.Discription || "").toLowerCase().includes(searchQuery.toLowerCase())
);

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentComics = filteredComics.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredComics.length / rowsPerPage);

  // Function to change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  return (
    <div className="vision-container">
        <div className="card">
      {/* Header Panel (Glassy) */}
      <div className="vision-panel header-panel">
        <h1 className="vision-text-primary">Comics Management</h1>
        <div className="flex space-x-4">
          <button className="vision-button primary" onClick={() => { 
            setOpenForm(true); 
            setIsEditing(false); 
            setNewComic({
              name: "", Date: null, Discription: "", Premium: false, Tag: "",
              category: "", filename: "", fileurl: "", imageurl: "", imgurl: "", nov: 0, database: ""
            });
          }}>+ Add New Comic</button>
          <button className="vision-button secondary" onClick={() => setOpenBulkUpload(true)}>⬆️ Bulk Upload</button>
        </div>
      </div>
      
      {/* Controls Panel (Glassy) - FIX APPLIED HERE */}
      <div className="vision-panel controls-panel grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">

  {/* Search */}
  <input
    className="vision-input col-span-2 lg:col-span-3"
    type="text"
    placeholder="Search Name, Filename, or Description..."
    value={searchQuery}
    onChange={e => {
      setSearchQuery(e.target.value);
      setCurrentPage(1);
    }}
  />

  {/* Select Database */}
  <select
    className="vision-input col-span-1"
    value={selectedDatabase}
    onChange={e => {
      setSelectedDatabase(e.target.value);
      setCurrentPage(1);
    }}
  >
    {defaultDatabases.map(db => (
      <option key={db} value={db}>{db}</option>
    ))}
  </select>

  {/* Rows per page */}
  <select
    className="vision-input col-span-1"
    value={rowsPerPage}
    onChange={(e) => {
      setRowsPerPage(Number(e.target.value));
      setCurrentPage(1);
    }}
  >
    <option value="5">5 rows</option>
    <option value="10">10 rows</option>
    <option value="20">20 rows</option>
    <option value="50">50 rows</option>
    <option value="100">100 rows</option>
  </select>

</div>


      {/* Comics Table Panel (Glassy) */}
<div className="vision-panel table-panel">
  <div className="table-grid table-header">
    <span className="table-cell">Name</span>
    <span className="table-cell">Filename</span>
    <span className="table-cell">Date</span>
    <span className="table-cell">Description</span>
    <span className="table-cell">Premium</span>
    <span className="table-cell">Status</span>
    <span className="table-cell">Media</span>
    <span className="table-cell">Approval</span>
    <span className="table-cell">Actions</span>
  </div>

  {loading ? (
    <div className="vision-loading">
      <div className="vision-spinner"></div>
      Loading Comics from **{selectedDatabase}**...
    </div>
  ) : filteredComics.length === 0 ? (
    <div className="vision-empty-state">No comics found for the current search/database.</div>
  ) : (
    currentComics.map(comic => (
      <div className="table-row" key={comic.id}>
        <span className="table-cell font-medium">{comic.name || "N/A"}</span>
        <span className="table-cell text-sm truncate">{comic.filename || "N/A"}</span>
        <span className="table-cell text-xs">{comic.Date ? new Date(comic.Date).toLocaleDateString() : "N/A"}</span>
        <span className="table-cell text-xs max-w-xs">
          {(() => {
            const words = comic.Discription?.trim().split(" ") || [];
            const isExpanded = expandedRows[comic.id];
            if (!comic.Discription) return "N/A";
            if (words.length <= 5) return comic.Discription;
            return isExpanded ? (
              <>
                {comic.Discription}
                <button className="vision-link ml-2" onClick={() => toggleExpand(comic.id)}>▲</button>
              </>
            ) : (
              <>
                {words.slice(0, 5).join(" ")}...
                <button className="vision-link ml-2" onClick={() => toggleExpand(comic.id)}>▼</button>
              </>
            );
          })()}
        </span>
        <span className="table-cell">
          <span className={`vision-badge ${comic.Premium ? "premium" : "free"}`}>
            {comic.Premium !== undefined ? (comic.Premium ? "Premium" : "Free") : "N/A"}
          </span>
        </span>

<span className="table-cell">
  <span
    className={`vision-badge ${
      comic.approved === true
        ? "approved"
        : comic.approved === false
        ? "rejected"
        : "free"
    }`}
  >
    {comic.approved === true
      ? "Approved"
      : comic.approved === false
      ? "Rejected"
      : "N/A"}
  </span>
</span>


        <span className="table-cell action-buttons">
          {comic.imageurl ? (
            <button className="vision-button-icon view" onClick={() => handleViewImage(comic.imageurl)}>🖼️</button>
          ) : "N/A"}
          {comic.fileurl ? (
            <button className="vision-button-icon view" onClick={() => handleViewPdf(comic.fileurl)}>📄</button>
          ) : "N/A"}
        </span>

<span className="table-cell action-buttons">
  {userrole === "admin" || userrole === "manager" ? (
    <>
      {/* Show Approve button only if not already approved */}
      {comic.approved !== true && (
        <button
          className="vision-button-icon approve"
          onClick={() => handleApprove(comic)}
        >
          ✅
        </button>
      )}

      {/* Show Reject button only if not already rejected */}
      {comic.approved !== false && (
        <button
          className="vision-button-icon reject"
          onClick={() => handleReject(comic)}
        >
          ❌
        </button>
      )}
    </>
  ) : null}
</span>



        <span className="table-cell action-buttons">
          <button className="vision-button-icon edit" onClick={() => handleEdit(comic)}>✏️</button>
          <button className="vision-button-icon delete" onClick={() => handleDelete(comic.id)}>🗑️</button>
        </span>
      </div>
    ))
  )}
</div>

      {/* Pagination Panel (Glassy) */}
      <div className="vision-panel pagination-panel">
        <div className="pagination-info">
          Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredComics.length)} of {filteredComics.length} results
        </div>
        <div className="pagination-controls">
          <button 
            className="vision-button-icon"
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          {/* Display page numbers in a compact way */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
            // Logic to only show a few pages around the current one for cleaner UI
            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
              return (
                <button
                  key={page}
                  className={`vision-button-page ${currentPage === page ? "active" : ""}`}
                  onClick={() => paginate(page)}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="vision-text-tertiary px-1">...</span>;
            }
            return null; // Hide other page numbers
          })}
          <button 
            className="vision-button-icon"
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Add/Edit Comic Modal (Glassy Backdrop and Panel) */}
{/* Add/Edit Comic Modal */}
{openForm && (
  <div className="vision-modal-backdrop">
    <div className="vision-modal-panel xl">
      <h2 className="vision-text-primary">{isEditing ? "Edit Comic" : "Add Comic"}</h2>

      <div className="modal-form-grid">

<div className="dropdown-wrapper">
  <Database className="dropdown-icon" />

  <select
    className="vision-input dropdown-select"
    value={selectedDatabase}
    onChange={handleDatabaseChange}
    
  >
    {defaultDatabases.map((db, index) => (
      <option key={index} value={db}>
        {db}
      </option>
    ))}
  </select>
</div>


        {/* NAME */}
        <input
          className="vision-input"
          name="name"
          value={newComic.name}
          onChange={handleFormChange}
          placeholder="Comic Name"
           readOnly={isEditing}
        />

        {/* DATE */}
        <DatePicker
          selected={newComic.Date ? new Date(newComic.Date) : null}
          onChange={(date) => setNewComic((p) => ({ ...p, Date: date }))}
          className="vision-input"
          dateFormat="yyyy-MM-dd"
          placeholderText="Select Date"
        />

        {/* TAG */}
        <input
          className="vision-input"
          name="Tag"
          value={newComic.Tag}
          onChange={handleFormChange}
          placeholder="Tag (e.g., Action, Comedy)"
        />

        {/* CATEGORY */}
        <select
  className="vision-input"
  name="category"
  value={newComic.category}
  onChange={handleFormChange}
>
  <option value="">Select Category</option>

  {categories.map((cat, index) => (
    <option key={index} value={cat}>
      {cat}
    </option>
  ))}
</select>



        

        {/* DESCRIPTION */}
        <textarea
          className="vision-textarea col-span-2"
          name="Discription"
          value={newComic.Discription}
          onChange={handleFormChange}
          placeholder="Description (Max 255 chars)"
          maxLength={255}
        />

        {/* FILENAME */}
        <input
          className="vision-input"
          name="filename"
          value={newComic.filename}
          onChange={handleFormChange}
          placeholder="Filename (Auto or Manual)"
           readOnly={isEditing}
        />

    {/* FILE URL */}
        <input
          className="vision-input"
          name="fileurl"
          value={newComic.fileurl}
          onChange={handleFormChange}
          placeholder="File URL"
        />

    {/* IMAGE URL */}
        <input
          className="vision-input"
          name="imageurl"
          value={newComic.imageurl}
          onChange={handleFormChange}
          placeholder="Image URL (Main Cover)"
        />

    {/* IMG URL (Extra Thumbnail) */}
        <input
          className="vision-input"
          name="imgurl"
          value={newComic.imgurl}
          onChange={handleFormChange}
          placeholder="Thumbnail URL"
        />

    {/* NOV (No. of Views or Episodes) */}
        <input
          className="vision-input"
          name="nov"
          type="number"
          value={newComic.nov}
          onChange={handleFormChange}
          placeholder="No. of Views / Episodes"
        />

      </div>

      {/* PREMIUM CHECKBOX */}
      <label className="vision-checkbox-label">
        <input
          type="checkbox"
          name="Premium"
          checked={newComic.Premium}
          onChange={handleFormChange}
        />
        <span>Premium Content</span>
      </label>

      <div className="modal-actions">
        <button className="vision-button cancel" onClick={() => setOpenForm(false)}>
          Cancel
        </button>
        <button className="vision-button primary" onClick={handleAddEditComic}>
          {isEditing ? "Update Comic" : "Add Comic"}
        </button>
      </div>
    </div>
  </div>
)}


      {/* Bulk Upload Modal (Glassy Backdrop and Panel) */}
      {openBulkUpload && (
        <div 
          className="vision-modal-backdrop"
          onClick={() => setOpenBulkUpload(false)}
        >
          <div
            className="vision-modal-panel large" // Added 'large' class for wider modal
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - positioned absolutely within the modal-panel */}
            <button
              className="vision-close-button"
              onClick={() => setOpenBulkUpload(false)}
            >
              ✕
            </button>

            {/* Bulk Upload Component */}
            <ComicsBulkUpload 
              isOpen={openBulkUpload}
              onClose={() => setOpenBulkUpload(false)}
              database={selectedDatabase}
            />
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default Comics;
