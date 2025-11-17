import React, { useEffect, useState , useRef} from 'react';

import api from '../common/api';
import { Search, ChevronDown } from 'lucide-react';
import '../../styles/UserLogs.css';

export default function UserLogs({token}) {
  const [userLogs, setUserLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedUsers, setExpandedUsers] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

    const fetchCalled = useRef(false);


   useEffect(() => {
    if (fetchCalled.current) return; // prevent duplicate call
    fetchCalled.current = true;
    fetchUserLogs();
  }, []);

  useEffect(() => { filterLogs(); }, [searchQuery, userLogs]);

  const fetchUserLogs = async () => {
      let isMounted = true;

    try {
      if (!token) return;
      const response = await api.get('/userlogs', { headers: { Authorization: `Bearer ${token}` }});
       if (!isMounted) return;
      const uniqueUserIds = [...new Set(response.data.map(log => log.userId))];
      const userEmailsData = await fetchUserEmails(uniqueUserIds);
      const formattedLogs = response.data.map((log, index) => ({
        id: index,
        userId: log.userId,
        userEmail: userEmailsData[log.userId] || log.userId,
        date: formatDate(log.date),
        page: log.page,
        totalDuration: `${(parseInt(log.totalDuration, 10)/1000).toFixed(2)} sec`,
        startTime: formatDateTime(log.startTime),
        lastUpdated: formatDateTime(log.lastUpdated),
      }));
      setUserLogs(formattedLogs);
      setFilteredLogs(formattedLogs);
    } catch (err) { console.error(err); }
      return () => { isMounted = false; };

  };

  const fetchUserEmails = async (userIds) => {
    try {
      if (!token) return {};
      const response = await api.post('/users', { database: 'users' }, { headers: { Authorization: `Bearer ${token}` }});
      const mapping = {};
      response.data.forEach(user => { if (userIds.includes(user.id)) mapping[user.id] = user.email; });
      return mapping;
    } catch { return {}; }
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 8) return dateString;
    const day = dateString.substring(0, 2);
    const month = parseInt(dateString.substring(2, 4), 10) - 1;
    const year = dateString.substring(4, 8);
    return new Date(year, month, day).toLocaleDateString('en-GB',{ day:'2-digit', month:'short', year:'numeric'});
  };

  const formatDateTime = (timestamp) => new Date(parseInt(timestamp,10)).toLocaleString();

  const filterLogs = () => {
    const lower = searchQuery.toLowerCase();
    const filtered = userLogs.filter(
      log => log.userEmail.toLowerCase().includes(lower) || log.page.toLowerCase().includes(lower) || log.date.toLowerCase().includes(lower)
    );
    setFilteredLogs(filtered);
  };

  const toggleExpand = (userId) => {
    setExpandedUsers(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  // Pagination
  const uniqueUsers = Array.from(new Set(filteredLogs.map(log => log.userId))).map(userId => ({
    userId,
    userEmail: filteredLogs.find(log => log.userId===userId).userEmail,
    logs: filteredLogs.filter(log => log.userId===userId),
  }));

  const totalPages = Math.ceil(uniqueUsers.length/rowsPerPage);
  const paginatedUsers = uniqueUsers.slice((currentPage-1)*rowsPerPage, currentPage*rowsPerPage);

  return (
    <div className="userlogs-container p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold vision-text-primary">App Page Track</h2>
        <div className="search-wrapper mt-4 md:mt-0 w-full md:w-1/3 relative">
          <Search size={18} className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Search logs..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}/>
        </div>
      </div>

      {/* Table */}
      <div className="vision-table-container">
        <div className="vision-table-header grid grid-cols-6 gap-4 p-3 text-gray-400 font-semibold text-sm">
          <div></div>
          <div>User Email</div>
          <div>Date</div>
          <div>Page</div>
          <div>Total Duration</div>
          <div>Last Updated</div>
        </div>

        <div className="vision-table-body">
          {paginatedUsers.length===0 ? <div className="p-4 text-center text-gray-400">No logs found.</div> :
            paginatedUsers.map(user=>(
              <React.Fragment key={user.userId}>
                {/* Main row */}
                <div
                  className={`vision-table-row grid grid-cols-6 gap-4 p-3 rounded-lg cursor-pointer transition-all duration-300
                    ${expandedUsers[user.userId] ? 'bg-gray-100 shadow-lg' : 'hover:bg-gray-50/20'}`}
                  onClick={() => toggleExpand(user.userId)}
                >
                  <div className={`flex items-center justify-center transition-transform duration-300 ${expandedUsers[user.userId] ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} />
                  </div>
                  <div>{user.userEmail}</div>
                  <div>{user.logs[0]?.date}</div>
                  <div>{user.logs[0]?.page}</div>
                  <div>{user.logs[0]?.totalDuration}</div>
                  <div>{user.logs[0]?.lastUpdated}</div>
                </div>

                {/* Animated sub-rows */}
                <div className={`sub-row-wrapper ${expandedUsers[user.userId]? 'expanded': ''}`}>
                  {user.logs.slice(1).map((log, idx)=>(
                    <div key={idx} className="vision-table-row sub-row grid grid-cols-6 gap-4 p-3 pl-12 rounded-lg text-sm opacity-90 hover:bg-gray-50/10">
                      <div></div><div></div>
                      <div>{log.date}</div>
                      <div>{log.page}</div>
                      <div>{log.totalDuration}</div>
                      <div>{log.lastUpdated}</div>
                    </div>
                  ))}
                </div>
              </React.Fragment>
            ))
          }
        </div>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div>
          Rows per page:
          <select className="ml-2 border rounded p-1 vision-input"
            value={rowsPerPage} onChange={e=>{ setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}>
            {[5,10,15,20].map(size=><option key={size} value={size}>{size}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          <button className="vision-button secondary px-3 py-1" disabled={currentPage===1} onClick={()=>setCurrentPage(p=>p-1)}>Prev</button>
          <span>{currentPage} / {totalPages||1}</span>
          <button className="vision-button secondary px-3 py-1" disabled={currentPage===totalPages||totalPages===0} onClick={()=>setCurrentPage(p=>p+1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
