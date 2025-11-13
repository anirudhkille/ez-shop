type HeadProps = {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  noIndex?: boolean;
};

export default function Head({
  title = "EZ Shop",
  description = "EZ Shop - Your one-stop online store for a seamless shopping experience. Discover a wide range of products, exclusive deals, and fast shipping. Created by Anirudh Kille, this e-commerce platform offers convenience at your fingertips.",
  keywords = "EZ Shop, E Commerce, Anirudh Kille, anirudhkille, kille, mern stack",
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage = "/og.png",
  ogType = "website",
  twitterCard = "summary_large_image",
  noIndex = false,
}: HeadProps) {
  // avoid window.location in SSR
  const currentUrl =
    typeof window !== "undefined" ? window.location.href : canonicalUrl || "";

  return (
    <article>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}

      {currentUrl && <link rel="canonical" href={currentUrl} />}

      <meta
        name="robots"
        content={noIndex ? "noindex, nofollow" : "index, follow"}
      />

      {/* Open Graph */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:image" content={ogImage} />
      {currentUrl && <meta property="og:url" content={currentUrl} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Carat Years" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Viewport */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Additional Meta */}
      <meta name="author" content="Anirudh Kille" />
      <meta name="language" content="en-GB" />
    </article>
  );
}
