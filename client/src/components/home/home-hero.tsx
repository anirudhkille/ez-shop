export default function Hero() {
  return (
    <section className="w-full">
      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-20 grid lg:grid-cols-2 gap-12 items-center">

        {/* LEFT CONTENT */}
        <div className="space-y-6">
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Elevate Your Style<br />
            <span >Step Into Comfort</span>
          </h1>

          <p className="text-gray-600 text-lg max-w-md">
            Explore the latest athletic sneakers engineered for speed,
            comfort, and premium performance.
          </p>

          <div className="flex gap-4 pt-4">
            <button className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-black/90 transition">
              Shop Now
            </button>

            <button className="px-6 py-3 border border-gray-900 rounded-full text-sm font-medium hover:bg-gray-100 transition">
              Explore Collection
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center">
          <img
            src="/hero.avif"
            alt="Nike Sneaker"
            className="w-full max-w-lg drop-shadow-xl animate-fadeSlide"
          />
        </div>
      </div>
    </section>
  );
}
