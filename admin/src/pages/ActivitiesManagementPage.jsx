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
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { activitiesAPI } from '@/lib/api';

export default function ActivitiesManagementPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
        category: filterCategory === 'all' ? '' : filterCategory,
        isActive: filterStatus === 'all' ? 'all' : filterStatus === 'active',
        isFeatured: filterStatus === 'featured' ? true : undefined,
      };
      const response = await activitiesAPI.getActivities(params);
      setActivities(response.data.activities);
    } catch (error) {
      toast.error('Failed to fetch activities.');
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await activitiesAPI.getActivityCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories.');
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [searchTerm, filterCategory, filterStatus]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredActivities = activities;

  const handleToggleStatus = async (activity, field) => {
    try {
      await activitiesAPI.updateActivity(activity._id, {
        ...activity,
        [field]: !activity[field],
      });
      toast.success(`Activity ${field} status updated.`);
      fetchActivities();
    } catch (error) {
      toast.error(`Failed to update activity ${field} status.`);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity? This is a soft delete.')) {
      try {
        await activitiesAPI.deleteActivity(activityId);
        toast.success('Activity deleted successfully.');
        fetchActivities();
      } catch (error) {
        toast.error('Failed to delete activity.');
      }
    }
  };

  const ActivityForm = ({ activity, categories, onSave, onCancel }) => {
    const [formData, setFormData] = useState(activity || {
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
      images: [],
      tags: [],
      isActive: true,
      isFeatured: false
    });

    const handleFormChange = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Activity Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleFormChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category._id} value={category._id}>
                    {category._id}
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
              onChange={(e) => handleFormChange('location', e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="duration">Duration *</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => handleFormChange('duration', e.target.value)}
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
              onChange={(e) => handleFormChange('price', e.target.valueAsNumber)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="marketPrice">Market Price ($) *</Label>
            <Input
              id="marketPrice"
              type="number"
              value={formData.marketPrice}
              onChange={(e) => handleFormChange('marketPrice', e.target.valueAsNumber)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="minParticipants">Min Participants *</Label>
            <Input
              id="minParticipants"
              type="number"
              value={formData.minParticipants}
              onChange={(e) => handleFormChange('minParticipants', e.target.valueAsNumber)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="maxParticipants">Max Participants *</Label>
            <Input
              id="maxParticipants"
              type="number"
              value={formData.maxParticipants}
              onChange={(e) => handleFormChange('maxParticipants', e.target.valueAsNumber)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select 
              value={formData.difficulty} 
              onValueChange={(value) => handleFormChange('difficulty', value)}
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
            onChange={(e) => handleFormChange('shortDescription', e.target.value)}
            placeholder="Brief description for listings (max 300 characters)"
            maxLength={300}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="description">Full Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
            placeholder="Detailed description of the activity"
            rows={6}
            required
          />
        </div>

        <div>
          <Label htmlFor="images">Images (comma-separated URLs)</Label>
          <Input
            id="images"
            value={formData.images.join(',')}
            onChange={(e) => handleFormChange('images', e.target.value.split(','))}
          />
        </div>

        <div>
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={formData.tags.join(',')}
            onChange={(e) => handleFormChange('tags', e.target.value.split(','))}
          />
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleFormChange('isActive', checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => handleFormChange('isFeatured', checked)}
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
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
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
                  <SelectItem key={category._id} value={category._id}>
                    {category._id} ({category.count})
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

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activities ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }, (_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={8}>
                        <div className="animate-pulse flex space-x-4">
                          <div className="rounded bg-gray-300 h-4 w-full"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-gray-500">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No activities found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredActivities.map((activity) => (
                    <TableRow key={activity._id}>
                      <TableCell>
                        <div>
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
                              onClick={() => handleToggleStatus(activity, 'isActive')}
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
                          <button
                            onClick={() => handleToggleStatus(activity, 'isFeatured')}
                            className="flex items-center gap-1"
                          >
                            {activity.isFeatured ? (
                                <Star className="h-4 w-4 text-yellow-500" />
                            ) : (
                                <Star className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-xs">
                              {activity.isFeatured ? 'Featured' : 'Not Featured'}
                            </span>
                          </button>
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
            categories={categories}
            onSave={async (formData) => {
              try {
                await activitiesAPI.createActivity(formData);
                toast.success('Activity created successfully.');
                fetchActivities();
                setIsCreateDialogOpen(false);
              } catch (error) {
                toast.error('Failed to create activity.');
              }
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
            categories={categories}
            onSave={async (formData) => {
              try {
                await activitiesAPI.updateActivity(selectedActivity._id, formData);
                toast.success('Activity updated successfully.');
                fetchActivities();
                setIsEditDialogOpen(false);
                setSelectedActivity(null);
              } catch (error) {
                toast.error('Failed to update activity.');
              }
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

