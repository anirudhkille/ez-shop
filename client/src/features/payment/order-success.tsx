import type { TAddress } from "@/types/address";

import { formatPrice } from "@/lib/formatPrice";

type OrderProduct = {
  product: {
    _id: string | undefined;
    name: string | undefined;
    image: string | undefined;
  };
  quantity: number;
  price: number;
  _id: string | undefined;
};

export type Order = {
  _id: string;
  user: string | undefined;
  email: string | undefined;
  products: OrderProduct[];
  address: TAddress;
  deliveryMethod: string | undefined;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentStatus: string;
  paymentType: string;
  paymentIntentId: string | undefined;
  sessionId: string | undefined;
  orderStatus: string | undefined;
  createdAt: string | number | undefined;
  updatedAt: string | number | undefined;
};

function maskPhone(phone: string | undefined) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const last4 = digits.slice(-4);
    const prefix = digits.length > 10 ? digits.slice(0, digits.length - 10) + " " : "";
    return `+${prefix}xxxx${last4}`;
  }

  return phone.replace(/.(?=.{2})/g, "x");
}

function maskEmail(email: string | undefined) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  const maskedName = name.length > 1 ? `${name[0]}***${name.slice(-1)}` : `${name[0]}***`;
  const domainParts = domain?.split(".");
  if (!domainParts) return `${maskedName}@***`;
  return `${maskedName}@${domainParts[0][0]}***.${domainParts.slice(1).join(".")}`;
}

function shortDate(value: string | number | undefined) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : new Date(Number(value));
  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderSuccess({
  order,
  email,
  allowShowFull = false,
}: {
  order: Order;
  email: string | undefined;
  allowShowFull: boolean | undefined;
}) {
  const displayId = `EZ-ORD-${order._id.slice(-6).toUpperCase()}`;
  const shipping = order.address || ({} as TAddress);
  const visibleEmail = email || order.email || "";
  const maskedEmail = allowShowFull ? visibleEmail : maskEmail(visibleEmail);
  const maskedPhone = allowShowFull ? shipping.phone : maskPhone(shipping.phone);
  const paymentTail = order.paymentIntentId
    ? order.paymentIntentId.slice(-4)
    : (order.sessionId || "").slice(-4);

  return (
    <main className="mx-auto max-w-6xl px-6 pt-24 pb-20 lg:px-10">
      <section className="mb-10 text-center">
        <div className="bg-brand-orange/12 text-brand-orange mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full text-xs font-black tracking-[0.22em] uppercase">
          Paid
        </div>
        <h1 className="font-display text-foreground text-4xl font-black uppercase lg:text-5xl">
          Your Order Is Confirmed
        </h1>
        <p className="text-muted-foreground mx-auto mt-3 max-w-2xl text-sm leading-6">
          We&apos;ve received your order and sent a confirmation to
          <strong> {maskedEmail || "your email"}</strong>.
        </p>
        <p className="text-muted-foreground mt-3 text-xs tracking-[0.18em] uppercase">
          Order reference: <span className="text-foreground font-semibold">{displayId}</span>
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="bg-card border-brand-border rounded-[1.75rem] border p-6 md:col-span-2 lg:p-8">
          <h2 className="font-display text-foreground mb-6 text-3xl font-black uppercase">
            Order Summary
          </h2>

          <div className="divide-y divide-[var(--color-brand-border)]">
            {order.products.map((item) => (
              <div key={item._id || item.product._id} className="flex items-center gap-4 py-4">
                <div className="bg-brand-surface-raised flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl">
                  <img
                    src={item.product.image || "/placeholder.png"}
                    alt={item.product.name || "Order product"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <div className="text-foreground font-medium">{item.product.name}</div>
                  <div className="text-muted-foreground text-sm">Qty: {item.quantity}</div>
                </div>
                <div className="text-brand-orange ml-auto font-semibold">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-brand-border mt-6 border-t pt-4">
            <div className="text-muted-foreground flex justify-between text-sm">
              <div>Subtotal</div>
              <div>{formatPrice(order.subtotal)}</div>
            </div>
            <div className="text-muted-foreground mt-2 flex justify-between text-sm">
              <div>Delivery</div>
              <div>{order.deliveryCharge === 0 ? "Free" : formatPrice(order.deliveryCharge)}</div>
            </div>
            <div className="text-foreground mt-4 flex justify-between text-lg font-semibold">
              <div>Total</div>
              <div>{formatPrice(order.totalAmount)}</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a href="/" className="bg-gradient-orange text-primary-foreground font-body inline-flex rounded-full px-6 py-3 text-sm font-semibold tracking-wider uppercase">
              Continue Shopping
            </a>
            <a href="/products" className="border-brand-border text-muted-foreground font-body inline-flex rounded-full border px-6 py-3 text-sm tracking-wider uppercase">
              Shop More
            </a>
          </div>
        </div>

        <aside className="bg-card border-brand-border space-y-5 rounded-[1.75rem] border p-6 lg:p-8">
          <div>
            <h3 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">Payment</h3>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="text-foreground font-medium">
                  {order.paymentType === "card" ? `Card ****${paymentTail}` : order.paymentType.toUpperCase()}
                </div>
                <div className="text-muted-foreground text-xs">Status: <span className="font-medium">{order.paymentStatus}</span></div>
              </div>
              <div className="text-sm font-semibold">{formatPrice(order.totalAmount)}</div>
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">Shipping</h3>
            <div className="text-foreground mt-2 text-sm">
              <div className="font-medium">{allowShowFull ? shipping.name : shipping.name?.split(" ")[0]}</div>
              <div className="text-muted-foreground">
                {allowShowFull
                  ? `${shipping.addressLine1}${shipping.addressLine2 ? ", " + shipping.addressLine2 : ""}, ${shipping.city}, ${shipping.state} - ${shipping.zipCode}`
                  : `${shipping.city}, ${shipping.state} xxx${String(shipping.zipCode || "").slice(-2)}`}
              </div>
              <div className="text-muted-foreground mt-1">{maskedPhone}</div>
            </div>
          </div>

          <div>
            <h3 className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">Order Details</h3>
            <div className="text-muted-foreground mt-2 space-y-1 text-xs">
              <div>Order ID: <span className="font-medium">{order._id}</span></div>
              <div>Placed: <span className="font-medium">{shortDate(order.createdAt)}</span></div>
              <div>Order status: <span className="font-medium">{order.orderStatus}</span></div>
            </div>
          </div>

          <div className="text-muted-foreground border-brand-border border-t pt-4 text-xs">
            Need help? <a href="mailto:anirudhkille@gmail.com" className="underline">anirudhkille@gmail.com</a>
          </div>
        </aside>
      </div>
    </main>
  );
}
