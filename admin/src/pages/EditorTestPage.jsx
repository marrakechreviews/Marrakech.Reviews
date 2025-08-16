import React, { useState } from 'react';
import TinyMCEEditor from '../components/TinyMCEEditor';
import HtmlEditor from '../components/HtmlEditor';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Switch } from '../components/ui/switch';
import { FileText, Eye, Code, Save, Download } from 'lucide-react';

const EditorTestPage = () => {
  const [editorType, setEditorType] = useState('tinymce');
  const [content, setContent] = useState('<h2>Welcome to the Enhanced Article Editor!</h2><p>This is a demonstration of our new Shopify-like editor with both TinyMCE and HTML editing capabilities.</p><p>Key features:</p><ul><li>Rich text editing with TinyMCE</li><li>HTML source code editing</li><li>Pre-built content templates</li><li>Word and character count</li><li>Fullscreen editing mode</li></ul>');
  const [title, setTitle] = useState('Sample Article Title');
  const [category, setCategory] = useState('Technology');
  const [isPublished, setIsPublished] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleSave = () => {
    const articleData = {
      title,
      content,
      category,
      isPublished,
      createdAt: new Date().toISOString()
    };
    
    console.log('Article data to save:', articleData);
    alert('Article saved successfully! Check console for details.');
  };

  const handleExport = () => {
    const articleData = {
      title,
      content,
      category,
      isPublished,
      createdAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(articleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editor Test Page</h1>
          <p className="text-gray-600 mt-1">Test the new Shopify-like article editor functionality</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            {previewMode ? <Code className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {previewMode ? 'Edit Mode' : 'Preview Mode'}
          </Button>
          <Button
            variant="outline"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Article
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Editor Type</p>
                <p className="text-lg font-bold">{editorType === 'tinymce' ? 'TinyMCE' : 'HTML'}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Content Length</p>
                <p className="text-lg font-bold">{content.length} chars</p>
              </div>
              <Badge variant="outline">{content.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length} words</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <p className="text-lg font-bold">{isPublished ? 'Published' : 'Draft'}</p>
              </div>
              <Badge variant={isPublished ? 'default' : 'secondary'}>
                {isPublished ? 'Live' : 'Draft'}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Category</p>
                <p className="text-lg font-bold">{category}</p>
              </div>
              <Badge variant="outline">{category}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {previewMode ? (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Article Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <h1>{title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-6">
                <Badge variant="outline">{category}</Badge>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
                <span>•</span>
                <Badge variant={isPublished ? 'default' : 'secondary'}>
                  {isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Edit Mode */
        <div className="space-y-6">
          {/* Article Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Article Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="title">Article Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article title..."
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter category..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="published">Published</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editor Selection and Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Editor
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Label htmlFor="editor-type" className="text-sm">Editor Type:</Label>
                  <Select value={editorType} onValueChange={setEditorType}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tinymce">TinyMCE</SelectItem>
                      <SelectItem value="html">HTML Editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {editorType === 'tinymce' ? (
                <TinyMCEEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start writing your article content..."
                  height={500}
                  showWordCount={true}
                  showToolbar={true}
                />
              ) : (
                <HtmlEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Start writing your article content..."
                />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use the Enhanced Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">TinyMCE Editor Features:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Rich text formatting (bold, italic, underline)</li>
                <li>• Multiple heading levels and text styles</li>
                <li>• Lists, tables, and media insertion</li>
                <li>• Pre-built content templates</li>
                <li>• Fullscreen editing mode</li>
                <li>• Word and character count</li>
                <li>• Image upload and management</li>
                <li>• Link insertion and management</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">HTML Editor Features:</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Direct HTML source editing</li>
                <li>• Visual and code view toggle</li>
                <li>• Syntax highlighting</li>
                <li>• Quick HTML insertion tools</li>
                <li>• Template insertion</li>
                <li>• Real-time preview</li>
                <li>• Copy HTML functionality</li>
                <li>• Format HTML code</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditorTestPage;

