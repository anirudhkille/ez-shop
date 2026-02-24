import { useState } from "react";

import { ChevronDown } from "lucide-react";

import { Checkbox } from "@/components/ui/checkbox";

const genders = ["Men", "Women", "Unisex"];

const types = ["New", "Featured", "Sale"];

const priceRanges = [
  "Under ₹5,000",
  "₹5,000 - ₹10,000",
  "₹10,000 - ₹15,000",
  "Above ₹15,000",
];

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

const colors = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#22C55E" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Pink", value: "#EC4899" },
  { name: "Orange", value: "#F97316" },
  { name: "Navy", value: "#1E3A5F" },
  { name: "Gray", value: "#6B7280" },
];

const categories = ["shoes", "clothing"];

export default function FilterSidebar() {
  const [openSections, setOpenSections] = useState({
    categories: true,
    gender: true,
    type: true,
    price: true,
    size: true,
    color: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside className="w-64 overflow-y-auto border-r border-gray-200 bg-white p-6">
      <div>
        {/* Categories */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("categories")}
            className="mb-4 flex w-full items-center justify-between py-2"
          >
            <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
            <ChevronDown
              size={18}
              className={`text-gray-600 transition-transform ${
                openSections.categories ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSections.categories && (
            <div className="space-y-3 pb-4">
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox id={category} className="h-4 w-4" />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Gender */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("gender")}
            className="mb-4 flex w-full items-center justify-between py-2"
          >
            <h3 className="text-sm font-semibold text-gray-900">Gender</h3>
            <ChevronDown
              size={18}
              className={`text-gray-600 transition-transform ${
                openSections.gender ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSections.gender && (
            <div className="space-y-3 pb-4">
              {genders.map((gender) => (
                <label
                  key={gender}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox id={gender} className="h-4 w-4" />
                  <span className="text-sm text-gray-700">{gender}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Type (New, Featured, Sale) */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("type")}
            className="mb-4 flex w-full items-center justify-between py-2"
          >
            <h3 className="text-sm font-semibold text-gray-900">Type</h3>
            <ChevronDown
              size={18}
              className={`text-gray-600 transition-transform ${
                openSections.type ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSections.type && (
            <div className="space-y-3 pb-4">
              {types.map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox id={type} className="h-4 w-4" />
                  <span className="text-sm text-gray-700">
                    {type}
                    {type === "Sale" && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                        Hot
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("price")}
            className="mb-4 flex w-full items-center justify-between py-2"
          >
            <h3 className="text-sm font-semibold text-gray-900">Price</h3>
            <ChevronDown
              size={18}
              className={`text-gray-600 transition-transform ${
                openSections.price ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSections.price && (
            <div className="space-y-3 pb-4">
              {priceRanges.map((range) => (
                <label
                  key={range}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox id={range} className="h-4 w-4" />
                  <span className="text-sm text-gray-700">{range}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Size */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection("size")}
            className="mb-4 flex w-full items-center justify-between py-2"
          >
            <h3 className="text-sm font-semibold text-gray-900">Size</h3>
            <ChevronDown
              size={18}
              className={`text-gray-600 transition-transform ${
                openSections.size ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSections.size && (
            <div className="space-y-3 pb-4">
              {sizes.map((size) => (
                <label
                  key={size}
                  className="flex cursor-pointer items-center gap-3"
                >
                  <Checkbox id={size} className="h-4 w-4" />
                  <span className="text-sm text-gray-700">{size}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Color */}
        <div>
          <button
            onClick={() => toggleSection("color")}
            className="mb-4 flex w-full items-center justify-between py-2"
          >
            <h3 className="text-sm font-semibold text-gray-900">Color</h3>
            <ChevronDown
              size={18}
              className={`text-gray-600 transition-transform ${
                openSections.color ? "rotate-180" : ""
              }`}
            />
          </button>
          {openSections.color && (
            <div className="grid grid-cols-5 gap-2 pb-4">
              {colors.map((color) => (
                <button
                  key={color.name}
                  title={color.name}
                  className="group relative h-8 w-8 rounded-full border-2 border-gray-200 transition-all hover:scale-110 hover:border-gray-400 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none"
                  style={{ backgroundColor: color.value }}
                >
                  <span className="sr-only">{color.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
