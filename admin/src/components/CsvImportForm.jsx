import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { reviewsAPI } from '../lib/api';

const CsvImportForm = ({ onFinished }) => {
  const [file, setFile] = useState(null);
  const [refModel, setRefModel] = useState('Product');
  const queryClient = useQueryClient();

  const bulkImportMutation = useMutation({
    mutationFn: (data) => reviewsAPI.bulkImportReviews(data),
    onSuccess: (response) => {
      toast.success(`${response.data.successCount} reviews imported successfully.`);
      if (response.data.errorCount > 0) {
        toast.error(`${response.data.errorCount} reviews failed to import.`);
      }
      queryClient.invalidateQueries(['reviews']);
      onFinished();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to import reviews');
    },
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleImport = () => {
    if (!file) {
      toast.error('Please select a file to import.');
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const reviews = results.data.map(row => ({
          ...row,
          refModel,
        }));
        bulkImportMutation.mutate({ reviews });
      },
      error: (error) => {
        toast.error('Error parsing CSV file.');
        console.error('CSV parsing error:', error);
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="refModel">Reference Type</Label>
        <Select value={refModel} onValueChange={setRefModel}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Product">Product</SelectItem>
            <SelectItem value="Activity">Activity</SelectItem>
            <SelectItem value="OrganizedTravel">Organized Travel</SelectItem>
            <SelectItem value="Article">Article</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Select the type of item these reviews are for. The CSV should contain a 'refId' column with the IDs of the items.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="csv-file">CSV File</Label>
        <Input id="csv-file" type="file" accept=".csv" onChange={handleFileChange} />
        <p className="text-sm text-muted-foreground">
          CSV columns: refId, name, rating, comment
        </p>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleImport} disabled={bulkImportMutation.isLoading}>
          {bulkImportMutation.isLoading ? 'Importing...' : 'Import Reviews'}
        </Button>
      </div>
    </div>
  );
};

export default CsvImportForm;
