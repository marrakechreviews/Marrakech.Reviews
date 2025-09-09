import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Star,
  MapPin,
  Clock,
  Users,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Settings,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { activitiesAPI } from '../lib/api';

export default function ActivitiesManagementPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [selectedActivityIds, setSelectedActivityIds] = useState([]);

  const [categories, setCategories] = useState([
    "Desert Tours",
    "City Tours",
    "Cultural Experiences",
    "Adventure Sports",
    "Food & Cooking",
    "Wellness & Spa",
    "Day Trips",
    "Multi-day Tours"
  ]);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        category: filterCategory === 'all' ? '' : filterCategory,
        isActive: 'all',
        limit: 1000,
      };
      if (filterStatus === 'active') params.isActive = true;
      if (filterStatus === 'inactive') params.isActive = false;
      if (filterStatus === 'featured') params.isFeatured = true;

      const response = await activitiesAPI.getActivities(params);
      setActivities(response.data.activities);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await activitiesAPI.getActivityCategories();
      setCategories(response.data.map(c => c._id));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchActivities();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterCategory, filterStatus]);

  const handleFileChange = (e) => {
    setCsvFile(e.target.files[0]);
  };

  const handleBulkImport = async () => {
    if (!csvFile) {
      toast.error('Please select a CSV file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', csvFile);

    try {
      await activitiesAPI.bulkImportActivities(formData);
      toast.success('Activities imported successfully!');
      fetchActivities();
      setCsvFile(null);
    } catch (error) {
      console.error("Failed to import activities:", error);
      toast.error("Failed to import activities. Please try again.");
    }
  };

  const handleExport = () => {
    activitiesAPI.exportActivities({ ids: selectedActivityIds })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'activities.csv');
        document.body.appendChild(link);
        link.click();
        toast.success('Activities exported successfully');
      })
      .catch(error => {
        toast.error('Failed to export activities');
      });
  };

  const handleToggleStatus = async (activityId, field) => {
    const activity = activities.find(a => a._id === activityId);
    if (!activity) return;

    const updatedActivityData = { ...activity, [field]: !activity[field] };

    try {
      await activitiesAPI.updateActivity(activityId, updatedActivityData);
      setActivities(prev => prev.map(a =>
        a._id === activityId ? updatedActivityData : a
      ));
    } catch (error) {
      console.error(`Failed to toggle ${field} status:`, error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activitiesAPI.deleteActivity(activityId);
        toast.success('Activity deleted successfully!');
        setActivities(prev => prev.filter(activity => activity._id !== activityId));
      } catch (error) {
        console.error("Failed to delete activity:", error);
        toast.error('Failed to delete activity. Please try again.');
      }
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedActivityIds(activities.map(a => a._id));
    } else {
      setSelectedActivityIds([]);
    }
  };

  const handleSelectOne = (checked, id) => {
    if (checked) {
      setSelectedActivityIds(prev => [...prev, id]);
    } else {
      setSelectedActivityIds(prev => prev.filter(activityId => activityId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedActivityIds.length} selected activities?`)) {
      try {
        await activitiesAPI.bulkDeleteActivities(selectedActivityIds);
        toast.success(`${selectedActivityIds.length} activities deleted successfully!`);
        setActivities(prev => prev.filter(activity => !selectedActivityIds.includes(activity._id)));
        setSelectedActivityIds([]);
      } catch (error) {
        console.error("Failed to bulk delete activities:", error);
        toast.error('Failed to delete selected activities. Please try again.');
      }
    }
  };

  const ActivityForm = ({ activity, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      activity
        ? {
            ...activity,
            images: activity.images ? activity.images.join(', ') : '',
          }
        : {
            name: '',
            category: '',
            location: '',
            duration: '',
            price: 0,
            marketPrice: 0,
            maxParticipants: 10,
            minParticipants: 1,
            difficulty: 'Easy',
            shortDescription: '',
            description: '',
            image: 'https://placehold.co/400x300.png?text=Activity+Image',
            images: '',
            isActive: true,
            isFeatured: false,
          }
    );

    const handleSubmit = async (e) => {
      e.preventDefault();
      const dataToSend = {
        ...formData,
        images: typeof formData.images === 'string'
          ? formData.images.split(',').map(url => url.trim()).filter(url => url)
          : formData.images,
      };

      try {
        if (activity) {
          await activitiesAPI.updateActivity(activity._id, dataToSend);
          toast.success("Activity updated successfully!");
        } else {
          await activitiesAPI.createActivity(dataToSend);
          toast.success("Activity created successfully!");
        }
        onSave();
      } catch (error) {
        console.error("Failed to save activity:", error);
        if (error.response && error.response.data && error.response.data.errors) {
          const errorMessages = Object.values(error.response.data.errors).map(err => err.message).join('\n');
          toast.error(errorMessages || "Please check the form for errors.");
        } else if (error.response && error.response.data && error.response.data.message) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Failed to save activity. Please try again.");
        }
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Activity Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="duration">Duration *</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 4 Hours, Full Day"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="price">Our Price ($) *</Label>
            <Input
              id="price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="marketPrice">Market Price ($) *</Label>
            <Input
              id="marketPrice"
              type="number"
              value={formData.marketPrice}
              onChange={(e) => setFormData(prev => ({ ...prev, marketPrice: parseFloat(e.target.value) || 0 }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="minParticipants">Min Participants *</Label>
            <Input
              id="minParticipants"
              type="number"
              value={formData.minParticipants}
              onChange={(e) => setFormData(prev => ({ ...prev, minParticipants: parseInt(e.target.value) || 1 }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="maxParticipants">Max Participants *</Label>
            <Input
              id="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) || 10 }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select 
              value={formData.difficulty} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Challenging">Challenging</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="shortDescription">Short Description *</Label>
          <Textarea
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => setFormData(prev => ({ ...prev, shortDescription: e.target.value }))}
            placeholder="Brief description for listings (max 300 characters)"
            maxLength={300}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="image">Main Image URL *</Label>
          <Input
            id="image"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
            placeholder="e.g., https://example.com/main-image.jpg"
            required
          />
        </div>

        <div>
          <Label htmlFor="images">Additional Images (comma-separated)</Label>
          <Textarea
            id="images"
            value={formData.images}
            onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
            placeholder="e.g., https://example.com/image1.jpg, https://example.com/image2.jpg"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="description">Full Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detailed description of the activity"
            rows={6}
            required
          />
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
            />
            <Label htmlFor="isFeatured">Featured</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {activity ? 'Update Activity' : 'Create Activity'}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activities Management</h1>
          <p className="text-gray-600">Manage your activities and tours</p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedActivityIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected ({selectedActivityIds.length})
            </Button>
          )}
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Activity
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Activities</p>
                <p className="text-2xl font-bold">{activities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ToggleRight className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold">
                  {activities.filter(a => a.isFeatured).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${activities.reduce((sum, a) => sum + (a.revenue || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Bulk Import */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bulk Import</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Input type="file" accept=".csv" onChange={handleFileChange} />
              <Button onClick={handleBulkImport} disabled={!csvFile}>
                <Plus className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" asChild>
                <a href="/samples/activities.csv" download>
                  Download Sample
                </a>
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export to CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activities ({activities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedActivityIds.length === activities.length && activities.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <div className="animate-pulse flex space-x-4">
                          <div className="rounded bg-gray-300 h-4 w-full"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No activities found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow key={activity._id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedActivityIds.includes(activity._id)}
                          onCheckedChange={(checked) => handleSelectOne(checked, activity._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          {activity.refId && (
                            <div className="text-xs text-gray-400">
                              {activity.refId}
                            </div>
                          )}
                          <div className="font-medium">{activity.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.duration}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{activity.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          {activity.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">${activity.price}</div>
                          {activity.marketPrice > activity.price && (
                            <div className="text-xs text-gray-500 line-through">
                              ${activity.marketPrice}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3" />
                          {activity.minParticipants}-{activity.maxParticipants}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="font-medium">{activity.rating}</span>
                          <span className="text-sm text-gray-500">
                            ({activity.numReviews})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleStatus(activity._id, 'isActive')}
                              className="flex items-center gap-1"
                            >
                              {activity.isActive ? (
                                <ToggleRight className="h-4 w-4 text-green-500" />
                              ) : (
                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                              )}
                              <span className="text-xs">
                                {activity.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </button>
                          </div>
                          {activity.isFeatured && (
                            <Badge variant="secondary" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{activity.totalReservations || 0} bookings</div>
                          <div className="text-green-600 font-medium">
                            ${activity.revenue || 0}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedActivity(activity);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteActivity(activity._id)}
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
        </CardContent>
      </Card>

      {/* Create Activity Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Activity</DialogTitle>
          </DialogHeader>
          <ActivityForm
            onSave={() => {
              setIsCreateDialogOpen(false);
              fetchActivities();
            }}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Activity Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Activity</DialogTitle>
          </DialogHeader>
          <ActivityForm
            activity={selectedActivity}
            onSave={() => {
              setIsEditDialogOpen(false);
              setSelectedActivity(null);
              fetchActivities();
            }}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedActivity(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

