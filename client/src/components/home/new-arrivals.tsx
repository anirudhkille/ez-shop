import { useProducts } from "@/hooks/useProduct";
import ProductsSlider from "../shared/product-slider";

export default function NewArrivals() {
  const { data } = useProducts({ isNewArrival: true }); 
  return <ProductsSlider heading="New Arrivals" products={data?.data} />;
}
