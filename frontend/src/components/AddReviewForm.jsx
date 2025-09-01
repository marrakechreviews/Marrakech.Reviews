import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';

const AddReviewForm = () => {
    const [purchasedProducts, setPurchasedProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState('');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPurchasedProducts = async () => {
            try {
                const response = await api.get('/orders/myorders');
                if (response.data.success) {
                    const products = response.data.data.flatMap(order =>
                        order.orderItems.map(item => ({
                            _id: item.product,
                            name: item.name
                        }))
                    );
                    // Remove duplicates
                    const uniqueProducts = Array.from(new Set(products.map(p => p._id)))
                        .map(id => {
                            return products.find(p => p._id === id)
                        });
                    setPurchasedProducts(uniqueProducts);
                }
            } catch (err) {
                console.error("Failed to fetch purchased products", err);
            }
        };
        fetchPurchasedProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct || rating === 0) {
            toast.error("Please select a product and provide a rating.");
            return;
        }
        setLoading(true);

        const formData = new FormData();
        formData.append('product', selectedProduct);
        formData.append('rating', rating);
        formData.append('comment', comment);

        const imageInput = document.querySelector('#images');
        if (imageInput.files.length > 0) {
            for (const file of imageInput.files) {
                formData.append('images', file);
            }
        }

        try {
            const response = await api.post('/reviews', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data.success) {
                toast.success("Review submitted successfully!");
                setSelectedProduct('');
                setRating(0);
                setComment('');
                imageInput.value = '';
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit review.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add a Review</CardTitle>
                <CardDescription>Share your thoughts on a product you've purchased.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="product">Product</Label>
                        <Select onValueChange={setSelectedProduct} value={selectedProduct}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a product to review" />
                            </SelectTrigger>
                            <SelectContent>
                                {purchasedProducts.map(product => (
                                    <SelectItem key={product._id} value={product._id}>
                                        {product.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Button
                                    key={star}
                                    type="button"
                                    variant={rating >= star ? "primary" : "outline"}
                                    size="icon"
                                    onClick={() => setRating(star)}
                                >
                                    &#9733;
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment</Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="What did you like or dislike?"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="images">Images (optional)</Label>
                        <Input id="images" type="file" multiple />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default AddReviewForm;
