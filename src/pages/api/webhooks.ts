import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

//This function get the readable stream from stripe and convert in an object in  string format
async function buffer(readable: Readable) {
  const chunks = [];

  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

// Disable the bodyParser because the request is a Stream
// https://nextjs.org/docs/api-routes/api-middlewares
export const config = {
  api: {
    bodyParser: false,
  },
};

// Array with the relevant events for our app
const relevantEvents = new Set([
  "checkout.session.completed",
//   "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
]);

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    // Converting the request of type stream to a string
    const buf = await buffer(req);

    // Getting the secret code for to avoid malicious information
    const secret = req.headers["stripe-signature"];

    // Get the request and compare the secret code
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        buf,
        secret,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook error: ${err.message}`);
    }

    const { type } = event;
    if (relevantEvents.has(type)) {
      try {
        switch (type) {
        //   case "customer.subscription.created":
          case "customer.subscription.updated":
          case "customer.subscription.deleted":
            const subscription = event.data.object as Stripe.Subscription;
            await saveSubscription(
              subscription.id,
              subscription.customer.toString(),
              false,
            //   type === "customer.subscription.created",
            );
            break;

          case "checkout.session.completed":
            const checkoutSession = event.data
              .object as Stripe.Checkout.Session;
            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true,
            );
            break;
          default:
            throw new Error("Unhandled event type.");
        }
      } catch (err) {
        return res.json({ error: "Webhook handle failed." });
      }
    }

    res.json({ received: true });
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).send("Method not allowed");
  }
};
