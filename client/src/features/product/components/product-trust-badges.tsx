import { RotateCcw, Shield, Truck } from "lucide-react";

const BADGES = [
  { icon: Truck, label: "Free delivery", sub: "On orders over ₹999" },
  { icon: RotateCcw, label: "Easy returns", sub: "30-day policy" },
  { icon: Shield, label: "Authentic", sub: "100% genuine" },
];

export function ProductTrustBadges() {
  return (
    <div className="border-brand-border mt-8 grid grid-cols-3 gap-3 border-t pt-8">
      {BADGES.map((badge) => (
        <div
          key={badge.label}
          className="flex flex-col items-center gap-2 text-center"
        >
          <badge.icon size={20} className="text-brand-orange" />
          <div>
            <p className="font-body text-foreground text-xs font-semibold">
              {badge.label}
            </p>
            <p className="font-body text-muted-foreground text-[10px]">
              {badge.sub}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
