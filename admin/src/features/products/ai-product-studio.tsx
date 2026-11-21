"use client";

import { useState } from "react";

import { toast } from "sonner";

import { Loader2, Sparkles, WandSparkles } from "lucide-react";

import { clientFetch } from "@/lib/client-api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export interface ProductStudioResult {
  name: string;
  description: string;
  tag: "Best Seller" | "Trending" | "Limited" | "New" | "Hot" | "Sale";
  gender: "men" | "women" | "unisex";
  imageAlt: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
}

interface ProductStudioInput {
  name?: string;
  description?: string;
  category?: string;
  gender?: "men" | "women" | "unisex";
  price?: number;
  discountPrice?: number;
  tag?: string;
  colors?: string[];
  sizes?: string[];
  image?: string;
}

interface AIProductStudioProps {
  getProductInput: () => ProductStudioInput;
  onApply: (result: ProductStudioResult) => void;
}

const tones = [
  { value: "professional", label: "Professional" },
  { value: "playful", label: "Playful" },
  { value: "minimal", label: "Minimal" },
  { value: "premium", label: "Premium" },
];

export default function AIProductStudio({
  getProductInput,
  onApply,
}: AIProductStudioProps) {
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState<ProductStudioResult | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);

    try {
      const response = await clientFetch("/api/ai/product-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...getProductInput(),
          brief: brief || undefined,
          tone,
        }),
      });

      const payload = await response.json();

      if (!payload.success) {
        throw new Error(
          payload.message || "Could not generate product content"
        );
      }

      setResult(payload.data);
      toast.success("Product content generated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not generate product content"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-brand-orange/30 bg-brand-surface-raised/40">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="size-4 text-brand-orange" />
              AI Product Studio
            </CardTitle>
            <CardDescription>
              Draft copy, SEO metadata and image alt text from the product
              details. Review everything before saving.
            </CardDescription>
          </div>
          <WandSparkles className="hidden size-8 text-brand-orange/40 sm:block" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
          <Textarea
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            placeholder="Optional brief: occasion, audience, materials, or the selling point to emphasise."
            maxLength={600}
            rows={3}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="ai-tone">
              Tone
            </label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="ai-tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tones.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              className="w-full"
              onClick={generate}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              {loading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </div>

        {result && (
          <div className="space-y-4 rounded-xl border border-brand-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge>{result.tag}</Badge>
                <Badge variant="outline">{result.gender}</Badge>
              </div>
              <Button type="button" size="sm" onClick={() => onApply(result)}>
                Apply all
              </Button>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Name
              </p>
              <p className="font-medium">{result.name}</p>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Description
              </p>
              <p className="text-sm">{result.description}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Image alt text
                </p>
                <p className="text-sm">{result.imageAlt}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Keywords
                </p>
                <div className="flex flex-wrap gap-1">
                  {result.keywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  SEO title
                </p>
                <p className="text-sm">{result.seoTitle}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  SEO description
                </p>
                <p className="text-sm">{result.seoDescription}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
