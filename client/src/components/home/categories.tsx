import { Link } from "react-router";

import type { TCategory } from "@/types/category";

import { useCategorys } from "@/hooks/useCategory";

import Heading from "../ui/heading";

export default function Categories() {
  const { data } = useCategorys();

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Heading>Categories</Heading>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {data?.data?.map((c: TCategory) => (
            <Link
              key={c._id}
              to={`/products/?category=${c.slug}`}
              className="group flex flex-col rounded-lg border p-2"
            >
              <div className="aspect-square overflow-hidden rounded-lg">
                <img
                  src={c.image}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h3 className="mt-2 text-center text-sm font-medium sm:text-lg">
                {c.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
