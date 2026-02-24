import { useEffect, useState } from "react";

import { useParams } from "react-router";

import { Heart } from "lucide-react";

import type { TVariant } from "@/types/product";

import { useAddToCart } from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProduct";
import { useAddToWishlist } from "@/hooks/useWishlist";

import Container from "@/layout/container";

import { Button } from "@/components/ui/button";
import Image from "@/components/ui/img";

export default function DetailProduct() {
  const { slug } = useParams();
  const { data } = useProduct(slug ?? "");
  const { mutate: addToWishlist } = useAddToWishlist();
  const { mutate: addToCart } = useAddToCart();
  const product = data?.data;

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImg, setSelectedImg] = useState("");
  const [selectedSize, setSelectedSize] = useState("");

  useEffect(() => {
    if (product) {
      setSelectedVariantIndex(0);

      const firstVariant = product.variants[0];
      setSelectedImg(firstVariant.images[0]);
    }
  }, [product]);

  if (!product) return null;

  const selectedVariant = product.variants[selectedVariantIndex];

  const galleryImages = selectedVariant.images;

  const variantId = selectedVariant._id;

  return (
    <Container className="px-5 py-10 sm:px-8 md:px-10">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex gap-5">
          <div className="space-y-3">
            {galleryImages.map((img: string, i: number) => (
              <div
                className={`size-20 cursor-pointer overflow-hidden rounded-xl border ${selectedImg === img ? "border-primary ring" : ""} `}
              >
                <Image
                  key={i}
                  src={img}
                  className="h-full w-full object-cover"
                  onClick={() => setSelectedImg(img)}
                  onMouseEnter={() => setSelectedImg(img)}
                />
              </div>
            ))}
          </div>

          <div className="h-[80vh] w-full overflow-hidden rounded-xl">
            <Image src={selectedImg} className="h-full w-full object-contain" />
          </div>
        </div>

        <div className="max-w-sm">
          <h1 className="text-lg font-semibold md:text-xl">{product.name}</h1>

          <p className="text-muted-foreground text-sm md:text-base">
            {product?.category?.name ?? ""}
          </p>

          <p className="mt-5 flex gap-3 font-medium">
            MRP : ₹{product.discountPrice}{" "}
            {product.discountPrice !== product.price && (
              <span className="text-muted-foreground line-through">
                ₹{product.price}
              </span>
            )}
          </p>

          <div className="mt-10">
            <div className="flex gap-3">
              {product.variants.map((variant: TVariant, idx: number) => (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedVariantIndex(idx);
                    setSelectedImg(variant.images[0]);
                    setSelectedSize("");
                  }}
                  className={`size-20 cursor-pointer overflow-hidden rounded-xl border ${
                    selectedVariantIndex === idx
                      ? "border-primary ring-primary ring"
                      : ""
                  } `}
                >
                  <Image
                    src={variant.images[0]}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="mb-3 font-semibold">Select Size</h2>

            <div className="grid grid-cols-3 gap-3">
              {selectedVariant.sizes.map((s: { size: string }, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSize(s.size)}
                  className={`hover:bg-accent rounded border py-2 text-center font-medium transition ${
                    selectedSize === s.size
                      ? "bg-accent border-black"
                      : "border-gray-300"
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button
              className="w-full"
              onClick={() =>
                addToCart({
                  productId: product._id,
                  variantId,
                  size: selectedSize,
                  quantity: 1,
                })
              }
            >
              Add to Bag
            </Button>

            <Button
              className="w-full"
              variant="secondary"
              onClick={() => addToWishlist(product._id)}
            >
              Wishlist <Heart className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <p className="text-muted-foreground mt-6">{product.description}</p>
        </div>
      </div>
    </Container>
  );
}
