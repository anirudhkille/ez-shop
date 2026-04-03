import { useEffect, useState } from "react";

import { Link } from "react-router";

import { CheckCircle, ChevronDown, CreditCard, Lock, User } from "lucide-react";

import { products } from "@/data/products";
import useUserStore from "@/store/userStore";
import { formatPrice } from "@/lib/formatPrice";

const orderItems = [
  { product: products[0], size: 10, quantity: 1 },
  { product: products[3], size: 9, quantity: 2 },
];

const subtotal = orderItems.reduce(
  (s, i) => s + i.product.price * i.quantity,
  0
);
const total = subtotal;

export default function Checkout() {
  const { user } = useUserStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  // Auto-fill for logged-in users
  useEffect(() => {
    if (user) {
      const nameParts = user.displayName.split(" ");
      setForm((prev) => ({
        ...prev,
        email: user.email || prev.email,
        firstName: nameParts[0] || prev.firstName,
        lastName: nameParts.slice(1).join(" ") || prev.lastName,
      }));
    }
  }, [user]);

  const set = (field: string, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <main className="flex min-h-[80vh] items-center justify-center pt-24 pb-20">
        <div className="animate-fade-in-up max-w-md px-6 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/15">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="font-display text-foreground text-5xl font-black uppercase">
            Order Placed!
          </h1>
          <p className="font-body text-muted-foreground mt-4 leading-relaxed">
            Thank you for your order! We've received your request and will email
            you a confirmation shortly.
          </p>
          <p className="font-body text-muted-foreground mt-2 text-xs">
            Order #STR-{Math.floor(Math.random() * 90000) + 10000}
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link
              to="/"
              className="bg-gradient-orange text-primary-foreground font-body rounded-full px-6 py-3 text-sm font-semibold tracking-wider uppercase transition-opacity hover:opacity-90"
            >
              Back to Home
            </Link>
            <Link
              to="/products"
              className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/50 hover:text-foreground rounded-full border px-6 py-3 text-sm tracking-wider uppercase transition-all"
            >
              Keep Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const inputClass =
    "w-full bg-background border border-brand-border rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-orange transition-colors";
  const labelClass =
    "font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5";

  return (
    <main className="pt-24 pb-20">
        <div className="mx-auto max-w-300 px-6 lg:px-10">
          <div className="mb-10">
            <span className="font-body text-brand-orange text-xs font-semibold tracking-widest uppercase">
              Secure
            </span>
            <h1 className="font-display text-foreground mt-1 text-5xl font-black uppercase lg:text-6xl">
              Check<span className="text-gradient-orange">out</span>
            </h1>
          </div>

          {/* Steps */}
          <div className="mb-10 flex items-center gap-2">
            {[
              { n: 1, label: "Contact" },
              { n: 2, label: "Shipping" },
              { n: 3, label: "Payment" },
            ].map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div
                  className={`flex cursor-pointer items-center gap-2`}
                  onClick={() => step > s.n && setStep(s.n as 1 | 2 | 3)}
                >
                  <div
                    className={`font-body flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 ${step >= s.n ? "bg-brand-orange text-primary-foreground" : "border-brand-border text-muted-foreground border"}`}
                  >
                    {s.n}
                  </div>
                  <span
                    className={`font-body hidden text-sm sm:block ${step >= s.n ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`h-px w-8 ${step > s.n ? "bg-brand-orange" : "bg-brand-border"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Form */}
            <form
              onSubmit={handlePlaceOrder}
              className="space-y-6 lg:col-span-2"
            >
              {step === 1 && (
                <div className="bg-card border-brand-border space-y-4 rounded-2xl border p-6">
                  <h2 className="font-display text-foreground text-2xl font-bold uppercase">
                    Contact Info
                  </h2>
                  {user && (
                    <div className="bg-brand-orange/5 border-brand-orange/20 flex items-center gap-3 rounded-xl border p-3">
                      <div className="bg-brand-orange/20 flex h-9 w-9 items-center justify-center rounded-full">
                        <User size={16} className="text-brand-orange" />
                      </div>
                      <div>
                        <p className="font-body text-foreground text-sm font-semibold">
                          Signed in as {user.displayName}
                        </p>
                        <p className="font-body text-muted-foreground text-xs">
                          Details auto-filled from your profile
                        </p>
                      </div>
                    </div>
                  )}
                  {!user && (
                    <div className="bg-muted/50 border-brand-border flex items-center gap-3 rounded-xl border p-3">
                      <User size={16} className="text-muted-foreground" />
                      <p className="font-body text-muted-foreground text-sm">
                        <Link
                          to="/auth/login"
                          className="text-brand-orange font-semibold hover:underline"
                        >
                          Sign in
                        </Link>{" "}
                        for faster checkout
                      </p>
                    </div>
                  )}
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        required
                        value={form.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                        placeholder="John"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input
                        required
                        value={form.lastName}
                        onChange={(e) => set("lastName", e.target.value)}
                        
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow w-full rounded-xl py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:opacity-90"
                  >
                    Continue to Shipping →
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="bg-card border-brand-border space-y-4 rounded-2xl border p-6">
                  <h2 className="font-display text-foreground text-2xl font-bold uppercase">
                    Shipping Address
                  </h2>
                  <div>
                    <label className={labelClass}>Street Address</label>
                    <input
                      required
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="123 Main Street"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>City</label>
                      <input
                        required
                        value={form.city}
                        onChange={(e) => set("city", e.target.value)}
                        placeholder="New York"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <input
                        required
                        value={form.state}
                        onChange={(e) => set("state", e.target.value)}
                        placeholder="NY"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>ZIP Code</label>
                      <input
                        required
                        value={form.zip}
                        onChange={(e) => set("zip", e.target.value)}
                        placeholder="10001"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <div className="relative">
                        <select
                          value={form.country}
                          onChange={(e) => set("country", e.target.value)}
                          className={`${inputClass} cursor-pointer appearance-none pr-9`}
                        >
                          <option>India</option>
                          <option>United States</option>
                          <option>Canada</option>
                          <option>United Kingdom</option>
                        </select>
                        <ChevronDown
                          size={14}
                          className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/50 hover:text-foreground rounded-xl border px-6 py-4 text-sm tracking-wider uppercase transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow flex-1 rounded-xl py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:opacity-90"
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="bg-card border-brand-border space-y-4 rounded-2xl border p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-foreground text-2xl font-bold uppercase">
                      Payment
                    </h2>
                    <div className="text-muted-foreground flex items-center gap-1.5">
                      <Lock size={12} />
                      <span className="font-body text-xs">
                        Secure & Encrypted
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Name on Card</label>
                    <input
                      required
                      value={form.cardName}
                      onChange={(e) => set("cardName", e.target.value)}
                      placeholder="John Doe"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Card Number</label>
                    <div className="relative">
                      <CreditCard
                        size={16}
                        className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2"
                      />
                      <input
                        required
                        value={form.cardNumber}
                        onChange={(e) =>
                          set(
                            "cardNumber",
                            e.target.value.replace(/\D/g, "").slice(0, 16)
                          )
                        }
                        placeholder="1234 5678 9012 3456"
                        className={`${inputClass} pl-11`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Expiry Date</label>
                      <input
                        required
                        value={form.expiry}
                        onChange={(e) => set("expiry", e.target.value)}
                        placeholder="MM/YY"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>CVV</label>
                      <input
                        required
                        value={form.cvv}
                        onChange={(e) => set("cvv", e.target.value.slice(0, 3))}
                        placeholder="123"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="border-brand-border text-muted-foreground font-body hover:border-brand-orange/50 hover:text-foreground rounded-xl border px-6 py-4 text-sm tracking-wider uppercase transition-all"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow flex flex-1 items-center justify-center gap-2 rounded-xl py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:opacity-90"
                    >
                      <Lock size={14} />
                      Place Order · {formatPrice(total)}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Order summary */}
            <div>
              <div className="bg-card border-brand-border sticky top-24 rounded-2xl border p-6">
                <h2 className="font-display text-foreground mb-5 text-xl font-bold uppercase">
                  Order Review
                </h2>
                <div className="mb-5 space-y-4">
                  {orderItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="bg-brand-surface-raised flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-contain p-2"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-foreground truncate text-sm font-semibold">
                          {item.product.name}
                        </p>
                        <p className="font-body text-muted-foreground text-xs">
                          Size {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <span className="font-display text-brand-orange shrink-0 text-base font-bold">
                        {formatPrice(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-brand-border space-y-2 border-t pt-4">
                  <div className="font-body flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="font-body flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="text-success">Free</span>
                  </div>
                  <div className="border-brand-border flex justify-between border-t pt-2">
                    <span className="font-display text-foreground text-lg font-bold uppercase">
                      Total
                    </span>
                    <span className="font-display text-brand-orange text-2xl font-bold">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
