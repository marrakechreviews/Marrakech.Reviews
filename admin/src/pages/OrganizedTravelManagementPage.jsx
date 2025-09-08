import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Globe,
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
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { organizedTravelAPI, uploadAPI } from '../lib/api';

const ImageUploader = ({ value, onChange, onUpload, isUploading }) => {
  const triggerFileInput = () => {
    document.getElementById('image-upload').click();
  };

  return (
    <div>
      <Label>Hero Image</Label>
      <div className="mt-2 flex items-center gap-4">
        {value && <img src={value} alt="Hero" className="w-20 h-20 object-cover rounded" />}
        <Input
          id="image-upload"
          type="file"
          className="hidden"
          onChange={onUpload}
          accept="image/*"
        />
        <Button type="button" variant="outline" onClick={triggerFileInput} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Image'}
        </Button>
        <Input
          type="text"
          placeholder="Or paste image URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
        />
      </div>
    </div>
  );
};

const GalleryUploader = ({ gallery, onGalleryChange, onUpload, isUploading }) => {
  const triggerFileInput = () => {
    document.getElementById('gallery-upload').click();
  };

  const handleRemoveImage = (index) => {
    const newGallery = [...gallery];
    newGallery.splice(index, 1);
    onGalleryChange(newGallery);
  };

  return (
    <div>
      <Label>Image Gallery</Label>
      <div className="mt-2 p-4 border rounded-lg">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">
          {gallery.map((url, index) => (
            <div key={index} className="relative group">
              <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-24 object-cover rounded" />
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <Input
          id="gallery-upload"
          type="file"
          multiple
          className="hidden"
          onChange={onUpload}
          accept="image/*"
        />
        <Button type="button" variant="outline" onClick={triggerFileInput} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Images'}
        </Button>
      </div>
    </div>
  );
};

export default function OrganizedTravelManagementPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [stats, setStats] = useState(null);
  const [csvFile, setCsvFile] = useState(null);

  useEffect(() => {
    fetchPrograms();
    fetchStats();
  }, [searchTerm, filterStatus]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchTerm,
      };
      if (filterStatus === 'active') params.isActive = true;
      if (filterStatus === 'inactive') params.isActive = false;

      const response = await organizedTravelAPI.getPrograms(params);
      setPrograms(response.data);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
      toast.error("Failed to fetch travel programs.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await organizedTravelAPI.getTravelStats();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to fetch travel stats:", error);
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
      await organizedTravelAPI.bulkImportPrograms(formData);
      toast.success('Travel programs imported successfully!');
      fetchPrograms();
      setCsvFile(null);
    } catch (error) {
      console.error("Failed to import travel programs:", error);
      toast.error("Failed to import travel programs. Please try again.");
    }
  };

  const handleToggleStatus = async (programId, field) => {
    const program = programs.find(p => p._id === programId);
    if (!program) return;

    const updatedProgramData = { ...program, [field]: !program[field] };

    try {
      await organizedTravelAPI.updateProgram(programId, updatedProgramData);
      setPrograms(prev => prev.map(p =>
        p._id === programId ? updatedProgramData : p
      ));
      toast.success(`Program ${field} status updated.`);
    } catch (error) {
      console.error(`Failed to toggle ${field} status:`, error);
      toast.error(`Failed to update program status.`);
    }
  };

  const handleDeleteProgram = async (programId) => {
    if (window.confirm('Are you sure you want to delete this travel program?')) {
      try {
        await organizedTravelAPI.deleteProgram(programId);
        setPrograms(prev => prev.filter(p => p._id !== programId));
        toast.success("Travel program deleted.");
      } catch (error) {
        console.error("Failed to delete program:", error);
        toast.error("Failed to delete travel program.");
      }
    }
  };

  const openCreateForm = () => {
    setSelectedProgram(null);
    setIsFormOpen(true);
  };

  const openEditForm = (program) => {
    setSelectedProgram(program);
    setIsFormOpen(true);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedPrograms(programs.map((p) => p._id));
    } else {
      setSelectedPrograms([]);
    }
  };

  const handleSelectOne = (checked, id) => {
    if (checked) {
      setSelectedPrograms((prev) => [...prev, id]);
    } else {
      setSelectedPrograms((prev) => prev.filter((programId) => programId !== id));
    }
  };

  const handleExport = () => {
    organizedTravelAPI.exportOrganizedTravels({ ids: selectedPrograms })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'organized-travels.csv');
        document.body.appendChild(link);
        link.click();
        toast.success('Organized travels exported successfully');
      })
      .catch(error => {
        toast.error('Failed to export organized travels');
      });
  };

  const ProgramForm = ({ program, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
      program
        ? { ...program, included: program.included.join(', '), gallery: Array.isArray(program.gallery) ? program.gallery : [] }
        : {
            title: '',
            subtitle: '',
            destination: '',
            duration: '',
            price: 0,
            maxGroupSize: 10,
            description: '',
            heroImage: '',
            included: '',
            gallery: [],
            isActive: true,
          }
    );
    const [isUploading, setIsUploading] = useState(false);

    const handleHeroImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const response = await uploadAPI.uploadImage(file);
        setFormData(prev => ({ ...prev, heroImage: response.data.data.url }));
        toast.success("Hero image uploaded successfully.");
      } catch (error) {
        toast.error("Failed to upload hero image.");
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    };

    const handleGalleryUpload = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length === 0) return;

      setIsUploading(true);
      try {
        const response = await uploadAPI.uploadImages(files);
        const newImageUrls = response.data.data.map(file => file.url);
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, ...newImageUrls] }));
        toast.success(`${files.length} image(s) uploaded to gallery.`);
      } catch (error) {
        toast.error("Failed to upload gallery images.");
        console.error("Gallery upload error:", error);
      } finally {
        setIsUploading(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const dataToSend = {
        ...formData,
        included: typeof formData.included === 'string'
          ? formData.included.split(',').map(item => item.trim()).filter(item => item)
          : formData.included,
      };

      try {
        if (program) {
          await organizedTravelAPI.updateProgram(program._id, dataToSend);
          toast.success("Program updated successfully!");
        } else {
          await organizedTravelAPI.createProgram(dataToSend);
          toast.success("Program created successfully!");
        }
        onSave();
      } catch (error) {
        console.error("Failed to save program:", error);
        toast.error("Failed to save program. Check console for details.");
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" value={formData.subtitle} onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="destination">Destination *</Label>
            <Input id="destination" value={formData.destination} onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value }))} required />
          </div>
          <div>
            <Label htmlFor="duration">Duration *</Label>
            <Input id="duration" value={formData.duration} onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))} placeholder="e.g., 7 Days / 6 Nights" required />
          </div>
          <div>
            <Label htmlFor="price">Price ($) *</Label>
            <Input id="price" type="number" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} required />
          </div>
          <div>
            <Label htmlFor="maxGroupSize">Max Group Size *</Label>
            <Input id="maxGroupSize" type="number" value={formData.maxGroupSize} onChange={(e) => setFormData(prev => ({ ...prev, maxGroupSize: parseInt(e.target.value) || 1 }))} required />
          </div>
          <div className="md:col-span-2">
            <ImageUploader
              value={formData.heroImage}
              onChange={(value) => setFormData(prev => ({ ...prev, heroImage: value }))}
              onUpload={handleHeroImageUpload}
              isUploading={isUploading}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={5} required />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="included">What's Included (comma-separated)</Label>
            <Textarea id="included" value={formData.included} onChange={(e) => setFormData(prev => ({ ...prev, included: e.target.value }))} rows={3} />
          </div>
          <div className="md:col-span-2">
            <GalleryUploader
              gallery={formData.gallery}
              onGalleryChange={(newGallery) => setFormData(prev => ({ ...prev, gallery: newGallery }))}
              onUpload={handleGalleryUpload}
              isUploading={isUploading}
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))} />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit">{program ? 'Update Program' : 'Create Program'}</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organized Travel Management</h1>
          <p className="text-gray-600">Manage your travel programs</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={openCreateForm}>
            <Plus className="h-4 w-4 mr-2" />
            Add Program
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Programs</p>
                <p className="text-2xl font-bold">{stats?.totalPrograms || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.activePrograms || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.featuredPrograms || 0}</p>
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
                <p className="text-sm font-medium text-gray-600">Average Price</p>
                <p className="text-2xl font-bold">${stats?.averagePrice?.toFixed(2) || 0}</p>
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
                    placeholder="Search by title or destination..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
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
                <a href="/samples/organized-travels.csv" download>
                  Download Sample
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Travel Programs ({programs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedPrograms.length === programs.length && programs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7}>Loading...</TableCell></TableRow>
              ) : programs.map((program) => (
                <TableRow key={program._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedPrograms.includes(program._id)}
                      onCheckedChange={(checked) => handleSelectOne(checked, program._id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{program.title}</TableCell>
                  <TableCell>{program.destination}</TableCell>
                  <TableCell>{program.duration}</TableCell>
                  <TableCell>${program.price}</TableCell>
                  <TableCell>
                    <Badge variant={program.isActive ? 'default' : 'secondary'}>
                      {program.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditForm(program)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteProgram(program._id)}>
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

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedProgram ? 'Edit Program' : 'Create New Program'}</DialogTitle>
          </DialogHeader>
          <ProgramForm
            program={selectedProgram}
            onSave={() => {
              setIsFormOpen(false);
              fetchPrograms();
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
