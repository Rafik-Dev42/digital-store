import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import ProductImage from "@/components/ProductImage";
import {
  Search,
  SlidersHorizontal,
  Star,
  Grid3X3,
  List,
  X,
} from "lucide-react";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Highest Rated" },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "newest");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: categories } = trpc.product.getCategories.useQuery();
  const { data, isLoading } = trpc.product.list.useQuery({
    category: category || undefined,
    search: search || undefined,
    sort: sort as "newest" | "price-asc" | "price-desc" | "popular" | "rating",
    page,
    limit: 12,
  });

  const products = data?.products ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (sort && sort !== "newest") params.sort = sort;
    setSearchParams(params);
  }, [search, category, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            All Products
          </h1>
          <p className="text-white/50">
            {total} products available
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search products..."
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/40 text-sm focus:outline-none focus:border-[#ff5500]"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(""); setPage(1); }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-white/40 hover:text-white" />
              </button>
            )}
          </form>

          {/* Filters Toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>

          {/* Category Filter (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5500]"
            >
              <option value="">All Categories</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff5500]"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2.5 ${viewMode === "grid" ? "bg-[#ff5500] text-white" : "text-white/50 hover:text-white"}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2.5 ${viewMode === "list" ? "bg-[#ff5500] text-white" : "text-white/50 hover:text-white"}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Filters */}
        {filtersOpen && (
          <div className="md:hidden mb-6 p-4 bg-[#1a1d22] border border-white/5 rounded-lg">
            <div className="space-y-3">
              <div>
                <label className="text-white/50 text-sm mb-2 block">Category</label>
                <select
                  value={category}
                  onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="">All Categories</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(search || category) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {search && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ff5500]/10 text-[#ff5500] text-xs rounded-full">
                Search: {search}
                <button onClick={() => setSearch("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#ff5500]/10 text-[#ff5500] text-xs rounded-full">
                Category: {categories?.find((c) => c.slug === category)?.name ?? category}
                <button onClick={() => setCategory("")}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Products Grid/List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-[#1a1d22] border border-white/5 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-1/4" />
                  <div className="h-5 bg-white/5 rounded w-3/4" />
                  <div className="h-4 bg-white/5 rounded w-full" />
                  <div className="flex justify-between">
                    <div className="h-5 bg-white/5 rounded w-16" />
                    <div className="h-4 bg-white/5 rounded w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/50 text-lg">No products found</p>
            <button
              onClick={() => { setSearch(""); setCategory(""); setSort("newest"); }}
              className="mt-4 text-[#ff5500] text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group block bg-[#1a1d22] border border-white/5 rounded-lg overflow-hidden hover:border-[#ff5500]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(255,85,0,0.1)]"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    fileType={product.fileType}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#ff5500]/10 text-[#ff5500] text-xs font-medium rounded">
                      {product.fileType}
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 text-white/50 text-xs rounded">
                      {product.licenseType}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-2 group-hover:text-[#ff5500] transition-colors line-clamp-1">
                    {product.title}
                  </h3>
                  <p className="text-white/50 text-sm mb-3 line-clamp-2">
                    {product.shortDesc ?? product.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-[#ff5500] font-bold text-lg">
                      ${product.price}
                    </span>
                    <div className="flex items-center gap-3 text-white/40 text-xs">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        {product.rating}
                      </span>
                      <span>{product.salesCount} sold</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="group flex gap-6 bg-[#1a1d22] border border-white/5 rounded-lg overflow-hidden hover:border-[#ff5500]/30 transition-all p-4"
              >
                <div className="w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                  <ProductImage
                    src={product.image}
                    alt={product.title}
                    fileType={product.fileType}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#ff5500]/10 text-[#ff5500] text-xs font-medium rounded">
                      {product.fileType}
                    </span>
                    <span className="text-white/40 text-xs">
                      {categories?.find((c) => c.id === product.categoryId)?.name ?? "Digital"}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-1 group-hover:text-[#ff5500] transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-white/50 text-sm mb-3 line-clamp-2">
                    {product.shortDesc ?? product.description}
                  </p>
                  <div className="flex items-center gap-4">
                    <span className="text-[#ff5500] font-bold">${product.price}</span>
                    <span className="flex items-center gap-1 text-white/40 text-xs">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      {product.rating} ({product.reviewCount})
                    </span>
                    <span className="text-white/40 text-xs">{product.salesCount} sold</span>
                  </div>
                </div>
              </Link>
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
