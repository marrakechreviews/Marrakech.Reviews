import React, { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { toast } from 'sonner';

const OpenTicketForm = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/contact', {
                name: user.name,
                email: user.email,
                subject: formData.subject,
                message: formData.message,
                category: 'technical',
            });
            if (response.data.success) {
                toast.success("Support ticket created successfully!");
                setFormData({ subject: '', message: '' });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create ticket.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Open a Support Ticket</CardTitle>
                <CardDescription>Have an issue? Let us know and we'll get back to you.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            name="subject"
                            value={formData.subject}
                            onChange={handleInputChange}
                            placeholder="Briefly describe your issue"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Please provide as much detail as possible."
                            rows={6}
                            required
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Ticket'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default OpenTicketForm;
