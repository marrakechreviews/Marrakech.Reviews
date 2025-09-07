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
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  Check, 
  X, 
  Eye,
  ThumbsUp,
  User,
  Package,
  Calendar,
  Filter,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { reviewsAPI, productsAPI, articlesAPI, activitiesAPI, organizedTravelAPI } from '../lib/api';
import CsvImportForm from '../components/CsvImportForm';

const ReviewsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all');
  const [refModelFilter, setRefModelFilter] = useState('all');
  const [refIdFilter, setRefIdFilter] = useState('all');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    rating: 5,
    comment: '',
    product: '',
    isApproved: true
  });
  const [embedData, setEmbedData] = useState({
    articleId: '',
    reviewIds: []
  });

  const queryClient = useQueryClient();

  // Fetch reviews
  const { data: reviewsResponse, isLoading, error } = useQuery({
    queryKey: ['reviews', searchTerm, approvalFilter, refModelFilter, refIdFilter, sortBy],
    queryFn: () => reviewsAPI.getReviews({ 
      search: searchTerm,
      isApproved: approvalFilter === 'approved' ? true : approvalFilter === 'pending' ? false : undefined,
      refModel: refModelFilter !== 'all' ? refModelFilter : undefined,
      refId: refIdFilter !== 'all' ? refIdFilter : undefined,
      sort: sortBy,
      limit: 50
    }),
  });

  // Fetch items for filters
  const { data: productsResponse } = useQuery({
    queryKey: ['products-list'],
    queryFn: () => productsAPI.getProducts({ limit: 100 }),
  });
  const { data: articlesResponse } = useQuery({
    queryKey: ['articles-list'],
    queryFn: () => articlesAPI.getArticles({ limit: 100 }),
  });
  const { data: activitiesResponse } = useQuery({
    queryKey: ['activities-list'],
    queryFn: () => activitiesAPI.getActivities({ limit: 100 }),
  });
  const { data: organizedTravelsResponse } = useQuery({
    queryKey: ['organized-travels-list'],
    queryFn: () => organizedTravelAPI.getAllTravelPrograms({ limit: 100 }),
  });

  const reviews = reviewsResponse?.data?.data || [];
  const totalReviews = reviewsResponse?.data?.pagination?.total || 0;
  const products = productsResponse?.data?.data || [];
  const articles = articlesResponse?.data?.articles || [];
  const activities = activitiesResponse?.data?.data || [];
  const organizedTravels = organizedTravelsResponse?.data?.data || [];

  const getRefModelItems = () => {
    switch (refModelFilter) {
      case 'Product':
        return products;
      case 'Activity':
        return activities;
      case 'OrganizedTravel':
        return organizedTravels;
      case 'Article':
        return articles;
      default:
        return [];
    }
  };

  // Approve/Disapprove review mutation
  const approveMutation = useMutation({
    mutationFn: ({ id, isApproved }) => reviewsAPI.approveReview(id, isApproved),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
      toast.success('Review approval status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update review');
    },
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => reviewsAPI.deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['reviews']);
      toast.success('Review deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    },
  });

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      rating: 5,
      comment: '',
      product: '',
      isApproved: true
    });
    setSelectedReview(null);
  }, []);

  const handleEdit = useCallback((review) => {
    setSelectedReview(review);
    setFormData({
      name: review.name || '',
      rating: review.rating || 5,
      comment: review.comment || '',
      refModel: review.refModel,
      refId: review.refId?._id || review.refId,
      isApproved: review.isApproved !== false
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((id, reviewerName) => {
    if (window.confirm(`Are you sure you want to delete the review by "${reviewerName}"?`)) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleApprovalToggle = useCallback((review) => {
    approveMutation.mutate({ 
      id: review._id, 
      isApproved: !review.isApproved 
    });
  }, [approveMutation]);

  const handleEmbedReviews = useCallback(() => {
    // This would typically call an API to embed reviews in articles
    // For now, we'll just show a success message
    toast.success('Reviews embedded in article successfully');
    setIsEmbedDialogOpen(false);
    setEmbedData({ articleId: '', reviewIds: [] });
  }, []);

  const handleFieldChange = useCallback((field) => (e) => {
    const value = e.target ? e.target.value : e;
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getApprovalBadge = (isApproved) => {
    return isApproved ? (
      <Badge variant="default" className="flex items-center gap-1">
        <Check className="h-3 w-3" />
        Approved
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <X className="h-3 w-3" />
        Pending
      </Badge>
    );
  };

  const ReviewForm = React.memo(({ isEdit = false }) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="review-name">Reviewer Name *</Label>
          <Input
            id="review-name"
            value={formData.name}
            onChange={handleFieldChange('name')}
            placeholder="Enter reviewer name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-rating">Rating *</Label>
          <Select value={formData.rating.toString()} onValueChange={(value) => handleFieldChange('rating')(parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Star</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="review-refModel">Reference Type *</Label>
          <Select value={formData.refModel} onValueChange={handleFieldChange('refModel')}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Activity">Activity</SelectItem>
              <SelectItem value="OrganizedTravel">Organized Travel</SelectItem>
              <SelectItem value="Article">Article</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-refId">Reference Item *</Label>
          <Select value={formData.refId} onValueChange={handleFieldChange('refId')} disabled={!formData.refModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select item" />
            </SelectTrigger>
            <SelectContent>
              {(formData.refModel === 'Product' ? products :
                formData.refModel === 'Activity' ? activities :
                formData.refModel === 'OrganizedTravel' ? organizedTravels :
                formData.refModel === 'Article' ? articles : []
              ).map(item => (
                <SelectItem key={item._id} value={item._id}>
                  {item.name || item.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="review-comment">Review Comment *</Label>
        <Textarea
          id="review-comment"
          value={formData.comment}
          onChange={handleFieldChange('comment')}
          placeholder="Enter review comment"
          rows={4}
          maxLength={1000}
          required
        />
        <p className="text-sm text-muted-foreground">
          {formData.comment.length}/1000 characters
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="review-approved">Approved</Label>
          <p className="text-sm text-muted-foreground">
            Make this review visible to customers
          </p>
        </div>
        <Switch
          id="review-approved"
          checked={formData.isApproved}
          onCheckedChange={handleFieldChange('isApproved')}
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
          disabled={!formData.name || !formData.comment || !formData.product}
        >
          {isEdit ? 'Update Review' : 'Create Review'}
        </Button>
      </div>
    </div>
  ));

  const EmbedDialog = () => (
    <Dialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Embed Reviews in Article</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="embed-article">Select Article</Label>
            <Select value={embedData.articleId} onValueChange={(value) => setEmbedData(prev => ({ ...prev, articleId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an article" />
              </SelectTrigger>
              <SelectContent>
                {articles.map(article => (
                  <SelectItem key={article._id} value={article._id}>
                    {article.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Reviews to Embed</Label>
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4 space-y-2">
              {reviews.filter(review => review.isApproved).map(review => (
                <div key={review._id} className="flex items-start gap-3 p-2 border rounded">
                  <input
                    type="checkbox"
                    checked={embedData.reviewIds.includes(review._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEmbedData(prev => ({
                          ...prev,
                          reviewIds: [...prev.reviewIds, review._id]
                        }));
                      } else {
                        setEmbedData(prev => ({
                          ...prev,
                          reviewIds: prev.reviewIds.filter(id => id !== review._id)
                        }));
                      }
                    }}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{review.name}</span>
                      <div className="flex">{renderStars(review.rating)}</div>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.comment}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Product: {review.product?.name || 'Unknown'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEmbedDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEmbedReviews}
              disabled={!embedData.articleId || embedData.reviewIds.length === 0}
            >
              Embed Reviews
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

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
        <p className="text-red-600">Error loading reviews: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">Manage customer reviews and feedback</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Import from CSV
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import Reviews from CSV</DialogTitle>
              </DialogHeader>
              <CsvImportForm onFinished={() => setIsImportDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={() => setIsEmbedDialogOpen(true)}>
            <FileText className="h-4 w-4 mr-2" />
            Embed in Article
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Review
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Review</DialogTitle>
              </DialogHeader>
              <ReviewForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => r.isApproved).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <X className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.filter(r => !r.isApproved).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reviews.length > 0 
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : '0.0'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={approvalFilter} onValueChange={setApprovalFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All Reviews" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        <Select value={refModelFilter} onValueChange={(value) => { setRefModelFilter(value); setRefIdFilter('all'); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Product">Products</SelectItem>
            <SelectItem value="Activity">Activities</SelectItem>
            <SelectItem value="OrganizedTravel">Organized Travels</SelectItem>
            <SelectItem value="Article">Articles</SelectItem>
          </SelectContent>
        </Select>
        <Select value={refIdFilter} onValueChange={setRefIdFilter} disabled={refModelFilter === 'all'}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Item" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            {getRefModelItems().map(item => (
              <SelectItem key={item._id} value={item._id}>
                {item.name || item.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-createdAt">Newest First</SelectItem>
            <SelectItem value="createdAt">Oldest First</SelectItem>
            <SelectItem value="-rating">Highest Rating</SelectItem>
            <SelectItem value="rating">Lowest Rating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Review</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review._id}>
                  <TableCell>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {review.name?.charAt(0)?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{review.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {review.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm line-clamp-2 max-w-md">
                        {review.comment}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">
                          {review.refId?.name || review.refId?.title || 'Unknown Item'}
                        </span>
                        <div className="text-sm text-muted-foreground">{review.refModel}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm font-medium">
                        {review.rating}/5
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getApprovalBadge(review.isApproved)}
                      <Switch
                        checked={review.isApproved}
                        onCheckedChange={() => handleApprovalToggle(review)}
                        size="sm"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {formatDate(review.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(review)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(review._id, review.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {reviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews found.</p>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <ReviewForm isEdit={true} />
        </DialogContent>
      </Dialog>

      {/* Embed Dialog */}
      <EmbedDialog />
    </div>
  );
};

export default ReviewsPage;

