import React, { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Eye, Code, Type, Image, Link, Bold, Italic, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

const HtmlEditor = ({ value = '', onChange, placeholder = 'Start writing your article...' }) => {
  const editorRef = useRef(null);
  const [activeTab, setActiveTab] = useState('visual');
  const [htmlContent, setHtmlContent] = useState(value);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setHtmlContent(value);
    updateCounts(value);
  }, [value]);

  const updateCounts = (content) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    setWordCount(textContent.trim().split(/\s+/).filter(word => word.length > 0).length);
    setCharCount(textContent.length);
  };

  const handleContentChange = (newContent) => {
    setHtmlContent(newContent);
    updateCounts(newContent);
    onChange(newContent);
  };

  const insertHtml = (htmlTag) => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    let htmlToInsert = '';
    switch (htmlTag) {
      case 'bold':
        htmlToInsert = `<strong>${selectedText || 'Bold text'}</strong>`;
        break;
      case 'italic':
        htmlToInsert = `<em>${selectedText || 'Italic text'}</em>`;
        break;
      case 'h1':
        htmlToInsert = `<h1>${selectedText || 'Heading 1'}</h1>`;
        break;
      case 'h2':
        htmlToInsert = `<h2>${selectedText || 'Heading 2'}</h2>`;
        break;
      case 'h3':
        htmlToInsert = `<h3>${selectedText || 'Heading 3'}</h3>`;
        break;
      case 'p':
        htmlToInsert = `<p>${selectedText || 'Paragraph text'}</p>`;
        break;
      case 'ul':
        htmlToInsert = `<ul><li>${selectedText || 'List item'}</li></ul>`;
        break;
      case 'ol':
        htmlToInsert = `<ol><li>${selectedText || 'List item'}</li></ol>`;
        break;
      case 'blockquote':
        htmlToInsert = `<blockquote>${selectedText || 'Quote text'}</blockquote>`;
        break;
      case 'code':
        htmlToInsert = `<code>${selectedText || 'Code snippet'}</code>`;
        break;
      case 'pre':
        htmlToInsert = `<pre><code>${selectedText || 'Code block'}</code></pre>`;
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          htmlToInsert = `<a href="${url}" target="_blank">${selectedText || 'Link text'}</a>`;
        }
        break;
      case 'image':
        const imgUrl = prompt('Enter image URL:');
        const altText = prompt('Enter alt text:');
        if (imgUrl) {
          htmlToInsert = `<img src="${imgUrl}" alt="${altText || 'Image'}" style="max-width: 100%; height: auto;" />`;
        }
        break;
      case 'br':
        htmlToInsert = '<br>';
        break;
      case 'hr':
        htmlToInsert = '<hr>';
        break;
      default:
        return;
    }

    if (htmlToInsert) {
      range.deleteContents();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlToInsert;
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      range.insertNode(fragment);
      
      // Update content
      const newContent = editor.innerHTML;
      handleContentChange(newContent);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    const newContent = editorRef.current.innerHTML;
    handleContentChange(newContent);
  };

  const ToolbarButton = ({ onClick, icon: Icon, title, isActive = false }) => (
    <Button
      type="button"
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Content Editor</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Badge variant="outline">{wordCount} words</Badge>
            <Badge variant="outline">{charCount} characters</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visual Editor
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              HTML Source
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4">
            {/* Toolbar */}
            <div className="border rounded-lg p-2">
              <div className="flex flex-wrap gap-1">
                {/* Text Formatting */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                  <ToolbarButton
                    onClick={() => formatText('bold')}
                    icon={Bold}
                    title="Bold"
                  />
                  <ToolbarButton
                    onClick={() => formatText('italic')}
                    icon={Italic}
                    title="Italic"
                  />
                </div>

                {/* Headings */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtml('h1')}
                    className="h-8 px-2 text-xs"
                  >
                    H1
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtml('h2')}
                    className="h-8 px-2 text-xs"
                  >
                    H2
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtml('h3')}
                    className="h-8 px-2 text-xs"
                  >
                    H3
                  </Button>
                </div>

                {/* Lists */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                  <ToolbarButton
                    onClick={() => insertHtml('ul')}
                    icon={List}
                    title="Bullet List"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => insertHtml('ol')}
                    className="h-8 px-2 text-xs"
                    title="Numbered List"
                  >
                    1.
                  </Button>
                </div>

                {/* Alignment */}
                <div className="flex gap-1 border-r pr-2 mr-2">
                  <ToolbarButton
                    onClick={() => formatText('justifyLeft')}
                    icon={AlignLeft}
                    title="Align Left"
                  />
                  <ToolbarButton
                    onClick={() => formatText('justifyCenter')}
                    icon={AlignCenter}
                    title="Align Center"
                  />
                  <ToolbarButton
                    onClick={() => formatText('justifyRight')}
                    icon={AlignRight}
                    title="Align Right"
                  />
                </div>

                {/* Media & Links */}
                <div className="flex gap-1">
                  <ToolbarButton
                    onClick={() => insertHtml('link')}
                    icon={Link}
                    title="Insert Link"
                  />
                  <ToolbarButton
                    onClick={() => insertHtml('image')}
                    icon={Image}
                    title="Insert Image"
                  />
                </div>
              </div>

              {/* Second Row */}
              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertHtml('p')}
                  className="h-8 px-2 text-xs"
                >
                  Paragraph
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertHtml('blockquote')}
                  className="h-8 px-2 text-xs"
                >
                  Quote
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertHtml('code')}
                  className="h-8 px-2 text-xs"
                >
                  Code
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertHtml('pre')}
                  className="h-8 px-2 text-xs"
                >
                  Code Block
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertHtml('hr')}
                  className="h-8 px-2 text-xs"
                >
                  Divider
                </Button>
              </div>
            </div>

            {/* Visual Editor */}
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[400px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 prose prose-sm max-w-none"
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              onInput={(e) => handleContentChange(e.target.innerHTML)}
              onBlur={(e) => handleContentChange(e.target.innerHTML)}
              placeholder={placeholder}
            />
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <textarea
              value={htmlContent}
              onChange={(e) => handleContentChange(e.target.value)}
              className="w-full min-h-[400px] p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter HTML content..."
            />
            <div className="text-sm text-muted-foreground">
              <p>You can edit the HTML source directly. Switch back to Visual Editor to see the rendered result.</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HtmlEditor;

