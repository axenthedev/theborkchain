
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useBork } from '@/context/BorkContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal } from "lucide-react"

const AdminPage = () => {
  const { connected, isAdmin, users, tasks } = useBork();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [adminAccess, setAdminAccess] = useState(false);

  useEffect(() => {
    // Check for admin session in localStorage
    const adminSession = localStorage.getItem('admin_session');
    if (adminSession) {
      try {
        const session = JSON.parse(adminSession);
        if (session.isLoggedIn) {
          setAdminAccess(true);
        }
      } catch (error) {
        console.error('Error parsing admin session:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Filter users based on search term
    const results = users.filter(user =>
      user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.referralCode.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  if (!adminAccess && (!connected || !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Unauthorized</h1>
          <p className="text-gray-500">You do not have permission to access this page.</p>
          <Link to="/admin/login" className="text-white hover:text-bork-green mt-4 block">Go to Admin Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-5">Admin Dashboard</h1>

      <div className="mb-5">
        <Input
          type="text"
          placeholder="Search users by address or referral code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Table>
        <TableCaption>A list of your recent users.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Address</TableHead>
            <TableHead>Referral Code</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.address}</TableCell>
              <TableCell>{user.referralCode}</TableCell>
              <TableCell>{user.balance}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => {
                      setSelectedUser(user);
                      setIsTaskModalOpen(true);
                    }}>
                      View Tasks
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">Delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete user from our servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction>Continue</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Task Modal */}
      {isTaskModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Tasks for User: {selectedUser.address}</h2>
            <ul>
              {tasks.map(task => (
                <li key={task.id} className="py-2 border-b border-gray-200">
                  <strong>{task.title}</strong> - Reward: {task.reward}
                </li>
              ))}
            </ul>
            <Button onClick={() => setIsTaskModalOpen(false)}>Close</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
