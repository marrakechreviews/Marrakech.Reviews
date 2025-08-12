import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
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
} from '../components/ui/alert-dialog';
import { Switch } from '../components/ui/switch';
import {
  DragDropContext,
  Droppable,
  Draggable
} from 'react-beautiful-dnd';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Settings,
  Layout,
  Palette,
  Type,
  Save,
  X
} from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import api from '../lib/api';

const HomepageSectionsManagementPage = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    type: 'features',
    content: {},
    styling: {
      backgroundColor: 'bg-white',
      textColor: 'text-gray-900',
      padding: 'py-16'
    }
  });
  const { toast } = useToast();

  const sectionTypes = [
    { value: 'hero', label: 'Hero Section' },
    { value: 'reviews', label: 'Reviews' },
    { value: 'hosting', label: 'Hosting' },
    { value: 'activities', label: 'Activities' },
    { value: 'stats', label: 'Statistics' },
    { value: 'flights', label: 'Flight Reservations' },
    { value: 'categories', label: 'Categories' },
    { value: 'recommended_places', label: 'Recommended Places' },
    { value: 'features', label: 'Features' },
    { value: 'cta', label: 'Call to Action' }
  ];

  const backgroundColors = [
    { value: 'bg-white', label: 'White' },
    { value: 'bg-gray-50', label: 'Light Gray' },
    { value: 'bg-gray-100', label: 'Gray' },
    { value: 'bg-muted/30', label: 'Muted' },
    { value: 'bg-gradient-to-r from-red-500 to-orange-500', label: 'Red to Orange Gradient' },
    { value: 'bg-blue-50', label: 'Light Blue' },
    { value: 'bg-green-50', label: 'Light Green' }
  ];

  const textColors = [
    { value: 'text-gray-900', label: 'Dark Gray' },
    { value: 'text-white', label: 'White' },
    { value: 'text-foreground', label: 'Foreground' },
    { value: 'text-blue-600', label: 'Blue' },
    { value: 'text-red-600', label: 'Red' }
  ];

  const paddingOptions = [
    { value: 'py-0', label: 'No Padding' },
    { value: 'py-8', label: 'Small (2rem)' },
    { value: 'py-16', label: 'Medium (4rem)' },
    { value: 'py-24', label: 'Large (6rem)' },
    { value: 'py-32', label: 'Extra Large (8rem)' }
  ];

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const response = await api.get('/homepage-sections');
      setSections(response.data.data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch homepage sections',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultSections = async () => {
    try {
      await api.post('/homepage-sections/initialize');
      toast({
        title: 'Success',
        description: 'Default sections initialized successfully',
      });
      fetchSections();
    } catch (error) {
      console.error('Error initializing sections:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize default sections',
        variant: 'destructive',
      });
    }
  };

  const handleCreateSection = async () => {
    try {
      await api.post('/homepage-sections', formData);
      toast({
        title: 'Success',
        description: 'Section created successfully',
      });
      setIsCreateDialogOpen(false);
      resetForm();
      fetchSections();
    } catch (error) {
      console.error('Error creating section:', error);
      toast({
        title: 'Error',
        description: 'Failed to create section',
        variant: 'destructive',
      });
    }
  };

  const handleEditSection = async () => {
    try {
      await api.put(`/homepage-sections/${editingSection._id}`, formData);
      toast({
        title: 'Success',
        description: 'Section updated successfully',
      });
      setIsEditDialogOpen(false);
      setEditingSection(null);
      resetForm();
      fetchSections();
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: 'Error',
        description: 'Failed to update section',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      await api.delete(`/homepage-sections/${sectionId}`);
      toast({
        title: 'Success',
        description: 'Section deleted successfully',
      });
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete section',
        variant: 'destructive',
      });
    }
  };

  const handleToggleSection = async (sectionId) => {
    try {
      await api.patch(`/homepage-sections/${sectionId}/toggle`);
      toast({
        title: 'Success',
        description: 'Section status updated successfully',
      });
      fetchSections();
    } catch (error) {
      console.error('Error toggling section:', error);
      toast({
        title: 'Error',
        description: 'Failed to update section status',
        variant: 'destructive',
      });
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSections(items);

    try {
      const sectionIds = items.map(item => item._id);
      await api.put('/homepage-sections/reorder', { sectionIds });
      toast({
        title: 'Success',
        description: 'Sections reordered successfully',
      });
    } catch (error) {
      console.error('Error reordering sections:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder sections',
        variant: 'destructive',
      });
      fetchSections(); // Revert on error
    }
  };

  const openEditDialog = (section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      title: section.title,
      description: section.description || '',
      type: section.type,
      content: section.content || {},
      styling: section.styling || {
        backgroundColor: 'bg-white',
        textColor: 'text-gray-900',
        padding: 'py-16'
      }
    });
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      type: 'features',
      content: {},
      styling: {
        backgroundColor: 'bg-white',
        textColor: 'text-gray-900',
        padding: 'py-16'
      }
    });
  };

  const getSectionTypeLabel = (type) => {
    const sectionType = sectionTypes.find(t => t.value === type);
    return sectionType ? sectionType.label : type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Homepage Sections Management</h1>
          <p className="text-muted-foreground">
            Manage the sections displayed on your homepage
          </p>
        </div>
        <div className="flex gap-2">
          {sections.length === 0 && (
            <Button onClick={initializeDefaultSections} variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Initialize Default Sections
            </Button>
          )}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Section
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Section</DialogTitle>
                <DialogDescription>
                  Add a new section to your homepage
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Section name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {sectionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Section title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Section description"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <Select 
                      value={formData.styling.backgroundColor} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        styling: { ...formData.styling, backgroundColor: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {backgroundColors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            {color.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <Select 
                      value={formData.styling.textColor} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        styling: { ...formData.styling, textColor: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {textColors.map((color) => (
                          <SelectItem key={color.value} value={color.value}>
                            {color.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Padding</Label>
                    <Select 
                      value={formData.styling.padding} 
                      onValueChange={(value) => setFormData({ 
                        ...formData, 
                        styling: { ...formData.styling, padding: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paddingOptions.map((padding) => (
                          <SelectItem key={padding.value} value={padding.value}>
                            {padding.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSection}>
                  <Save className="mr-2 h-4 w-4" />
                  Create Section
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layout className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sections found</h3>
            <p className="text-muted-foreground text-center mb-4">
              Get started by initializing default sections or creating a new one
            </p>
            <Button onClick={initializeDefaultSections}>
              <Settings className="mr-2 h-4 w-4" />
              Initialize Default Sections
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {sections.map((section, index) => (
                  <Draggable key={section._id} draggableId={section._id} index={index}>
                    {(provided, snapshot) => (
                      <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`${snapshot.isDragging ? 'shadow-lg' : ''}`}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                              </div>
                              <div>
                                <CardTitle className="flex items-center gap-2">
                                  {section.title}
                                  <Badge variant={section.isEnabled ? 'default' : 'secondary'}>
                                    {getSectionTypeLabel(section.type)}
                                  </Badge>
                                  {!section.isEnabled && (
                                    <Badge variant="outline">Disabled</Badge>
                                  )}
                                </CardTitle>
                                <CardDescription>
                                  {section.description || 'No description'}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleSection(section._id)}
                              >
                                {section.isEnabled ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(section)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Section</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{section.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteSection(section._id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Background:</span>
                              <div className="mt-1">
                                <Badge variant="outline">{section.styling?.backgroundColor || 'bg-white'}</Badge>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Text Color:</span>
                              <div className="mt-1">
                                <Badge variant="outline">{section.styling?.textColor || 'text-gray-900'}</Badge>
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Padding:</span>
                              <div className="mt-1">
                                <Badge variant="outline">{section.styling?.padding || 'py-16'}</Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Section</DialogTitle>
            <DialogDescription>
              Update the section details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Section name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Section title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Section description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Background Color</Label>
                <Select 
                  value={formData.styling.backgroundColor} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    styling: { ...formData.styling, backgroundColor: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <Select 
                  value={formData.styling.textColor} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    styling: { ...formData.styling, textColor: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {textColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Padding</Label>
                <Select 
                  value={formData.styling.padding} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    styling: { ...formData.styling, padding: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {paddingOptions.map((padding) => (
                      <SelectItem key={padding.value} value={padding.value}>
                        {padding.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSection}>
              <Save className="mr-2 h-4 w-4" />
              Update Section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomepageSectionsManagementPage;

