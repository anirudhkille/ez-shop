import { Link, useParams } from "react-router";

import {
  ArrowLeft,
  CreditCard,
  Download,
  MapPin,
  Package,
  Truck,
  Wallet,
} from "lucide-react";

import { formatPrice } from "@/lib/formatPrice";

import { useDownloadInvoice } from "@/hooks/useInvoice";
import { useOrderDetail } from "@/hooks/useOrder";

import Container from "@/layout/container";
import Head from "@/layout/head";

import {
  OrderLineItems,
  OrderStatusPill,
} from "@/features/account/profile/order-line-items";

const DELIVERY_LABELS: Record<string, string> = {
  standard: "Standard",
  express: "Express",
  "same-day": "Same day",
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on delivery",
  card: "Card",
};

function SummaryRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "credit" | "strong";
}) {
  return (
    <div className="font-body flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={
          tone === "credit"
            ? "text-green-400"
            : tone === "strong"
              ? "text-foreground font-semibold"
              : "text-foreground"
        }
      >
        {value}
      </span>
    </div>
  );
}

function MetaTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck;
  label: string;
  value: string;
}) {
  return (
    <div className="border-brand-border/40 rounded-xl border p-4">
      <div className="text-muted-foreground mb-2 flex items-center gap-2">
        <Icon size={14} aria-hidden />
        <span className="font-body text-[11px] tracking-wider uppercase">
          {label}
        </span>
      </div>
      <p className="font-body text-foreground text-sm font-semibold">{value}</p>
    </div>
  );
}

export default function OrderDetail() {
  const { orderId = "" } = useParams();
  const { data, isLoading, isError } = useOrderDetail(orderId);
  const { mutate: downloadInvoice, isPending: downloading } =
    useDownloadInvoice();

  const order = data?.data;

  if (isLoading) {
    return (
      <Container className="mt-10 max-w-4xl px-5 py-16 sm:px-8 md:px-10">
        <div className="bg-muted-foreground/20 h-6 w-32 animate-pulse rounded" />
        <div className="bg-card border-brand-border mt-6 h-40 animate-pulse rounded-2xl border" />
      </Container>
    );
  }

  if (isError || !order) {
    return (
      <>
        <Head title="Order Not Found | EZ Shop" noIndex />
        <Container className="mt-10 max-w-4xl px-5 py-16 sm:px-8 md:px-10">
          <Link
            to="/account/orders"
            className="font-body text-brand-orange hover:text-brand-orange/80 inline-flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeft size={14} /> Back to orders
          </Link>
          <div className="bg-card border-brand-border mt-6 rounded-2xl border p-12 text-center">
            <Package
              size={40}
              className="text-muted-foreground/40 mx-auto mb-4"
              aria-hidden
            />
            <h1 className="font-display text-foreground text-2xl font-bold uppercase">
              Order not found
            </h1>
            <p className="font-body text-muted-foreground mt-2 text-sm">
              We could not load this order. It may belong to another account, or
              the link may be incorrect.
            </p>
          </div>
        </Container>
      </>
    );
  }

  const items = order.products ?? [];
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const shortId = order._id.slice(-6).toUpperCase();
  const deliveryCharge = order.deliveryCharge ?? 0;

  return (
    <>
      <Head
        title={`Order #${shortId} | EZ Shop`}
        description={`Details for order #${shortId} at EZ Shop.`}
        noIndex
      />
      <Container className="mt-10 max-w-4xl px-5 py-16 sm:px-8 md:px-10">
        <Link
          to="/account/orders"
          className="font-body text-brand-orange hover:text-brand-orange/80 inline-flex items-center gap-1 text-sm transition-colors"
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>

        <div className="mt-4 mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-foreground text-3xl font-black uppercase">
              Order #{shortId}
            </h1>
            <p className="font-body text-muted-foreground mt-1 text-sm">
              Placed{" "}
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <OrderStatusPill status={order.orderStatus} />
            <button
              type="button"
              onClick={() => downloadInvoice(order._id)}
              disabled={downloading}
              className="border-brand-border text-muted-foreground hover:border-brand-orange/50 hover:text-brand-orange font-body inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors disabled:opacity-60"
            >
              <Download size={14} aria-hidden />
              {downloading ? "Preparing…" : "Invoice"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetaTile
              icon={Truck}
              label="Delivery"
              value={
                DELIVERY_LABELS[order.deliveryMethod ?? ""] ??
                order.deliveryMethod ??
                "Standard"
              }
            />
            <MetaTile
              icon={Wallet}
              label="Payment"
              value={
                PAYMENT_LABELS[order.paymentType ?? ""] ??
                order.paymentType ??
                "—"
              }
            />
            <MetaTile
              icon={CreditCard}
              label="Payment status"
              value={order.paymentStatus ?? "—"}
            />
          </div>

          <section className="bg-card border-brand-border rounded-2xl border">
            <div className="border-brand-border/40 flex items-center justify-between border-b px-5 py-4">
              <h2 className="font-display text-foreground text-base font-bold uppercase">
                Items
              </h2>
              <span className="font-body text-muted-foreground text-xs">
                {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
            </div>
            <OrderLineItems items={items} />
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="bg-card border-brand-border rounded-2xl border p-5">
              <h2 className="font-display text-foreground mb-4 text-base font-bold uppercase">
                Delivery address
              </h2>
              {order.address ? (
                <address className="font-body text-muted-foreground text-sm leading-relaxed not-italic">
                  <span className="text-foreground block font-semibold">
                    {order.address.name}
                  </span>
                  {order.address.addressLine1}
                  {order.address.addressLine2 ? (
                    <>
                      <br />
                      {order.address.addressLine2}
                    </>
                  ) : null}
                  <br />
                  {order.address.city}, {order.address.state}{" "}
                  {order.address.zipCode}
                  <br />
                  {order.address.country}
                  <br />
                  <span className="text-foreground">{order.address.phone}</span>
                </address>
              ) : (
                <p className="font-body text-muted-foreground flex items-center gap-2 text-sm">
                  <MapPin size={14} aria-hidden /> No address on this order
                </p>
              )}
            </section>

            <section className="bg-card border-brand-border rounded-2xl border p-5">
              <h2 className="font-display text-foreground mb-4 text-base font-bold uppercase">
                Payment summary
              </h2>
              <div className="space-y-3">
                <SummaryRow
                  label="Subtotal"
                  value={formatPrice(order.subtotal ?? 0)}
                />
                {(order.discount ?? 0) > 0 ? (
                  <SummaryRow
                    label="Discount"
                    value={`-${formatPrice(order.discount ?? 0)}`}
                    tone="credit"
                  />
                ) : null}
                {order.coupon ? (
                  <SummaryRow
                    label={`Coupon (${order.coupon.code})`}
                    value={`-${formatPrice(order.coupon.discount)}`}
                    tone="credit"
                  />
                ) : null}
                <SummaryRow
                  label="Delivery"
                  value={
                    deliveryCharge === 0 ? "Free" : formatPrice(deliveryCharge)
                  }
                  tone={deliveryCharge === 0 ? "credit" : undefined}
                />
                <div className="border-brand-border flex items-center justify-between border-t pt-3">
                  <span className="font-display text-foreground text-lg font-bold uppercase">
                    Total
                  </span>
                  <span className="font-display text-brand-orange text-2xl font-bold">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Container>
    </>
  );
}
