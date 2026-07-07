import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import ProductImage from "@/components/ProductImage";
import {
  Users,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  BarChart3,
  Package,
  Shield,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="bg-[#1a1d22] border border-white/5 rounded-lg p-5">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/50 text-sm">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "orders" | "products">("overview");
  const [userPage, setUserPage] = useState(1);
  const [orderPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");

  // Redirect non-admin users
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      navigate("/");
    }
  }, [authLoading, isAuthenticated, isAdmin, navigate]);

  const { data: stats } = trpc.admin.stats.useQuery(undefined, {
    enabled: isAdmin,
  });

  const { data: usersData } = trpc.admin.users.useQuery(
    { page: userPage, limit: 10, search: userSearch || undefined },
    { enabled: isAdmin && activeTab === "users" }
  );

  const { data: ordersData } = trpc.admin.orders.useQuery(
    { page: orderPage, limit: 10 },
    { enabled: isAdmin && activeTab === "orders" }
  );

  const { data: productsData } = trpc.product.list.useQuery(
    { page: 1, limit: 20 },
    { enabled: isAdmin && activeTab === "products" }
  );

  if (authLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "orders" as const, label: "Orders", icon: ShoppingBag },
    { id: "products" as const, label: "Products", icon: Package },
  ];

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-6 h-6 text-[#ff5500]" />
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "bg-[#ff5500] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Total Users"
                value={stats?.totalUsers ?? 0}
                color="#3b82f6"
              />
              <StatCard
                icon={Package}
                label="Total Products"
                value={stats?.totalProducts ?? 0}
                color="#10b981"
              />
              <StatCard
                icon={ShoppingBag}
                label="Total Orders"
                value={stats?.totalOrders ?? 0}
                color="#f59e0b"
              />
              <StatCard
                icon={DollarSign}
                label="Total Revenue"
                value={`$${Number(stats?.totalRevenue ?? 0).toFixed(2)}`}
                color="#ff5500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-[#1a1d22] border border-white/5 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#ff5500]" />
                  Recent Orders
                </h3>
                <div className="space-y-3">
                  {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                    stats.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-white/5 rounded"
                      >
                        <div>
                          <div className="text-white text-sm font-medium">
                            Order #{order.id}
                          </div>
                          <div className="text-white/40 text-xs">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#ff5500] font-medium text-sm">
                            ${order.totalAmount}
                          </div>
                          <div
                            className={`text-xs capitalize ${
                              order.status === "completed"
                                ? "text-green-400"
                                : order.status === "pending"
                                ? "text-yellow-400"
                                : "text-red-400"
                            }`}
                          >
                            {order.status}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/40 text-sm text-center py-4">
                      No orders yet
                    </p>
                  )}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-[#1a1d22] border border-white/5 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#ff5500]" />
                  Top Products
                </h3>
                <div className="space-y-3">
                  {stats?.topProducts && stats.topProducts.length > 0 ? (
                    stats.topProducts.map((product, i) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded"
                      >
                        <div className="w-6 h-6 bg-[#ff5500]/20 rounded flex items-center justify-center text-xs text-[#ff5500] font-bold">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm truncate">
                            {product.title}
                          </div>
                          <div className="text-white/40 text-xs">
                            {product.salesCount} sales
                          </div>
                        </div>
                        <div className="text-[#ff5500] font-medium text-sm">
                          ${product.price}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/40 text-sm text-center py-4">
                      No products yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-[#1a1d22] border border-white/5 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                  placeholder="Search users..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff5500]"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">ID</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Name</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Email</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Role</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Auth</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData?.users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-white/60 text-sm">#{user.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-[#ff5500]/20 rounded-full flex items-center justify-center">
                            <span className="text-[#ff5500] text-xs font-bold">
                              {(user.name ?? "U").charAt(0)}
                            </span>
                          </div>
                          <span className="text-white text-sm">{user.name ?? "N/A"}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">{user.email ?? "N/A"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            user.role === "admin"
                              ? "bg-[#ff5500]/20 text-[#ff5500]"
                              : "bg-white/5 text-white/50"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/50 text-sm capitalize">
                        {user.authType ?? "oauth"}
                      </td>
                      <td className="py-3 px-4 text-white/40 text-sm">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {usersData && usersData.total > 10 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setUserPage(Math.max(1, userPage - 1))}
                  disabled={userPage === 1}
                  className="p-2 text-white/50 hover:text-white disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-white/50 text-sm">
                  Page {userPage}
                </span>
                <button
                  onClick={() => setUserPage(userPage + 1)}
                  disabled={usersData.users.length < 10}
                  className="p-2 text-white/50 hover:text-white disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div className="bg-[#1a1d22] border border-white/5 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Order ID</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">User</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Amount</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Status</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersData?.orders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-white text-sm font-medium">
                        #{order.id}
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        User #{order.userId}
                      </td>
                      <td className="py-3 px-4 text-[#ff5500] font-medium text-sm">
                        ${order.totalAmount}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-xs rounded capitalize ${
                            order.status === "completed"
                              ? "bg-green-500/20 text-green-400"
                              : order.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : order.status === "failed"
                              ? "bg-red-500/20 text-red-400"
                              : "bg-white/5 text-white/50"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white/40 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="bg-[#1a1d22] border border-white/5 rounded-lg p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Product</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Price</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Sales</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Rating</th>
                    <th className="text-left text-white/50 text-xs font-medium py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {productsData?.products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded overflow-hidden bg-white/5">
                            <ProductImage
                              src={product.image}
                              alt={product.title}
                              fileType={product.fileType}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="text-white text-sm font-medium">
                              {product.title}
                            </div>
                            <div className="text-white/40 text-xs">
                              {product.fileType} &middot; {product.licenseType}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#ff5500] font-medium text-sm">
                        ${product.price}
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        {product.salesCount}
                      </td>
                      <td className="py-3 px-4 text-white/60 text-sm">
                        {product.rating} ({product.reviewCount})
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            product.isPublished
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {product.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
