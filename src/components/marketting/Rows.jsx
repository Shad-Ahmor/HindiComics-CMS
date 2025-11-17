import React, { useState } from "react";
import PropTypes from 'prop-types';
import { ChevronDown, ChevronRight } from 'lucide-react'; 

export default function Row({ row, isParent }) {
  const [open, setOpen] = useState(false);
  // Safety check to prevent errors if 'row' is null/undefined
  if (!row) return null; 
  const rowClass = `vision-tr ${isParent ? 'parent-row' : ''}`;
  // This utility function is needed to format the role
  const formatRole = (role) => (role ? role.charAt(0).toUpperCase() + role.slice(1) : '—');
  return (
    <>
      {/* 🔹 Parent/Child Main Row (vision-tr) */}
      <div className={rowClass}>
        
        {/* 1. Collapse Icon Cell (vision-td, width: 40px) */}
        <div className="vision-td flex items-center justify-center">
          {isParent && (
            <button 
              className="collapse-icon"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="expand row"
            >
              {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          )}
        </div>
        {/* 2. Email */}
        <div className="vision-td font-medium">
          {row.email}
        </div>
        
        {/* 3. Points */}
        <div className="vision-td text-right">
          {row.points ?? 0}
        </div>
        
        {/* 4. Role */}
        <div className="vision-td text-right capitalize">
          {formatRole(row.role)}
        </div>
        {/* 5. Designation (or Referred Count) */}
        <div className="vision-td text-right">
          {row.referredUsers ? row.referredUsers.length : (row.referred ? 'Yes' : 'No')}
        </div>
        
        {/* 6. Referred Count (Was 'Referred' in CollapsibleTable header) */}
         <div className="vision-td text-right">
           {row.referredUsers ? row.referredUsers.length : (row.referred ? 'Yes' : 'No')}
         </div>
      </div>

      {/* 🔹 Child Rows (Collapsible Section) */}
      {isParent && open && (
        // Uses 'sub-row' class from your CSS
        <div className="vision-tr sub-row"> 
            
            {/* Header for the Collapsed Section */}
            <div className="sub-row-header">
                रेफर किए गए यूज़र्स ({row.referredUsers?.length || 0})
            </div>

            {row.referredUsers?.length ? (
                <div className="w-full">
                    
                    {/* Nested Table Header (sub-row-item structure for header) */}
                    {/* The structure here must match the .sub-row-item grid-template-columns */}
                    <div className="sub-row-item" style={{ fontWeight: '700', color: 'var(--color-text-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                        <div style={{ width: '40px' }}></div> {/* Empty Column */}
                        <div>ईमेल</div>
                        <div className="text-right">पॉइंट्स</div>
                        <div className="text-right">भूमिका</div>
                    </div>

                    {/* Nested Table Body */}
                    {row.referredUsers
                        .filter(user => user && user.email) 
                        .map((referredUser) => (
                        // Uses 'sub-row-item' class from your CSS
                        <div key={referredUser.uid} className="sub-row-item">
                            <div style={{ width: '40px' }}></div> {/* Empty Column */}
                            <div>{referredUser.email}</div>
                            <div className="text-right">
                                {referredUser.points ?? 0}
                            </div>
                            <div className="text-right capitalize">
                                {formatRole(referredUser.role)}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="vision-td text-center vision-text-secondary p-4">
                    कोई रेफर किया गया यूज़र नहीं मिला।
                </p>
            )}
        </div>
      )}
    </>
  );
}

// Prop Types (Unchanged)
Row.propTypes = {
  row: PropTypes.shape({
    email: PropTypes.string.isRequired, 
    points: PropTypes.number,
    role: PropTypes.string,
    referred: PropTypes.bool,
    referredUsers: PropTypes.arrayOf(
      PropTypes.shape({
        uid: PropTypes.string,
        email: PropTypes.string, 
        points: PropTypes.number,
        role: PropTypes.string,
      })
    ),
  }).isRequired, 
  isParent: PropTypes.bool.isRequired,
};