import { query as q } from "faunadb";
import NextAuth from "next-auth";
import Providers from "next-auth/providers";

import { fauna } from "../../../services/fauna";

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      scope: "read:user", // scope defines what informations we need from the user github
    }),
  ],
  callbacks: {
    async signIn(user, account, profile) {
      const { email } = user;

      try {
        await fauna.query(
            q.If(
                q.Not(
                    q.Exists(
                        q.Match(
                            q.Index("user_by_email"), // index fauna
                            q.Casefold(user.email) // casefold made a lowercase
                        )
                    )
                ),
                q.Create(
                    q.Collection("users"),
                     { data: { email } }
                ),
                q.Get(
                    q.Match(
                        q.Index('user_by_email'), 
                        q.Casefold(user.email) 
                    )
                )
            )    
        )
        return true;
      } catch {
        return false;
      }
    },
  },
});
