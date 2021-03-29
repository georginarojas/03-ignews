import { GetStaticProps } from "next";
import Head from "next/head";
import { SubscribeButton } from "../components/SubscribeButton";
import { stripe } from "../services/stripe";

import styles from "./home.module.scss";

interface HomeProps {
  product: {
    priceId: string;
    amount: number;
  }
}

export default function Home({product}: HomeProps) {
  console.log(product);
  return (
    <>
      <Head>
        <title>Home | ig.news</title>
      </Head>
      <main className={styles.contentContainer}>
        <section className={styles.hero}>
          <span>👏 Hey, welcome</span>
          <h1>
            {" "}
            News about the <span>React</span> world.
          </h1>
          <p>
            Get access to all the publications <br />
            <span>for {product.amount} month</span>
          </p>
          <SubscribeButton priceId={product.priceId} />
        </section>
        <img src="/images/avatar.svg" alt="Girl coding" />
      </main>
    </>
  );
}

//-- Using SSR (server side rendering)
// export const getServerSideProps: GetServerSideProps = async () => {

//-- Usgin SSG (server static generation)
export const getStaticProps: GetStaticProps = async () => {

  // "retrive" return only one product
  // "expand" return all the informations of the product
  const price = await stripe.prices.retrieve("price_1IaTVyAuCDd75JjsgkpCBL3l", { 
    expand: ['product']
  });

  const product = {
    priceId: price.id,
    amount: new Intl.NumberFormat('en-US', {
      style: "currency",
      currency: "USD",
    }).format( price.unit_amount /100,) // because is in cents
  }

  return {
    props: {
      product
    },
    revalidate: 60 * 60 * 24 // 24 hours (This is used in SSG)
  };
};
