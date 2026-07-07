import { useState } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { getCartSessionId } from "@/lib/cart-session";
import ProductImage from "@/components/ProductImage";
import {
  Star,
  ShoppingCart,
  Shield,
  FileType,
  HardDrive,
  Tag,
  ArrowLeft,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const sessionId = getCartSessionId();

  const { data: product, isLoading } = trpc.product.getBySlug.useQuery(
    { slug: slug ?? "" },
    { enabled: !!slug }
  );

  const utils = trpc.useUtils();
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  const createReview = trpc.review.create.useMutation({
    onSuccess: () => {
      utils.product.getBySlug.invalidate({ slug: slug ?? "" });
      setReviewOpen(false);
      setReviewRating(5);
      setReviewComment("");
    },
  });

  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/50 text-lg mb-4">Product not found</p>
          <Link
            to="/products"
            className="text-[#ff5500] hover:underline"
          >
            Browse all products
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart.mutate(
      { productId: product.id, sessionId },
      {
        onSuccess: () => {
          setAddedToCart(true);
          setTimeout(() => setAddedToCart(false), 2000);
        },
      }
    );
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    createReview.mutate({
      productId: product.id,
      rating: reviewRating,
      comment: reviewComment,
    });
  };

  const tags: string[] = (product.tags as string[]) ?? [];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-white/50 text-sm hover:text-[#ff5500] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="rounded-lg overflow-hidden bg-[#1a1d22] border border-white/5">
            <ProductImage
              src={product.image}
              alt={product.title}
              fileType={product.fileType}
              className="w-full aspect-video object-cover"
            />
          </div>

          {/* Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-0.5 bg-[#ff5500]/10 text-[#ff5500] text-xs font-medium rounded">
                {product.fileType}
              </span>
              {product.isFeatured && (
                <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded">
                  Featured
                </span>
              )}
              <span className="px-2 py-0.5 bg-white/5 text-white/50 text-xs rounded">
                {product.licenseType} License
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {product.title}
            </h1>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.round(Number(product.rating))
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-white/20"
                    }`}
                  />
                ))}
                <span className="text-white/60 text-sm ml-1">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
              <span className="text-white/30">|</span>
              <span className="text-white/50 text-sm">
                {product.salesCount} sold
              </span>
            </div>

            <div className="text-4xl font-bold text-[#ff5500] mb-6">
              ${product.price}
            </div>

            <p className="text-white/60 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {product.fileSize && (
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <HardDrive className="w-4 h-4" />
                  <span>{product.fileSize}</span>
                </div>
              )}
              {product.fileType && (
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <FileType className="w-4 h-4" />
                  <span>{product.fileType} format</span>
                </div>
              )}
              {product.version && (
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <Tag className="w-4 h-4" />
                  <span>v{product.version}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Shield className="w-4 h-4" />
                <span>{product.licenseType} license</span>
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-white/5 text-white/50 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addToCart.isPending}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#ff5500] text-white font-medium rounded hover:bg-[#e64d00] transition-all disabled:opacity-50"
              >
                {addedToCart ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Added!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              <Link
                to="/cart"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-white/20 text-white font-medium rounded hover:border-[#ff5500] hover:text-[#ff5500] transition-all"
              >
                View Cart
              </Link>
            </div>

            {product.requirements && (
              <div className="mt-4 p-3 bg-white/5 rounded text-white/50 text-sm">
                <span className="font-medium">Requirements:</span> {product.requirements}
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Reviews ({product.reviews?.length ?? 0})
            </h2>
            {isAuthenticated && (
              <button
                onClick={() => setReviewOpen(!reviewOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded text-white text-sm hover:border-[#ff5500] hover:text-[#ff5500] transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Write a Review
              </button>
            )}
          </div>

          {/* Review Form */}
          {reviewOpen && (
            <form
              onSubmit={handleSubmitReview}
              className="mb-8 p-6 bg-[#1a1d22] border border-white/5 rounded-lg"
            >
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= reviewRating
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-white/20"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-white/70 text-sm mb-2 block">Comment</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#ff5500]"
                  placeholder="Share your experience..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createReview.isPending}
                  className="px-6 py-2 bg-[#ff5500] text-white text-sm font-medium rounded hover:bg-[#e64d00] transition-colors disabled:opacity-50"
                >
                  {createReview.isPending ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setReviewOpen(false)}
                  className="px-6 py-2 border border-white/20 text-white text-sm rounded hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Review List */}
          <div className="space-y-4">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-5 bg-[#1a1d22] border border-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-[#ff5500]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#ff5500] text-xs font-bold">
                        {(review.userName ?? "U").charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="text-white text-sm font-medium">
                        {review.userName ?? "Anonymous"}
                      </span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-white/20"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-white/40 text-center py-8">
                No reviews yet. Be the first to review!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
