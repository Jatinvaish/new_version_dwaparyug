"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search } from "lucide-react"
import { format } from "date-fns"

interface User {
  id: number
  name: string
  email: string
  role: "Admin" | "Editor" | "Volunteer" | "Donor"
  status: "Active" | "Inactive" | "Suspended"
  createdAt: Date
  lastLogin: Date
}

const initialUsers: User[] = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@example.com",
    role: "Admin",
    status: "Active",
    createdAt: new Date("2023-01-15"),
    lastLogin: new Date("2024-01-20"),
  },
  {
    id: 2,
    name: "Editor Jane",
    email: "jane@example.com",
    role: "Editor",
    status: "Active",
    createdAt: new Date("2023-03-01"),
    lastLogin: new Date("2024-01-19"),
  },
  {
    id: 3,
    name: "Volunteer John",
    email: "john@example.com",
    role: "Volunteer",
    status: "Active",
    createdAt: new Date("2023-05-20"),
    lastLogin: new Date("2024-01-18"),
  },
  {
    id: 4,
    name: "Donor Alice",
    email: "alice@example.com",
    role: "Donor",
    status: "Active",
    createdAt: new Date("2023-07-10"),
    lastLogin: new Date("2024-01-17"),
  },
  {
    id: 5,
    name: "Inactive Bob",
    email: "bob@example.com",
    role: "Donor",
    status: "Inactive",
    createdAt: new Date("2023-09-01"),
    lastLogin: new Date("2023-10-01"),
  },
  {
    id: 6,
    name: "Suspended Carol",
    email: "carol@example.com",
    role: "Donor",
    status: "Suspended",
    createdAt: new Date("2023-11-11"),
    lastLogin: new Date("2023-11-15"),
  },
]

const userRoles = ["Admin", "Editor", "Volunteer", "Donor"]
const userStatuses = ["Active", "Inactive", "Suspended"]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")

  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formRole, setFormRole] = useState<User["role"]>("Donor")
  const [formStatus, setFormStatus] = useState<User["status"]>("Active")

  const resetForm = () => {
    setCurrentUser(null)
    setFormName("")
    setFormEmail("")
    setFormRole("Donor")
    setFormStatus("Active")
  }

  const handleEdit = (user: User) => {
    setCurrentUser(user)
    setFormName(user.name)
    setFormEmail(user.email)
    setFormRole(user.role)
    setFormStatus(user.status)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id))
    }
  }

  const handleSave = () => {
    if (!formName || !formEmail || !formRole || !formStatus) {
      alert("Please fill in all required fields.")
      return
    }

    const newUser: User = {
      id: currentUser ? currentUser.id : users.length + 1,
      name: formName,
      email: formEmail,
      role: formRole,
      status: formStatus,
      createdAt: currentUser ? currentUser.createdAt : new Date(),
      lastLogin: currentUser ? currentUser.lastLogin : new Date(),
    }

    if (currentUser) {
      setUsers(users.map((u) => (u.id === newUser.id ? newUser : u)))
    } else {
      setUsers([...users, newUser])
    }
    setIsDialogOpen(false)
    resetForm()
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "All" || user.role === filterRole
    const matchesStatus = filterStatus === "All" || user.status === filterStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive"
      case "Editor":
        return "default"
      case "Volunteer":
        return "secondary"
      case "Donor":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Inactive":
        return "secondary"
      case "Suspended":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users & Roles</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{currentUser ? "Edit User" : "Add New User"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formRole} onValueChange={(value) => setFormRole(value as User["role"])} required>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {userRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formStatus} onValueChange={(value) => setFormStatus(value as User["status"])} required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {userStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Roles</SelectItem>
                {userRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                {userStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{format(user.createdAt, "PPP")}</TableCell>
                  <TableCell>{format(user.lastLogin, "PPP")}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
