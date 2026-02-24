import Image from "@/components/ui/img";
import { useRemoveFromWishlist, useWishlists } from "@/hooks/useWishlist";
import Container from "@/layout/container";
import Head from "@/layout/head";
import type { TProduct } from "@/types/product";
import { Heart } from "lucide-react";
import { Link } from "react-router";

export default function wishlist() {
  const { data } = useWishlists();

  const { mutate } = useRemoveFromWishlist();
  return (
    <>
      <Head title="Wishlist | EZ Shop" />
      <Container className="py-10 px-5 sm:px-8 md:px-10">
        <h1 className="font-medium text-xl sm:text-2xl">Wishlist</h1>

        <div className="grid auto-rows-max grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data?.data?.products?.map((w: TProduct) => (
            <div className="block min-w-[250px] md:min-w-[280px] transition-transform relative z-10">
              <button
                className="absolute top-5 right-5 z-50 cursor-pointer"
                onClick={() => mutate(w._id)}
              >
                <Heart className="fill-black" />
              </button>

              <Link to={`/${w?.slug}`}>
                <div className="size-[250px] md:size-[280px] bg-gray-100 rounded-xl overflow-hidden mx-auto">
                  <Image
                    src={w.image}
                    alt={w.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <p className="font-semibold md:text-lg mt-2 line-clamp-1">
                  {w.name}
                </p>

                {w?.category?.name && (
                  <p className="text-muted-foreground text-sm md:text-base line-clamp-1">
                    {w.category.name}
                  </p>
                )}

                <p className="font-semibold mt-3 text-sm md:text-base">
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
