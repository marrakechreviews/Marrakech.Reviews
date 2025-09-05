import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from '../hooks/use-mobile';

import UserReservations from '../components/UserReservations';
import UserOrders from '../components/UserOrders';
import UpdatePasswordForm from '../components/UpdatePasswordForm';
import AddReviewForm from '../components/AddReviewForm';
import OpenTicketForm from '../components/OpenTicketForm';

const AccountPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated, isLoading, updateProfile, logout, updateProfileImage } = useAuth();
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState("profile");

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: {
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
        },
    });
    const [loadingUpdate, setLoadingUpdate] = useState(false);

    useEffect(() => {
        if (isLoading) {
            return; // Wait for auth state to load
        }
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location }, replace: true });
        } else if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                address: user.address || { street: '', city: '', state: '', postalCode: '', country: '' },
            });
        }
    }, [isAuthenticated, isLoading, user, navigate, location]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value,
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingUpdate(true);
        const result = await updateProfile(formData);
        setLoadingUpdate(false);
        if (result.success) {
            toast.success('Profile updated successfully!');
        } else {
            toast.error(result.message || 'Failed to update profile.');
        }
    };

    if (isLoading || !user) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Helmet>
                <title>My Account - Marrakech Experiences</title>
            </Helmet>
            <div className="container mx-auto p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold">My Account</h1>
                        <Button variant="outline" onClick={logout}>Logout</Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {isMobile ? (
                            <Select value={activeTab} onValueChange={setActiveTab}>
                                <SelectTrigger className="w-full mb-4">
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="profile">Profile</SelectItem>
                                    <SelectItem value="orders">Orders</SelectItem>
                                    <SelectItem value="reservations">Reservations</SelectItem>
                                    <SelectItem value="add-review">Add Review</SelectItem>
                                    <SelectItem value="security">Security</SelectItem>
                                    <SelectItem value="support">Support</SelectItem>
                                </SelectContent>
                            </Select>
                        ) : (
                            <TabsList className="grid w-full grid-cols-6">
                                <TabsTrigger value="profile">Profile</TabsTrigger>
                                <TabsTrigger value="orders">Orders</TabsTrigger>
                                <TabsTrigger value="reservations">Reservations</TabsTrigger>
                                <TabsTrigger value="add-review">Add Review</TabsTrigger>
                                <TabsTrigger value="security">Security</TabsTrigger>
                                <TabsTrigger value="support">Support</TabsTrigger>
                            </TabsList>
                        )}

                        <TabsContent value="profile">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>Update your personal details here.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Form content remains the same */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} />
                                        </div>

                                        <div className="space-y-4 pt-4 border-t">
                                            <h3 className="text-lg font-medium">Shipping Address</h3>
                                            <div className="space-y-2">
                                                <Label htmlFor="street">Street Address</Label>
                                                <Input id="street" name="street" value={formData.address.street} onChange={handleAddressChange} />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="city">City</Label>
                                                    <Input id="city" name="city" value={formData.address.city} onChange={handleAddressChange} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="state">State / Province</Label>
                                                    <Input id="state" name="state" value={formData.address.state} onChange={handleAddressChange} />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="postalCode">Postal Code</Label>
                                                    <Input id="postalCode" name="postalCode" value={formData.address.postalCode} onChange={handleAddressChange} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="country">Country</Label>
                                                    <Input id="country" name="country" value={formData.address.country} onChange={handleAddressChange} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                          <Button type="submit" disabled={loadingUpdate}>
                                            {loadingUpdate ? 'Saving...' : 'Save Changes'}
                                          </Button>
                                        </div>
                                    </form>

                                    <div className="space-y-4 pt-4 border-t">
                                        <h3 className="text-lg font-medium">Profile Picture</h3>
                                        <div className="flex items-center gap-4">
                                            <img src={user.image || 'https://placehold.co/150'} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
                                            <div>
                                                <Input id="profileImage" type="file" />
                                                <Button className="mt-2" onClick={async () => {
                                                    const imageInput = document.querySelector('#profileImage');
                                                    if (imageInput.files.length > 0) {
                                                        const result = await updateProfileImage(imageInput.files[0]);
                                                        if (result.success) {
                                                            toast.success('Profile image updated successfully!');
                                                        } else {
                                                            toast.error(result.message || 'Failed to update profile image.');
                                                        }
                                                    }
                                                }}>Upload</Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="orders">
                            <UserOrders />
                        </TabsContent>
                        <TabsContent value="reservations">
                            <UserReservations />
                        </TabsContent>
                        <TabsContent value="add-review">
                            <AddReviewForm />
                        </TabsContent>
                        <TabsContent value="security">
                            <UpdatePasswordForm />
                        </TabsContent>
                        <TabsContent value="support">
                            <OpenTicketForm />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </>
    );
};

export default AccountPage;
