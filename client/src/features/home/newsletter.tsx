import { useState } from "react";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="py-24 bg-card/40">
      <div className="max-w-350 mx-auto px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl bg-card border border-brand-border p-8 md:p-16">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/6 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-orange/4 rounded-full blur-[80px] pointer-events-none" />

          {/* Giant BG text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <span className="font-display text-[160px] font-black uppercase text-foreground/[0.018] select-none leading-none">
              EZ SHOP
            </span>
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            {/* Left */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-orange/10 border border-brand-orange/30 text-brand-orange text-xs font-body font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
                <Mail size={12} />
                Newsletter
              </div>
              <h2 className="font-display text-4xl md:text-5xl font-black uppercase text-foreground leading-[0.95]">
                JOIN THE
                <br />
                <span className="text-gradient-orange">INNER CIRCLE</span>
              </h2>
              <p className="font-body text-muted-foreground text-base mt-4 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Get early access to new drops, exclusive discounts, and training tips from pro athletes. No spam, ever.
              </p>

              {/* Perks */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 text-left">
                {["10% off first order", "Early access drops", "Exclusive content"].map((perk) => (
                  <div key={perk} className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-brand-orange shrink-0" />
                    <span className="font-body text-xs text-muted-foreground">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — form */}
            <div className="flex-1 w-full max-w-md">
              {submitted ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <CheckCircle size={48} className="text-brand-orange" />
                  <h3 className="font-display text-2xl font-bold text-foreground">You're in!</h3>
                  <p className="font-body text-sm text-muted-foreground">Check your inbox for your welcome gift 🎁</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-background border border-brand-border rounded-full pl-11 pr-5 py-4 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-orange transition-colors duration-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-orange text-primary-foreground font-body font-semibold text-sm tracking-wider uppercase rounded-full btn-primary-glow transition-all duration-300 hover:scale-105"
                  >
                    Subscribe Now
                    <ArrowRight size={16} />
                  </button>
                  <p className="font-body text-[11px] text-muted-foreground/60 text-center">
                    By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
