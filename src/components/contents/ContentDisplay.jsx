import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";


const ContentDisplay = ({ items = [], database, handleEdit, handleDelete }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [itemsPerPage, setItemsPerPage] = useState(5);
const safe = (txt) => (typeof txt === "string" ? txt : "");

  // 🔍 UNIVERSAL TEXT FOR SEARCH
  const filteredItems = items
    .filter(item => filterCategory === "all" || (item.category?.toLowerCase() === filterCategory.toLowerCase()))
    .filter(item => {
      if (!searchQuery.trim()) return true;
      const lower = searchQuery.toLowerCase();

      const text = [
        item.category,
        item.writername,
        item.shayarname,
        item.title,
        safe(item.joke),
        safe(item.story),
        safe(item.shayri),
        item.postedBy,
        item.tag
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return text.includes(lower);
    })
    .sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const bDate = b.createdAt ? new Date(b.createdAt) : new Date(0);

      switch (sortOption) {
        case "az":
          return (a.category || "").localeCompare(b.category || "");
        case "za":
          return (b.category || "").localeCompare(a.category || "");
        case "oldest":
          return aDate.getTime() - bDate.getTime();
        default:
          return bDate.getTime() - aDate.getTime();
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + itemsPerPage);

  const uniqueCategories = Array.from(new Set(items.map(item => item.category).filter(Boolean))).sort();

  useEffect(() => {
    if (page > totalPages) setPage(totalPages > 0 ? totalPages : 1);
  }, [page, totalPages]);

  const truncate = (txt, limit = 200) =>
    txt && txt.length > limit ? txt.substring(0, limit) + "..." : txt;

  return (
    <div className="vision-panel table-panel">
      {/* Filters */}
      <div className="controls-panel">
        
        {/* per page */}
        <div style={{ minWidth: "160px" }}>
          <div className="vision-label">प्रति पेज</div>
          <select
            className="vision-input vision-select"
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setPage(1); }}
          >
            {[5, 10, 20, 50].map(n => (
              <option key={n} value={n}>{n} आइटम्स</option>
            ))}
          </select>
        </div>

        {/* search */}
        <div style={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <i className="lucide-icon lucide-search" style={{ marginRight: 6 }} />
          <input
            type="text"
            className="vision-input"
            placeholder={`Search ${database}...`}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>

        {/* category */}
        <div style={{ minWidth: "160px" }}>
          <div className="vision-label">कैटेगरी</div>
          <select
            className="vision-input vision-select"
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          >
            <option value="all">सभी ({items.length})</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* sort */}
        <div style={{ minWidth: "160px" }}>
          <div className="vision-label">सॉर्ट</div>
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

      {/* Content Grid */}
      <div className="content-grid" style={{ padding: "1.5rem" }}>
        {paginatedItems.length === 0 ? (
          <div className="vision-empty-state">
            कोई परिणाम नहीं मिला।
          </div>
        ) : (
          paginatedItems.map(item => (
            <div key={item.id} className="content-card" data-database={database}>
              <div className="card-content-area">

                {/* Category Chip */}
                {item.category && (
                  <div
                    className="vision-text-secondary"
                    style={{ marginBottom: 10, fontSize: "0.9rem" }}
                  >
                    {item.category}
                  </div>
                )}

                {/* -------------------------------------- */}
                {/* ✨ JOKES UI */}
                {/* -------------------------------------- */}
                {database === "jokes" && (
                  <>
                    {item.postedBy && (
                      <p style={{ fontWeight: "bold", marginBottom: 5 }}>{item.postedBy}</p>
                    )}
                   <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkBreaks]}
                        rehypePlugins={[rehypeRaw, rehypeHighlight]}
                        >
                        {safe(item.joke)}
                        </ReactMarkdown>


                  </>
                )}

                {/* -------------------------------------- */}
                {/* ✨ STORIES UI */}
                {/* -------------------------------------- */}
                {database === "stories" && (
                  <>
                    <p className="story-title" style={{ marginBottom: 5 }}>
                      {item.title || "Untitled Story"}
                    </p>
                    <p className="vision-text-tertiary" style={{ fontSize: "0.9rem" }}>
                      By {item.writername || "Unknown"}
                    </p>

                    {item.image && (
                      <img
                        src={item.image}
                        onError={(e) =>
                          (e.target.src = "https://placehold.co/400x150/5e9bff/fff?text=No+Image")
                        }
                        alt={item.title}
                      />
                    )}

                    <div className="vision-text-secondary">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight]}
                        >
                            {truncate(item?.story ?? "")}
                        </ReactMarkdown>
                        </div>

                  </>
                )}

                {/* -------------------------------------- */}
                {/* ✨ SHAYARI UI */}
                {/* -------------------------------------- */}
                {database === "shayri" && (
                  <>
                    <p style={{ fontWeight: "bold", marginBottom: 5 }}>
                      {item.shayarname || "अज्ञात"}
                    </p>

                    {item.tag && (
                      <span className="tag-text">#{item.tag}</span>
                    )}

                    <div className="shayari-text" style={{ marginTop: 8 }}>
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight]}
                        >
                            {safe(item.shayri)}
                        </ReactMarkdown>
                        </div>

                  </>
                )}
              </div>

              {/* Footer */}
              <div className="card-footer">
                <p className="vision-text-tertiary" style={{ fontSize: "0.8rem" }}>
                  🕒 Posted by: {item.postedBy || "Unknown"}
                </p>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="vision-button primary small" onClick={() => handleEdit(item)}>
                    <i className="lucide-icon lucide-edit" /> एडिट
                  </button>
                  <button className="vision-button cancel small" onClick={() => handleDelete(item)}>
                    <i className="lucide-icon lucide-trash-2" /> डिलीट
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-panel">
          <div className="pagination-info">
            {filteredItems.length} में से {startIndex + 1} –{" "}
            {Math.min(startIndex + itemsPerPage, filteredItems.length)}
          </div>

          <div className="pagination-controls">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              पिछला
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
              .map(p => (
                <button
                  key={p}
                  className={page === p ? "vision-button-page active" : "vision-button-page"}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}

            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              अगला
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentDisplay;
