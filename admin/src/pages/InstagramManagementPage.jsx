import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogFooter,
} from '@/components/ui/dialog';
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
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import {
  Instagram,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Star,
  Heart,
  MessageCircle,
  ExternalLink,
  BarChart3,
  TrendingUp,
  Users,
  Play,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';

export default function InstagramManagementPage() {
  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    instagramId: '',
    instagramUrl: '',
    embedUrl: '',
    title: '',
    description: '',
    caption: '',
    thumbnailUrl: '',
    duration: '',
    category: 'travel',
    tags: '',
    location: {
      name: '',
      city: '',
      country: ''
    },
    publishedAt: '',
    isFeatured: false,
    displayOrder: 0,
    metaTitle: '',
    metaDescription: ''
  });

  const categories = [
    { value: 'travel', label: 'Travel' },
    { value: 'food', label: 'Food' },
    { value: 'culture', label: 'Culture' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'tips', label: 'Tips' },
    { value: 'reviews', label: 'Reviews' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchVideos();
    fetchStats();
  }, [currentPage, categoryFilter, statusFilter, searchTerm]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { active: statusFilter === 'active' }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/instagram?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setVideos(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/instagram/admin/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleInputChange = (field, value) => {
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
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      instagramId: '',
      instagramUrl: '',
      embedUrl: '',
      title: '',
      description: '',
      caption: '',
      thumbnailUrl: '',
      duration: '',
      category: 'travel',
      tags: '',
      location: {
        name: '',
        city: '',
        country: ''
      },
      publishedAt: '',
      isFeatured: false,
      displayOrder: 0,
      metaTitle: '',
      metaDescription: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      const submitData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        publishedAt: formData.publishedAt || new Date().toISOString()
      };

      const url = selectedVideo 
        ? `${import.meta.env.VITE_API_URL}/instagram/${selectedVideo._id}`
        : `${import.meta.env.VITE_API_URL}/instagram`;
      
      const method = selectedVideo ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      if (data.success) {
        fetchVideos();
        fetchStats();
        setIsAddDialogOpen(false);
        setIsEditDialogOpen(false);
        setSelectedVideo(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const handleEdit = (video) => {
    setSelectedVideo(video);
    setFormData({
      instagramId: video.instagramId,
      instagramUrl: video.instagramUrl,
      embedUrl: video.embedUrl,
      title: video.title,
      description: video.description || '',
      caption: video.caption || '',
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration?.toString() || '',
      category: video.category,
      tags: video.tags.join(', '),
      location: {
        name: video.location?.name || '',
        city: video.location?.city || '',
        country: video.location?.country || ''
      },
      publishedAt: video.publishedAt ? format(new Date(video.publishedAt), 'yyyy-MM-dd\'T\'HH:mm') : '',
      isFeatured: video.isFeatured,
      displayOrder: video.displayOrder,
      metaTitle: video.metaTitle || '',
      metaDescription: video.metaDescription || ''
    });
    setIsEditDialogOpen(true);
  };

  const toggleVideoStatus = async (videoId, field) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/instagram/${videoId}/toggle-${field}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchVideos();
        fetchStats();
      }
    } catch (error) {
      console.error(`Error toggling ${field}:`, error);
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/instagram/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchVideos();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  if (loading && videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Instagram Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage Instagram videos displayed on your website.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Instagram Video</DialogTitle>
              <DialogDescription>
                Add a new Instagram video to display on your website
              </DialogDescription>
            </DialogHeader>
            <InstagramVideoForm 
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              categories={categories}
              isEdit={false}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalStats[0]?.totalVideos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.totalStats[0]?.activeVideos || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber((stats.totalStats[0]?.totalLikes || 0) + (stats.totalStats[0]?.totalComments || 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Likes + Comments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatNumber(stats.totalStats[0]?.totalViews || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all videos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured Videos</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalStats[0]?.featuredVideos || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently featured
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Videos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Instagram Videos</CardTitle>
          <CardDescription>
            Manage your Instagram video collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Engagement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium line-clamp-2">{video.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {video.description}
                        </p>
                        {video.location?.name && (
                          <p className="text-xs text-muted-foreground">
                            📍 {video.location.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{video.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Heart className="h-3 w-3" />
                        <span>{formatNumber(video.likes)}</span>
                        <MessageCircle className="h-3 w-3" />
                        <span>{formatNumber(video.comments)}</span>
                      </div>
                      {video.views > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Eye className="h-3 w-3" />
                          <span>{formatNumber(video.views)} views</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={video.isActive}
                          onCheckedChange={() => toggleVideoStatus(video._id, 'active')}
                        />
                        <span className="text-sm">Active</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={video.isFeatured}
                          onCheckedChange={() => toggleVideoStatus(video._id, 'featured')}
                        />
                        <span className="text-sm">Featured</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(video.publishedAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={video.instagramUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      
                      <Button variant="outline" size="sm" onClick={() => handleEdit(video)}>
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Video</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this video? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteVideo(video._id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Instagram Video</DialogTitle>
            <DialogDescription>
              Update the Instagram video information
            </DialogDescription>
          </DialogHeader>
          <InstagramVideoForm 
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            categories={categories}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Instagram Video Form Component
const InstagramVideoForm = ({ formData, handleInputChange, handleSubmit, categories, isEdit }) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="instagramId">Instagram ID *</Label>
          <Input
            id="instagramId"
            value={formData.instagramId}
            onChange={(e) => handleInputChange('instagramId', e.target.value)}
            placeholder="e.g., C1234567890"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category *</Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter video title"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Enter video description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="instagramUrl">Instagram URL *</Label>
          <Input
            id="instagramUrl"
            value={formData.instagramUrl}
            onChange={(e) => handleInputChange('instagramUrl', e.target.value)}
            placeholder="https://www.instagram.com/p/..."
            required
          />
        </div>
        <div>
          <Label htmlFor="embedUrl">Embed URL *</Label>
          <Input
            id="embedUrl"
            value={formData.embedUrl}
            onChange={(e) => handleInputChange('embedUrl', e.target.value)}
            placeholder="https://www.instagram.com/p/.../embed"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="thumbnailUrl">Thumbnail URL *</Label>
        <Input
          id="thumbnailUrl"
          value={formData.thumbnailUrl}
          onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
          placeholder="https://..."
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) => handleInputChange('duration', e.target.value)}
            placeholder="30"
          />
        </div>
        <div>
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => handleInputChange('displayOrder', parseInt(e.target.value) || 0)}
            placeholder="0"
          />
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            checked={formData.isFeatured}
            onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
          />
          <Label>Featured</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={formData.tags}
          onChange={(e) => handleInputChange('tags', e.target.value)}
          placeholder="travel, marrakech, food"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="locationName">Location Name</Label>
          <Input
            id="locationName"
            value={formData.location.name}
            onChange={(e) => handleInputChange('location.name', e.target.value)}
            placeholder="Jemaa el-Fnaa"
          />
        </div>
        <div>
          <Label htmlFor="locationCity">City</Label>
          <Input
            id="locationCity"
            value={formData.location.city}
            onChange={(e) => handleInputChange('location.city', e.target.value)}
            placeholder="Marrakech"
          />
        </div>
        <div>
          <Label htmlFor="locationCountry">Country</Label>
          <Input
            id="locationCountry"
            value={formData.location.country}
            onChange={(e) => handleInputChange('location.country', e.target.value)}
            placeholder="Morocco"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="publishedAt">Published Date</Label>
        <Input
          id="publishedAt"
          type="datetime-local"
          value={formData.publishedAt}
          onChange={(e) => handleInputChange('publishedAt', e.target.value)}
        />
      </div>

      <DialogFooter>
        <Button type="submit">
          {isEdit ? 'Update Video' : 'Add Video'}
        </Button>
      </DialogFooter>
    </form>
  );
};

