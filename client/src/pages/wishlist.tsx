import { Link } from "react-router";

import { Heart } from "lucide-react";

import type { TProduct } from "@/types/product";

import { useToggleWishlist, useWishlists } from "@/hooks/useWishlist";

import Container from "@/layout/container";
import Head from "@/layout/head";

import Image from "@/components/ui/img";

export default function wishlist() {
  const { data } = useWishlists();

  const { mutate } = useToggleWishlist();
  return (
    <>
      <Head title="Wishlist | EZ Shop" />
      <Container className="px-5 py-10 sm:px-8 md:px-10">
        <h1 className="text-xl font-medium sm:text-2xl">Wishlist</h1>

        <div className="grid auto-rows-max grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.data?.products?.map((w: TProduct) => (
            <div className="relative z-10 block min-w-[250px] transition-transform md:min-w-[280px]">
              <button
                className="absolute top-5 right-5 z-50 cursor-pointer"
                onClick={() => mutate(w._id)}
              >
                <Heart className="fill-black" />
              </button>

              <Link to={`/${w?.slug}`}>
                <div className="mx-auto size-[250px] overflow-hidden rounded-xl bg-gray-100 md:size-[280px]">
                  <Image
                    src={w.image}
                    alt={w.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                <p className="mt-2 line-clamp-1 font-semibold md:text-lg">
                  {w.name}
                </p>

                {w?.category?.name && (
                  <p className="text-muted-foreground line-clamp-1 text-sm md:text-base">
                    {w.category.name}
                  </p>
                )}

                <p className="mt-3 text-sm font-semibold md:text-base">
                  MRP : ₹ {w.price}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
