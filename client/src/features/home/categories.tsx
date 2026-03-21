import { useCategorys } from "@/hooks/useCategory";

import Fade from "@/components/shared/fade";

export default function CategoriesSection() {
  const { data: categories } = useCategorys();

  return (
    <section id="categories" className="bg-background py-24">
      <div className="mx-auto max-w-350 px-6 lg:px-10">
        <Fade className="mb-12 flex items-end justify-between">
          <div>
            <span className="font-body text-brand-orange text-xs font-semibold tracking-widest uppercase">
              Browse
            </span>
            <h2 className="font-display text-foreground mt-1 text-5xl font-black uppercase lg:text-6xl">
              Shop by <span className="text-gradient-orange">Category</span>
            </h2>
          </div>
          <a
            href="#"
            className="font-body text-muted-foreground hover:text-brand-orange group hidden items-center gap-2 text-sm font-medium transition-colors sm:inline-flex"
          >
            View All
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </a>
        </Fade>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
          {categories?.map((cat, i) => (
            <Fade
              key={cat.name}
              delay={i * 0.1}
              className={`group relative h-120 cursor-pointer overflow-hidden rounded-2xl ${
                i === 3 ? "md:col-span-1" : ""
              }`}
            >
              <a href="#" style={{ aspectRatio: "3/4" }}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />

                <div className="from-background via-background/40 absolute inset-0 bg-linear-to-t to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-75" />

                <div className="bg-brand-orange/0 group-hover:bg-brand-orange/10 absolute inset-0 transition-all duration-300" />

                <div className="absolute inset-0 flex flex-col justify-end p-5">
                  <div>
                    <span className="font-body text-muted-foreground text-xs tracking-widest uppercase">
                      {cat.count}
                    </span>
                    <h3 className="font-display text-foreground group-hover:text-brand-orange mt-0.5 text-3xl font-black uppercase transition-colors duration-300 lg:text-4xl">
                      {cat.name}
                    </h3>
                  </div>

                  <div className="mt-3 flex translate-y-4 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="font-body text-brand-orange text-xs font-semibold tracking-wider uppercase">
                      Shop Now
                    </span>
                    <span className="text-brand-orange text-sm">→</span>
                  </div>
                </div>

                <div className="border-brand-orange/0 group-hover:border-brand-orange/60 absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300">
                  <span className="text-brand-orange/0 group-hover:text-brand-orange text-xs transition-all duration-300">
                    ↗
                  </span>
                </div>
              </a>
            </Fade>
          ))}
        </div>
      </div>
    </section>
  );
}
