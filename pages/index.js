import Hero from "@/components/Hero";
import { mongooseConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import Products from "@/components/Products";
import Collection from "@/components/Collection";

export default function Home({ featuredProduct, newProducts, collectionProduct }) {
  return (
    <>
      <Hero product={featuredProduct} />

      <hr className="my-8 h-px border-0 bg-gray-300" />

      <Products products={newProducts} />

      <hr className="my-8 h-px border-0 bg- /gray-300" />

      <Collection product={collectionProduct} />
    </>
  );
}

export async function getServerSideProps() {
  await mongooseConnect();

  const featuredId = "669816e3f22e9571a9e6d93e";

  const collectionId = "669923c6f22e9571a9e6d955";

  const featuredProduct = await Product.findById(featuredId);

  const collectionProduct = await Product.findById(collectionId);

  const newProducts = await Product.find({}, null, {
    sort: { _id: 1 },
    limit: 5,
  });

  return {
    props: {
      featuredProduct: JSON.parse(JSON.stringify(featuredProduct)),
      newProducts: JSON.parse(JSON.stringify(newProducts)),
      collectionProduct: JSON.parse(JSON.stringify(collectionProduct)),
    }
  }
}
