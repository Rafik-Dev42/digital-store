import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { maskEmail } from "@/lib/format";
import {
  Star,
  MessageSquare,
  Send,
  Quote,
} from "lucide-react";

export default function FeedbackWall() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading } = trpc.feedback.list.useQuery({ page: 1, limit: 20 });
  const utils = trpc.useUtils();

  const createFeedback = trpc.feedback.create.useMutation({
    onSuccess: () => {
      utils.feedback.list.invalidate();
      setSubmitted(true);
      setName("");
      setEmail("");
      setMessage("");
      setRating(5);
      setTimeout(() => setSubmitted(false), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createFeedback.mutate({ name, email, message, rating });
  };

  const feedbacks = data?.feedback ?? [];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Feedback Wall
          </h1>
          <p className="text-white/50 max-w-lg mx-auto">
            Real voices from our community. Share your experience with NEXUS and see what others are saying.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Feedback Form */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1d22] border border-white/5 rounded-lg p-6 sticky top-24">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#ff5500]" />
                Share Your Experience
              </h3>

              {submitted ? (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
                  <Star className="w-8 h-8 mx-auto mb-2 text-green-400 fill-green-400" />
                  Thank you for your feedback!
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-white/70 text-sm mb-1.5 block">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5500]"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5500]"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-1.5 block">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-white/20"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-white/70 text-sm mb-1.5 block">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff5500]"
                      placeholder="Tell us about your experience..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={createFeedback.isPending}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-[#ff5500] text-white text-sm font-medium rounded-lg hover:bg-[#e64d00] transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {createFeedback.isPending ? "Submitting..." : "Submit Feedback"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Feedback Cards */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-5 bg-[#1a1d22] border border-white/5 rounded-lg animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-1/4 mb-3" />
                  <div className="h-4 bg-white/5 rounded w-full mb-2" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                </div>
              ))
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-16">
                <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">No feedback yet. Be the first to share!</p>
              </div>
            ) : (
              feedbacks.map((item) => (
                <div
                  key={item.id}
                  className="p-5 bg-[#1a1d22] border border-white/5 rounded-lg hover:border-[#ff5500]/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#ff5500] to-[#ff8c00] rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-white font-medium text-sm">
                            {item.name}
                          </span>
                          <span className="text-white/30 text-xs ml-2">
                            {maskEmail(item.email)}
                          </span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (item.rating ?? 5)
                                  ? "text-yellow-500 fill-yellow-500"
                                  : "text-white/10"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <Quote className="absolute -left-1 -top-1 w-5 h-5 text-[#ff5500]/20" />
                        <p className="text-white/60 text-sm leading-relaxed pl-5">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
