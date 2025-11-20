
import { routesConfig } from "./routesConfig";

/**
 * Returns the routes a user is allowed to see based on their role.
 * @param {string} role - User role (e.g., 'admin', 'editor', 'viewer', 'marketing')
 * @returns {Array} - Array of route objects the user can access
 */


// Define default permissions for each role
export const rolePermissions = {
  admin: {
    Dashboard: { view: true },
    Comics: { view: true, add: true, edit: true, delete: true },
    Contents: { view: true, add: true, edit: true, delete: true },
    Referrals: { view: true, add: true, edit: true, delete: true },
    Coupons: { view: true, add: true, edit: true, delete: true },
    "User Logs": { view: true },
    Suggestions: { view: true },
  },
  editor: {
    Dashboard: { view: true },
    Comics: { view: true, add: true, edit: true, delete: false },
    Contents: { view: true, add: true, edit: true, delete: false },
    Referrals: { view: true, add: false, edit: false, delete: false },
    Coupons: { view: false },
    "User Logs": { view: false },
    Suggestions: { view: true },
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
    Suggestions: { view: true },
  },
    comicwriter: {  // ✅ Only comics
    Dashboard: { view: true },
    Comics: { view: true, add: true, edit: true, delete: false },
    Contents: { view: false },
    Referrals: { view: false },
    Coupons: { view: false },
    "User Logs": { view: false },
    Suggestions: { view: false },
  },
  contentwriter: { // ✅ Only stories/jokes/shayari content
    Dashboard: { view: true },
    Comics: { view: false },
    Contents: { view: true, add: true, edit: true, delete: false },
    Referrals: { view: false },
    Coupons: { view: false },
    "User Logs": { view: false },
    Suggestions: { view: true }, // optional
  },
    comicswriter: { // ✅ Only stories/jokes/shayari content
    Dashboard: { view: true },
    Comics: { view: true, add: true, edit: true, delete: false  },
    Contents: { view: false },
    Referrals: { view: false },
    Coupons: { view: false },
    "User Logs": { view: false },
    Suggestions: { view: true }, // optional
  },
};



export function getAllowedRoutes(role) {
  if (!role || !rolePermissions[role]) return [];

  const permissions = rolePermissions[role];

  // Filter routes based on 'view' permission
  return routesConfig.filter(route => permissions[route.name]?.view);
}