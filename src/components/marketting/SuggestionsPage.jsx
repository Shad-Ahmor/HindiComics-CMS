import React, { useState, useEffect, useRef } from 'react';
import api from '../common/api';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import '../../styles/ComicsTheme.css'; // Use the same Vision OS CSS

export default function SuggestionsPage({ user, userrole, token, uid }) {
const [suggestions, setSuggestions] = useState([]);
const [newSuggestion, setNewSuggestion] = useState({ id: '', answer: '', email: '', suggestion: '' });
const [isEditing, setIsEditing] = useState(false);
const [selectedSuggestionId, setSelectedSuggestionId] = useState(null);
const [openForm, setOpenForm] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [currentPage, setCurrentPage] = useState(1);
const [rowsPerPage, setRowsPerPage] = useState(10);

const navigate = useNavigate();
const fetchRef = useRef(false);

const fetchSuggestions = async () => {
try {
if (!token) return navigate('/');
const res = await api.get('/suggestions', { headers: { Authorization: `Bearer ${token}` } });
setSuggestions(res.data || []);
} catch (err) {
console.error(err);
}
};

useEffect(() => {
if (fetchRef.current) return;
fetchRef.current = true;
fetchSuggestions();
}, []);

const handleChange = (e) => setNewSuggestion({ ...newSuggestion, [e.target.name]: e.target.value });

const handleSubmit = async (e) => {
e.preventDefault();
try {
if (!token) return navigate('/');
const suggestionData = {
id: newSuggestion.id || Date.now().toString(),
answer: newSuggestion.answer,
email: newSuggestion.email,
suggestion: newSuggestion.suggestion
};
if (isEditing) {
await api.put(`/suggestions/${selectedSuggestionId}`, suggestionData, { headers: { Authorization: `Bearer ${token}` } });
} else {
await api.post('/suggestions/create', suggestionData, { headers: { Authorization: `Bearer ${token}` } });
}
fetchSuggestions();
setNewSuggestion({ id: '', answer: '', email: '', suggestion: '' });
setIsEditing(false);
setOpenForm(false);
} catch (err) { console.error(err); }
};

const handleEdit = (id) => {
const suggestion = suggestions.find((s) => s.id === id);
if (suggestion) {
setNewSuggestion({ ...suggestion });
setSelectedSuggestionId(id);
setIsEditing(true);
setOpenForm(true);
}
};

const handleDelete = async (id) => {
if (!window.confirm("Are you sure you want to delete this suggestion?")) return;
try {
if (!token) return navigate('/');
await api.delete(`/suggestions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
fetchSuggestions();
} catch (err) { console.error(err); }
};

// Filtered suggestions based on search
const filteredSuggestions = suggestions.filter(s =>
s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
s.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
s.suggestion.toLowerCase().includes(searchQuery.toLowerCase())
);

// Pagination
const indexOfLast = currentPage * rowsPerPage;
const indexOfFirst = indexOfLast - rowsPerPage;
const currentSuggestions = filteredSuggestions.slice(indexOfFirst, indexOfLast);
const totalPages = Math.ceil(filteredSuggestions.length / rowsPerPage);
const paginate = (pageNumber) => setCurrentPage(pageNumber);

return ( <div className="vision-container">
{/* Header Panel */} <div className="card"> <div className="vision-panel header-panel"> <h1 className="vision-text-primary">Suggestions Management</h1> <div className="flex space-x-4">
<button className="vision-button primary" onClick={() => { setOpenForm(true); setIsEditing(false); setNewSuggestion({ id: '', answer: '', email: '', suggestion: '' }); }}>
+ Add New Suggestion </button> </div> </div>


    {/* Controls Panel */}
    <div className="vision-panel controls-panel grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <input
        className="vision-input sm:col-span-2 lg:col-span-2"
        type="text"
        placeholder="Search by Email, Answer, or Suggestion..."
        value={searchQuery}
        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
      />
      <select
        className="vision-input lg:col-span-1"
        value={rowsPerPage}
        onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
      >
        <option value="5">5 rows per page</option>
        <option value="10">10 rows per page</option>
        <option value="20">20 rows per page</option>
        <option value="50">50 rows per page</option>
        <option value="100">100 rows per page</option>
      </select>
    </div>

    {/* Suggestions Table */}
    <div className="vision-panel table-panel">
      <div className="table-header">
        <span className="table-cell">Email</span>
        <span className="table-cell">Answer</span>
        <span className="table-cell hidden md:inline">Suggestion</span>
        <span className="table-cell">Actions</span>
      </div>

      {filteredSuggestions.length === 0 ? (
        <div className="vision-empty-state">No suggestions found.</div>
      ) : (
        currentSuggestions.map((s) => (
          <div className="table-row" key={s.id}>
            <span className="table-cell">{s.email}</span>
            <span className="table-cell">{s.answer}</span>
            <span className="table-cell hidden md:inline">{s.suggestion}</span>
            <span className="table-cell action-buttons">
              <button className="vision-button-icon edit" onClick={() => handleEdit(s.id)}>
                <PencilIcon className="w-5 h-5" />
              </button>
              <button className="vision-button-icon delete" onClick={() => handleDelete(s.id)}>
                <TrashIcon className="w-5 h-5" />
              </button>
            </span>
          </div>
        ))
      )}
    </div>

    {/* Pagination Panel */}
    <div className="vision-panel pagination-panel">
      <div className="pagination-info">
        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredSuggestions.length)} of {filteredSuggestions.length} results
      </div>
      <div className="pagination-controls">
        <button className="vision-button-icon" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
          if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
            return (
              <button key={page} className={`vision-button-page ${currentPage === page ? "active" : ""}`} onClick={() => paginate(page)}>
                {page}
              </button>
            );
          } else if (page === currentPage - 2 || page === currentPage + 2) {
            return <span key={page} className="vision-text-tertiary px-1">...</span>;
          }
          return null;
        })}
        <button className="vision-button-icon" onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
          &gt;
        </button>
      </div>
    </div>

    {/* Add/Edit Suggestion Modal */}
    {openForm && (
      <div className="vision-modal-backdrop">
        <div className="vision-modal-panel">
          <h2 className="vision-text-primary">{isEditing ? 'Edit Suggestion' : 'Add Suggestion'}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <input
              type="email"
              name="email"
              value={newSuggestion.email}
              onChange={handleChange}
              placeholder="Email"
              className="vision-input"
              required
            />
            <input
              type="text"
              name="answer"
              value={newSuggestion.answer}
              onChange={handleChange}
              placeholder="Answer"
              className="vision-input"
              required
            />
            <input
              type="text"
              name="suggestion"
              value={newSuggestion.suggestion}
              onChange={handleChange}
              placeholder="Suggestion"
              className="vision-input"
              required
            />
            <div className="modal-actions">
              <button type="button" className="vision-button cancel" onClick={() => setOpenForm(false)}>Cancel</button>
              <button type="submit" className="vision-button primary">{isEditing ? 'Update' : 'Add'}</button>
            </div>
          </form>
          <button onClick={() => setOpenForm(false)} className="vision-close-button"><XMarkIcon className="w-5 h-5" /></button>
        </div>
      </div>
    )}

  </div>
</div>

);
}
