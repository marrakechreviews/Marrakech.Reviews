import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  User, 
  UserCheck, 
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Crown,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { usersAPI } from '../lib/api';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    phone: '',
    isActive: true,
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });

  const queryClient = useQueryClient();

  // Fetch users with error handling
  const { data: usersResponse, isLoading, error } = useQuery({
    queryKey: ['users', searchTerm, roleFilter, statusFilter, sortBy],
    queryFn: () => usersAPI.getUsers({ 
      search: searchTerm || undefined,
      role: roleFilter && roleFilter !== 'all' ? roleFilter : undefined,
      isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      sort: sortBy,
      limit: 50
    }),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user stats with error handling
  const { data: statsResponse } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersAPI.getUserStats(),
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const users = usersResponse?.data?.data || [];
  const totalUsers = usersResponse?.data?.pagination?.total || 0;
  const stats = statsResponse?.data || {};

  // Create user mutation with enhanced error handling
  const createMutation = useMutation({
    mutationFn: (userData) => {
      console.log('Creating user with data:', userData);
      return usersAPI.createUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-stats']);
      setIsCreateDialogOpen(false);
      resetForm();
      toast.success('User created successfully');
    },
    onError: (error) => {
      console.error('Create user error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create user';
      toast.error(errorMessage);
    },
  });

  // Update user mutation with enhanced error handling
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      console.log('Updating user:', id, 'with data:', data);
      return usersAPI.updateUser(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-stats']);
      setIsEditDialogOpen(false);
      resetForm();
      toast.success('User updated successfully');
    },
    onError: (error) => {
      console.error('Update user error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update user';
      toast.error(errorMessage);
    },
  });

  // Delete user mutation with enhanced error handling
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      console.log('Deleting user:', id);
      return usersAPI.deleteUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-stats']);
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      console.error('Delete user error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to delete user';
      toast.error(errorMessage);
    },
  });

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user',
      phone: '',
      isActive: true,
      address: {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      }
    });
    setSelectedUser(null);
  }, []);

  const handleCreate = useCallback(() => {
    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Use the same simple structure as the working SimpleProductsPage pattern
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        isActive: formData.isActive
      };

      // Only add optional fields if they have values
      if (formData.phone && formData.phone.trim()) {
        userData.phone = formData.phone.trim();
      }

      // Handle address - only include if at least one field is provided
      if (formData.address.street || formData.address.city || formData.address.state || 
          formData.address.postalCode || formData.address.country) {
        userData.address = {};
        if (formData.address.street && formData.address.street.trim()) {
          userData.address.street = formData.address.street.trim();
        }
        if (formData.address.city && formData.address.city.trim()) {
          userData.address.city = formData.address.city.trim();
        }
        if (formData.address.state && formData.address.state.trim()) {
          userData.address.state = formData.address.state.trim();
        }
        if (formData.address.postalCode && formData.address.postalCode.trim()) {
          userData.address.postalCode = formData.address.postalCode.trim();
        }
        if (formData.address.country && formData.address.country.trim()) {
          userData.address.country = formData.address.country.trim();
        }
      }

      console.log('Final user data for creation:', userData);
      createMutation.mutate(userData);
    } catch (error) {
      console.error('Error preparing user data:', error);
      toast.error('Error preparing user data');
    }
  }, [formData, createMutation]);

  const handleEdit = useCallback((user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't populate password for security
      role: user.role || 'user',
      phone: user.phone || '',
      isActive: user.isActive !== false,
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        postalCode: user.address?.postalCode || '',
        country: user.address?.country || ''
      }
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdate = useCallback(() => {
    try {
      // Add more robust null checking
      if (!selectedUser || !selectedUser._id) {
        toast.error('No user selected for update');
        setIsEditDialogOpen(false);
        resetForm();
        return;
      }
  
      // Validate required fields
      if (!formData.name || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Use the same simple structure as the working SimpleProductsPage pattern
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        isActive: formData.isActive
      };

      // Only include password if it's provided
      if (formData.password && formData.password.trim()) {
        userData.password = formData.password;
      }

      // Only add optional fields if they have values
      if (formData.phone && formData.phone.trim()) {
        userData.phone = formData.phone.trim();
      }

      // Handle address - only include if at least one field is provided
      if (formData.address.street || formData.address.city || formData.address.state || 
          formData.address.postalCode || formData.address.country) {
        userData.address = {};
        if (formData.address.street && formData.address.street.trim()) {
          userData.address.street = formData.address.street.trim();
        }
        if (formData.address.city && formData.address.city.trim()) {
          userData.address.city = formData.address.city.trim();
        }
        if (formData.address.state && formData.address.state.trim()) {
          userData.address.state = formData.address.state.trim();
        }
        if (formData.address.postalCode && formData.address.postalCode.trim()) {
          userData.address.postalCode = formData.address.postalCode.trim();
        }
        if (formData.address.country && formData.address.country.trim()) {
          userData.address.country = formData.address.country.trim();
        }
      }

      console.log('Final user data for update:', userData);
      updateMutation.mutate({ id: selectedUser._id, data: userData });
    } catch (error) {
      console.error('Error preparing update data:', error);
      toast.error('Error preparing update data');
    }
  }, [formData, selectedUser, updateMutation]);
  

  const handleDelete = useCallback((id, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleQuickRoleToggle = useCallback((user) => {
    if (!user?._id) {
      toast.error('Invalid user data');
      return;
    }
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    updateMutation.mutate({ 
      id: user._id, 
      data: { role: newRole }
    });
  }, [updateMutation]);

  const handleQuickStatusToggle = useCallback((user) => {
    if (!user?._id) {
      toast.error('Invalid user data');
      return;
    }
    updateMutation.mutate({ 
      id: user._id, 
      data: { isActive: !user.isActive }
    });
  }, [updateMutation]);

  const handleFieldChange = useCallback((field) => (e) => {
    const value = e.target ? e.target.value : e;
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role) => {
    return role === 'admin' ? (
      <Badge variant="default" className="flex items-center gap-1">
        <Crown className="h-3 w-3" />
        Admin
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <User className="h-3 w-3" />
        User
      </Badge>
    );
  };

  const UserForm = React.memo(({ isEdit = false }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="user-name">Full Name *</Label>
          <Input
            id="user-name"
            value={formData.name}
            onChange={handleFieldChange('name')}
            placeholder="Enter full name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-email">Email *</Label>
          <Input
            id="user-email"
            type="email"
            value={formData.email}
            onChange={handleFieldChange('email')}
            placeholder="Enter email address"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="user-password">
            Password {isEdit ? '(leave blank to keep current)' : '*'}
          </Label>
          <Input
            id="user-password"
            type="password"
            value={formData.password}
            onChange={handleFieldChange('password')}
            placeholder={isEdit ? "Enter new password" : "Enter password"}
            required={!isEdit}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-phone">Phone</Label>
          <Input
            id="user-phone"
            value={formData.phone}
            onChange={handleFieldChange('phone')}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="user-role">Role</Label>
        <Select value={formData.role} onValueChange={handleFieldChange('role')}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>Address</Label>
        <div className="space-y-2">
          <Input
            value={formData.address.street}
            onChange={handleFieldChange('address.street')}
            placeholder="Street address"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={formData.address.city}
              onChange={handleFieldChange('address.city')}
              placeholder="City"
            />
            <Input
              value={formData.address.state}
              onChange={handleFieldChange('address.state')}
              placeholder="State"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input
              value={formData.address.postalCode}
              onChange={handleFieldChange('address.postalCode')}
              placeholder="Postal Code"
            />
            <Input
              value={formData.address.country}
              onChange={handleFieldChange('address.country')}
              placeholder="Country"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="user-active">Active User</Label>
          <p className="text-sm text-muted-foreground">
            Allow this user to access the system
          </p>
        </div>
        <Switch
          id="user-active"
          checked={formData.isActive}
          onCheckedChange={handleFieldChange('isActive')}
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          variant="outline"
          onClick={() => {
            if (isEdit) {
              setIsEditDialogOpen(false);
            } else {
              setIsCreateDialogOpen(false);
            }
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={isEdit ? handleUpdate : handleCreate}
          disabled={
            !formData.name || 
            !formData.email || 
            (!isEdit && !formData.password) || 
            (isEdit ? updateMutation.isPending : createMutation.isPending)
          }
        >
          {isEdit 
            ? (updateMutation.isPending ? 'Updating...' : 'Update User')
            : (createMutation.isPending ? 'Creating...' : 'Create User')
          }
        </Button>
      </div>
    </div>
  ));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading users: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage user accounts and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            <UserForm />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalUsers || 0) - (stats.activeUsers || 0)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search Users</Label>
              <Input
                id="search"
                placeholder="Search by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-createdAt">Newest First</SelectItem>
                  <SelectItem value="createdAt">Oldest First</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="-name">Name Z-A</SelectItem>
                  <SelectItem value="email">Email A-Z</SelectItem>
                  <SelectItem value="-email">Email Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({totalUsers})
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-muted-foreground">No users found. Create your first user!</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">ID: {user._id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="cursor-pointer" 
                        onClick={() => handleQuickRoleToggle(user)}
                        title="Click to toggle role"
                      >
                        {getRoleBadge(user.role)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="cursor-pointer" 
                        onClick={() => handleQuickStatusToggle(user)}
                        title="Click to toggle status"
                      >
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(user.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user._id, user.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser ? (
            <UserForm isEdit={true} />
          ) : (
            <div className="py-4 text-center">No user selected</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;

