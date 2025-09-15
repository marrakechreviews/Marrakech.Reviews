import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { reviewsAPI } from '../lib/api';
import { Upload } from 'lucide-react';

const CsvImportForm = ({ onFinished }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const successSoundRef = useRef(null);
  const queryClient = useQueryClient();

  const bulkImportMutation = useMutation({
    mutationFn: (formData) => reviewsAPI.bulkImportReviews(formData),
    onSuccess: (response) => {
      const { message, errors, createdCount, updatedCount } = response.data;
      toast.success(message, {
        description: `Created: ${createdCount}, Updated: ${updatedCount}`,
      });

      if (successSoundRef.current) {
        successSoundRef.current.play();
      }

      if (errors && errors.length > 0) {
        toast.error(`${errors.length} rows had errors.`, {
          description: (
            <ul className="list-disc list-inside max-h-40 overflow-y-auto">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          ),
          duration: 10000,
        });
      }
      queryClient.invalidateQueries(['reviews']);
      onFinished();
    },
    onError: (error) => {
      const errorData = error.response?.data;
      if (errorData && errorData.errors) {
        toast.error(errorData.message || 'Validation failed', {
          description: (
            <ul className="list-disc list-inside">
              {errorData.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          ),
          duration: 10000,
        });
      } else {
        toast.error(errorData?.message || 'Failed to import reviews');
      }
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleImport = () => {
    if (!file) {
      toast.error('Please select a file to import.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    bulkImportMutation.mutate(formData);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <audio ref={successSoundRef} src="/sounds/success.mp3" />
      {bulkImportMutation.isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4">Please wait, import is in progress...</p>
        </div>
      ) :
      <div className="space-y-2">
        <Label>CSV File</Label>
        <p className="text-sm text-muted-foreground">
          The CSV file should have the following columns:
          <span className="font-mono text-xs bg-muted p-1 rounded">refModel</span>,
          <span className="font-mono text-xs bg-muted p-1 rounded">refId</span> (or <span className="font-mono text-xs bg-muted p-1 rounded">itemName</span>),
          <span className="font-mono text-xs bg-muted p-1 rounded">reviewUserEmail</span>,
          <span className="font-mono text-xs bg-muted p-1 rounded">reviewName</span>,
          <span className="font-mono text-xs bg-muted p-1 rounded">reviewRating</span>,
          <span className="font-mono text-xs bg-muted p-1 rounded">reviewComment</span>.
        </p>
        <div
          className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={triggerFileSelect}
        >
          <input
            ref={fileInputRef}
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">
            {file ? file.name : 'Click to select a file or drag and drop'}
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onFinished}>Cancel</Button>
        <Button onClick={handleImport} disabled={!file || bulkImportMutation.isLoading}>
          {bulkImportMutation.isLoading ? 'Importing...' : 'Import Reviews'}
        </Button>
      </div>
    </div>
  );
};

export default CsvImportForm;
