import promoBanner from "@/assets/promo-banner.jpg";

export default function PromoBanner() {
  return (
    <section className="py-10 px-6 lg:px-10">
      <div className="max-w-350 mx-auto">
        <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: "420px" }}>
          {/* Background image */}
          <img
            src={promoBanner}
            alt="New Collection Drop"
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-linear-to-r from-background/95 via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-brand-orange/10" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center h-full p-8 md:p-16" style={{ minHeight: "420px" }}>
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 font-body text-xs font-semibold text-brand-orange uppercase tracking-widest bg-brand-orange/10 border border-brand-orange/30 px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 bg-brand-orange rounded-full animate-pulse" />
                Limited Edition Drop
              </span>

              <h2 className="font-display text-5xl md:text-7xl font-black uppercase text-foreground leading-[0.9] mb-4">
                THE APEX
                <br />
                <span className="text-gradient-orange">COLLECTION</span>
              </h2>

              <p className="font-body text-muted-foreground text-base md:text-lg max-w-sm leading-relaxed mb-8">
                Exclusive colorways. Performance-engineered. Only 500 pairs available worldwide.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#"
                  className="inline-flex items-center justify-center px-8 py-3.5 bg-gradient-orange text-primary-foreground font-body font-semibold text-sm tracking-wider uppercase rounded-full btn-primary-glow transition-all duration-300 hover:scale-105"
                >
                  Shop the Drop
                </a>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-foreground">24</div>
                    <div className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Hours</div>
                  </div>
                  <div className="text-muted-foreground">:</div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-foreground">18</div>
                    <div className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Mins</div>
                  </div>
                  <div className="text-muted-foreground">:</div>
                  <div className="text-center">
                    <div className="font-display text-2xl font-bold text-foreground">42</div>
                    <div className="font-body text-[10px] text-muted-foreground uppercase tracking-widest">Secs</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
