import { Award, Globe, Shield, Zap } from "lucide-react";

import brandStory from "@/assets/brand-story.jpg";

const pillars = [
  {
    icon: Zap,
    title: "Innovation",
    desc: "Pioneering quantum-foam and carbon-fiber tech for athletes who demand the best.",
  },
  {
    icon: Shield,
    title: "Durability",
    desc: "Engineered to last through 1,000+ miles without compromising performance.",
  },
  {
    icon: Award,
    title: "Excellence",
    desc: "Every pair crafted to the highest standards, tested by professional athletes.",
  },
  {
    icon: Globe,
    title: "Sustainability",
    desc: "30% recycled materials in every shoe. Running toward a greener planet.",
  },
];

export default function BrandStory() {
  return (
    <section className="overflow-hidden py-24">
      <div className="mx-auto max-w-350 px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Image side */}
          <div className="relative">
            <div
              className="relative overflow-hidden rounded-3xl"
              style={{ aspectRatio: "4/3" }}
            >
              <img
                src={brandStory}
                alt="EZ Shop brand story — craftsmanship"
                className="h-full w-full object-cover"
              />
              <div className="from-background/60 absolute inset-0 bg-linear-to-tr to-transparent" />
            </div>

            {/* Floating stat card */}
            <div className="bg-card border-brand-border absolute -right-4 -bottom-6 rounded-2xl border p-5 shadow-lg lg:right-10">
              <div className="font-display text-brand-orange text-4xl font-black">
                50+
              </div>
              <div className="font-body text-muted-foreground mt-0.5 text-sm">
                Years of innovation
              </div>
              <div className="bg-brand-border mt-3 h-1 w-full rounded-full">
                <div className="bg-gradient-orange h-full w-4/5 rounded-full" />
              </div>
            </div>

            {/* Floating award card */}
            <div className="bg-brand-orange absolute -top-4 -left-4 rounded-2xl p-4 shadow-lg lg:-left-8">
              <Award size={20} className="text-primary-foreground mb-1" />
              <div className="font-display text-primary-foreground text-sm font-bold">
                #1 Rated
              </div>
              <div className="font-body text-primary-foreground/80 text-[10px]">
                2025 Awards
              </div>
            </div>
          </div>

          {/* Text side */}
          <div className="">
            <span className="font-body text-brand-orange text-xs font-semibold tracking-widest uppercase">
              Our Story
            </span>
            <h2 className="font-display text-foreground mt-2 text-5xl leading-[0.95] font-black uppercase lg:text-6xl">
              BUILT FOR
              <br />
              <span className="text-gradient-orange">CHAMPIONS</span>
            </h2>

            <p className="font-body text-muted-foreground mt-6 max-w-lg text-base leading-relaxed">
              For over five decades, EZ Shop has been at the intersection of
              performance science and design mastery. We don't just make shoes —
              we engineer the ground beneath the world's greatest athletes.
            </p>

            <p className="font-body text-muted-foreground mt-4 max-w-lg text-base leading-relaxed">
              From marathon world records to stadium lights, our footwear has
              been part of history's greatest moments. Because when you lace up,{" "}
              <span className="text-foreground font-medium">
                you're wearing a legacy.
              </span>
            </p>

            {/* Pillars */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              {pillars.map((pillar, i) => (
                <div
                  key={pillar.title}
                  className="group flex items-start gap-3"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="bg-brand-orange/10 border-brand-orange/20 group-hover:bg-brand-orange/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors duration-200">
                    <pillar.icon size={18} className="text-brand-orange" />
                  </div>
                  <div>
                    <h4 className="font-display text-foreground text-base font-bold">
                      {pillar.title}
                    </h4>
                    <p className="font-body text-muted-foreground mt-0.5 text-xs leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
