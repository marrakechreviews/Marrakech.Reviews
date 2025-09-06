import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { toast } from 'sonner';
import api from '../lib/api';

const AdminImport = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const response = await api.post('/activities/import');
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Activities from File</CardTitle>
        <CardDescription>
          Click the button below to import all activities from the pre-scraped `activities_data.csv` file into the database.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleImport} disabled={isLoading}>
          {isLoading ? 'Importing...' : 'Import Activities'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminImport;
