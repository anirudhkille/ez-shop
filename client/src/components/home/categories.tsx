import { Link } from "react-router";
import Heading from "../ui/heading";
import { useCategorys } from "@/hooks/useCategory";
import type { TCategory } from "@/types/category";

export default function Categories() {
  const { data } = useCategorys();

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Heading>Categories</Heading>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
          {data?.data?.map((c: TCategory) => (
            <Link
              key={c._id}
              to={`/products/?category=${c.slug}`}
              className="group rounded-lg border p-2 flex flex-col"
            >
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h3 className="text-center sm:text-lg text-sm font-medium mt-2">
                {c.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
