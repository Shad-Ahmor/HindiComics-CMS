import React, { useState, useEffect, useMemo, useRef } from "react";
// import { jokesCategories, storyCategories, shayariCategories } from './categories.js';

// --- MOCK DATA EXPANSION (TESTING FIX) ---
// यह फंक्शन सिर्फ पेजिनेशन लॉजिक को टेस्ट करने के लिए है।
// जब आप वास्तविक API का उपयोग करना शुरू करेंगे, तो इस फंक्शन को हटा दें।
const mockExpandItems = (items) => {
    if (items.length === 0) return [];
    
    // यदि 100 से कम हैं, तो डुप्लीकेट करें
    let expanded = [...items];
    let count = 0;
    while (expanded.length < 100 && count < 50) { // 100 items तक बढ़ाने के लिए
        expanded = expanded.concat(items.map(item => ({
            ...item,
            // ID और writername को यूनिक बनाएं
            jokeId: item.jokeId ? `${item.jokeId}-${expanded.length}` : undefined,
            storyId: item.storyId ? `${item.storyId}-${expanded.length}` : undefined,
            shayriId: item.shayriId ? `${item.shayriId}-${expanded.length}` : undefined,
            // ID के लिए fallback
            id: item.id ? `${item.id}-${expanded.length}` : undefined,
            // नाम को थोड़ा अलग करें
            writername: item.writername ? `${item.writername} ${expanded.length}` : item.shayarname ? `${item.shayarname} ${expanded.length}` : item.postedBy,
            // createdAt को थोड़ा अलग करें ताकि सॉर्टिंग काम करे
            createdAt: new Date(new Date().getTime() - expanded.length * 60000).toISOString(),
        })));
        count++;
    }
    return expanded;
}
// --- END MOCK DATA EXPANSION ---


const ContentDisplay = ({ items, database, handleEdit, handleDelete }) => {
  // 🔍 State
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  
  // ✅ NEW STATE: प्रति पेज आइटम की संख्या, डिफ़ॉल्ट 5
  const [itemsPerPage, setItemsPerPage] = useState(5); 

  // मॉक डेटा का उपयोग करें (जब तक API से बड़ी सूची नहीं आती)
  const dataItems = useMemo(() => mockExpandItems(items), [items]);

  // 🔎 फ़िल्टर और सर्च लॉजिक
  const filteredItems = useMemo(() => {
    let filtered = [...dataItems];

    // कैटेगरी द्वारा फ़िल्टर करें
    if (filterCategory !== "all") {
      filtered = filtered.filter(
        (item) => item.category?.toLowerCase() === filterCategory.toLowerCase()
      );
    }

    // टेक्स्ट सर्च करें
    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const fields = [
          item.category,
          item.writername,
          item.shayarname,
          item.title,
          item.jokeText, 
          item.story,
          item.shayri,
          item.tag,
          item.postedBy,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return fields.includes(lower);
      });
    }

    // सॉर्ट करें
    filtered.sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0); 

      if (sortOption === "az") {
        return (a.category || "").localeCompare(b.category || "");
      }
      if (sortOption === "za") {
        return (b.category || "").localeCompare(a.category || "");
      }
      if (sortOption === "oldest") {
        return aDate.getTime() - bDate.getTime();
      }
      // डिफ़ॉल्ट = newest
      return bDate.getTime() - aDate.getTime();
    });

    return filtered;
  }, [dataItems, searchQuery, filterCategory, sortOption]);

  // 📄 पेजिनेशन लॉजिक
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage); 

  // 🏷️ फ़िल्टर ड्रॉपडाउन के लिए यूनिक कैटेगरी
  const uniqueCategories = Array.from(
    new Set(
      dataItems
        .filter(item => item)
        .map((item) => item.category)
        .filter(Boolean)
    )
  ).sort();

  // जब फ़िल्टर या प्रति पेज आइटम बदलें तो पेज को 1 पर रीसेट करें
  useEffect(() => {
    if (page > 1 && page > totalPages) {
        setPage(totalPages > 0 ? totalPages : 1);
    } else if (totalPages === 0 && filteredItems.length > 0) {
        setPage(1);
    }
  }, [filteredItems.length, totalPages, itemsPerPage]); // itemsPerPage को डिपेंडेंसी में जोड़ा


  const itemsPerPageOptions = [5, 10, 20, 50];

  return (
    <div className="vision-panel table-panel">
      {/* 🔍 सर्च + फ़िल्टर + सॉर्ट बार */}
      <div className="controls-panel">
        
        {/* ✅ नया: प्रति पेज आइटम की संख्या */}
        <div style={{ minWidth: '160px' }}>
          <div className="vision-label">प्रति पेज</div>
          <select
            className="vision-input vision-select"
            value={itemsPerPage}
            onChange={(e) => {
              // आइटम बदलने पर पेज 1 पर रीसेट करें
              setItemsPerPage(Number(e.target.value));
              setPage(1);
            }}
          >
            {itemsPerPageOptions.map((num) => (
              <option key={num} value={num}>
                {num} आइटम्स
              </option>
            ))}
          </select>
        </div>

        {/* 🔍 सर्च */}
        <div style={{ flexGrow: 1, minWidth: '200px', display: 'flex', alignItems: 'center' }}>
          <i className="lucide-icon lucide-search" style={{ marginRight: '8px', color: 'var(--color-text-secondary)' }}></i>
          <input
            type="text"
            className="vision-input"
            placeholder={`Search ${database}...`}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* 🧮 फ़िल्टर */}
        <div style={{ minWidth: '160px' }}>
          <div className="vision-label">कैटेगरी</div>
          <select
            className="vision-input vision-select"
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">सभी कैटेगरी ({dataItems.length})</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 🔃 सॉर्ट */}
        <div style={{ minWidth: '160px' }}>
          <div className="vision-label">सॉर्ट करें</div>
          <select
            className="vision-input vision-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">नया पहले</option>
            <option value="oldest">पुराना पहले</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
        </div>
      </div>

      {/* 🗂️ कार्ड्स ग्रिड */}
      <div 
        className="content-grid" 
        style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}
      >
        {paginatedItems.length === 0 ? (
            <div className="vision-empty-state">
              वर्तमान फ़िल्टर के लिए कोई परिणाम नहीं मिला।
            </div>
        ) : (
          paginatedItems.map((item) => {
            const id = item.id || item.shayriId || item.jokeId || item.storyId;

            return (
              <div 
                key={id} 
                className="content-card"
                data-database={database}
              >
                <div className="card-content-area">
                    <div className="vision-text-secondary" style={{marginBottom: '10px', fontSize: '0.9rem'}}>
                      {item.category}
                    </div>

                    {/* --- चुटकुले (JOKES) --- */}
                    {database === "jokes" && (
                      <>
                        {item.writername && (
                          <p style={{fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '0.95rem'}}>
                            {item.writername}
                          </p>
                        )}
                        <p style={{ whiteSpace: "pre-line", marginTop: '0.5rem' }}>
                          {item.jokeText}
                        </p>
                      </>
                    )}

                    {/* --- कहानियाँ (STORIES) --- */}
                    {database === "stories" && (
                      <>
                        <p className="story-title" style={{margin: '0 0 5px 0'}}>{item.title}</p>
                        <p className="vision-text-tertiary" style={{margin: '0 0 10px 0', fontSize: '0.85rem'}}>By {item.writername}</p>
                        {item.image && (
                          <img
                            src={item.image}
                            onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x120/5e9bff/ffffff?text=Image+Missing" }}
                            alt={item.title}
                          />
                        )}
                        <p style={{ whiteSpace: "pre-line", fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                          {item.story ? (item.story.length > 200 ? item.story.substring(0, 200) + '...' : item.story) : 'सामग्री पूर्वावलोकन उपलब्ध नहीं है।'}
                        </p>
                      </>
                    )}

                    {/* --- शायरी (SHAYARI) --- */}
                    {database === "shayri" && (
                      <>
                        <p style={{fontWeight: 'bold', margin: '0 0 5px 0', fontSize: '0.95rem'}}>
                          {item.shayarname || "अज्ञात"}
                        </p>
                        {item.tag && (
                          <span className="tag-text">
                            #{item.tag}
                          </span>
                        )}
                        <p
                          className="shayari-text"
                          style={{
                            whiteSpace: "pre-line",
                            marginTop: '0.5rem'
                          }}
                        >
                          {item.shayri}
                        </p>
                      </>
                    )}
                </div>

                {/* बटन्स और पोस्ट की जानकारी */}
                <div className="card-footer">
                    <p className="vision-text-tertiary" style={{ fontSize: '0.8rem', marginBottom: '10px' }}>
                      🕒 पोस्ट किया गया: {item.postedBy}
                    </p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        className="vision-button primary small"
                        onClick={() => handleEdit(item)}
                        style={{ flex: 1, padding: '0.4rem 0.6rem' }}
                      >
                        <i className="lucide-icon lucide-edit" style={{ marginRight: '5px' }}></i> एडिट
                      </button>
                      <button
                        className="vision-button cancel small"
                        onClick={() => handleDelete(item)}
                        style={{ flex: 1, padding: '0.4rem 0.6rem' }}
                      >
                        <i className="lucide-icon lucide-trash-2" style={{ marginRight: '5px' }}></i> डिलीट
                      </button>
                    </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 📄 पेजिनेशन */}
      {totalPages > 1 && (
        <div className="pagination-panel">
          <div className="pagination-info">
            {filteredItems.length} परिणामों में से {startIndex + 1} - {Math.min(startIndex + itemsPerPage, filteredItems.length)} दिखा रहा है।
          </div>
          <div className="pagination-controls">
            <button 
                className="vision-button-page"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
            >
                पिछला
            </button>
            
            {/* वर्तमान पेज के आसपास अधिकतम 5 पेज संख्याएं दिखा रहा है */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2))
              .map((p, index, arr) => {
                // यदि पेज संख्या में छलांग है तो दीर्घवृत्त जोड़ें
                if (index > 0 && p > arr[index - 1] + 1) {
                  return <span key={`dots-${p}`} className="vision-text-tertiary" style={{alignSelf: 'center'}}>...</span>;
                }
                return (
                  <button
                      key={p}
                      className={`vision-button-page ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                  >
                      {p}
                  </button>
                );
              })}

            <button 
                className="vision-button-page"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
            >
                अगला
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDisplay;
