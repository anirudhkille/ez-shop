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
  const maskedEmail = allowShowFull ? (email ?? "") : maskEmail(email ?? "");

  return (
    <main className="mx-auto max-w-4xl p-6">
      <section className="py-8 text-center">
        <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-slate-900 to-gray-700 text-white">
          ✓
        </div>
        <h1 className="text-3xl font-semibold">
          Thank you — Your order is confirmed
        </h1>
        <p className="text-mute-foreground mt-2 text-sm">
          We've received your order and sent a confirmation to{" "}
          <strong>{maskedEmail || "your email"}</strong>
        </p>
        <p className="mt-3 text-xs text-slate-400">
          Order reference:{" "}
          <span className="font-medium text-slate-700">{displayId}</span>
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* LEFT: Order summary */}
        <div className="rounded-xl bg-white p-6 shadow md:col-span-2">
          <h2 className="mb-4 text-lg font-medium">Order summary</h2>

          <div className="divide-y">
            {order?.products.map((it) => (
              <div key={it._id} className="flex items-center py-4">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded bg-gray-100">
                  <img
                    src={it.product.image ?? "/placeholder.png"}
                    alt={it.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="ml-4">
                  <div className="font-medium">{it.product.name}</div>
                  <div className="text-mute-foreground text-sm">
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
            <div className="text-mute-foreground flex justify-between text-sm">
              <div>Subtotal</div>
              <div>{formatINR(order.subtotal)}</div>
            </div>
            <div className="text-mute-foreground mt-2 flex justify-between text-sm">
              <div>Delivery</div>
              <div>{formatINR(order.deliveryCharge)}</div>
            </div>
            <div className="mt-4 flex justify-between text-lg font-semibold">
              <div>Total</div>
              <div>{formatINR(order.totalAmount)}</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href={`/orders/${order._id}`}
              className="inline-block rounded bg-slate-900 px-4 py-2 text-white shadow hover:opacity-95"
            >
              View order
            </a>
            <a
              href="/"
              className="inline-block rounded border px-4 py-2 text-slate-900 hover:bg-slate-50"
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

        <aside className="space-y-4 rounded-xl bg-white p-6 shadow">
          <div>
            <h3 className="text-mute-foreground text-sm">Payment</h3>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {order.paymentType === "card"
                    ? `Card ••••${
                        order.paymentIntentId
                          ? order.paymentIntentId.slice(-4)
                          : (order.sessionId?.slice(-4) ?? "")
                      }`
                    : order.paymentType?.toUpperCase()}
                </div>
                <div className="text-mute-foreground text-xs">
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
            <h3 className="text-mute-foreground text-sm">Shipping</h3>
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
            <h3 className="text-mute-foreground text-sm">Order details</h3>
            <div className="text-mute-foreground mt-2 text-xs">
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

          <div className="text-mute-foreground pt-2 text-xs">
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
