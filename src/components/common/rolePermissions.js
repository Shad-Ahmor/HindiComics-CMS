// Define default permissions for each role
export const rolePermissions = {
  admin: {
    Dashboard: { view: true },
    Comics: { view: true, add: true, edit: true, delete: true },
    Contents: { view: true, add: true, edit: true, delete: true },
    Referrals: { view: true, add: true, edit: true, delete: true },
    Coupons: { view: true, add: true, edit: true, delete: true },
    "User Logs": { view: true },
  },
  editor: {
    Dashboard: { view: true },
    Comics: { view: true, add: true, edit: true, delete: false },
    Contents: { view: true, add: true, edit: true, delete: false },
    Referrals: { view: true, add: false, edit: false, delete: false },
    Coupons: { view: false },
    "User Logs": { view: false },
  },
  viewer: {
    Dashboard: { view: true },
    Comics: { view: true, add: false, edit: false, delete: false },
    Contents: { view: true, add: false, edit: false, delete: false },
    Referrals: { view: true, add: false, edit: false, delete: false },
    Coupons: { view: false },
    "User Logs": { view: false },
  },
  marketing: {
    Dashboard: { view: true },
    Referrals: { view: true, add: true, edit: true },
    Coupons: { view: true, add: true, edit: true },
  },
};
