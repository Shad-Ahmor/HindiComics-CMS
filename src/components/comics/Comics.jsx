import React, { useState, useEffect,useRef } from "react";
import api from '../common/api';
import { useNavigate } from "react-router-dom";
import ComicsBulkUpload from "./ComicsBulkUpload";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { decryptData } from "../../utils/encryption.jsx";
import "../../styles/ComicsTheme.css"; // This will contain the actual Vision OS styles

const Comics = ({user,userrole,token,uid}) => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [openBulkUpload, setOpenBulkUpload] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [newComic, setNewComic] = useState({
    name: "", Date: null, Discription: "", Premium: false, Tag: "",
    category: "", filename: "", fileurl: "", imageurl: "", imgurl: "", nov: 0, database: ""
  });

  const navigate = useNavigate();
  const demoDatabases = ["ComicsDemo", "EducationDemo", "ReligiousDemo"];
  const liveDatabases = ["Comics", "Education", "Religious"];
  const defaultDatabases = userrole === "admin" ? [...demoDatabases, ...liveDatabases] : demoDatabases;
  const fetchRef = useRef(false);



  useEffect(() => {
  if (!selectedDatabase) {
    setSelectedDatabase(defaultDatabases[0]);
    return;
  }

  if (fetchRef.current) return; // already fetched
  fetchRef.current = true;

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

  const handleFormChange = e => {
    const { name, value, type, checked } = e.target;
    setNewComic(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleAddEditComic = async () => {
    try {
      if (!token) return navigate('/login');

      const endpoint = isEditing ? `/comics/update/${newComic.id}` : `/comics/add`;
      const payload = { ...newComic, database: selectedDatabase };

      const response = await api.post(endpoint, payload, { headers: { Authorization: `Bearer ${token}` } });
      if (response.status === 200) {
        fetchComics();
        setOpenForm(false);
        setIsEditing(false);
        setNewComic({
          name: "", Date: null, Discription: "", Premium: false, Tag: "",
          category: "", filename: "", fileurl: "", imageurl: "", imgurl: "", nov: 0, database: ""
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

      // Assuming you have a delete endpoint
      await api.delete(`/comics/delete/${id}`, { 
        headers: { Authorization: `Bearer ${token}` },
        data: { database: selectedDatabase } 
      });

      fetchComics();
    } catch (err) {
      console.error("Failed to delete comic:", err);
    }
  };


  const filteredComics = comics.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.Discription.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="vision-panel controls-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Search - Takes full width on small screens, 3/5 width on large screens */}
        <input
          className="vision-input sm:col-span-2 lg:col-span-3"
          type="text"
          placeholder="Search Name, Filename, or Description..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to page 1 on new search
          }}
        />
        {/* Database Selector - Shares row with RowsPerPage on small screens, 1/5 width on large screens */}
        <select
          className="vision-input lg:col-span-1"
          value={selectedDatabase}
          onChange={e => {
            setSelectedDatabase(e.target.value);
            setCurrentPage(1); // Reset to page 1 on DB change
          }}
        >
          {defaultDatabases.map(db => <option key={db} value={db}>{db}</option>)}
        </select>
        {/* Rows Per Page Selector - Shares row with Database Selector on small screens, 1/5 width on large screens */}
        <select
          className="vision-input lg:col-span-1"
          value={rowsPerPage}
          onChange={(e) => { 
            setRowsPerPage(Number(e.target.value)); 
            setCurrentPage(1); // Reset to page 1 on rows change
          }}
        >
          <option value="5">5 rows per page</option>
          <option value="10">10 rows per page</option>
          <option value="20">20 rows per page</option>
          <option value="50">50 rows per page</option>
          <option value="100">100 rows per page</option>
        </select>
      </div>

      {/* Comics Table Panel (Glassy) */}
      <div className="vision-panel table-panel">
        <div className="table-header">
          <span className="table-cell">Name</span>
          <span className="table-cell">Filename</span>
          <span className="table-cell hidden sm:inline">Date</span>
          <span className="table-cell hidden md:inline">Description</span>
          <span className="table-cell">Premium</span>
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
              <span className="table-cell font-medium">{comic.name}</span>
              <span className="table-cell text-sm truncate">{comic.filename}</span>
              <span className="table-cell hidden sm:inline text-xs">{comic.Date ? new Date(comic.Date).toLocaleDateString() : 'N/A'}</span>
              <span className="table-cell hidden md:inline text-xs truncate max-w-xs">{comic.Discription}</span>
              <span className="table-cell">
                <span className={`vision-badge ${comic.Premium ? "premium" : "free"}`}>
                  {comic.Premium ? "Premium" : "Free"}
                </span>
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
      {openForm && (
        <div className="vision-modal-backdrop">
          <div className="vision-modal-panel">
            <h2 className="vision-text-primary">{isEditing ? "Edit Comic" : "Add Comic"}</h2>
            
            <div className="modal-form-grid">
              <input className="vision-input" name="name" value={newComic.name} onChange={handleFormChange} placeholder="Comic Name" />
              <DatePicker
                selected={newComic.Date ? new Date(newComic.Date) : null}
                onChange={date => setNewComic(prev => ({ ...prev, Date: date }))}
                className="vision-input"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select Date"
              />
              <input className="vision-input" name="Tag" value={newComic.Tag} onChange={handleFormChange} placeholder="Tag (e.g., Action, Sci-Fi)" />
              <textarea className="vision-textarea" name="Discription" value={newComic.Discription} onChange={handleFormChange} placeholder="Description (Max 255 chars)" maxLength="255" />
            </div>

            <label className="vision-checkbox-label">
              <input type="checkbox" name="Premium" checked={newComic.Premium} onChange={handleFormChange} />
              <span>Premium Content</span>
            </label>

            <div className="modal-actions">
              <button className="vision-button cancel" onClick={() => setOpenForm(false)}>Cancel</button>
              <button className="vision-button primary" onClick={handleAddEditComic}>{isEditing ? "Update Comic" : "Add Comic"}</button>
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
