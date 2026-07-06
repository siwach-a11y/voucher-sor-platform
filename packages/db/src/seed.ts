import { prisma } from "./client.js";

async function main() {
  const [amazonUsGiftCard, steamWallet] = await Promise.all([
    prisma.product.upsert({
      where: { id: "prod_amazon_us_50" },
      update: {},
      create: { id: "prod_amazon_us_50", name: "Amazon US $50 Gift Card", brand: "Amazon", country: "US", category: "gift_card" },
    }),
    prisma.product.upsert({
      where: { id: "prod_steam_25" },
      update: {},
      create: { id: "prod_steam_25", name: "Steam Wallet $25", brand: "Steam", country: "US", category: "gaming" },
    }),
  ]);

  const vendors = await Promise.all(
    [
      { id: "vendor_a", name: "Vendor A Marketplace", website: "https://vendor-a.example.com", priority: 1 },
      { id: "vendor_b", name: "Vendor B Deals", website: "https://vendor-b.example.com", priority: 2 },
      { id: "vendor_c", name: "Vendor C Vouchers", website: "https://vendor-c.example.com", priority: 3 },
    ].map((v) =>
      prisma.vendor.upsert({
        where: { id: v.id },
        update: {},
        create: { ...v, enabled: true },
      }),
    ),
  );

  await Promise.all(
    vendors.map((v) =>
      prisma.vendorStats.upsert({
        where: { vendorId: v.id },
        update: {},
        create: {
          vendorId: v.id,
          successfulOrders: 470,
          totalOrders: 500,
          successfulExecutions: 480,
          totalExecutions: 500,
          averageCheckoutTimeMs: 8000,
          lastCaptchaLevel: "light",
          lastCheckoutFailed: false,
        },
      }),
    ),
  );

  const offerRows = [
    { vendorId: "vendor_a", productId: amazonUsGiftCard.id, price: 48.5, stockStatus: "confirmed" as const, checkoutSpeedMs: 6000 },
    { vendorId: "vendor_b", productId: amazonUsGiftCard.id, price: 47.9, stockStatus: "recently_scraped" as const, checkoutSpeedMs: 12000 },
    { vendorId: "vendor_c", productId: amazonUsGiftCard.id, price: 49.75, stockStatus: "confirmed" as const, checkoutSpeedMs: 9000 },
    { vendorId: "vendor_a", productId: steamWallet.id, price: 23.99, stockStatus: "confirmed" as const, checkoutSpeedMs: 5000 },
  ];

  for (const o of offerRows) {
    await prisma.offer.upsert({
      where: { vendorId_productId: { vendorId: o.vendorId, productId: o.productId } },
      update: { price: o.price, stockStatus: o.stockStatus, checkoutSpeedMs: o.checkoutSpeedMs, lastUpdated: new Date() },
      create: {
        vendorId: o.vendorId,
        productId: o.productId,
        price: o.price,
        currency: "USD",
        stockStatus: o.stockStatus,
        stockConfidence: o.stockStatus === "confirmed" ? 1 : 0.8,
        checkoutSpeedMs: o.checkoutSpeedMs,
        riskScore: 0.2,
        successRate: 0.94,
        paymentMethods: ["card", "paypal"],
        checkoutAvailable: true,
        estimatedDeliveryMinutes: 5,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
