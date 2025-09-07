import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const renderStars = (rating) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-5 w-5 ${
        i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
      }`}
    />
  ));
};

const ReviewsList = ({ reviews, isLoading }) => {
  if (isLoading) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Guest Reviews</CardTitle>
            </CardHeader>
            <CardContent>
                <p>Loading reviews...</p>
            </CardContent>
        </Card>
    )
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No reviews yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Guest Reviews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center mb-2">
                <Avatar>
                    <AvatarImage src={review.user?.image} alt={review.user?.name || review.name} />
                    <AvatarFallback>{(review.user?.name || review.name).charAt(0)}</AvatarFallback>
                </Avatar>
              <div className="ml-4">
                <p className="font-semibold">{review.user?.name || review.name}</p>
                <div className="flex items-center">
                    {renderStars(review.rating)}
                </div>
              </div>
            </div>
            <p className="text-gray-600 mt-2">{review.comment}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ReviewsList;
