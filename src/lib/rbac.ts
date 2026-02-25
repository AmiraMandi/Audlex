/**
 * RBAC — Role-Based Access Control
 * 
 * Roles hierarchy (highest to lowest):
 *   owner > admin > member > viewer
 * 
 * Permissions:
 *   - viewer:  read-only dashboard, view systems/documents/checklist
 *   - member:  everything viewer + create/edit systems, run classification, generate docs
 *   - admin:   everything member + manage users, billing, org settings
 *   - owner:   everything admin + delete org, transfer ownership
 */

export type UserRole = "owner" | "admin" | "member" | "viewer";

const roleHierarchy: Record<UserRole, number> = {
  viewer: 0,
  member: 1,
  admin: 2,
  owner: 3,
};

export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

// Permission definitions
export type Permission =
  | "systems.read"
  | "systems.create"
  | "systems.update"
  | "systems.delete"
  | "assessments.read"
  | "assessments.create"
  | "documents.read"
  | "documents.create"
  | "documents.delete"
  | "documents.approve"
  | "compliance.read"
  | "compliance.update"
  | "alerts.read"
  | "alerts.manage"
  | "org.read"
  | "org.update"
  | "billing.manage"
  | "users.read"
  | "users.invite"
  | "users.remove"
  | "users.changeRole";

const permissionMap: Record<Permission, UserRole> = {
  // Read permissions — viewer+
  "systems.read": "viewer",
  "assessments.read": "viewer",
  "documents.read": "viewer",
  "compliance.read": "viewer",
  "alerts.read": "viewer",
  "org.read": "viewer",
  "users.read": "viewer",

  // Write permissions — member+
  "systems.create": "member",
  "systems.update": "member",
  "assessments.create": "member",
  "documents.create": "member",
  "compliance.update": "member",

  // Management — admin+
  "systems.delete": "admin",
  "documents.delete": "admin",
  "documents.approve": "admin",
  "alerts.manage": "admin",
  "org.update": "admin",
  "billing.manage": "admin",
  "users.invite": "admin",
  "users.remove": "admin",
  "users.changeRole": "owner",
};

export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const requiredRole = permissionMap[permission];
  if (!requiredRole) return false;
  return hasMinRole(userRole, requiredRole);
}

export function assertPermission(userRole: UserRole, permission: Permission): void {
  if (!hasPermission(userRole, permission)) {
    throw new Error(
      `Permiso denegado: se requiere rol '${permissionMap[permission]}' o superior para '${permission}'. Tu rol actual es '${userRole}'.`
    );
  }
}
