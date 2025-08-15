import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Mail,
  Search,
  Filter,
  Eye,
  MessageSquare,
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  Download
} from 'lucide-react';
import { format } from 'date-fns';

export default function ContactManagementPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    unreadCount: 0,
    statusBreakdown: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchContacts();
  }, [currentPage, filterStatus, filterCategory, searchTerm]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterCategory !== 'all' && { category: filterCategory }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setContacts(data.data);
        setStats(data.stats);
        setTotalPages(data.pagination.pages);
      } else {
        console.error('Failed to fetch contacts');
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewContact = async (contact) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/${contact._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedContact(data.data);
        setIsViewDialogOpen(true);
        // Refresh the list to update read status
        fetchContacts();
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  };

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchContacts();
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact({ ...selectedContact, status: newStatus });
        }
      }
    } catch (error) {
      console.error('Error updating contact status:', error);
    }
  };

  const handleAddAdminNotes = async (contactId, notes) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ adminNotes: notes })
      });

      if (response.ok) {
        fetchContacts();
        if (selectedContact && selectedContact._id === contactId) {
          setSelectedContact({ ...selectedContact, adminNotes: notes });
        }
      }
    } catch (error) {
      console.error('Error updating admin notes:', error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact submission?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/contact/${contactId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          fetchContacts();
          setIsViewDialogOpen(false);
        }
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      read: { color: 'bg-yellow-100 text-yellow-800', icon: Eye },
      replied: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      resolved: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
    };

    const config = statusConfig[status] || statusConfig.new;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getCategoryBadge = (category) => {
    const categoryColors = {
      general: 'bg-gray-100 text-gray-800',
      travel: 'bg-blue-100 text-blue-800',
      review: 'bg-green-100 text-green-800',
      partnership: 'bg-purple-100 text-purple-800',
      feedback: 'bg-orange-100 text-orange-800',
      technical: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={categoryColors[category] || categoryColors.general}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !searchTerm || 
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || contact.category === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Management</h1>
          <p className="text-muted-foreground">
            Manage and respond to customer inquiries
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unreadCount || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {contacts.filter(c => {
                const today = new Date();
                const contactDate = new Date(c.createdAt);
                return contactDate.toDateString() === today.toDateString();
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contacts.filter(c => c.status === 'resolved').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Submissions</CardTitle>
          <CardDescription>
            {filteredContacts.length} of {contacts.length} contacts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact._id} className={!contact.isRead ? 'bg-blue-50' : ''}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {!contact.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        {contact.name}
                      </div>
                    </TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell className="max-w-xs truncate">{contact.subject}</TableCell>
                    <TableCell>{getCategoryBadge(contact.category)}</TableCell>
                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                    <TableCell>{format(new Date(contact.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewContact(contact)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(contact._id)}
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

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <span className="flex items-center px-4">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      {/* View Contact Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
            <DialogDescription>
              View and manage contact submission
            </DialogDescription>
          </DialogHeader>
          
          {selectedContact && (
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Name</Label>
                  <p className="text-sm text-gray-600">{selectedContact.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-gray-600">{selectedContact.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="mt-1">{getCategoryBadge(selectedContact.category)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedContact.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date Submitted</Label>
                  <p className="text-sm text-gray-600">
                    {format(new Date(selectedContact.createdAt), 'PPpp')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <p className="text-sm text-gray-600">{selectedContact.ipAddress || 'N/A'}</p>
                </div>
              </div>

              {/* Subject */}
              <div>
                <Label className="text-sm font-medium">Subject</Label>
                <p className="text-sm text-gray-600 mt-1">{selectedContact.subject}</p>
              </div>

              {/* Message */}
              <div>
                <Label className="text-sm font-medium">Message</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
                </div>
              </div>

              {/* Status Update */}
              <div>
                <Label className="text-sm font-medium">Update Status</Label>
                <Select
                  value={selectedContact.status}
                  onValueChange={(value) => handleUpdateStatus(selectedContact._id, value)}
                >
                  <SelectTrigger className="w-[200px] mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Admin Notes */}
              <div>
                <Label className="text-sm font-medium">Admin Notes</Label>
                <Textarea
                  placeholder="Add internal notes..."
                  value={selectedContact.adminNotes || ''}
                  onChange={(e) => {
                    setSelectedContact({
                      ...selectedContact,
                      adminNotes: e.target.value
                    });
                  }}
                  className="mt-1"
                />
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => handleAddAdminNotes(selectedContact._id, selectedContact.adminNotes)}
                >
                  Save Notes
                </Button>
              </div>

              {/* Actions */}
              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteContact(selectedContact._id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Contact
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" asChild>
                    <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}>
                      <Mail className="mr-2 h-4 w-4" />
                      Reply via Email
                    </a>
                  </Button>
                  <Button onClick={() => setIsViewDialogOpen(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

