'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, User, MessageSquare, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/ui/rating-stars';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { cn } from '@/lib/utils';
import { getProductReviews, submitReview } from '@/lib/api/reviews';

export interface Review {
  user_id: number;
  user_name: string;
  avatar: string;
  rating: number;
  comment: string;
  time: string;
}

interface ProductReviewsProps {
  productId: number;
  /**
   * Suppress the internal "Customer Reviews" <h2>. Set when the component is
   * rendered inside something that already labels it — e.g. the grocery
   * detail page nests it in an accordion titled "Reviews".
   */
  hideHeading?: boolean;
}

function ReviewSkeleton() {
  return (
    <div className="flex gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-[8px]">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function StarRatingSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-0.5 transition-all duration-300 hover:scale-110"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={cn(
              'h-6 w-6 transition-all duration-300',
              (hovered || value) >= star
                ? 'fill-accent text-accent'
                : 'fill-none text-neutral-300 dark:text-neutral-600'
            )}
          />
        </button>
      ))}
    </div>
  );
}

function RatingSummary({
  reviews,
  totalCount,
}: {
  reviews: Review[];
  totalCount: number;
}) {
  const average =
    totalCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalCount
      : 0;

  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;
    const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
    return { star, count, percentage };
  });

  return (
    <div className="flex flex-col sm:flex-row gap-6 p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-[8px]">
      <div className="flex flex-col items-center justify-center gap-1 min-w-[120px]">
        <span className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          {average.toFixed(1)}
        </span>
        <RatingStars rating={average} />
        <span className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
        </span>
      </div>

      <div className="flex-1 space-y-1.5">
        {distribution.map(({ star, count, percentage }) => (
          <div key={star} className="flex items-center gap-2 text-sm">
            <span className="w-8 text-right text-neutral-600 dark:text-neutral-400">
              {star}
            </span>
            <Star className="h-3.5 w-3.5 fill-accent text-accent" />
            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="w-8 text-neutral-500 dark:text-neutral-400">
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="flex gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-[8px] transition-all duration-300 hover:border-neutral-300 dark:hover:border-neutral-600">
      <div className="shrink-0">
        {review.avatar ? (
          <img
            src={review.avatar}
            alt={review.user_name}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
            <User className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              {review.user_name}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <RatingStars rating={review.rating} />
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {review.time}
              </span>
            </div>
          </div>
        </div>

        {review.comment && (
          <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {review.comment}
          </p>
        )}
      </div>
    </div>
  );
}

export function ProductReviews({ productId, hideHeading = false }: ProductReviewsProps) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getProductReviews(productId);
      setReviews(response.data ?? []);
    } catch {
      showToast('Failed to load reviews. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  }, [productId, showToast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newRating === 0) {
      showToast('Please select a star rating before submitting.', 'error');
      return;
    }

    if (!newComment.trim()) {
      showToast('Please write a comment before submitting.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await submitReview({
        product_id: productId,
        rating: newRating,
        comment: newComment.trim(),
      });
      showToast('Thank you for sharing your experience!', 'success');
      setNewRating(0);
      setNewComment('');
      setShowForm(false);
      await fetchReviews();
    } catch {
      showToast('Failed to submit review. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex flex-col sm:flex-row gap-6 p-5 bg-neutral-50 dark:bg-neutral-800/50 rounded-[8px]">
          <div className="flex flex-col items-center gap-2 min-w-[120px]">
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex-1 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-3 w-full" />
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <ReviewSkeleton />
          <ReviewSkeleton />
          <ReviewSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        {hideHeading ? (
          <span aria-hidden="true" />
        ) : (
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Customer Reviews
          </h2>
        )}
        {user && !showForm && (
          <Button
            variant="accent"
            onClick={() => setShowForm(true)}
          >
            <MessageSquare className="h-4 w-4" />
            Write a Review
          </Button>
        )}
      </div>

      {reviews.length > 0 && (
        <RatingSummary reviews={reviews} totalCount={reviews.length} />
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-5 border border-accent/30 bg-accent/5 dark:bg-accent/10 rounded-[8px] transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Write Your Review
            </h3>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewRating(0);
                setNewComment('');
              }}
              className="p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-all duration-300"
              aria-label="Close review form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Your Rating
            </label>
            <StarRatingSelector value={newRating} onChange={setNewRating} />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="review-comment"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Your Review
            </label>
            <textarea
              id="review-comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your experience with this product..."
              rows={4}
              className={cn(
                'w-full px-3 py-2 text-sm rounded-[8px] border transition-all duration-300 resize-none',
                'border-neutral-300 dark:border-neutral-600',
                'bg-white dark:bg-neutral-800',
                'text-neutral-900 dark:text-neutral-100',
                'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
                'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent'
              )}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="accent"
              disabled={submitting}
              isLoading={submitting}
              icon={!submitting ? <Send className="h-4 w-4" /> : undefined}
            >
              Submit Review
            </Button>
          </div>
        </form>
      )}

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-14 w-14 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
            <MessageSquare className="h-7 w-7 text-neutral-400 dark:text-neutral-500" />
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 font-medium">
            No reviews yet. Be the first to share your experience.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard key={`${review.user_id}-${review.time}`} review={review} />
          ))}
        </div>
      )}
    </section>
  );
}
