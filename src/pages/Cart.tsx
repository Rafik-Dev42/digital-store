import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { getCartSessionId } from "@/lib/cart-session";
import ProductImage from "@/components/ProductImage";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Package,
  CreditCard,
} from "lucide-react";

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const sessionId = getCartSessionId();
  const [orderSuccess, setOrderSuccess] = useState<{ id: number; total: string } | null>(null);

  const { data: cartItems, isLoading } = trpc.cart.get.useQuery({ sessionId });
  const utils = trpc.useUtils();

  const removeItem = trpc.cart.remove.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });

  const clearCart = trpc.cart.clear.useMutation({
    onSuccess: () => utils.cart.get.invalidate(),
  });

  const createOrder = trpc.order.create.useMutation({
    onSuccess: (data) => {
      clearCart.mutate({ sessionId });
      setOrderSuccess({ id: data.orderId, total: data.totalAmount });
    },
  });

  const items = cartItems ?? [];

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.product?.price ?? "0");
      return sum + price * item.quantity;
    }, 0);
  }, [items]);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const orderItems = items.map((item) => ({
      productId: item.product!.id,
      price: item.product!.price,
    }));
    createOrder.mutate({ items: orderItems });
  };

  if (isLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#ff5500] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Placed!</h2>
          <p className="text-white/50 mb-2">
            Order #{orderSuccess.id} confirmed
          </p>
          <p className="text-[#ff5500] font-bold text-xl mb-6">
            Total: ${orderSuccess.total}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/products"
              className="px-6 py-3 bg-[#ff5500] text-white font-medium rounded-lg hover:bg-[#e64d00] transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/"
              className="px-6 py-3 border border-white/20 text-white font-medium rounded-lg hover:border-[#ff5500] transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-white/30" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-white/50 mb-6">
            Browse our products and add items to your cart
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff5500] text-white font-medium rounded hover:bg-[#e64d00] transition-colors"
          >
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7 text-[#ff5500]" />
          Shopping Cart
          <span className="text-lg text-white/50 font-normal">
            ({items.length} items)
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-[#1a1d22] border border-white/5 rounded-lg"
              >
                <div className="w-24 h-20 rounded overflow-hidden flex-shrink-0">
                  <ProductImage
                    src={item.product?.image}
                    alt={item.product?.title ?? "Product"}
                    fileType={item.product?.fileType}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${item.product?.slug ?? ""}`}
                    className="text-white font-medium hover:text-[#ff5500] transition-colors line-clamp-1"
                  >
                    {item.product?.title}
                  </Link>
                  <p className="text-white/50 text-xs mt-1">
                    {item.product?.fileType} &middot; {item.product?.licenseType}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[#ff5500] font-bold">
                      ${item.product?.price}
                    </span>
                    <button
                      onClick={() => removeItem.mutate({ itemId: item.id })}
                      className="p-1.5 text-white/30 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={() => clearCart.mutate({ sessionId })}
              className="text-white/40 text-sm hover:text-red-400 transition-colors"
            >
              Clear all items
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#1a1d22] border border-white/5 rounded-lg p-6 sticky top-24">
              <h3 className="text-white font-semibold mb-4">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Subtotal</span>
                  <span className="text-white">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Tax</span>
                  <span className="text-white">$0.00</span>
                </div>
                <div className="border-t border-white/10 pt-3 flex justify-between">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-[#ff5500] font-bold text-xl">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={createOrder.isPending}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#ff5500] text-white font-medium rounded hover:bg-[#e64d00] transition-all disabled:opacity-50"
              >
                <CreditCard className="w-5 h-5" />
                {createOrder.isPending
                  ? "Processing..."
                  : isAuthenticated
                  ? "Place Order"
                  : "Sign In to Checkout"}
              </button>

              {!isAuthenticated && (
                <p className="text-white/40 text-xs text-center mt-3">
                  You need to sign in before checkout
                </p>
              )}

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <Package className="w-3.5 h-3.5" />
                  <span>Instant digital delivery</span>
                </div>
                <div className="flex items-center gap-2 text-white/40 text-xs">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Secure payment processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
