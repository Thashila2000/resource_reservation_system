"use client";

import { useState, useTransition, useMemo } from "react";
import { format } from "date-fns";
import {
  Users,
  UserPlus,
  Search,
  ShieldCheck,
  User,
  Building,
  Calendar,
  AlertCircle,
  Lock,
  Mail,
  Pencil,
  Trash2,
} from "lucide-react";
import { adminRegisterUser, adminUpdateUser, adminDeleteUser } from "@/lib/actions";
import { confirmDeleteAlert, showErrorAlert, showToast } from "@/lib/alerts";
import { GlassButton } from "@/components/ui/GlassButton";
import { Modal } from "@/components/ui/Modal";

export interface UserDirectoryItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EMPLOYEE";
  department: string | null;
  createdAt: Date;
}

export const DEPARTMENTS = [
  "Engineering",
  "Quality Assurance",
  "Product & Design",
  "IT & Operations",
  "Facility & IT",
  "Human Resources",
  "Sales & Marketing",
] as const;

interface AdminUsersClientProps {
  initialUsers: UserDirectoryItem[];
}

export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  const [users, setUsers] = useState<UserDirectoryItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "EMPLOYEE" | "ADMIN">("ALL");

  // Registration modal state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    department: DEPARTMENTS[0] as string,
    role: "EMPLOYEE" as "EMPLOYEE" | "ADMIN",
    password: "",
  });
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Edit user modal state
  const [editingUser, setEditingUser] = useState<UserDirectoryItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "EMPLOYEE" as "EMPLOYEE" | "ADMIN",
    password: "",
  });
  const [editError, setEditError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Filter users based on search and role
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(query);
        const matchesEmail = u.email.toLowerCase().includes(query);
        const matchesDept = u.department?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesDept) return false;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Handle open registration modal
  const handleOpenRegister = () => {
    setRegisterForm({
      name: "",
      email: "",
      department: DEPARTMENTS[0],
      role: "EMPLOYEE",
      password: "",
    });
    setRegisterError(null);
    setIsRegisterOpen(true);
  };

  // Handle submit registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    const fd = new FormData();
    fd.append("name", registerForm.name);
    fd.append("email", registerForm.email);
    fd.append("department", registerForm.department);
    fd.append("role", registerForm.role);
    fd.append("password", registerForm.password);

    startTransition(async () => {
      const res = await adminRegisterUser(fd);
      if (res?.error) {
        setRegisterError(res.error);
      } else {
        setIsRegisterOpen(false);
        showToast(`User "${registerForm.name}" registered successfully!`, "success");

        // Optimistically prepend to list
        setUsers((prev) => [
          {
            id: `temp-${Date.now()}`,
            name: registerForm.name,
            email: registerForm.email,
            role: registerForm.role,
            department: registerForm.department || null,
            createdAt: new Date(),
          },
          ...prev,
        ]);
      }
    });
  };

  // Handle open edit modal
  const handleOpenEdit = (user: UserDirectoryItem) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      department: user.department || DEPARTMENTS[0],
      role: user.role,
      password: "",
    });
    setEditError(null);
  };

  // Handle submit edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditError(null);

    const fd = new FormData();
    fd.append("name", editForm.name);
    fd.append("email", editForm.email);
    fd.append("department", editForm.department);
    fd.append("role", editForm.role);
    if (editForm.password) {
      fd.append("password", editForm.password);
    }

    startTransition(async () => {
      const res = await adminUpdateUser(editingUser.id, fd);
      if (res?.error) {
        setEditError(res.error);
      } else {
        const updatedId = editingUser.id;
        const updatedName = editForm.name;
        setEditingUser(null);
        showToast(`User "${updatedName}" updated successfully!`, "success");

        // Optimistically update in list
        setUsers((prev) =>
          prev.map((u) =>
            u.id === updatedId
              ? {
                  ...u,
                  name: editForm.name,
                  email: editForm.email,
                  role: editForm.role,
                  department: editForm.department || null,
                }
              : u
          )
        );
      }
    });
  };

  // SweetAlert confirmation before deleting a user
  const handleDeleteUser = async (user: UserDirectoryItem) => {
    const confirmed = await confirmDeleteAlert({
      title: `Delete user "${user.name}"?`,
      text: `Are you sure you want to delete ${user.name} (${user.email})? This action cannot be undone and will delete all their reservations.`,
      confirmButtonText: "Yes, delete user",
      cancelButtonText: "Cancel",
    });

    if (!confirmed) return;

    startTransition(async () => {
      const res = await adminDeleteUser(user.id);
      if (res?.error) {
        await showErrorAlert("Failed to Delete User", res.error);
      } else {
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        showToast(`User "${user.name}" has been deleted.`, "success");
      }
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Users className="h-6 w-6 text-indigo-400" />
            User Management & Provisioning
          </h1>
          <p className="text-sm text-slate-400">
            Create, edit, and manage system user accounts, roles, and departmental access.
          </p>
        </div>

        <GlassButton
          variant="primary"
          size="md"
          onClick={handleOpenRegister}
          className="inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          Register New User
        </GlassButton>
      </div>

      {/* Filters Bar: Search & Role Tabs */}
      <div className="glass-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search users by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input !py-1.5 !pl-9 !text-xs w-full"
          />
        </div>

        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(["ALL", "EMPLOYEE", "ADMIN"] as const).map((r) => {
            const count =
              r === "ALL"
                ? users.length
                : users.filter((u) => u.role === r).length;

            return (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  roleFilter === r
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                    : "border border-white/5 bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {r === "ALL" ? `All (${count})` : `${r.charAt(0) + r.slice(1).toLowerCase()}s (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Users className="h-10 w-10 text-slate-600 mb-2" />
            <p className="text-base font-semibold text-white">No users found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              {searchQuery
                ? `No users match "${searchQuery}".`
                : "No users registered under this filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/5 bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Department</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredUsers.map((item) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* User Profile */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-[11px] font-bold text-indigo-300 shrink-0">
                          {getInitials(item.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="h-3 w-3 text-slate-500" />
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      {item.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">
                          <ShieldCheck className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                          <User className="h-3 w-3" />
                          Employee
                        </span>
                      )}
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3.5">
                      {item.department ? (
                        <span className="inline-flex items-center gap-1.5 text-slate-300">
                          <Building className="h-3 w-3 text-slate-500" />
                          {item.department}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="px-4 py-3.5 text-slate-400 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        {format(new Date(item.createdAt), "MMM d, yyyy")}
                      </span>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="inline-flex items-center gap-1 rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-400 hover:bg-indigo-500/20 hover:border-indigo-500/50 transition-colors"
                          title="Edit user details"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(item)}
                          className="inline-flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/50 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Register New User Modal ── */}
      <Modal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New User"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Create an account for an employee or admin. The user will be able to log in immediately using these credentials.
          </p>

          {registerError && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{registerError}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Morgan"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
              className="glass-input"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="e.g. alex.morgan@primewave.com"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
              className="glass-input"
            />
          </div>

          {/* Department */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Department *
            </label>
            <select
              required
              value={registerForm.department}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, department: e.target.value })
              }
              className="glass-input cursor-pointer"
            >
              {DEPARTMENTS.map((dept) => (
                <option
                  key={dept}
                  value={dept}
                  className="bg-slate-900 text-white"
                >
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Account Role *
            </label>
            <select
              value={registerForm.role}
              onChange={(e) =>
                setRegisterForm({
                  ...registerForm,
                  role: e.target.value as "EMPLOYEE" | "ADMIN",
                })
              }
              className="glass-input cursor-pointer"
            >
              <option value="EMPLOYEE" className="bg-slate-900 text-white">
                Employee (Can reserve resources)
              </option>
              <option value="ADMIN" className="bg-slate-900 text-white">
                Admin (Facility Manager / Approver)
              </option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Password * <span className="text-slate-500">(Min. 6 characters)</span>
            </label>
            <div className="relative">
              <input
                type="password"
                required
                minLength={6}
                placeholder="Temporary or initial password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                className="glass-input !pr-9"
              />
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setIsRegisterOpen(false)}
              className="rounded-lg border border-white/10 px-3.5 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <GlassButton
              variant="primary"
              size="md"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Registering user..." : "Register User"}
            </GlassButton>
          </div>
        </form>
      </Modal>

      {/* ── Edit User Modal ── */}
      <Modal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        title="Edit User"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Update account information and role permissions for this user.
          </p>

          {editError && (
            <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{editError}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="glass-input"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="glass-input"
            />
          </div>

          {/* Department */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Department *
            </label>
            <select
              required
              value={editForm.department}
              onChange={(e) =>
                setEditForm({ ...editForm, department: e.target.value })
              }
              className="glass-input cursor-pointer"
            >
              {editForm.department &&
                !DEPARTMENTS.includes(
                  editForm.department as (typeof DEPARTMENTS)[number]
                ) && (
                  <option
                    value={editForm.department}
                    className="bg-slate-900 text-white"
                  >
                    {editForm.department}
                  </option>
                )}
              {DEPARTMENTS.map((dept) => (
                <option
                  key={dept}
                  value={dept}
                  className="bg-slate-900 text-white"
                >
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Role */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Account Role *
            </label>
            <select
              value={editForm.role}
              onChange={(e) =>
                setEditForm({
                  ...editForm,
                  role: e.target.value as "EMPLOYEE" | "ADMIN",
                })
              }
              className="glass-input cursor-pointer"
            >
              <option value="EMPLOYEE" className="bg-slate-900 text-white">
                Employee (Can reserve resources)
              </option>
              <option value="ADMIN" className="bg-slate-900 text-white">
                Admin (Facility Manager / Approver)
              </option>
            </select>
          </div>

          {/* Password (Optional) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              New Password <span className="text-slate-500">(Leave blank to keep existing password)</span>
            </label>
            <div className="relative">
              <input
                type="password"
                minLength={6}
                placeholder="Leave blank or enter min. 6 characters"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="glass-input !pr-9"
              />
              <Lock className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="rounded-lg border border-white/10 px-3.5 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <GlassButton
              variant="primary"
              size="md"
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Saving changes..." : "Save Changes"}
            </GlassButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
