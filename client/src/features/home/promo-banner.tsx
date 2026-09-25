import Fade from "@/components/shared/fade";
import Image from "@/components/ui/img";

import promoBanner from "@/assets/promo-banner.webp";

export default function PromoBanner() {
  return (
    <section className="px-6 py-10 lg:px-10">
      <Fade className="mx-auto max-w-350">
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{ minHeight: "420px" }}
        >
          <Image
            src={promoBanner}
            alt="New Collection Drop"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="from-background/95 via-background/70 absolute inset-0 bg-linear-to-r to-transparent" />
          <div className="bg-brand-orange/10 absolute inset-0" />

          <div
            className="relative z-10 flex h-full flex-col justify-center p-8 md:p-16"
            style={{ minHeight: "420px" }}
          >
            <div className="max-w-xl">
              <span className="font-body text-brand-orange bg-brand-orange/10 border-brand-orange/30 mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold tracking-widest uppercase">
                Limited Edition Drop
              </span>

              <h2 className="font-display text-foreground mb-4 text-5xl leading-[0.9] font-black uppercase md:text-7xl">
                THE APEX
                <br />
                <span className="text-gradient-orange">COLLECTION</span>
              </h2>

              <p className="font-body text-muted-foreground mb-8 max-w-sm text-base leading-relaxed md:text-lg">
                Exclusive colorways. Performance-engineered. Only 500 pairs
                available worldwide.
              </p>

              <a
                href="#"
                className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow inline-flex items-center justify-center rounded-full px-8 py-3.5 text-sm font-semibold tracking-wider uppercase transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]"
              >
                Shop the Drop
              </a>
            </div>
          </div>
        </div>
      </Fade>
    </section>
  );
}
