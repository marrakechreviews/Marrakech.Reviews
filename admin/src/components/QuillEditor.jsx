import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import ReactQuill, { Quill } from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = ({ value, onChange, placeholder = "Start writing your article..." }) => {
  const quillRef = useRef(null);
  
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: function() {
          const input = document.createElement('input');
          input.setAttribute('type', 'file');
          input.setAttribute('accept', 'image/*');
          input.click();

          input.onchange = async () => {
            const file = input.files[0];
            if (file) {
              const formData = new FormData();
              formData.append('image', file);

              try {
                const response = await fetch('http://localhost:5000/api/upload/image', {
                  method: 'POST',
                  body: formData,
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                  }
                });

                const result = await response.json();
                if (result.success) {
                  const quill = this.quill;
                  const range = quill.getSelection();
                  quill.insertEmbed(range.index, 'image', `http://localhost:5000${result.data.url}`);
                } else {
                  console.error('Upload failed:', result.message);
                }
              } catch (error) {
                console.error('Upload error:', error);
              }
            }
          };
        }
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list',
    'indent',
    'align',
    'link', 'image', 'video'
  ];

  // Stable onChange handler to prevent re-renders
  const handleChange = useCallback((content, delta, source, editor) => {
    if (source === 'user') {
      onChange(content);
    }
  }, [onChange]);

  return (
    <div className="border rounded-lg overflow-hidden">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        preserveWhitespace={true}
        style={{
          height: '400px',
          marginBottom: '42px' // Account for toolbar height
        }}
      />
    </div>
  );
};

export default React.memo(QuillEditor);

