import React from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const BlockRenderer = ({ content }) => {
  // If content is just HTML string, render it directly
  if (typeof content === 'string') {
    return (
      <div 
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:text-gray-700 prose-blockquote:font-medium prose-img:rounded-xl prose-img:shadow-lg prose-ul:list-disc prose-ol:list-decimal prose-li:my-1"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // If content is block-based (array of blocks), render each block
  if (Array.isArray(content)) {
    return (
      <div className="space-y-6">
        {content.map((block, index) => (
          <BlockComponent key={block.id || index} block={block} />
        ))}
      </div>
    );
  }

  // Fallback for other content types
  return (
    <div className="prose prose-lg max-w-none">
      <p>{content}</p>
    </div>
  );
};

const BlockComponent = ({ block }) => {
  const { type, props, visible = true } = block;

  if (!visible) return null;

  const blockStyle = {
    padding: props.padding ? `${props.padding}px` : undefined,
    margin: props.margin ? `${props.margin}px` : undefined,
    color: props.color || undefined,
    backgroundColor: props.backgroundColor !== 'transparent' ? props.backgroundColor : undefined,
    fontSize: props.fontSize ? `${props.fontSize}px` : undefined,
    fontWeight: props.fontWeight || undefined,
    textAlign: props.textAlign || undefined,
    borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined,
    borderLeft: props.borderLeft || undefined
  };

  // Remove undefined values
  Object.keys(blockStyle).forEach(key => {
    if (blockStyle[key] === undefined) {
      delete blockStyle[key];
    }
  });

  switch (type) {
    case 'text':
      return (
        <div style={blockStyle} className="leading-relaxed">
          {props.content}
        </div>
      );

    case 'heading':
      const HeadingTag = props.level || 'h2';
      return (
        <HeadingTag style={blockStyle} className="font-bold leading-tight">
          {props.content}
        </HeadingTag>
      );

    case 'image':
      return (
        <div style={{ margin: blockStyle.margin }}>
          <div className="relative overflow-hidden rounded-xl shadow-lg group">
            <img
              src={props.src}
              alt={props.alt || ''}
              style={{
                width: props.width || '100%',
                height: props.height || 'auto',
                objectFit: props.objectFit || 'cover',
                borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined
              }}
              className="transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {props.caption && (
            <p className="text-center italic mt-3 text-gray-600 text-sm">
              {props.caption}
            </p>
          )}
        </div>
      );

    case 'video':
      return (
        <div style={blockStyle} className="relative rounded-xl overflow-hidden shadow-lg">
          <video
            src={props.src}
            width={props.width || '100%'}
            height={props.height || 400}
            controls={props.controls !== false}
            autoPlay={props.autoplay === true}
            className="w-full"
            style={{
              borderRadius: props.borderRadius ? `${props.borderRadius}px` : undefined
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );

    case 'quote':
      return (
        <Card className="border-l-4 border-blue-500 bg-blue-50/50">
          <CardContent className="p-6">
            <blockquote style={blockStyle} className="text-lg italic">
              <div className="mb-4">"{props.content}"</div>
              {props.author && (
                <cite className="text-sm font-medium text-gray-700 not-italic">
                  — {props.author}
                </cite>
              )}
            </blockquote>
          </CardContent>
        </Card>
      );

    case 'code':
      return (
        <Card className="bg-gray-900 text-gray-100 overflow-hidden">
          <CardContent className="p-0">
            {props.language && (
              <div className="bg-gray-800 px-4 py-2 text-sm font-medium border-b border-gray-700">
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  {props.language}
                </Badge>
              </div>
            )}
            <pre style={blockStyle} className="p-4 overflow-x-auto">
              <code className="text-sm leading-relaxed">
                {props.content}
              </code>
            </pre>
          </CardContent>
        </Card>
      );

    case 'list':
      const ListTag = props.type || 'ul';
      const listClass = props.type === 'ol' ? 'list-decimal' : 'list-disc';
      
      return (
        <ListTag style={blockStyle} className={`${listClass} pl-6 space-y-2`}>
          {(props.items || []).map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {item}
            </li>
          ))}
        </ListTag>
      );

    case 'columns':
      return (
        <div 
          style={{ 
            margin: blockStyle.margin,
            padding: blockStyle.padding
          }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {(props.columns || []).map((col, idx) => (
            <Card key={idx} className="h-fit">
              <CardContent className="p-4">
                <div 
                  dangerouslySetInnerHTML={{ __html: col.content }}
                  className="prose prose-sm max-w-none"
                />
              </CardContent>
            </Card>
          ))}
        </div>
      );

    case 'spacer':
      return (
        <div
          style={{
            height: `${props.height || 40}px`,
            backgroundColor: props.backgroundColor !== 'transparent' ? props.backgroundColor : undefined
          }}
          className="w-full"
        />
      );

    case 'divider':
      return (
        <div style={{ margin: blockStyle.margin }} className="flex items-center">
          <div className="flex-1 border-t border-gray-300" />
          {props.content && (
            <div className="px-4 text-gray-500 text-sm font-medium">
              {props.content}
            </div>
          )}
          <div className="flex-1 border-t border-gray-300" />
        </div>
      );

    case 'button':
      return (
        <div style={blockStyle} className="text-center">
          <a
            href={props.url || '#'}
            target={props.openInNewTab ? '_blank' : '_self'}
            rel={props.openInNewTab ? 'noopener noreferrer' : undefined}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              props.variant === 'outline' 
                ? 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
            style={{
              backgroundColor: props.variant === 'outline' ? 'transparent' : (props.backgroundColor || '#2563eb'),
              borderColor: props.variant === 'outline' ? (props.backgroundColor || '#2563eb') : 'transparent',
              color: props.variant === 'outline' ? (props.backgroundColor || '#2563eb') : '#ffffff'
            }}
          >
            {props.content || 'Button'}
          </a>
        </div>
      );

    case 'gallery':
      return (
        <div style={blockStyle}>
          <div className={`grid gap-4 ${
            props.columns === 1 ? 'grid-cols-1' :
            props.columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
            props.columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
          }`}>
            {(props.images || []).map((img, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-lg shadow-md group">
                <img
                  src={img.src}
                  alt={img.alt || `Gallery image ${idx + 1}`}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white text-center">
                    {img.caption && (
                      <p className="text-sm font-medium">{img.caption}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'embed':
      return (
        <div style={blockStyle} className="relative">
          <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={props.src}
              title={props.title || 'Embedded content'}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          {props.caption && (
            <p className="text-center italic mt-3 text-gray-600 text-sm">
              {props.caption}
            </p>
          )}
        </div>
      );

    case 'alert':
      const alertStyles = {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        success: 'bg-green-50 border-green-200 text-green-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        error: 'bg-red-50 border-red-200 text-red-800'
      };

      return (
        <div 
          style={blockStyle}
          className={`border-l-4 p-4 rounded-r-lg ${alertStyles[props.type] || alertStyles.info}`}
        >
          {props.title && (
            <h4 className="font-semibold mb-2">{props.title}</h4>
          )}
          <div>{props.content}</div>
        </div>
      );

    case 'table':
      return (
        <div style={blockStyle} className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            {props.headers && (
              <thead className="bg-gray-50">
                <tr>
                  {props.headers.map((header, idx) => (
                    <th key={idx} className="border border-gray-300 px-4 py-2 text-left font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {(props.rows || []).map((row, rowIdx) => (
                <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {row.map((cell, cellIdx) => (
                    <td key={cellIdx} className="border border-gray-300 px-4 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      // Fallback for unknown block types
      return (
        <div style={blockStyle} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-gray-600 text-sm">
            Unknown block type: <code className="bg-gray-200 px-1 rounded">{type}</code>
          </p>
          {props.content && (
            <div className="mt-2 text-gray-800">{props.content}</div>
          )}
        </div>
      );
  }
};

export default BlockRenderer;

