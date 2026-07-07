import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import {
  MessageSquare,
  ThumbsUp,
  Pin,
  Plus,
  X,
  HelpCircle,
  Users,
  Sparkles,
} from "lucide-react";

const categories = [
  { value: "", label: "All", icon: MessageSquare },
  { value: "question", label: "Questions", icon: HelpCircle },
  { value: "discussion", label: "Discussions", icon: Users },
  { value: "showcase", label: "Showcase", icon: Sparkles },
];

export default function CommunityHub() {
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("");
  const [sort, setSort] = useState<"newest" | "popular" | "top">("newest");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<"question" | "discussion" | "showcase">("discussion");
  const [newTags, setNewTags] = useState("");

  const { data, isLoading } = trpc.community.listPosts.useQuery({
    category: activeCategory || undefined,
    sort,
    page,
    limit: 10,
  });

  const utils = trpc.useUtils();
  const createPost = trpc.community.createPost.useMutation({
    onSuccess: () => {
      utils.community.listPosts.invalidate();
      setCreateOpen(false);
      setNewTitle("");
      setNewContent("");
      setNewTags("");
    },
  });

  const upvotePost = trpc.community.upvotePost.useMutation({
    onSuccess: () => utils.community.listPosts.invalidate(),
  });

  const posts = data?.posts ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    createPost.mutate({
      title: newTitle,
      content: newContent,
      category: newCategory,
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Community Hub
            </h1>
            <p className="text-white/50">
              Connect, share, and learn with fellow creators
            </p>
          </div>
          {isAuthenticated && (
            <button
              onClick={() => setCreateOpen(!createOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-[#ff5500] text-white text-sm font-medium rounded hover:bg-[#e64d00] transition-colors"
            >
              {createOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {createOpen ? "Cancel" : "New Post"}
            </button>
          )}
        </div>

        {/* Create Post Form */}
        {createOpen && (
          <form
            onSubmit={handleCreatePost}
            className="mb-8 p-6 bg-[#1a1d22] border border-white/5 rounded-lg"
          >
            <h3 className="text-white font-semibold mb-4">Create New Post</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white/70 text-sm mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5500]"
                  placeholder="What's on your mind?"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white/70 text-sm mb-1.5 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as "question" | "discussion" | "showcase")}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5500]"
                  >
                    <option value="discussion">Discussion</option>
                    <option value="question">Question</option>
                    <option value="showcase">Showcase</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-1.5 block">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff5500]"
                    placeholder="react, tutorial"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/70 text-sm mb-1.5 block">Content</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff5500]"
                  placeholder="Describe your post..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={createPost.isPending}
                className="px-6 py-2.5 bg-[#ff5500] text-white text-sm font-medium rounded hover:bg-[#e64d00] transition-colors disabled:opacity-50"
              >
                {createPost.isPending ? "Posting..." : "Publish Post"}
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => { setActiveCategory(cat.value); setPage(1); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.value
                    ? "bg-[#ff5500] text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as "newest" | "popular" | "top"); setPage(1); }}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#ff5500]"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Viewed</option>
              <option value="top">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 bg-[#1a1d22] border border-white/5 rounded-lg animate-pulse">
                <div className="h-5 bg-white/5 rounded w-3/4 mb-3" />
                <div className="h-4 bg-white/5 rounded w-full mb-2" />
                <div className="h-4 bg-white/5 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50">No posts yet. Be the first to start a conversation!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-5 bg-[#1a1d22] border border-white/5 rounded-lg hover:border-[#ff5500]/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#ff5500]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-[#ff5500] font-bold text-sm">
                      {(post.userName ?? "U").charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {post.isPinned && (
                        <Pin className="w-3.5 h-3.5 text-[#ff5500]" />
                      )}
                      <span className="px-2 py-0.5 bg-white/5 text-white/50 text-xs rounded capitalize">
                        {post.category}
                      </span>
                      <span className="text-white/30 text-xs">
                        by {post.userName ?? "Anonymous"}
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-2 hover:text-[#ff5500] transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                    <p className="text-white/50 text-sm line-clamp-2 mb-3">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => upvotePost.mutate({ postId: post.id })}
                        className="flex items-center gap-1 text-white/40 text-xs hover:text-[#ff5500] transition-colors"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {post.upvotes ?? 0}
                      </button>
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {post.views ?? 0} views
                      </span>
                      {post.tags && (post.tags as string[]).length > 0 && (
                        <div className="flex gap-1">
                          {(post.tags as string[]).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 bg-white/5 text-white/40 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded text-white/70 text-sm disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              Previous
            </button>
            <span className="text-white/50 text-sm px-3">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded text-white/70 text-sm disabled:opacity-30 hover:bg-white/10 transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
