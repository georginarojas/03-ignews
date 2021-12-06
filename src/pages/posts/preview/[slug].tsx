import React, { useEffect } from "react";
import Head from "next/head";
import { GetStaticPaths, GetStaticProps } from "next";
import { useSession } from "next-auth/client";
import Link from "next/link";
// import { useRouter } from "next/dist/client/router";
import { useRouter } from "next/router";

import { RichText } from "prismic-dom";
import { getPrismicClient } from "../../../services/prismic";

import styles from "../post.module.scss";

interface PostPreviewProps {
  post: {
    slug: string;
    title: string;
    content: string;
    updatedAt: string;
  };
}

export default function PostPreview({ post }: PostPreviewProps) {
  const [session] = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.activeSubscription) {
      router.push(`/posts/${post.slug}`);
    }
  }, [session]);

  return (
    <>
      <Head>
        <title>{post.title} | Ignews</title>
      </Head>
      <main className={styles.container}>
        <article className={styles.post}>
          <h1>{post.title}</h1>
          <time>{post.updatedAt}</time>
          {/* for to use the format in html, only used when is security */}
          <div
            className={`${styles.postContent} ${styles.previewContent}`}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className={styles.continueReading}>
            Wanna continue reading?
            <Link href="/">
              <a>Subscribe now 🤗</a>
            </Link>
          </div>
        </article>
      </main>
    </>
  );
}

// This method only exists in dynamic pages [var].tsx
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [], // we pass all the paths that we want to load during the build
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  // Get the contert post from prismic
  const prismic = getPrismicClient();
  const response = await prismic.getByUID("post", String(slug), {});

  const post = {
    slug,
    title: RichText.asText(response.data.title),
    content: RichText.asHtml(response.data.content.splice(0, 3)), // takes the first 3 parts
    updatedAt: new Date(response.last_publication_date).toLocaleDateString(
      "pt-BR",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    ),
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30 // 30 min
  };
};
