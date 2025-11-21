import { Star, Calendar, User, Package } from 'lucide-react';

interface Review {
  id: string;
  contact_number: string;
  user_name: string;
  product_name: string;
  product_review: string;
  created_at: string;
}

interface ReviewsListProps {
  reviews: Review[];
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="grid gap-6">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-600">Reviewer</p>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {review.user_name}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-600">Product</p>
                </div>
                <p className="text-lg font-semibold text-slate-900">
                  {review.product_name}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <p className="text-sm text-slate-600">Date</p>
                </div>
                <p className="text-sm text-slate-700">
                  {formatDate(review.created_at)}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-2 mb-2">
                <Star className="w-4 h-4 text-amber-500 flex-shrink-0 mt-1" />
                <p className="text-sm text-slate-600">Review</p>
              </div>
              <p className="text-slate-700 leading-relaxed bg-slate-50 rounded p-3 border border-slate-100">
                {review.product_review}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              From: {review.contact_number}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}