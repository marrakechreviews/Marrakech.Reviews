import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { 
  Eye, 
  Code, 
  Type, 
  Image, 
  Link, 
  Bold, 
  Italic, 
  List, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Save,
  Undo,
  Redo,
  FileText,
  Settings,
  Palette,
  Layout,
  Maximize,
  Minimize
} from 'lucide-react';

const TinyMCEEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Start writing your article...', 
  height = 500,
  showWordCount = true,
  showToolbar = true,
  apiKey = 'wu3hiajsanxrc6v1i590tunrhnvppkmqjemd3qwnj7hylcd6' // You can get a free API key from TinyMCE
}) => {
  const editorRef = useRef(null);
  const [activeTab, setActiveTab] = useState('visual');
  const [htmlContent, setHtmlContent] = useState(value);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  useEffect(() => {
    setHtmlContent(value);
    updateCounts(value);
  }, [value]);

  const updateCounts = (content) => {
    const textContent = content.replace(/<[^>]*>/g, '');
    setWordCount(textContent.trim().split(/\s+/).filter(word => word.length > 0).length);
    setCharCount(textContent.length);
  };

  const handleEditorChange = (content, editor) => {
    setHtmlContent(content);
    updateCounts(content);
    onChange(content);
  };

  const handleHtmlChange = (e) => {
    const newContent = e.target.value;
    setHtmlContent(newContent);
    updateCounts(newContent);
    onChange(newContent);
  };

  const insertTemplate = (templateType) => {
    const editor = editorRef.current;
    if (!editor) return;

    let template = '';
    switch (templateType) {
      case 'intro':
        template = `<div class="article-intro" style="background: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h2 style="margin-top: 0; color: #007bff;">Introduction</h2>
          <p>Welcome to this article. Here's what you'll learn...</p>
        </div>`;
        break;
      case 'section':
        template = `<div class="article-section" style="margin: 30px 0;">
          <h3 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Section Title</h3>
          <p>Your content goes here...</p>
        </div>`;
        break;
      case 'quote':
        template = `<blockquote class="article-quote" style="background: #f8f9fa; border-left: 4px solid #6c757d; padding: 20px; margin: 20px 0; font-style: italic; border-radius: 4px;">
          <p style="margin: 0 0 10px 0; font-size: 18px;">"Your inspiring quote goes here."</p>
          <cite style="color: #6c757d; font-size: 14px;">— Author Name</cite>
        </blockquote>`;
        break;
      case 'callout':
        template = `<div class="article-callout" style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h4 style="margin-top: 0; color: #856404; display: flex; align-items: center;">
            <span style="margin-right: 8px;">💡</span>
            Pro Tip
          </h4>
          <p style="margin-bottom: 0; color: #856404;">Important information or tip for readers.</p>
        </div>`;
        break;
      case 'image-gallery':
        template = `<div class="image-gallery" style="margin: 30px 0;">
          <div class="gallery-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 10px;">
            <img src="https://via.placeholder.com/300x200" alt="Gallery image 1" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" />
            <img src="https://via.placeholder.com/300x200" alt="Gallery image 2" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" />
            <img src="https://via.placeholder.com/300x200" alt="Gallery image 3" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;" />
          </div>
          <p class="gallery-caption" style="text-align: center; font-style: italic; color: #6c757d; margin: 0;">Image gallery caption</p>
        </div>`;
        break;
      case 'cta':
        template = `<div class="article-cta" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
          <h4 style="margin-top: 0; font-size: 24px;">Ready to Get Started?</h4>
          <p style="margin-bottom: 20px;">Take the next step with our services.</p>
          <a href="#" class="cta-button" style="display: inline-block; background: white; color: #667eea; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; transition: transform 0.2s;">Get Started Now</a>
        </div>`;
        break;
      case 'table':
        template = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Header 1</th>
              <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Header 2</th>
              <th style="border: 1px solid #dee2e6; padding: 12px; text-align: left;">Header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #dee2e6; padding: 12px;">Cell 1</td>
              <td style="border: 1px solid #dee2e6; padding: 12px;">Cell 2</td>
              <td style="border: 1px solid #dee2e6; padding: 12px;">Cell 3</td>
            </tr>
            <tr style="background: #f8f9fa;">
              <td style="border: 1px solid #dee2e6; padding: 12px;">Cell 4</td>
              <td style="border: 1px solid #dee2e6; padding: 12px;">Cell 5</td>
              <td style="border: 1px solid #dee2e6; padding: 12px;">Cell 6</td>
            </tr>
          </tbody>
        </table>`;
        break;
      case 'code-block':
        template = `<pre style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 16px; margin: 20px 0; overflow-x: auto;"><code>// Your code here
console.log("Hello World!");

function example() {
  return "This is a code example";
}</code></pre>`;
        break;
      default:
        return;
    }

    editor.insertContent(template);
  };

  const tinyMCEConfig = {
    height: height,
    menubar: 'file edit view insert format tools table help',
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
      'template', 'codesample', 'hr', 'pagebreak', 'nonbreaking', 'toc',
      'imagetools', 'textpattern', 'noneditable', 'quickbars', 'accordion'
    ],
    toolbar: showToolbar ? [
      'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough',
      'alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist',
      'forecolor backcolor removeformat | pagebreak | charmap emoticons',
      'fullscreen preview save print | insertfile image media template link anchor codesample',
      'ltr rtl | accordion accordionremove | table tabledelete | tableprops tablerowprops tablecellprops',
      'tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol'
    ].join(' | ') : false,
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
        font-size: 16px; 
        line-height: 1.6; 
        color: #333;
        max-width: none;
        margin: 0;
        padding: 20px;
      }
      .article-intro {
        background: #f8f9fa;
        border-left: 4px solid #007bff;
        padding: 20px;
        margin: 20px 0;
        border-radius: 4px;
      }
      .article-section {
        margin: 30px 0;
      }
      .article-quote {
        background: #f8f9fa;
        border-left: 4px solid #6c757d;
        padding: 20px;
        margin: 20px 0;
        font-style: italic;
        border-radius: 4px;
      }
      .article-callout {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      .article-callout h4 {
        margin-top: 0;
        color: #856404;
      }
      .image-gallery {
        margin: 30px 0;
      }
      .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
        margin-bottom: 10px;
      }
      .gallery-grid img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        border-radius: 8px;
      }
      .gallery-caption {
        text-align: center;
        font-style: italic;
        color: #6c757d;
        margin: 0;
      }
      .article-cta {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 12px;
        text-align: center;
        margin: 30px 0;
      }
      .article-cta h4 {
        margin-top: 0;
        font-size: 24px;
      }
      .cta-button {
        display: inline-block;
        background: white;
        color: #667eea;
        padding: 12px 24px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: bold;
        margin-top: 15px;
        transition: transform 0.2s;
      }
      .cta-button:hover {
        transform: translateY(-2px);
      }
      table {
        border-collapse: collapse;
        width: 100%;
        margin: 20px 0;
      }
      table th, table td {
        border: 1px solid #dee2e6;
        padding: 12px;
        text-align: left;
      }
      table th {
        background: #f8f9fa;
        font-weight: 600;
      }
      table tr:nth-child(even) {
        background: #f8f9fa;
      }
      pre {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 4px;
        padding: 16px;
        margin: 20px 0;
        overflow-x: auto;
      }
      code {
        background: #f8f9fa;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }
      pre code {
        background: none;
        padding: 0;
      }
    `,
    placeholder: placeholder,
    branding: false,
    resize: true,
    elementpath: false,
    statusbar: showWordCount,
    contextmenu: 'link image table',
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    quickbars_insert_toolbar: 'quickimage quicktable',
    toolbar_mode: 'sliding',
    image_advtab: true,
    image_caption: true,
    image_title: true,
    automatic_uploads: true,
    file_picker_types: 'image',
    file_picker_callback: function (cb, value, meta) {
      var input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');

      input.onchange = function () {
        var file = this.files[0];
        var reader = new FileReader();
        reader.onload = function () {
          var id = 'blobid' + (new Date()).getTime();
          var blobCache = editorRef.current.editorUpload.blobCache;
          var base64 = reader.result.split(',')[1];
          var blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name });
        };
        reader.readAsDataURL(file);
      };

      input.click();
    },
    setup: (editor) => {
      editor.on('init', () => {
        editorRef.current = editor;
      });
    }
  };

  return (
    <Card className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Rich Text Editor
          </CardTitle>
          <div className="flex items-center gap-4">
            {showWordCount && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <Badge variant="outline">{wordCount} words</Badge>
                <Badge variant="outline">{charCount} characters</Badge>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Label htmlFor="advanced-options" className="text-sm">Advanced</Label>
              <Switch
                id="advanced-options"
                checked={showAdvancedOptions}
                onCheckedChange={setShowAdvancedOptions}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              {isFullscreen ? 'Exit' : 'Fullscreen'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visual Editor
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              HTML Source
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visual" className="space-y-4">
            <Editor
              apiKey={apiKey}
              value={htmlContent}
              onEditorChange={handleEditorChange}
              init={tinyMCEConfig}
            />
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">HTML Source Code</h4>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(htmlContent);
                    }}
                  >
                    Copy HTML
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const formatted = htmlContent
                        .replace(/></g, '>\n<')
                        .replace(/^\s*\n/gm, '');
                      setHtmlContent(formatted);
                      onChange(formatted);
                    }}
                  >
                    Format
                  </Button>
                </div>
              </div>
              <textarea
                value={htmlContent}
                onChange={handleHtmlChange}
                className="w-full min-h-[400px] p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                placeholder="Enter HTML content..."
              />
              <div className="text-sm text-muted-foreground">
                <p>You can edit the HTML source directly. Switch back to Visual Editor to see the rendered result.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Content Templates</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => insertTemplate('intro')}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-xs">Introduction</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => insertTemplate('section')}
                  >
                    <Type className="h-6 w-6" />
                    <span className="text-xs">Section</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => insertTemplate('quote')}
                  >
                    <span className="text-lg">"</span>
                    <span className="text-xs">Quote</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => insertTemplate('callout')}
                  >
                    <span className="text-lg">💡</span>
                    <span className="text-xs">Callout</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => insertTemplate('image-gallery')}
                  >
                    <Image className="h-6 w-6" />
                    <span className="text-xs">Gallery</span>
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => insertTemplate('cta')}
                  >
                    <span className="text-lg">🎯</span>
                    <span className="text-xs">Call to Action</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => insertTemplate('table')}
                  >
                    <span className="text-lg">📊</span>
                    <span className="text-xs">Table</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => insertTemplate('code-block')}
                  >
                    <Code className="h-6 w-6" />
                    <span className="text-xs">Code Block</span>
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editorRef.current?.execCommand('mceInsertContent', false, '<hr style="margin: 20px 0; border: none; border-top: 2px solid #e9ecef;">')}
                  >
                    Add Divider
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editorRef.current?.execCommand('mceInsertContent', false, '<div style="height: 40px;"></div>')}
                  >
                    Add Space
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editorRef.current?.execCommand('mceInsertContent', false, '<p><strong>Bold text</strong></p>')}
                  >
                    Bold Text
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => editorRef.current?.execCommand('mceInsertContent', false, '<p><em>Italic text</em></p>')}
                  >
                    Italic Text
                  </Button>
                </div>
              </div>

              {showAdvancedOptions && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-3">Advanced Templates</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertTemplate('newsletter-signup')}
                      >
                        Newsletter Signup
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertTemplate('social-share')}
                      >
                        Social Share
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertTemplate('author-bio')}
                      >
                        Author Bio
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => insertTemplate('related-articles')}
                      >
                        Related Articles
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TinyMCEEditor;

