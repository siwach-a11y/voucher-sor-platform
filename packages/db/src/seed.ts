import { prisma } from "./client.js";

/**
 * Intentionally seeds nothing. This project ships as a vendor-agnostic framework — it must not
 * invent vendors, products, offers, or URLs (see packages/framework/src/connectors/README.md).
 * Register your own real products/connectors from your own application; this script exists only
 * so `db:migrate`/CI pipelines that expect a seed step have one to run.
 */
async function main() {
  console.log("Seed complete: no demo data is created. Register real products and connectors from your own application.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
