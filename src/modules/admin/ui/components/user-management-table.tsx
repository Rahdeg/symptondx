'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Users,
    Search,
    Edit,
    Trash2,
    AlertTriangle,
    UserCheck,
    UserX,
    Loader2
} from 'lucide-react';
import { api } from '@/trpc/client';
import { formatDistanceToNow } from 'date-fns';

// Skeleton loading component for table rows
const UserTableSkeleton: React.FC = () => {
    return (
        <>
            {Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                    <TableCell>
                        <Skeleton className="h-4 w-4" />
                    </TableCell>
                    <TableCell>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                        <div className="flex gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
};

interface User {
    id: string;
    clerkId: string;
    name: string | null;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    isActive: boolean | null;
    onboardingComplete: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

interface UserEditModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ user, isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'patient',
        isActive: user?.isActive ?? true,
    });

    const updateUser = api.admin.updateUser.useMutation({
        onSuccess: () => {
            onSuccess();
            onClose();
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        updateUser.mutate({
            id: user.id,
            ...formData,
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="User name"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="User email"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Role</label>
                        <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as 'patient' | 'doctor' | 'admin' })}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="patient">Patient</SelectItem>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            className="rounded border-gray-300"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium">
                            Account Active
                        </label>
                    </div>

                    {updateUser.error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{updateUser.error.message}</AlertDescription>
                        </Alert>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={updateUser.isPending}>
                            {updateUser.isPending ? 'Updating...' : 'Update User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export const UserManagementTable: React.FC = () => {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [editUser, setEditUser] = useState<User | null>(null);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    const { data: usersData, refetch, isLoading, isFetching } = api.admin.getAllUsers.useQuery({
        search: search || undefined,
        role: roleFilter === 'all' ? undefined : roleFilter as 'patient' | 'doctor' | 'admin',
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
        limit: 50,
        offset: 0,
    });

    const deleteUserMutation = api.admin.deleteUser.useMutation({
        onSuccess: () => {
            refetch();
            setDeleteUser(null);
        },
    });

    const bulkActionMutation = api.admin.bulkUserAction.useMutation({
        onSuccess: () => {
            refetch();
            setSelectedUsers([]);
        },
    });

    const handleSelectUser = (userId: string, checked: boolean) => {
        if (checked) {
            setSelectedUsers([...selectedUsers, userId]);
        } else {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked && usersData?.users) {
            setSelectedUsers(usersData.users.map(user => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
        if (selectedUsers.length === 0) return;

        bulkActionMutation.mutate({
            userIds: selectedUsers,
            action,
        });
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800';
            case 'doctor': return 'bg-blue-100 text-blue-800';
            case 'patient': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                    {isFetching && !isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <div className="flex-1">
                        <div className="relative">
                            {isFetching && !isLoading ? (
                                <Loader2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            )}
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <Select value={roleFilter} onValueChange={setRoleFilter} disabled={isLoading}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All Roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="patient">Patient</SelectItem>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                    <div className="flex gap-2 mb-4 p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm text-blue-800">
                            {selectedUsers.length} users selected
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction('activate')}
                            className="ml-auto"
                            disabled={isLoading || bulkActionMutation.isPending}
                        >
                            {bulkActionMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <UserCheck className="h-4 w-4 mr-1" />
                            )}
                            Activate
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBulkAction('deactivate')}
                            disabled={isLoading || bulkActionMutation.isPending}
                        >
                            {bulkActionMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <UserX className="h-4 w-4 mr-1" />
                            )}
                            Deactivate
                        </Button>
                        <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBulkAction('delete')}
                            disabled={isLoading || bulkActionMutation.isPending}
                        >
                            {bulkActionMutation.isPending ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-1" />
                            )}
                            Delete
                        </Button>
                    </div>
                )}

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === usersData?.users?.length && usersData?.users?.length > 0}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="rounded border-gray-300"
                                        aria-label="Select all users"
                                        disabled={isLoading}
                                    />
                                </TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <UserTableSkeleton />
                            ) : usersData?.users?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <div className="flex flex-col items-center gap-2">
                                            <Users className="h-8 w-8 text-gray-400" />
                                            <p className="text-gray-500">No users found</p>
                                            <p className="text-sm text-gray-400">
                                                {search || roleFilter !== 'all' || statusFilter !== 'all'
                                                    ? 'Try adjusting your search or filters'
                                                    : 'No users have been registered yet'
                                                }
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                usersData?.users?.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                                                className="rounded border-gray-300"
                                                aria-label={`Select user ${user.name || user.email}`}
                                                disabled={isLoading}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{user.name || 'Unnamed User'}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getRoleColor(user.role)}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.isActive ? "default" : "secondary"}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setEditUser(user)}
                                                    disabled={isLoading}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setDeleteUser(user)}
                                                    className="text-red-600 hover:text-red-700"
                                                    disabled={isLoading}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {!isLoading && usersData && (
                    <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {usersData.users.length} of {usersData.total} users
                        </div>
                        {usersData.hasMore && (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isFetching}
                            >
                                {isFetching ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    'Load More'
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>

            {/* Edit Modal */}
            <UserEditModal
                user={editUser}
                isOpen={!!editUser}
                onClose={() => setEditUser(null)}
                onSuccess={refetch}
            />

            {/* Delete Confirmation */}
            <Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                    </DialogHeader>
                    <p>Are you sure you want to delete {deleteUser?.name || deleteUser?.email}? This action cannot be undone.</p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteUser(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteUser && deleteUserMutation.mutate({ id: deleteUser.id })}
                            disabled={deleteUserMutation.isPending}
                        >
                            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};
