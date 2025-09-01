import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

const AccountPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isLoading, updateProfile, logout } = useAuth();

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
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || '',
        },
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
        <title>My Account - Your Store</title>
      </Helmet>
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Account</h1>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default AccountPage;
