import { rolePermissions } from "./rolePermissions";

/**
 * Check if a role can perform an action on a module
 * @param {string} role - user's role
 * @param {string} module - module name
 * @param {string} action - action to check: "view", "edit", "add", "delete"
 * @returns {boolean}
 */
export function can(role, module, action = "view") {
  if (!role || !module || !action) return false;

  const roleKey = String(role.role).toLowerCase();
  const permissions = rolePermissions[roleKey];
  if (!permissions) return false;

  const modulePermissions = permissions[module];
  if (!modulePermissions) return false;

  // ✅ Check if action is true
  return Boolean(modulePermissions[action]);
}
