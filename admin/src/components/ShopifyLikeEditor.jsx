import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { 
  Plus, 
  Trash2, 
  Move, 
  Image, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Video,
  Columns,
  Square,
  Eye,
  EyeOff,
  Copy,
  Settings,
  Palette,
  Layout,
  Smartphone,
  Monitor,
  Tablet,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Save,
  Undo,
  Redo,
  FileCode
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const ShopifyLikeEditor = ({ value = '', onChange, onSave }) => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [viewMode, setViewMode] = useState('desktop'); // desktop, tablet, mobile
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [htmlContent, setHtmlContent] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef(null);

  // Initialize blocks from HTML content
  useEffect(() => {
    if (value && blocks.length === 0) {
      parseHtmlToBlocks(value);
    }
  }, [value]);

  // Update HTML content when blocks change
  useEffect(() => {
    const html = blocksToHtml(blocks);
    setHtmlContent(html);
    onChange(html);
  }, [blocks, onChange]);

  // Block types configuration
  const blockTypes = {
    text: {
      name: 'Text',
      icon: Type,
      defaultProps: {
        content: 'Enter your text here...',
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: 'left',
        color: '#000000',
        backgroundColor: 'transparent',
        padding: 16,
        margin: 8
      }
    },
    heading: {
      name: 'Heading',
      icon: Type,
      defaultProps: {
        content: 'Your heading here',
        level: 'h2',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'left',
        color: '#000000',
        backgroundColor: 'transparent',
        padding: 16,
        margin: 8
      }
    },
    image: {
      name: 'Image',
      icon: Image,
      defaultProps: {
        src: '',
        alt: '',
        width: '100%',
        height: 'auto',
        objectFit: 'cover',
        borderRadius: 0,
        padding: 16,
        margin: 8,
        caption: ''
      }
    },
    video: {
      name: 'Video',
      icon: Video,
      defaultProps: {
        src: '',
        width: '100%',
        height: 400,
        autoplay: false,
        controls: true,
        padding: 16,
        margin: 8
      }
    },
    quote: {
      name: 'Quote',
      icon: Quote,
      defaultProps: {
        content: 'Your quote here...',
        author: '',
        fontSize: 18,
        fontStyle: 'italic',
        textAlign: 'center',
        color: '#666666',
        backgroundColor: '#f8f9fa',
        borderLeft: '4px solid #007bff',
        padding: 24,
        margin: 16
      }
    },
    code: {
      name: 'Code',
      icon: Code,
      defaultProps: {
        content: '// Your code here\nconsole.log("Hello World");',
        language: 'javascript',
        fontSize: 14,
        backgroundColor: '#f8f9fa',
        color: '#333333',
        padding: 16,
        margin: 8,
        borderRadius: 4
      }
    },
    list: {
      name: 'List',
      icon: List,
      defaultProps: {
        items: ['Item 1', 'Item 2', 'Item 3'],
        type: 'ul',
        fontSize: 16,
        color: '#000000',
        padding: 16,
        margin: 8
      }
    },
    columns: {
      name: 'Columns',
      icon: Columns,
      defaultProps: {
        columns: [
          { content: 'Column 1 content', width: '50%' },
          { content: 'Column 2 content', width: '50%' }
        ],
        gap: 16,
        padding: 16,
        margin: 8
      }
    },
    spacer: {
      name: 'Spacer',
      icon: Square,
      defaultProps: {
        height: 40,
        backgroundColor: 'transparent'
      }
    }
  };

  // Save to history for undo/redo
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(blocks)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [blocks, history, historyIndex]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setBlocks(history[historyIndex - 1]);
    }
  }, [history, historyIndex]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setBlocks(history[historyIndex + 1]);
    }
  }, [history, historyIndex]);

  // Add new block
  const addBlock = useCallback((type, index = null) => {
    const newBlock = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      props: { ...blockTypes[type].defaultProps },
      visible: true
    };

    setBlocks(prev => {
      const newBlocks = [...prev];
      if (index !== null) {
        newBlocks.splice(index + 1, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }
      return newBlocks;
    });

    saveToHistory();
    setSelectedBlock(newBlock.id);
  }, [blockTypes, saveToHistory]);

  // Update block
  const updateBlock = useCallback((blockId, updates) => {
    setBlocks(prev => prev.map(block => 
      block.id === blockId 
        ? { ...block, ...updates }
        : block
    ));
  }, []);

  // Delete block
  const deleteBlock = useCallback((blockId) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId));
    saveToHistory();
    if (selectedBlock === blockId) {
      setSelectedBlock(null);
    }
  }, [selectedBlock, saveToHistory]);

  // Duplicate block
  const duplicateBlock = useCallback((blockId) => {
    const blockToDuplicate = blocks.find(block => block.id === blockId);
    if (blockToDuplicate) {
      const newBlock = {
        ...blockToDuplicate,
        id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      
      const blockIndex = blocks.findIndex(block => block.id === blockId);
      setBlocks(prev => {
        const newBlocks = [...prev];
        newBlocks.splice(blockIndex + 1, 0, newBlock);
        return newBlocks;
      });
      
      saveToHistory();
    }
  }, [blocks, saveToHistory]);

  // Move block
  const moveBlock = useCallback((blockId, direction) => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    setBlocks(prev => {
      const newBlocks = [...prev];
      const [movedBlock] = newBlocks.splice(blockIndex, 1);
      newBlocks.splice(newIndex, 0, movedBlock);
      return newBlocks;
    });

    saveToHistory();
  }, [blocks, saveToHistory]);

  // Handle drag and drop
  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBlocks(items);
    saveToHistory();
  }, [blocks, saveToHistory]);

  // Parse HTML to blocks (simplified)
  const parseHtmlToBlocks = (html) => {
    // This is a simplified parser - in production, you'd want a more robust solution
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const newBlocks = [];
    Array.from(tempDiv.children).forEach((element, index) => {
      let blockType = 'text';
      let content = element.textContent || element.innerText;
      
      if (element.tagName === 'H1' || element.tagName === 'H2' || element.tagName === 'H3') {
        blockType = 'heading';
      } else if (element.tagName === 'IMG') {
        blockType = 'image';
        content = element.src;
      } else if (element.tagName === 'BLOCKQUOTE') {
        blockType = 'quote';
      } else if (element.tagName === 'PRE' || element.tagName === 'CODE') {
        blockType = 'code';
      } else if (element.tagName === 'UL' || element.tagName === 'OL') {
        blockType = 'list';
      }

      newBlocks.push({
        id: `block_${Date.now()}_${index}`,
        type: blockType,
        props: {
          ...blockTypes[blockType].defaultProps,
          content: content
        },
        visible: true
      });
    });

    if (newBlocks.length === 0) {
      // Add default text block if no content
      newBlocks.push({
        id: `block_${Date.now()}_0`,
        type: 'text',
        props: {
          ...blockTypes.text.defaultProps,
          content: html || 'Start writing your article...'
        },
        visible: true
      });
    }

    setBlocks(newBlocks);
  };

  // Convert blocks to HTML
  const blocksToHtml = (blocks) => {
    return blocks.map(block => {
      if (!block.visible) return '';
      
      const { type, props } = block;
      const style = {
        padding: `${props.padding || 0}px`,
        margin: `${props.margin || 0}px`,
        color: props.color || '#000000',
        backgroundColor: props.backgroundColor || 'transparent',
        fontSize: props.fontSize ? `${props.fontSize}px` : undefined,
        fontWeight: props.fontWeight || 'normal',
        textAlign: props.textAlign || 'left',
        borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined,
        borderLeft: props.borderLeft || undefined
      };

      const styleString = Object.entries(style)
        .filter(([_, value]) => value !== undefined && value !== 'transparent')
        .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
        .join('; ');

      switch (type) {
        case 'text':
          return `<p style="${styleString}">${props.content || ''}</p>`;
        
        case 'heading':
          const level = props.level || 'h2';
          return `<${level} style="${styleString}">${props.content || ''}</${level}>`;
        
        case 'image':
          const imgStyle = {
            ...style,
            width: props.width || '100%',
            height: props.height || 'auto',
            objectFit: props.objectFit || 'cover'
          };
          const imgStyleString = Object.entries(imgStyle)
            .filter(([_, value]) => value !== undefined && value !== 'transparent')
            .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
            .join('; ');
          
          let imgHtml = `<img src="${props.src || ''}" alt="${props.alt || ''}" style="${imgStyleString}" />`;
          if (props.caption) {
            imgHtml += `<p style="text-align: center; font-style: italic; margin-top: 8px;">${props.caption}</p>`;
          }
          return `<div style="margin: ${props.margin || 0}px;">${imgHtml}</div>`;
        
        case 'video':
          return `<video src="${props.src || ''}" style="${styleString}" width="${props.width || '100%'}" height="${props.height || 400}" ${props.controls ? 'controls' : ''} ${props.autoplay ? 'autoplay' : ''}></video>`;
        
        case 'quote':
          return `<blockquote style="${styleString}">${props.content || ''}<br><cite>— ${props.author || ''}</cite></blockquote>`;
        
        case 'code':
          return `<pre style="${styleString}"><code>${props.content || ''}</code></pre>`;
        
        case 'list':
          const listType = props.type || 'ul';
          const items = (props.items || []).map(item => `<li>${item}</li>`).join('');
          return `<${listType} style="${styleString}">${items}</${listType}>`;
        
        case 'columns':
          const columns = (props.columns || []).map(col => 
            `<div style="width: ${col.width}; padding: 0 ${(props.gap || 16) / 2}px;">${col.content}</div>`
          ).join('');
          return `<div style="display: flex; margin: ${props.margin || 0}px; padding: ${props.padding || 0}px;">${columns}</div>`;
        
        case 'spacer':
          return `<div style="height: ${props.height || 40}px; background-color: ${props.backgroundColor || 'transparent'};"></div>`;
        
        default:
          return '';
      }
    }).join('\n');
  };

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (selectedBlock) {
          updateBlock(selectedBlock, {
            props: {
              ...blocks.find(b => b.id === selectedBlock)?.props,
              src: e.target.result
            }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Render block in editor
  const renderBlock = (block, index) => {
    const { type, props, visible } = block;
    const isSelected = selectedBlock === block.id;
    
    if (!visible && !isPreviewMode) {
      return (
        <div key={block.id} className="opacity-50 border-2 border-dashed border-gray-300 p-4 rounded">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Hidden {blockTypes[type]?.name} Block</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateBlock(block.id, { visible: true })}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>
        </div>
      );
    }

    const blockStyle = {
      padding: `${props.padding || 0}px`,
      margin: `${props.margin || 0}px`,
      color: props.color || '#000000',
      backgroundColor: props.backgroundColor || 'transparent',
      fontSize: props.fontSize ? `${props.fontSize}px` : undefined,
      fontWeight: props.fontWeight || 'normal',
      textAlign: props.textAlign || 'left',
      borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined,
      borderLeft: props.borderLeft || undefined
    };

    let blockContent;

    switch (type) {
      case 'text':
        blockContent = (
          <div
            style={blockStyle}
            contentEditable={!isPreviewMode}
            suppressContentEditableWarning={true}
            onBlur={(e) => updateBlock(block.id, {
              props: { ...props, content: e.target.textContent }
            })}
            className="outline-none"
          >
            {props.content || 'Enter your text here...'}
          </div>
        );
        break;

      case 'heading':
        const HeadingTag = props.level || 'h2';
        blockContent = (
          <HeadingTag
            style={blockStyle}
            contentEditable={!isPreviewMode}
            suppressContentEditableWarning={true}
            onBlur={(e) => updateBlock(block.id, {
              props: { ...props, content: e.target.textContent }
            })}
            className="outline-none"
          >
            {props.content || 'Your heading here'}
          </HeadingTag>
        );
        break;

      case 'image':
        blockContent = (
          <div style={{ margin: `${props.margin || 0}px` }}>
            {props.src ? (
              <img
                src={props.src}
                alt={props.alt || ''}
                style={{
                  width: props.width || '100%',
                  height: props.height || 'auto',
                  objectFit: props.objectFit || 'cover',
                  borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined
                }}
                className="max-w-full"
              />
            ) : (
              <div 
                className="border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-gray-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Click to upload image</p>
              </div>
            )}
            {props.caption && (
              <p className="text-center italic mt-2 text-gray-600">{props.caption}</p>
            )}
          </div>
        );
        break;

      case 'quote':
        blockContent = (
          <blockquote
            style={blockStyle}
            className="border-l-4 border-blue-500 pl-4"
          >
            <div
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning={true}
              onBlur={(e) => updateBlock(block.id, {
                props: { ...props, content: e.target.textContent }
              })}
              className="outline-none"
            >
              {props.content || 'Your quote here...'}
            </div>
            {props.author && (
              <cite className="block mt-2 text-right">— {props.author}</cite>
            )}
          </blockquote>
        );
        break;

      case 'code':
        blockContent = (
          <pre style={blockStyle} className="bg-gray-100 rounded overflow-x-auto">
            <code
              contentEditable={!isPreviewMode}
              suppressContentEditableWarning={true}
              onBlur={(e) => updateBlock(block.id, {
                props: { ...props, content: e.target.textContent }
              })}
              className="outline-none"
            >
              {props.content || '// Your code here'}
            </code>
          </pre>
        );
        break;

      case 'list':
        const ListTag = props.type || 'ul';
        blockContent = (
          <ListTag style={blockStyle}>
            {(props.items || []).map((item, idx) => (
              <li
                key={idx}
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const newItems = [...(props.items || [])];
                  newItems[idx] = e.target.textContent;
                  updateBlock(block.id, {
                    props: { ...props, items: newItems }
                  });
                }}
                className="outline-none"
              >
                {item}
              </li>
            ))}
          </ListTag>
        );
        break;

      case 'columns':
        blockContent = (
          <div 
            style={{ 
              display: 'flex', 
              gap: `${props.gap || 16}px`,
              margin: `${props.margin || 0}px`,
              padding: `${props.padding || 0}px`
            }}
            className="flex-wrap"
          >
            {(props.columns || []).map((col, idx) => (
              <div
                key={idx}
                style={{ width: col.width }}
                contentEditable={!isPreviewMode}
                suppressContentEditableWarning={true}
                onBlur={(e) => {
                  const newColumns = [...(props.columns || [])];
                  newColumns[idx] = { ...col, content: e.target.innerHTML };
                  updateBlock(block.id, {
                    props: { ...props, columns: newColumns }
                  });
                }}
                className="outline-none border border-gray-200 p-2 rounded"
                dangerouslySetInnerHTML={{ __html: col.content }}
              />
            ))}
          </div>
        );
        break;

      case 'spacer':
        blockContent = (
          <div
            style={{
              height: `${props.height || 40}px`,
              backgroundColor: props.backgroundColor || 'transparent'
            }}
            className="border border-dashed border-gray-300"
          />
        );
        break;

      default:
        blockContent = <div>Unknown block type: {type}</div>;
    }

    return (
      <div
        key={block.id}
        className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''} ${
          isPreviewMode ? '' : 'hover:ring-1 hover:ring-gray-300'
        } rounded transition-all`}
        onClick={() => !isPreviewMode && setSelectedBlock(block.id)}
      >
        {!isPreviewMode && (
          <div className="absolute -top-8 left-0 right-0 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity bg-white border rounded shadow-sm p-1 z-10">
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                {blockTypes[type]?.name}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  moveBlock(block.id, 'up');
                }}
                disabled={index === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  moveBlock(block.id, 'down');
                }}
                disabled={index === blocks.length - 1}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  duplicateBlock(block.id);
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  updateBlock(block.id, { visible: !visible });
                }}
              >
                {visible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteBlock(block.id);
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        {blockContent}
      </div>
    );
  };

  // Render block properties panel
  const renderBlockProperties = () => {
    if (!selectedBlock) return null;

    const block = blocks.find(b => b.id === selectedBlock);
    if (!block) return null;

    const { type, props } = block;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {blockTypes[type]?.name} Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Common properties */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Padding</Label>
              <Slider
                value={[props.padding || 0]}
                onValueChange={([value]) => updateBlock(selectedBlock, {
                  props: { ...props, padding: value }
                })}
                max={100}
                step={4}
              />
              <span className="text-xs text-gray-500">{props.padding || 0}px</span>
            </div>
            <div>
              <Label>Margin</Label>
              <Slider
                value={[props.margin || 0]}
                onValueChange={([value]) => updateBlock(selectedBlock, {
                  props: { ...props, margin: value }
                })}
                max={100}
                step={4}
              />
              <span className="text-xs text-gray-500">{props.margin || 0}px</span>
            </div>
          </div>

          {/* Text properties */}
          {(type === 'text' || type === 'heading' || type === 'quote') && (
            <>
              <div>
                <Label>Text Color</Label>
                <Input
                  type="color"
                  value={props.color || '#000000'}
                  onChange={(e) => updateBlock(selectedBlock, {
                    props: { ...props, color: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label>Font Size</Label>
                <Slider
                  value={[props.fontSize || 16]}
                  onValueChange={([value]) => updateBlock(selectedBlock, {
                    props: { ...props, fontSize: value }
                  })}
                  min={8}
                  max={72}
                  step={1}
                />
                <span className="text-xs text-gray-500">{props.fontSize || 16}px</span>
              </div>
              <div>
                <Label>Text Align</Label>
                <Select
                  value={props.textAlign || 'left'}
                  onValueChange={(value) => updateBlock(selectedBlock, {
                    props: { ...props, textAlign: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="justify">Justify</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Heading specific */}
          {type === 'heading' && (
            <div>
              <Label>Heading Level</Label>
              <Select
                value={props.level || 'h2'}
                onValueChange={(value) => updateBlock(selectedBlock, {
                  props: { ...props, level: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="h1">H1</SelectItem>
                  <SelectItem value="h2">H2</SelectItem>
                  <SelectItem value="h3">H3</SelectItem>
                  <SelectItem value="h4">H4</SelectItem>
                  <SelectItem value="h5">H5</SelectItem>
                  <SelectItem value="h6">H6</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Image specific */}
          {type === 'image' && (
            <>
              <div>
                <Label>Image URL</Label>
                <Input
                  value={props.src || ''}
                  onChange={(e) => updateBlock(selectedBlock, {
                    props: { ...props, src: e.target.value }
                  })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label>Alt Text</Label>
                <Input
                  value={props.alt || ''}
                  onChange={(e) => updateBlock(selectedBlock, {
                    props: { ...props, alt: e.target.value }
                  })}
                  placeholder="Image description"
                />
              </div>
              <div>
                <Label>Caption</Label>
                <Input
                  value={props.caption || ''}
                  onChange={(e) => updateBlock(selectedBlock, {
                    props: { ...props, caption: e.target.value }
                  })}
                  placeholder="Image caption"
                />
              </div>
              <div>
                <Label>Border Radius</Label>
                <Slider
                  value={[props.borderRadius || 0]}
                  onValueChange={([value]) => updateBlock(selectedBlock, {
                    props: { ...props, borderRadius: value }
                  })}
                  max={50}
                  step={1}
                />
                <span className="text-xs text-gray-500">{props.borderRadius || 0}px</span>
              </div>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Image className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
            </>
          )}

          {/* Quote specific */}
          {type === 'quote' && (
            <div>
              <Label>Author</Label>
              <Input
                value={props.author || ''}
                onChange={(e) => updateBlock(selectedBlock, {
                  props: { ...props, author: e.target.value }
                })}
                placeholder="Quote author"
              />
            </div>
          )}

          {/* List specific */}
          {type === 'list' && (
            <>
              <div>
                <Label>List Type</Label>
                <Select
                  value={props.type || 'ul'}
                  onValueChange={(value) => updateBlock(selectedBlock, {
                    props: { ...props, type: value }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ul">Bullet List</SelectItem>
                    <SelectItem value="ol">Numbered List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>List Items</Label>
                {(props.items || []).map((item, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newItems = [...(props.items || [])];
                        newItems[idx] = e.target.value;
                        updateBlock(selectedBlock, {
                          props: { ...props, items: newItems }
                        });
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = (props.items || []).filter((_, i) => i !== idx);
                        updateBlock(selectedBlock, {
                          props: { ...props, items: newItems }
                        });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItems = [...(props.items || []), 'New item'];
                    updateBlock(selectedBlock, {
                      props: { ...props, items: newItems }
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </>
          )}

          {/* Spacer specific */}
          {type === 'spacer' && (
            <div>
              <Label>Height</Label>
              <Slider
                value={[props.height || 40]}
                onValueChange={([value]) => updateBlock(selectedBlock, {
                  props: { ...props, height: value }
                })}
                min={10}
                max={200}
                step={10}
              />
              <span className="text-xs text-gray-500">{props.height || 40}px</span>
            </div>
          )}

          {/* Background color for all blocks */}
          <div>
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={props.backgroundColor === 'transparent' ? '#ffffff' : props.backgroundColor || '#ffffff'}
                onChange={(e) => updateBlock(selectedBlock, {
                  props: { ...props, backgroundColor: e.target.value }
                })}
                className="w-16"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateBlock(selectedBlock, {
                  props: { ...props, backgroundColor: 'transparent' }
                })}
              >
                Transparent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="border-b bg-white p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={historyIndex <= 0}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
          >
            <Redo className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant={isPreviewMode ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? 'Edit' : 'Preview'}
          </Button>
          <Button
            variant={showHtmlEditor ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHtmlEditor(!showHtmlEditor)}
          >
            <FileCode className="h-4 w-4 mr-2" />
            HTML
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode selector */}
          <div className="flex items-center gap-1 border rounded p-1">
            <Button
              variant={viewMode === 'desktop' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'tablet' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'mobile' ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={onSave}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex">
        {/* Sidebar - Block Library */}
        {!isPreviewMode && (
          <div className="w-64 border-r bg-gray-50 p-4 overflow-y-auto">
            <h3 className="font-semibold mb-4">Add Blocks</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(blockTypes).map(([type, config]) => (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addBlock(type)}
                  className="flex flex-col items-center gap-2 h-auto p-3"
                >
                  <config.icon className="h-5 w-5" />
                  <span className="text-xs">{config.name}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex">
          {/* Content Editor */}
          <div className="flex-1 overflow-y-auto">
            {showHtmlEditor ? (
              <div className="p-4">
                <Textarea
                  value={htmlContent}
                  onChange={(e) => {
                    setHtmlContent(e.target.value);
                    onChange(e.target.value);
                  }}
                  className="w-full h-96 font-mono text-sm"
                  placeholder="Edit HTML directly..."
                />
                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={() => {
                      parseHtmlToBlocks(htmlContent);
                      setShowHtmlEditor(false);
                    }}
                  >
                    Apply Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowHtmlEditor(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                className={`p-4 ${
                  viewMode === 'mobile' ? 'max-w-sm mx-auto' :
                  viewMode === 'tablet' ? 'max-w-2xl mx-auto' :
                  'max-w-4xl mx-auto'
                }`}
              >
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="blocks">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {blocks.map((block, index) => (
                          <Draggable
                            key={block.id}
                            draggableId={block.id}
                            index={index}
                            isDragDisabled={isPreviewMode}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                {renderBlock(block, index)}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        
                        {/* Add block button */}
                        {!isPreviewMode && (
                          <div className="text-center py-8">
                            <Button
                              variant="dashed"
                              onClick={() => addBlock('text')}
                              className="border-dashed border-2 border-gray-300 hover:border-gray-400"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Block
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
          </div>

          {/* Properties Panel */}
          {!isPreviewMode && !showHtmlEditor && (
            <div className="w-80 border-l bg-gray-50 p-4 overflow-y-auto">
              {selectedBlock ? (
                renderBlockProperties()
              ) : (
                <div className="text-center text-gray-500 mt-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a block to edit its properties</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopifyLikeEditor;

