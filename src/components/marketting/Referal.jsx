import React, { useEffect, useState, useMemo, useCallback,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../common/api';
import Row from './Rows';
import ReferredUserLogs from './ReferredUserLogs';
import UserActivityGraph from './UserActivityGraph';
import { LucideBarChart3, LucideTable, LucideChevronLeft, LucideChevronRight } from 'lucide-react';
import '../../styles/Referal.css'

// Component for displaying loading and error states
const StatusMessage = ({ message, isError = false }) => (
    <div className={`vision-panel ${isError ? 'bg-red-900 border-red-700' : ''}`} 
         style={{ textAlign: 'center', marginTop: '40px', padding: '20px' }}>
        <p className={isError ? 'text-red-300' : 'vision-text-primary'}>
            {message}
        </p>
    </div>
);

export default function Referal({token}) {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [referredUsers, setReferredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const fetchCalled = useRef(false);


  // 🔄 PAGINATION STATE
  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = useMemo(() => {
    return Math.ceil(referredUsers.length / ITEMS_PER_PAGE);
  }, [referredUsers]);

  const paginatedUsers = useMemo(() => {
    // Ensuring currentPage is at least 1 for calculation
    const page = Math.max(1, currentPage); 
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return referredUsers.slice(start, end);
  }, [referredUsers, currentPage]);

  const handleChangePage = useCallback((newPage) => {
    setCurrentPage(newPage);
  }, []);
  // -------------------------

  useEffect(() => {
    if (fetchCalled.current) return; 
    fetchCalled.current = true;

    const fetchReferredData = async () => {
      if (!token) return;
      setLoading(true);

      try {
        const { data } = await api.get('/users/referred', { headers: { Authorization: `Bearer ${token}` }});
        const userData = data?.loggedInUser || null;
        const referred = data?.loggedInUser?.referredUsers || [];
        setLoggedInUser(userData);
        setReferredUsers(referred.filter(u => u && u.email));

      } catch (error) {
        console.error('Error fetching referred user data:', error);
        setLoggedInUser(null); 
      } finally {
        setLoading(false);
      }
    };

    fetchReferredData();
  }, [token]);


  if (loading) {
    return <StatusMessage message="Loading User and Referral Data..." />;
  }

  if (!loggedInUser) {
    return (
      <StatusMessage 
        message="Authentication Failed or Data Not Found. Please log in again." 
        isError={true} 
      />
    );
  }

  return (
    <div className="vision-container">
      
      {/* 📊 User’s activity graph (Separate Panel) */}
      <div className="vision-panel mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
            <LucideBarChart3 className="lucide-icon mr-2 text-indigo-500" />
            My Recent Activity
        </h2>
        <UserActivityGraph userId={loggedInUser.uid} token={token} />
      </div>

      <div className="vision-panel">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
            <LucideTable className="lucide-icon mr-2 text-indigo-500" />
            Referral Network Overview
        </h2>
        
        {/* 🗄️ User & referred users table */}
        <div className="vision-table-container">
            <div className="vision-table">
                {/* Table Head */}
                <div className="vision-thead">
                    <div className="vision-tr vision-tr-head">
                        <div className="vision-th" style={{ width: '40px' }} /> 
                        <div className="vision-th">Email</div>
                        <div className="vision-th text-right">Points</div>
                        <div className="vision-th text-right">Role</div>
                        <div className="vision-th text-right">Designation</div>
                        <div className="vision-th text-right">Referred</div>
                    </div>
                </div>
                
                {/* Table Body */}
                <div className="vision-tbody">
                    {/* Parent row: logged-in user */}
                    {loggedInUser.email ? (
                        <Row key={loggedInUser.uid} row={loggedInUser} isParent={true} />
                    ) : (
                        <div className="vision-tr">
                            <div className="vision-td text-center" style={{ gridColumn: 'span 6 / span 6' }}>
                                Logged-in user data is incomplete.
                            </div>
                        </div>
                    )}

                    {/* Child rows: paginated referred users */}
                    {paginatedUsers.length > 0 ? (
                        paginatedUsers.map((refUser) => (
                            <Row 
                                key={refUser.uid || refUser.email} 
                                row={refUser} 
                                isParent={false} 
                            />
                        ))
                    ) : (
                        // No referred users message on this page or overall
                        <div className="vision-tr">
                            <div className="vision-td text-center" style={{ gridColumn: 'span 6 / span 6' }}>
                                {referredUsers.length === 0 
                                  ? "You have not referred any users yet."
                                  : "No users found on this page."}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        
        {/* 📑 PAGINATION CONTROLS */}
        {referredUsers.length > ITEMS_PER_PAGE && (
          <div className="flex justify-between items-center mt-4 px-2 py-2 border-t border-gray-700/30 text-sm">
            
            {/* Left Padding for alignment with content */}
            <div className="w-10 sm:w-16"></div> 
            
            {/* Page Status */}
            <span className="vision-text-secondary">
              पेज {currentPage} of {totalPages} ({referredUsers.length} कुल यूज़र्स)
            </span>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => handleChangePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="vision-button-icon p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800/50 transition duration-200"
                    aria-label="Previous Page"
                >
                    <LucideChevronLeft size={20} />
                </button>
                <button
                    onClick={() => handleChangePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="vision-button-icon p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800/50 transition duration-200"
                    aria-label="Next Page"
                >
                    <LucideChevronRight size={20} />
                </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 📝 Referred user activity logs (Separate Panel) */}
      <div className="vision-panel mt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
            <LucideBarChart3 className="lucide-icon mr-2 text-indigo-500" />
            Referred User Activity Logs
        </h2>
        <ReferredUserLogs token={token}/>
      </div>
    </div>
  );
}