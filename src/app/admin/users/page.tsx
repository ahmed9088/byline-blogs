"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import AdminLayout from "../../../components/AdminLayout";
import { authAPI } from "../../../services/api";
import { useToast } from "../../../context/ToastContext";
import { Search, Trash2, ShieldAlert } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");

  // Modal states
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState("");
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await authAPI.getUsers();
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err: any) {
      console.error("Failed to load users:", err.message);
      showToast("Could not load users list.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, userName: string, newRole: string) => {
    try {
      const res = await authAPI.updateUserRole(userId, newRole);
      if (res.data.success) {
        showToast(`Role for ${userName} updated to ${newRole}`, "success");
        fetchUsers();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Error updating user role.", "error");
    }
  };

  const handleDeleteUser = async () => {
    if (!confirmDeleteId) return;
    try {
      const res = await authAPI.deleteUser(confirmDeleteId);
      if (res.data.success) {
        showToast("User deleted successfully", "success");
        setConfirmDeleteId(null);
        fetchUsers();
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Error deleting user.", "error");
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = filterRole ? u.role === filterRole : true;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-xl font-bold font-serif text-neutral-900 dark:text-neutral-50">User Management</h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Configure system roles, privileges, and roster details.
            </p>
          </div>
        </div>

        {/* Toolbar Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-neutral-950 p-4 border border-neutral-200/60 dark:border-neutral-900 rounded-sm">
          <div className="relative w-full sm:max-w-xs">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm focus:outline-none dark:text-neutral-200"
            />
            <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-neutral-450" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-[10px] uppercase font-bold text-neutral-400">Role:</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm focus:outline-none dark:text-neutral-205"
            >
              <option value="">All Roles</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Admin">Admin</option>
              <option value="Author">Author</option>
              <option value="Registered User">Registered User</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200/60 dark:border-neutral-900 rounded-sm overflow-hidden">
          {loading ? (
            <div className="py-20 text-center text-xs text-neutral-450 animate-pulse uppercase tracking-wider font-medium">
              Loading Users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center text-xs text-neutral-450 italic">
              No users match search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900 border-b text-neutral-450 font-bold uppercase tracking-wider text-[9px]">
                    <th className="p-4">User</th>
                    <th className="p-4">Role Settings</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900 text-neutral-700 dark:text-neutral-305">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/20">
                      <td className="p-4 flex items-center gap-3">
                        {u.profileImage ? (
                          <img src={u.profileImage} alt="" className="w-7 h-7 rounded-full object-cover border" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-neutral-100 dark:bg-neutral-850 flex items-center justify-center font-bold">
                            {(u.name || "?")[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-neutral-850 dark:text-neutral-100">{u.name}</span>
                          <span className="text-[10px] text-neutral-450 dark:text-neutral-500">{u.email}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, u.name, e.target.value)}
                          disabled={u.role === "Super Admin"} // Cannot easily demote/change super admin here
                          className="text-xs px-2 py-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded focus:outline-none dark:text-neutral-205"
                        >
                          <option value="Super Admin">Super Admin</option>
                          <option value="Admin">Admin</option>
                          <option value="Author">Author</option>
                          <option value="Registered User">Registered User</option>
                        </select>
                      </td>
                      <td className="p-4 text-neutral-500">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="p-4 text-right">
                        {u.role !== "Super Admin" ? (
                          <button
                            onClick={() => {
                              setConfirmDeleteId(u._id);
                              setConfirmDeleteName(u.name);
                            }}
                            className="text-neutral-400 hover:text-red-500 p-1"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-bold uppercase tracking-wider">
                            Protected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[10000] bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 max-w-sm w-full p-6 space-y-4 rounded-sm shadow-2xl">
              <div className="flex items-center gap-2.5 text-red-550">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="font-serif text-sm font-bold uppercase tracking-wider">Delete Account</h3>
              </div>
              <p className="text-xs text-neutral-550 dark:text-neutral-400 leading-relaxed">
                Are you sure you want to permanently delete the account of <strong>{confirmDeleteName}</strong>?
                This action is irreversible and will remove all their bookmarks.
              </p>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="px-4 py-1.5 border border-neutral-350 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold uppercase tracking-wider rounded-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-1.5 bg-red-650 hover:bg-red-700 text-white text-xs font-semibold uppercase tracking-wider rounded-sm"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
