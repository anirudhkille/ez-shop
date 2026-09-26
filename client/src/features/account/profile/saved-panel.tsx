import { useToggleWishlist, useWishlistDetails } from "@/hooks/useWishlist";

import { PanelHeader } from "./panel";
import { SavedItems } from "./saved-items";

export default function SavedPanel() {
  const { data: wishlist, isLoading } = useWishlistDetails();
  const { mutate: toggleWishlist } = useToggleWishlist();

  const products = wishlist?.products ?? [];

  return (
    <>
      <PanelHeader
        title="Saved for later"
        subtitle={`${products.length} item${products.length === 1 ? "" : "s"} in your wishlist.`}
      />

      <SavedItems
        products={products}
        isLoading={isLoading}
        limit={0}
        onRemove={(productId) => toggleWishlist(productId)}
      />
    </>
  );
}
