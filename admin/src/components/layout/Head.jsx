import { Helmet } from "react-helmet";

const Head = ({
  title = "EZ Shop",
  description = "EZ Shop - Your one-stop online store for a seamless shopping experience. Discover a wide range of products, exclusive deals, and fast shipping. Created by Anirudh Kille, this e-commerce platform offers convenience at your fingertips.",
  metaTags = [],
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {metaTags.map((tag, index) => (
        <meta key={index} {...tag} />
      ))}
    </Helmet>
  );
};
export default Head;
