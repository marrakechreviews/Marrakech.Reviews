import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import QuillEditor from '../components/QuillEditor';

const TestQuillPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });

  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
  };

  const handleTitleChange = (e) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>QuillEditor Focus Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test-title">Title</Label>
            <Input
              id="test-title"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter article title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="test-content">Content</Label>
            <QuillEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Start typing to test focus behavior..."
            />
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Test Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click in the QuillEditor content area</li>
              <li>Start typing some text</li>
              <li>Verify that focus remains in the editor as you type</li>
              <li>Try using formatting buttons (bold, italic, etc.)</li>
              <li>Verify that focus returns to the editor after using toolbar buttons</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Current Values:</h3>
            <p><strong>Title:</strong> {formData.title}</p>
            <p><strong>Content Length:</strong> {formData.content.length} characters</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestQuillPage;

