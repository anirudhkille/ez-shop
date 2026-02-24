import type { TAddress } from "@/types/address";

type OrderProduct = {
  product: { _id?: string; name?: string; image?: string };
  quantity: number;
  price: number;
  _id?: string;
};

export type Order = {
  _id: string;
  user?: string;
  products: OrderProduct[];
  address: TAddress;
  deliveryMethod?: string;
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentStatus: string;
  paymentType: string;
  paymentIntentId?: string;
  sessionId?: string;
  orderStatus?: string;
  createdAt?: string | number;
  updatedAt?: string | number;
};

function formatINR(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}.00`;
}

function maskPhone(phone?: string) {
  if (!phone) return "";

  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    const last4 = digits.slice(-4);
    return `+${
      digits.length > 10 ? digits.slice(0, digits.length - 10) + " " : ""
    }••••${last4}`;
  }
  return phone.replace(/.(?=.{2})/g, "•");
}

function maskEmail(email?: string) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  const maskedName =
    name.length > 1 ? `${name[0]}***${name.slice(-1)}` : `${name[0]}***`;
  const domainParts = domain?.split(".");
  if (!domainParts) return `${maskedName}@***`;
  const maskedDomain = `${domainParts[0][0]}***.${domainParts
    .slice(1)
    .join(".")}`;
  return `${maskedName}@${maskedDomain}`;
}

function shortDate(d?: string | number) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : new Date(Number(d));
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
  email?: string;
  allowShowFull?: boolean;
}) {
  const displayId = `EZ-ORD-${order?._id.slice(-6).toUpperCase()}`;

  const shipping = order?.address || {};
  const maskedPhone = allowShowFull
    ? shipping.phone
    : maskPhone(shipping.phone);
  const maskedEmail = allowShowFull ? email ?? "" : maskEmail(email ?? "");

  return (
    <main className="max-w-4xl mx-auto p-6">
      <section className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-slate-900 to-gray-700 text-white mb-4">
          ✓
        </div>
        <h1 className="text-3xl font-semibold">
          Thank you — Your order is confirmed
        </h1>
        <p className="text-sm text-mute-foreground mt-2">
          We've received your order and sent a confirmation to{" "}
          <strong>{maskedEmail || "your email"}</strong>
        </p>
        <p className="mt-3 text-xs text-slate-400">
          Order reference:{" "}
          <span className="font-medium text-slate-700">{displayId}</span>
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* LEFT: Order summary */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="text-lg font-medium mb-4">Order summary</h2>

          <div className="divide-y">
            {order?.products.map((it) => (
              <div key={it._id} className="flex items-center py-4">
                <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                  <img
                    src={it.product.image ?? "/placeholder.png"}
                    alt={it.product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="ml-4">
                  <div className="font-medium">{it.product.name}</div>
                  <div className="text-sm text-mute-foreground">
                    Qty: {it.quantity}
                  </div>
                </div>
                <div className="ml-auto font-medium">
                  {formatINR(it.price * it.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between text-sm text-mute-foreground">
              <div>Subtotal</div>
              <div>{formatINR(order.subtotal)}</div>
            </div>
            <div className="flex justify-between text-sm text-mute-foreground mt-2">
              <div>Delivery</div>
              <div>{formatINR(order.deliveryCharge)}</div>
            </div>
            <div className="flex justify-between text-lg font-semibold mt-4">
              <div>Total</div>
              <div>{formatINR(order.totalAmount)}</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href={`/orders/${order._id}`}
              className="inline-block px-4 py-2 bg-slate-900 text-white rounded shadow hover:opacity-95"
            >
              View order
            </a>
            <a
              href="/"
              className="inline-block px-4 py-2 border rounded text-slate-900 hover:bg-slate-50"
            >
              Continue shopping
            </a>
            {/* <a
              href={`/invoice/${order._id}`}
              className="ml-auto text-sm underline text-mute-foreground"
            >
              Download invoice
            </a> */}
          </div>
        </div>

        <aside className="bg-white p-6 rounded-xl shadow space-y-4">
          <div>
            <h3 className="text-sm text-mute-foreground">Payment</h3>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {order.paymentType === "card"
                    ? `Card ••••${
                        order.paymentIntentId
                          ? order.paymentIntentId.slice(-4)
                          : order.sessionId?.slice(-4) ?? ""
                      }`
                    : order.paymentType?.toUpperCase()}
                </div>
                <div className="text-xs text-mute-foreground">
                  Status:{" "}
                  <span className="font-medium">{order.paymentStatus}</span>
                </div>
              </div>
              <div className="text-sm font-semibold">
                {formatINR(order.totalAmount)}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-mute-foreground">Shipping</h3>
            <div className="mt-2 text-sm text-slate-700">
              <div className="font-medium">
                {allowShowFull ? shipping.name : shipping.name?.split(" ")[0]}
              </div>
              <div className="text-mute-foreground">
                {allowShowFull
                  ? `${shipping.addressLine1}${
                      shipping.addressLine2 ? ", " + shipping.addressLine2 : ""
                    }, ${shipping.city}, ${shipping.state} - ${
                      shipping.zipCode
                    }`
                  : `${shipping.city}, ${shipping.state} •••${String(
                      shipping.zipCode || ""
                    ).slice(-2)}`}
              </div>
              <div className="text-mute-foreground mt-1">{maskedPhone}</div>
            </div>
          </div>

          <div>
            <h3 className="text-sm text-mute-foreground">Order details</h3>
            <div className="mt-2 text-xs text-mute-foreground">
              <div>
                Order ID: <span className="font-medium">{order._id}</span>
              </div>
              <div>
                Placed:{" "}
                <span className="font-medium">
                  {shortDate(order.createdAt)}
                </span>
              </div>
              <div>
                Order status:{" "}
                <span className="font-medium">{order.orderStatus}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-xs text-mute-foreground">
            Need help?{" "}
            <a href="mailto:anirudhkille@gmail.com" className="underline">
              anirudhkille@gmail.com
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
