import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Users, Calendar, MapPin, DollarSign, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import api from '../lib/api';

const OrganizedTravelPage = () => {
  const [programs, setPrograms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [activeTab, setActiveTab] = useState('programs');
  const [csvFile, setCsvFile] = useState(null);

  const [programForm, setProgramForm] = useState({
    title: '',
    subtitle: '',
    destination: '',
    description: '',
    price: '',
    duration: '',
    maxGroupSize: '',
    difficulty: 'moderate',
    category: 'cultural',
    heroImage: '',
    isActive: true,
    featured: false,
    itinerary: [
      { day: 1, title: '', description: '', activities: [''] }
    ],
    included: [''],
    gallery: ['']
  });

  useEffect(() => {
    fetchPrograms();
    fetchReservations();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await api.get('/organized-travel/admin/programs');
      setPrograms(response.data);
    } catch (error) {
      console.error('Error fetching programs:', error);
      toast.error('Failed to fetch programs');
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await api.get('/organized-travel/admin/reservations');
      setReservations(response.data.reservations || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

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
      await api.post('/bulk/organized-travels', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Travel programs imported successfully!');
      fetchPrograms();
      setCsvFile(null);
    } catch (error) {
      console.error("Failed to import programs:", error);
      toast.error('Failed to import programs. Please check the console for details.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...programForm,
        price: parseFloat(programForm.price),
        maxGroupSize: parseInt(programForm.maxGroupSize),
        itinerary: programForm.itinerary.filter(item => item.title && item.description),
        included: programForm.included.filter(item => item.trim()),
        gallery: programForm.gallery.filter(item => item.trim())
      };

      if (editingProgram) {
        await api.put(`/organized-travel/admin/programs/${editingProgram._id}`, formData);
        toast.success('Program updated successfully');
      } else {
        await api.post('/organized-travel/admin/programs', formData);
        toast.success('Program created successfully');
      }

      setIsDialogOpen(false);
      resetForm();
      fetchPrograms();
    } catch (error) {
      console.error('Error saving program:', error);
      toast.error('Failed to save program');
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setProgramForm({
      ...program,
      price: program.price.toString(),
      maxGroupSize: program.maxGroupSize.toString(),
      itinerary: program.itinerary.length > 0 ? program.itinerary : [
        { day: 1, title: '', description: '', activities: [''] }
      ],
      included: program.included.length > 0 ? program.included : [''],
      gallery: program.gallery.length > 0 ? program.gallery : ['']
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await api.delete(`/organized-travel/admin/programs/${id}`);
        toast.success('Program deleted successfully');
        fetchPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
        toast.error('Failed to delete program');
      }
    }
  };

  const updateReservationStatus = async (id, status) => {
    try {
      await api.put(`/organized-travel/admin/reservations/${id}`, { status });
      toast.success('Reservation status updated');
      fetchReservations();
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Failed to update reservation status');
    }
  };

  const resetForm = () => {
    setProgramForm({
      title: '',
      subtitle: '',
      destination: '',
      description: '',
      price: '',
      duration: '',
      maxGroupSize: '',
      difficulty: 'moderate',
      category: 'cultural',
      heroImage: '',
      isActive: true,
      featured: false,
      itinerary: [
        { day: 1, title: '', description: '', activities: [''] }
      ],
      included: [''],
      gallery: ['']
    });
    setEditingProgram(null);
  };

  const addItineraryDay = () => {
    setProgramForm(prev => ({
      ...prev,
      itinerary: [...prev.itinerary, {
        day: prev.itinerary.length + 1,
        title: '',
        description: '',
        activities: ['']
      }]
    }));
  };

  const updateItineraryDay = (index, field, value) => {
    setProgramForm(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addActivity = (dayIndex) => {
    setProgramForm(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) =>
        i === dayIndex ? { ...item, activities: [...item.activities, ''] } : item
      )
    }));
  };

  const updateActivity = (dayIndex, activityIndex, value) => {
    setProgramForm(prev => ({
      ...prev,
      itinerary: prev.itinerary.map((item, i) =>
        i === dayIndex ? {
          ...item,
          activities: item.activities.map((activity, j) =>
            j === activityIndex ? value : activity
          )
        } : item
      )
    }));
  };

  const addIncluded = () => {
    setProgramForm(prev => ({
      ...prev,
      included: [...prev.included, '']
    }));
  };

  const updateIncluded = (index, value) => {
    setProgramForm(prev => ({
      ...prev,
      included: prev.included.map((item, i) => i === index ? value : item)
    }));
  };

  const addGalleryImage = () => {
    setProgramForm(prev => ({
      ...prev,
      gallery: [...prev.gallery, '']
    }));
  };

  const updateGalleryImage = (index, value) => {
    setProgramForm(prev => ({
      ...prev,
      gallery: prev.gallery.map((item, i) => i === index ? value : item)
    }));
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.destination.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || reservation.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organized Travel</h1>
          <p className="text-muted-foreground">Manage travel programs and reservations</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="programs">Travel Programs</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
        </TabsList>

        <TabsContent value="programs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Travel Programs</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProgram ? 'Edit Program' : 'Create New Program'}
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details for the travel program
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        value={programForm.title}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="destination">Destination *</Label>
                      <Input
                        id="destination"
                        value={programForm.destination}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, destination: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      value={programForm.subtitle}
                      onChange={(e) => setProgramForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={programForm.description}
                      onChange={(e) => setProgramForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($) *</Label>
                      <Input
                        id="price"
                        type="number"
                        value={programForm.price}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, price: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration *</Label>
                      <Input
                        id="duration"
                        value={programForm.duration}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="e.g., 3 days / 2 nights"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxGroupSize">Max Group Size *</Label>
                      <Input
                        id="maxGroupSize"
                        type="number"
                        value={programForm.maxGroupSize}
                        onChange={(e) => setProgramForm(prev => ({ ...prev, maxGroupSize: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={programForm.difficulty} onValueChange={(value) => setProgramForm(prev => ({ ...prev, difficulty: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="challenging">Challenging</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={programForm.category} onValueChange={(value) => setProgramForm(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cultural">Cultural</SelectItem>
                          <SelectItem value="adventure">Adventure</SelectItem>
                          <SelectItem value="relaxation">Relaxation</SelectItem>
                          <SelectItem value="culinary">Culinary</SelectItem>
                          <SelectItem value="historical">Historical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="heroImage">Hero Image URL</Label>
                    <Input
                      id="heroImage"
                      value={programForm.heroImage}
                      onChange={(e) => setProgramForm(prev => ({ ...prev, heroImage: e.target.value }))}
                      placeholder="/images/destinations/destination.png"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label>Itinerary</Label>
                    {programForm.itinerary.map((day, dayIndex) => (
                      <Card key={dayIndex}>
                        <CardContent className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Day {day.day} Title</Label>
                              <Input
                                value={day.title}
                                onChange={(e) => updateItineraryDay(dayIndex, 'title', e.target.value)}
                                placeholder="Day title"
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={day.description}
                              onChange={(e) => updateItineraryDay(dayIndex, 'description', e.target.value)}
                              placeholder="Day description"
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label>Activities</Label>
                            {day.activities.map((activity, activityIndex) => (
                              <Input
                                key={activityIndex}
                                value={activity}
                                onChange={(e) => updateActivity(dayIndex, activityIndex, e.target.value)}
                                placeholder="Activity"
                                className="mb-2"
                              />
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => addActivity(dayIndex)}>
                              Add Activity
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button type="button" variant="outline" onClick={addItineraryDay}>
                      Add Day
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>What's Included</Label>
                    {programForm.included.map((item, index) => (
                      <Input
                        key={index}
                        value={item}
                        onChange={(e) => updateIncluded(index, e.target.value)}
                        placeholder="Included service"
                      />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addIncluded}>
                      Add Included Item
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Gallery Images</Label>
                    {programForm.gallery.map((image, index) => (
                      <Input
                        key={index}
                        value={image}
                        onChange={(e) => updateGalleryImage(index, e.target.value)}
                        placeholder="Image URL"
                      />
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={addGalleryImage}>
                      Add Gallery Image
                    </Button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isActive"
                        checked={programForm.isActive}
                        onCheckedChange={(checked) => setProgramForm(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="isActive">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={programForm.featured}
                        onCheckedChange={(checked) => setProgramForm(prev => ({ ...prev, featured: checked }))}
                      />
                      <Label htmlFor="featured">Featured</Label>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProgram ? 'Update' : 'Create'} Program
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

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
                  <a href="/samples/organized-travels.csv" download>
                    Download Sample
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            {programs.map((program) => (
              <Card key={program._id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {program.refId && (
                          <span className="flex items-center gap-1">
                            <Link className="h-4 w-4" />
                            {program.refId}
                          </span>
                        )}
                        <h3 className="text-xl font-semibold">{program.title}</h3>
                        <Badge variant={program.isActive ? 'default' : 'secondary'}>
                          {program.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {program.featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                      <p className="text-muted-foreground mb-2">{program.subtitle}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {program.destination}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${program.price}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {program.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Max {program.maxGroupSize}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(program)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(program._id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Reservations</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reservations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Travelers</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReservations.map((reservation) => (
                  <TableRow key={reservation._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {reservation.firstName} {reservation.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {reservation.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{reservation.destination}</TableCell>
                    <TableCell>
                      {new Date(reservation.preferredDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{reservation.numberOfTravelers}</TableCell>
                    <TableCell>${reservation.totalPrice}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(reservation.status)}>
                        {reservation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={reservation.status}
                        onValueChange={(value) => updateReservationStatus(reservation._id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizedTravelPage;
