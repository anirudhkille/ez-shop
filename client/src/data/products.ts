import product1 from "@/assets/product-1.png";
import product2 from "@/assets/product-2.png";
import product3 from "@/assets/product-3.png";
import product4 from "@/assets/product-4.png";
import product5 from "@/assets/product-5.png";
import product6 from "@/assets/product-6.png";
import product7 from "@/assets/product-7.png";
import product8 from "@/assets/product-8.png";

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice: number | null;
  rating: number;
  reviews: number;
  image: string;
  tag: string;
  colors: string[];
  sizes: number[];
  description: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Stride Pro X1",
    category: "Running",
    price: 189,
    originalPrice: 220,
    rating: 4.9,
    reviews: 342,
    image: product1,
    tag: "New",
    colors: ["#fff", "#f60"],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12],
    description: "Engineered for elite performance, the Stride Pro X1 combines quantum-foam cushioning with an ultra-light carbon fiber plate. Perfect for long-distance runs and daily training.",
  },
  {
    id: 2,
    name: "Air Phantom HT",
    category: "Basketball",
    price: 215,
    originalPrice: null,
    rating: 4.8,
    reviews: 218,
    image: product2,
    tag: "Hot",
    colors: ["#111", "#f60"],
    sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13],
    description: "Dominate the court with the Air Phantom HT. Superior ankle support and responsive cushioning for explosive lateral movements.",
  },
  {
    id: 3,
    name: "Velocity Low",
    category: "Casual",
    price: 145,
    originalPrice: 175,
    rating: 4.7,
    reviews: 189,
    image: product3,
    tag: "Sale",
    colors: ["#888", "#c00"],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 11],
    description: "A sleek low-top silhouette built for everyday wear. The Velocity Low fuses street style with premium comfort.",
  },
  {
    id: 4,
    name: "CloudRift X",
    category: "Training",
    price: 199,
    originalPrice: null,
    rating: 4.9,
    reviews: 401,
    image: product4,
    tag: "New",
    colors: ["#3af", "#fff"],
    sizes: [7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12],
    description: "Versatile training shoe with CloudRift technology. Multi-directional grip and breathable mesh upper for intense gym sessions.",
  },
  {
    id: 5,
    name: "Noir Edition",
    category: "Lifestyle",
    price: 249,
    originalPrice: null,
    rating: 5.0,
    reviews: 97,
    image: product5,
    tag: "Limited",
    colors: ["#111", "#c90"],
    sizes: [8, 9, 10, 11, 12],
    description: "The Noir Edition is a statement piece. Limited production, all-black premium leather upper with gold accents. For those who stand apart.",
  },
  {
    id: 6,
    name: "Heritage Runner",
    category: "Retro",
    price: 135,
    originalPrice: 160,
    rating: 4.6,
    reviews: 275,
    image: product6,
    tag: "Sale",
    colors: ["#fff", "#2a2"],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10, 11, 12],
    description: "Classic retro runner inspired by the 1980s racing circuit. Updated with modern comfort tech while maintaining the iconic silhouette.",
  },
  {
    id: 7,
    name: "Speed Sprint",
    category: "Track",
    price: 175,
    originalPrice: null,
    rating: 4.8,
    reviews: 156,
    image: product7,
    tag: "New",
    colors: ["#fc0", "#222"],
    sizes: [7, 7.5, 8, 8.5, 9, 9.5, 10],
    description: "Built for the track, the Speed Sprint features a razor-thin outsole and sprint spike compatibility. Your fastest lap starts here.",
  },
  {
    id: 8,
    name: "Rose Velocity",
    category: "Women's",
    price: 165,
    originalPrice: 190,
    rating: 4.9,
    reviews: 312,
    image: product8,
    tag: "Sale",
    colors: ["#f9a", "#fff"],
    sizes: [5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10],
    description: "Designed for the modern woman on the move. The Rose Velocity combines feminine aesthetics with high-performance running tech.",
  },
];

export const tagColors: Record<string, string> = {
  New: "bg-brand-orange text-primary-foreground",
  Hot: "bg-red-500 text-primary-foreground",
  Sale: "bg-green-500 text-primary-foreground",
  Limited: "bg-amber-500 text-primary-foreground",
};
