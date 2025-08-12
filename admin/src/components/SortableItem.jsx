import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from './ui/alert-dialog';
import { GripVertical, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';

const SortableItem = ({ section, getSectionTypeLabel, handleToggleSection, openEditDialog, handleDeleteSection }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'shadow-lg opacity-50' : ''}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div {...attributes} {...listeners}>
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
  );
};

export default SortableItem;

