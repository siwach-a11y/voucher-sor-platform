import Fastify from "fastify";
import cors from "@fastify/cors";
import { logger } from "@voucher-sor/logger";
import { productsRoutes } from "./routes/products.js";
import { offersRoutes } from "./routes/offers.js";
import { ordersRoutes } from "./routes/orders.js";
import { vendorsRoutes } from "./routes/vendors.js";

const fastify = Fastify({ logger: logger.child({ app: "api" }) });

await fastify.register(cors, { origin: true });
await fastify.register(productsRoutes, { prefix: "/products" });
await fastify.register(offersRoutes, { prefix: "/products" });
await fastify.register(ordersRoutes, { prefix: "/orders" });
await fastify.register(vendorsRoutes, { prefix: "/vendors" });

// Cloud Run (and most PaaS hosts) inject PORT and expect the process to bind to it.
const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);

fastify
  .listen({ port, host: "0.0.0.0" })
  .catch((err) => {
    fastify.log.error(err);
    process.exit(1);
  });
