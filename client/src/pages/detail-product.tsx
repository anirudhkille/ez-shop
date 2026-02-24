import { Button } from "@/components/ui/button";
import Image from "@/components/ui/img";
import { useAddToCart } from "@/hooks/useCart";
import { useProduct } from "@/hooks/useProduct";
import { useAddToWishlist } from "@/hooks/useWishlist";
import Container from "@/layout/container";
import type { TVariant } from "@/types/product";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router";

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
    <Container className="px-5 sm:px-8 md:px-10 py-10">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="flex gap-5">
          <div className="space-y-3">
            {galleryImages.map((img: string, i: number) => (
              <div
                className={`size-20 rounded-xl overflow-hidden cursor-pointer border 
          ${selectedImg === img ? "border-primary ring" : ""}
        `}
              >
                <Image
                  key={i}
                  src={img}
                  className="w-full h-full object-cover"
                  onClick={() => setSelectedImg(img)}
                  onMouseEnter={() => setSelectedImg(img)}
                />
              </div>
            ))}
          </div>

          <div className="w-full h-[80vh] rounded-xl overflow-hidden">
            <Image src={selectedImg} className="object-contain h-full w-full" />
          </div>
        </div>

        <div className="max-w-sm">
          <h1 className="text-lg md:text-xl font-semibold">{product.name}</h1>

          <p className="text-sm md:text-base text-muted-foreground">
            {product?.category?.name ?? ""}
          </p>

          <p className="mt-5 font-medium flex gap-3">
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
                  className={`size-20 rounded-xl overflow-hidden cursor-pointer border 
          ${
            selectedVariantIndex === idx
              ? "border-primary ring ring-primary"
              : ""
          }
        `}
                >
                  <Image
                    src={variant.images[0]}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-semibold mb-3">Select Size</h2>

            <div className="grid grid-cols-3 gap-3">
              {selectedVariant.sizes.map((s: { size: string }, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSize(s.size)}
                  className={`border rounded py-2 text-center font-medium 
                    hover:bg-accent transition ${
                      selectedSize === s.size
                        ? "border-black bg-accent"
                        : "border-gray-300"
                    }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 mt-8">
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

          <p className="mt-6 text-muted-foreground">{product.description}</p>
        </div>
      </div>
    </Container>
  );
}
