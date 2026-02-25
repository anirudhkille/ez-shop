export default function Hero() {
  return (
    <section className="w-full">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:px-12">
        {/* LEFT CONTENT */}
        <div className="space-y-6">
          <h1 className="text-4xl leading-tight font-extrabold tracking-tight lg:text-6xl">
            Elevate Your Style
            <br />
            <span>Step Into Comfort</span>
          </h1>

          <p className="max-w-md text-lg text-gray-600">
            Explore the latest athletic sneakers engineered for speed, comfort,
            and premium performance.
          </p>

          <div className="flex gap-4 pt-4">
            <button className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-black/90">
              Shop Now
            </button>

            <button className="rounded-full border border-gray-900 px-6 py-3 text-sm font-medium transition hover:bg-gray-100">
              Explore Collection
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center">
          <img
            src="/hero.avif"
            alt="Nike Sneaker"
            className="animate-fadeSlide w-full max-w-lg drop-shadow-xl"
          />
        </div>
      </div>
    </section>
  );
}
