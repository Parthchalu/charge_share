import React, { useState } from 'react';
import { Review, Charger } from '@/api/entities';
import { Star, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function StarRating({ rating, onRatingChange, size = "w-8 h-8" }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRatingChange(star)}
          className={`${size} transition-colors hover:scale-110 transform duration-150`}
        >
          <Star
            className={`w-full h-full ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function RatingForm({ booking, charger, onSubmit, onCancel }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      // Create the review
      await Review.create({
        booking_id: booking.id,
        driver_id: booking.driver_id,
        charger_id: booking.charger_id,
        host_id: charger.host_id,
        rating: rating,
        comment: comment.trim()
      });

      // Update charger's average rating
      const allReviews = await Review.filter({ charger_id: booking.charger_id });
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / allReviews.length;

      await Charger.update(booking.charger_id, {
        rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
        total_reviews: allReviews.length
      });

      onSubmit();
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Rate Your Experience</CardTitle>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Charger Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg">{charger.title}</h3>
            <p className="text-gray-500 text-sm">{charger.address}</p>
          </div>

          {/* Rating Stars */}
          <div className="text-center space-y-2">
            <p className="text-gray-700 font-medium">How was your charging experience?</p>
            <StarRating rating={rating} onRatingChange={setRating} />
            <p className="text-sm text-gray-500">
              {rating === 0 && "Tap a star to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Comment */}
          <div>
            <Textarea
              placeholder="Share your experience (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="h-24"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Submitting...' : 'Submit Rating'}
            <Send className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}