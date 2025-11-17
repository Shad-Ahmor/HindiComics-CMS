import React, { useEffect, useState, useRef } from 'react';
import api from '../common/api';
import { useNavigate } from 'react-router-dom';
import { LucideChevronLeft, LucideChevronRight } from 'lucide-react'; 

// Table columns config
const columns = [
  { field: "email", headerName: "Email" },
  { field: "date", headerName: "Date" },
  { field: "page", headerName: "Page" },
  { field: "totalDuration", headerName: "कुल अवधि (सेकंड)", align: "right" },
  { field: "lastUpdated", headerName: "अंतिम अपडेट" },
  { field: "startTime", headerName: "शुरुआत का समय" },
];
// Reusable Loading / Empty / Error Component
const StatusMessage = ({ message, isError = false }) => (
  <div className={`p-4 text-center ${isError ? "text-red-500" : "vision-text-secondary"}`}>
    {message}
  </div>
);
let fetchedLogsOnce = false;

export default function ReferredUserLogs({token}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const fetchCalled = useRef(false);

  // =============================
  //     SINGLE API CALL ONLY
  // =============================

  useEffect(() => {
    if (!token || fetchedLogsOnce) return;
    fetchedLogsOnce = true;

    async function fetchLogs() {
      try {
        const { data } = await api.get('/userlogs/referredbyme', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [token]);

  if (loading) {
    return <StatusMessage message="लॉग डेटा लोड हो रहा है..." />;
  }

  // PAGINATION CALCULATIONS
  const totalPages = Math.ceil(logs.length / ITEMS_PER_PAGE);
  const paginatedLogs = logs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  // Custom columns for Activity Logs to match the vision-tr template (6 columns + 1 collapse icon slot)
  // We need to ensure the grid template accommodates the correct number of columns (currently 6 data columns).
  const logColumns = [
    // Add a placeholder column to match the grid structure's first 40px slot
    { field: 'placeholder', headerName: '', width: '40px' }, 
    ...columns
  ];

  return (
    <div className="w-full">
      {logs.length === 0 ? (
        <StatusMessage message="रेफर किए गए यूज़र्स का कोई गतिविधि लॉग नहीं मिला।" />
      ) : (
        <>
          <div className="vision-table-container" style={{ minHeight: "300px" }}>
            <div className="vision-table">
              {/* Table Header */}
              <div className="vision-thead">
                <div className="vision-tr vision-tr-head">
                  {/* Map the headers */}
                  {logColumns.map((c) => (
                    <div
                      key={c.field}
                      className={`vision-th ${c.align === "right" ? "text-right" : ""}`}
                      // Set explicit width for the placeholder column
                      style={c.field === 'placeholder' ? { width: '40px' } : {}}
                    >
                      {c.headerName}
                    </div>
                  ))}
                </div>
              </div>
              {/* Table Body */}
              <div className="vision-tbody">
                {paginatedLogs.map((row) => (
                  <div key={row.id} className="vision-tr">
                    {/* Map the data cells */}
                    {logColumns.map((col) => (
                      <div
                        key={col.field}
                        className={`vision-td ${col.align === "right" ? "text-right" : ""}`}
                        // Render empty content for the placeholder
                        style={col.field === 'placeholder' ? { width: '40px' } : {}}
                      >
                        {col.field === 'placeholder' ? '' : row[col.field]}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* PAGINATION BAR */}
          {logs.length > ITEMS_PER_PAGE && (
            <div className="flex justify-between items-center mt-4 px-2 py-2 border-t border-gray-700/30 text-sm">
              
              {/* Left Padding for alignment */}
              <div className="w-10 sm:w-16"></div> 
            
              <span className="vision-text-secondary">
                Page {currentPage} of {totalPages}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="vision-button-icon p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800/50 transition duration-200"
                    aria-label="Previous Page"
                >
                    <LucideChevronLeft size={20} />
                </button>
                <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="vision-button-icon p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800/50 transition duration-200"
                    aria-label="Next Page"
                >
                    <LucideChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}