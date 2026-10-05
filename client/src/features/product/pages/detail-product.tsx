import { Link, useParams } from "react-router";

import { toast } from "sonner";

import { useUserStore } from "@/features/auth";
import { useAddToCart } from "@/features/cart";
import type { TProduct } from "@/features/product";
import { ReviewSection } from "@/features/review";
import { useToggleWishlist, useWishlists } from "@/features/wishlist";
import { StarRating } from "@/shared/components/star-rating";
import { formatRating, reviewCountLabel } from "@/shared/lib/format-rating";

import {
  ProductActions,
  ProductMobileBar,
} from "../components/product-actions";
import { ProductDetailSkeleton } from "../components/product-detail-skeleton";
import { ProductGallery } from "../components/product-gallery";
import { ProductPrice } from "../components/product-price";
import { ProductTrustBadges } from "../components/product-trust-badges";
import { RelatedProducts } from "../components/related-products";
import { VariantPicker } from "../components/variant-picker";
import { useProduct, useSimilarProducts } from "../hooks/use-product";
import { useProductSelection } from "../hooks/use-product-selection";

function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="font-display text-muted-foreground text-4xl uppercase">
          Product not found
        </p>
        <Link
          to="/products"
          className="font-body text-brand-orange mt-4 inline-block hover:underline"
        >
          Back to products
        </Link>
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { slug, id } = useParams();
  const { token } = useUserStore();
  const { data: product, isLoading } = useProduct(slug ?? "", id ?? "");
  const { data: related } = useSimilarProducts(id ?? "");
  const { data: wishlist } = useWishlists();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: addToCart } = useAddToCart();

  const selection = useProductSelection(
    product ?? ({ variants: [] } as unknown as TProduct)
  );

  const liked = new Set(wishlist?.products || []).has(id ?? "");

  const handleWishlist = () => {
    if (!token) {
      toast.error("Login to save wishlist");
      return;
    }
    if (!product) return;
    toggleWishlist(product._id);
  };

  const handleAddToCart = () => {
    if (!product || !selection.selectedSize) return;

    addToCart({
      productId: product._id,
      size: selection.selectedSize,
      quantity: selection.quantity,
      name: product.name,
      image: product.image,
      price: product.discountPrice || product.price,
      discountPrice: product.discountPrice,
      slug: product.slug,
      category:
        typeof product.category === "string"
          ? product.category
          : product.category?.name,
    });
  };

  if (isLoading) return <ProductDetailSkeleton />;
  if (!product) return <NotFound />;

  const actionProps = {
    quantity: selection.quantity,
    onQuantityChange: selection.setQuantity,
    canAdd: !!selection.selectedSize,
    onAddToCart: handleAddToCart,
    liked,
    onToggleWishlist: handleWishlist,
  };

  return (
    <main className="pt-20">
      <div className="mx-auto grid max-w-350 grid-cols-1 gap-12 px-6 pb-20 lg:grid-cols-2 lg:gap-20 lg:px-10">
        <ProductGallery
          product={product}
          activeImage={selection.activeImage}
          activeImages={selection.activeImages}
          activeVariant={selection.activeVariant}
          selectedImageIdx={selection.selectedImageIdx}
          onSelectImage={selection.setSelectedImageIdx}
          onStepImage={selection.stepImage}
        />

        <div className="flex flex-col justify-center">
          <span className="font-body text-brand-orange text-xs font-semibold tracking-widest uppercase">
            {product.category?.name}
          </span>
          <h1 className="font-display text-foreground mt-2 text-5xl leading-tight font-black uppercase lg:text-6xl">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center gap-3">
            {product.reviewsCount > 0 ? (
              <>
                <StarRating rating={product.rating} size={14} />
                <span className="font-body text-muted-foreground text-sm">
                  {formatRating(product.rating)} (
                  {reviewCountLabel(product.reviewsCount)})
                </span>
              </>
            ) : (
              <span className="font-body text-muted-foreground text-sm">
                No reviews yet
              </span>
            )}
            <a
              href="#reviews"
              className="font-body text-muted-foreground hover:text-brand-orange ml-auto text-xs underline-offset-4 transition-colors hover:underline"
            >
              Read reviews
            </a>
          </div>

          <ProductPrice product={product} />

          <p className="font-body text-muted-foreground mt-5 leading-relaxed">
            {product.description}
          </p>

          <VariantPicker
            product={product}
            activeVariant={selection.activeVariant}
            selectedColorIdx={selection.selectedColorIdx}
            selectedSize={selection.selectedSize}
            sizes={selection.sizes}
            onSelectColor={selection.selectColor}
            onSelectSize={selection.setSelectedSize}
          />

          <ProductActions {...actionProps} />

          <ProductTrustBadges />
        </div>
      </div>

      <ProductMobileBar {...actionProps} />

      <ReviewSection
        productId={product._id}
        rating={product.rating}
        reviewsCount={product.reviewsCount}
      />

      <RelatedProducts products={related ?? []} />
    </main>
  );
}
