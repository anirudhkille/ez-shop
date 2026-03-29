import { motion, type Variants } from "motion/react";

import heroSneaker from "@/assets/hero-sneaker.png";

const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // premium easing
    },
  },
};

export default function HeroSection() {
  return (
    <section className="bg-background relative flex min-h-screen items-center overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="bg-brand-orange/6 absolute top-1/2 right-1/4 h-28 w-28 -translate-y-1/2 rounded-full blur-[120px]" />
        <div className="bg-brand-orange/4 absolute top-1/3 left-1/3 h-100 w-100 rounded-full blur-[100px]" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(0 0% 100% / 1) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="mx-auto grid w-full max-w-350 grid-cols-1 items-center gap-12 px-6 pt-24 pb-16 lg:grid-cols-2 lg:px-10">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10 order-2 lg:order-1"
        >
          <motion.div variants={item}>
            <span className="bg-brand-orange/10 border-brand-orange/30 text-brand-orange font-body mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-widest uppercase">
              <span className="bg-brand-orange h-1.5 w-1.5 animate-pulse rounded-full" />
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
              className="bg-gradient-orange text-primary-foreground font-body btn-primary-glow inline-flex items-center justify-center rounded-full px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-105"
            >
              Shop Now
            </a>
            <a
              href="#categories"
              className="border-brand-border text-foreground font-body hover:border-brand-orange hover:text-brand-orange inline-flex items-center justify-center rounded-full border px-8 py-4 text-sm font-semibold tracking-wider uppercase transition-all duration-300"
            >
              Explore Collection
            </a>
          </motion.div>

          <div
            className="mt-14 flex gap-10"
            style={{ animationDelay: "0.65s" }}
          >
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
          </div>
        </motion.div>

        <div className="relative order-1 flex items-center justify-center lg:order-2">
          <div
            className="border-brand-orange/15 absolute h-105 w-105 animate-spin rounded-full border"
            style={{ animationDuration: "20s" }}
          />
          <div
            className="border-brand-orange/10 absolute h-80 w-80 animate-spin rounded-full border"
            style={{ animationDuration: "15s", animationDirection: "reverse" }}
          />
          <div className="bg-brand-orange/6 absolute h-125 w-125 rounded-full blur-[80px]" />

          <motion.img
            src={heroSneaker}
            alt="EZ Shop Pro — Run the Future"
            className="animate-float relative z-10 w-full max-w-145 drop-shadow-2xl select-none"
            draggable={false}
            style={{
              filter: "drop-shadow(0 30px 60px hsl(22 100% 52% / 0.25))",
            }}

              initial={{ y: 0 }}
            animate={{ y: 10 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />

          <div className="bg-card border-brand-border animate-float-subtle absolute bottom-8 left-4 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg lg:-left-4">
            <div className="bg-brand-orange/15 flex h-10 w-10 items-center justify-center rounded-xl">
              <span className="text-xl">⚡</span>
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

          <motion.div
            className="bg-brand-orange absolute top-12 right-4 rounded-2xl px-4 py-3 shadow-lg lg:-right-4"
            initial={{ y: 0 }}
            animate={{ y: 10 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          >
            <div className="font-body text-primary-foreground/80 text-xs">
              Starting at
            </div>
            <div className="font-display text-primary-foreground text-xl font-bold">
              ₹15,782
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-bounce flex-col items-center gap-2">
        <span className="font-body text-muted-foreground text-xs tracking-widest uppercase">
          Scroll
        </span>
        <div className="from-brand-orange h-10 w-px bg-linear-to-b to-transparent" />
      </div>
    </section>
  );
}
