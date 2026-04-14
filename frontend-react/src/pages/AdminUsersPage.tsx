import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/Dialog";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import type { User } from "@/types";

export function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({ email: "", password: "", name: "", role: "PM" });

  useEffect(() => {
    load();
  }, []);

  const load = () => {
    api.get("/users").then((r) => setUsers(r.data)).catch(console.error);
  };

  const openCreate = () => {
    setEditUser(null);
    setForm({ email: "", password: "", name: "", role: "PM" });
    setIsDialogOpen(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({ email: u.email, password: "", name: u.name, role: u.role });
    setIsDialogOpen(true);
  };

  const save = async () => {
    try {
      if (editUser) {
        await api.put(`/users/${editUser.id}`, { name: form.name, role: form.role, password: form.password || undefined });
      } else {
        await api.post("/users", form);
      }
      setIsDialogOpen(false);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/users/${id}`);
    load();
  };

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = { PM: "default", PD: "success", BA: "warning", QA: "warning" };
    return map[role] || "outline";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 text-sm">Manage user accounts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/pd")}>Back</Button>
          <Button onClick={openCreate}>+ Add User</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Email</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-gray-500">{u.email}</TableCell>
                  <TableCell><Badge variant={getRoleBadge(u.role) as any}>{u.role}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(u)}>Edit</Button>
                      <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteUser(u.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogHeader>
          <DialogTitle>{editUser ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>
        <DialogContent className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          {!editUser && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </>
          )}
          {editUser && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password (leave blank to keep current)</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="PM">PM</option>
              <option value="PD">PD</option>
              <option value="BA">BA</option>
              <option value="QA">QA</option>
            </Select>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button onClick={save}>{editUser ? "Update" : "Create"}</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
