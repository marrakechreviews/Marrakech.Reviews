import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { toast } from 'sonner';
import api from '../lib/api';

const AdminScraper = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleScrape = async () => {
    if (!url) {
      toast.error('Please enter a URL to scrape.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await api.post('/activities/scrape', { url });
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Scraping failed.');
    } finally {
      setIsLoading(false);
      setUrl('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scrape New Activities</CardTitle>
        <CardDescription>
          Enter a category URL from a supported site (e.g., marrakechbestof.com) to scrape all activities from that page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scrape-url">Activity Category URL</Label>
          <Input
            id="scrape-url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.marrakechbestof.com/best-offer-category/activites-en/"
          />
        </div>
        <Button onClick={handleScrape} disabled={isLoading}>
          {isLoading ? 'Scraping...' : 'Scrape & Import Activities'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AdminScraper;
