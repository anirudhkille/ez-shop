import { motion, type Variants } from "motion/react";

import { Zap } from "lucide-react";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function HeroSection() {
  return (
    <section className="bg-background relative flex min-h-screen items-center overflow-hidden">
      <div className="mx-auto grid w-full max-w-350 grid-cols-1 items-center gap-12 px-6 pt-24 pb-16 lg:grid-cols-2 lg:px-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 order-2 lg:order-1"
        >
          <motion.div variants={item}>
            <span className="border-brand-border text-brand-orange font-body mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
              New Collection 2026
            </span>
          </motion.div>

          <motion.h1
            className="font-display text-foreground text-[clamp(64px,10vw,130px)] leading-[0.9] font-black tracking-tight uppercase"
            variants={item}
          >
            RUN THE
            <br />
            <span className="text-gradient-orange">FUTURE</span>
          </motion.h1>

          <motion.p
            className="font-body text-muted-foreground mt-6 max-w-md text-base leading-relaxed lg:text-lg"
            variants={item}
          >
            Engineered for those who never stop. The new EZ Shop Pro series
            combines{" "}
            <span className="text-foreground font-medium">
              quantum-foam cushioning
            </span>{" "}
            with ultra-light carbon fiber plates — built for every step forward.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col gap-4 sm:flex-row"
            variants={item}
          >
            <a
              href="#featured"
              className="bg-brand-orange text-primary-foreground font-body hover:bg-brand-orange-glow inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-[transform,background-color] duration-150 ease-out active:scale-[0.98]"
            >
              Shop Now
            </a>
            <a
              href="#categories"
              className="border-brand-border text-foreground font-body hover:border-brand-orange hover:text-brand-orange inline-flex items-center justify-center rounded-full border px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-colors duration-150"
            >
              Explore Collection
            </a>
          </motion.div>

          <motion.div className="mt-14 flex gap-10" variants={item}>
            {[
              { value: "200+", label: "Styles" },
              { value: "50K+", label: "Happy Runners" },
              { value: "4.9★", label: "Avg. Rating" },
            ].map((s) => (
              <div key={s.label}>
                <div className="font-display text-foreground text-3xl font-bold">
                  {s.value}
                </div>
                <div className="font-body text-muted-foreground mt-0.5 text-xs tracking-widest uppercase">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <div className="relative order-1 flex items-center justify-center lg:order-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative z-10 w-full max-w-145 select-none"
          >
            <picture>
              <source
                media="(max-width: 768px)"
                srcSet="/hero-sneaker-mobile.webp"
              />
              <img
                src="/hero-sneaker.webp"
                alt="EZ Shop Pro — Run the Future"
                width={1024}
                height={1024}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-auto w-full object-contain select-none"
                draggable={false}
              />
            </picture>
          </motion.div>

          <div className="bg-card border-brand-border absolute bottom-8 left-4 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg lg:-left-4">
            <div className="bg-brand-orange/15 flex h-10 w-10 items-center justify-center rounded-xl">
              <Zap size={16} className="text-brand-orange" />
            </div>
            <div>
              <div className="font-body text-muted-foreground text-xs">
                New Drop
              </div>
              <div className="font-display text-foreground text-sm font-bold">
                EZ Pro X1
              </div>
            </div>
          </div>

          <div className="bg-brand-orange absolute top-12 right-4 rounded-2xl px-4 py-3 shadow-lg lg:-right-4">
            <div className="font-body text-primary-foreground/80 text-xs">
              Starting at
            </div>
            <div className="font-display text-primary-foreground text-xl font-bold">
              ₹15,782
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
