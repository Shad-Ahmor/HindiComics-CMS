import React, { useEffect, useState , useRef} from "react";
import api from "../common/api";
import { Pencil, Trash2, Plus, X,Check, Edit2 } from "lucide-react";
import '../../styles/CouponPage.css';

export default function CouponPage({ user, token }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [newCoupon, setNewCoupon] = useState({
    code: "",
    points: "",
    expiredate: "",
  });
  const fetchCalled = useRef(false);
  // Fetch coupons when component mounts
  useEffect(() => {
    if (fetchCalled.current) return; 
    fetchCalled.current = true;
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
      let isMounted = true;

    try {
      setLoading(true);
      const { data } = await api.get("/coupons", {
        headers: { Authorization: `Bearer ${token}` }, // token now works
      });

      const formatted = data.map((c) => ({
        id: c.id,
        code: c.code,
        points: c.points,
        expiredate: c.expiredate,
        name: c.name,
        createdAt: c.createdAt ? new Date(c.createdAt).toLocaleString() : "-",
      }));

      setCoupons(formatted);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
    if (isMounted) setLoading(false);
    }

      return () => (isMounted = false);

  }

  // ================= CREATE COUPON =================
  async function createCoupon() {
    if (!newCoupon.code || !newCoupon.points || !newCoupon.expiredate) return;

    try {

      await api.post(
        "/coupons/create",
        {
          code: newCoupon.code,
          points: newCoupon.points,
          expiredate: newCoupon.expiredate,
          id: Date.now(),
          name: "Admin",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNewCoupon({ code: "", points: "", expiredate: "" });
      setModalOpen(false);
      fetchCoupons();
    } catch (err) {
      console.error("Error creating coupon:", err);
    }
  }

  async function updateCoupon() {
  try {
    await api.put(
      `/coupons/${editingCoupon.code}`,
      { ...newCoupon, name: "Admin" },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setEditingCoupon(null);
    setModalOpen(false);
    fetchCoupons();
  } catch (err) {
    console.error("Error updating coupon:", err);
  }
}


  useEffect(() => {
  if (editingCoupon) {
    setNewCoupon({
      code: editingCoupon.code,
      points: editingCoupon.points,
      expiredate: editingCoupon.expiredate,
    });
  } else {
    setNewCoupon({ code: "", points: "", expiredate: "" });
  }
}, [editingCoupon]);


  // ================= DELETE COUPON =================
  async function deleteCoupon(code) {
    const confirmDelete = window.confirm("Delete this coupon?");
    if (!confirmDelete) return;

    try {

      await api.delete(`/coupons/${code}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchCoupons();
    } catch (err) {
      console.error("Error deleting coupon:", err);
    }
  }

  // ================= TABLE COLUMNS =================
  const columns = [
    { field: "code", headerName: "Coupon Code" },
    { field: "points", headerName: "Points" },
    { field: "expiredate", headerName: "Expiry Date" },
    { field: "createdAt", headerName: "Created At" },
    { field: "actions", headerName: "Actions", align: "right" },
  ];

  return (
        <div className="vision-container">
        <div className="card">
{/* Header + Add Coupon Button */}
<div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 mt-10vh">
  <h2 className="text-xl vision-text-primary font-semibold">
    Coupon Management
  </h2>
  <button
    onClick={() => setModalOpen(true)}
    className="vision-btn-add-coupon w-full md:w-auto justify-center"
  >
    <Plus size={18} /> Add Coupon
  </button>
</div>


{/* Coupon Table */}
<div className="vision-table-container mt-6" style={{ minHeight: "350px" }}>
  <div className="vision-table">
    {/* TABLE HEAD */}
    <div className="vision-thead">
      <div className="vision-tr vision-tr-head">
        {columns.map((c) => (
          <div
            key={c.field}
            className={`vision-th ${c.align === "right" ? "text-right" : ""}`}
          >
            {c.headerName}
          </div>
        ))}
      </div>
    </div>

    {/* TABLE BODY */}
    <div className="vision-tbody">
      {loading ? (
        <div className="p-4 text-center vision-text-secondary">
          Loading coupons...
        </div>
      ) : coupons.length === 0 ? (
        <div className="p-4 text-center vision-text-secondary">
          No coupons found.
        </div>
      ) : (
        coupons.map((row) => (
          <div key={row.id} className="vision-tr">
            <div className="vision-td">{row.code}</div>
            <div className="vision-td">{row.points}</div>
            <div className="vision-td">{row.expiredate}</div>
            <div className="vision-td">{row.createdAt}</div>
            <div className="vision-td text-right">
              <div className="flex items-center gap-2 justify-end">
                <button
  onClick={() => {
    setEditingCoupon(row); // set the coupon to edit
    setModalOpen(true);    // open modal
  }}
  className="text-indigo-400"
>
  <Pencil size={17} />
</button>

                <button
                  onClick={() => deleteCoupon(row.code)}
                  className="text-red-400"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
</div>

      {/* ================= MODAL ================= */}
{modalOpen && (
  <div className="vision-modal-overlay" onClick={() => setModalOpen(false)}>
    <div
      className="vision-modal"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
    >
      <button
        className="vision-modal-close"
        onClick={() => setModalOpen(false)}
      >
        &times;
      </button>

   <h3 className="text-lg font-semibold vision-text-primary mb-4">
  {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
</h3>

<div className="flex flex-col gap-4">
  <input
    type="text"
    placeholder="Coupon Code"
    value={newCoupon.code}
    onChange={(e) =>
      setNewCoupon({ ...newCoupon, code: e.target.value })
    }
    className="vision-input"
  />
  <input
    type="number"
    placeholder="Points"
    value={newCoupon.points}
    onChange={(e) =>
      setNewCoupon({ ...newCoupon, points: e.target.value })
    }
    className="vision-input"
  />
  <input
    type="date"
    value={newCoupon.expiredate}
    onChange={(e) =>
      setNewCoupon({ ...newCoupon, expiredate: e.target.value })
    }
    className="vision-input"
  />

  <button
    onClick={editingCoupon ? updateCoupon : createCoupon}
    className="vision-btn-save-coupon"
  >
    {editingCoupon ? <Edit2 size={18} /> : <Check size={18} />}
    {editingCoupon ? "Update Coupon" : "Save Coupon"}
  </button>
</div>


    </div>
  </div>
)}

    </div>
    </div>
  );
}
