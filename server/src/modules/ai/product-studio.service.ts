import { env } from "@/config/env.config";
import {
  productStudioInputSchema,
  productStudioOutputSchema,
  type ProductStudioInput,
  type ProductStudioOutput,
} from "@/modules/ai/ai.schema";
import { AppError } from "@/utils/app-error";

type ProductStudioContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export interface ProductStudioMessage {
  role: "system" | "user";
  content: string | ProductStudioContentPart[];
}

export interface AiConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  visionEnabled: boolean;
  timeoutMs: number;
}

interface GenerateProductStudioOptions {
  config?: AiConfig;
  fetchImpl?: typeof fetch;
}

export const getAiConfig = (): AiConfig => ({
  apiKey: env.AI_API_KEY,
  baseUrl: env.AI_BASE_URL,
  model: env.AI_MODEL,
  visionEnabled: env.AI_VISION_ENABLED,
  timeoutMs: env.AI_TIMEOUT_MS,
});

const SYSTEM_PROMPT = `You are an ecommerce copywriter for EZ Shop. Write accurate, specific product content from the supplied attributes and image.

Return a single JSON object with exactly these keys:
- name: product name, up to 120 characters
- description: 2-4 sentences, 20-1200 characters, no HTML
- tag: one of "Best Seller", "Trending", "Limited", "New", "Hot", "Sale"
- gender: one of "men", "women", "unisex"
- imageAlt: concise accessible image description, 5-160 characters
- seoTitle: search title, 10-70 characters
- seoDescription: meta description, 50-160 characters
- keywords: 3-10 short search phrases

Do not invent materials, discounts, certifications, or claims that are not supported by the input. Return JSON only, with no markdown or commentary.`;

const buildUserText = (input: ProductStudioInput) => {
  const tone = input.tone ?? "professional";

  return `Create product content in a ${tone} tone.

Product data:
${JSON.stringify(input, null, 2)}

Use the existing name when it is already clear. Preserve the product's meaning and only fill gaps that the data supports.`;
};

export const buildProductStudioMessages = (
  input: ProductStudioInput,
  includeImage: boolean,
): ProductStudioMessage[] => {
  const text = buildUserText(input);
  const image = input.image;

  const userContent: string | ProductStudioContentPart[] =
    includeImage && image
      ? [
          { type: "text", text },
          { type: "image_url", image_url: { url: image } },
        ]
      : text;

  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userContent },
  ];
};

export const parseProductStudioResult = (
  content: string,
): ProductStudioOutput => {
  const fenced = content.trim().match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : content.trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(candidate);
  } catch {
    throw new AppError("AI returned an invalid JSON response.", 502);
  }

  const result = productStudioOutputSchema.safeParse(parsed);
  if (!result.success) {
    throw new AppError(
      "AI returned product content in an invalid format.",
      502,
    );
  }

  return result.data;
};

const requestCompletion = async (
  input: ProductStudioInput,
  config: AiConfig,
  fetchImpl: typeof fetch,
  withJsonMode: boolean,
  includeImage: boolean,
) => {
  const body: Record<string, unknown> = {
    model: config.model,
    messages: buildProductStudioMessages(input, includeImage),
    temperature: 0.6,
    max_tokens: 900,
  };

  if (withJsonMode) {
    body.response_format = { type: "json_object" };
  }

  return fetchImpl(`${config.baseUrl.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(config.timeoutMs),
  });
};

const providerError = async (response: Response) => {
  const detail = await response.text().catch(() => "");
  const suffix = detail ? `: ${detail.slice(0, 300)}` : "";

  return new AppError(
    `AI provider request failed (${response.status})${suffix}`,
    response.status === 429 ? 503 : 502,
  );
};

export const generateProductStudio = async (
  input: ProductStudioInput,
  options: GenerateProductStudioOptions = {},
): Promise<ProductStudioOutput> => {
  const config = options.config ?? getAiConfig();
  const fetchImpl = options.fetchImpl ?? fetch;

  if (!config.apiKey) {
    throw new AppError(
      "AI Product Studio is not configured. Add AI_API_KEY on the server.",
      503,
    );
  }

  productStudioInputSchema.parse(input);

  const includeImage = config.visionEnabled && Boolean(input.image);

  try {
    let response = await requestCompletion(
      input,
      config,
      fetchImpl,
      true,
      includeImage,
    );

    if (response.status === 400) {
      response = await requestCompletion(
        input,
        config,
        fetchImpl,
        false,
        includeImage,
      );

      if (response.status === 400 && includeImage) {
        response = await requestCompletion(
          input,
          config,
          fetchImpl,
          false,
          false,
        );
      }
    }

    if (!response.ok) {
      throw await providerError(response);
    }

    const payload = (await response.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    } | null;

    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new AppError("AI provider returned an empty response.", 502);
    }

    return parseProductStudioResult(content);
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      throw new AppError("AI request timed out. Please try again.", 504);
    }

    throw new AppError("AI provider is unavailable. Please try again.", 502);
  }
};
