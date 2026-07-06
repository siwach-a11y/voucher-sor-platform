export type StockStatus = "confirmed" | "recently_scraped" | "unknown" | "previously_failed" | "out_of_stock";

export interface Offer {
  id: string;
  vendorId: string;
  productId: string;
  price: number;
  currency: string;
  stockStatus: StockStatus;
  /** 0-1, derived from stockStatus by the normalization engine, see STOCK_CONFIDENCE_MAP. */
  stockConfidence: number;
  /** Average observed checkout duration in ms for this vendor+product combination. */
  checkoutSpeedMs: number;
  /** 0-1, see RISK_PENALTY_MAP in the SOR engine. */
  riskScore: number;
  /** 0-1 rolling success rate for this vendor. */
  successRate: number;
  /** Cached output of the SOR engine's scoreOffer(); recomputed by the scheduler. */
  finalScore: number | null;
  paymentMethods: string[];
  checkoutAvailable: boolean;
  estimatedDeliveryMinutes: number | null;
  lastUpdated: string;
}

/** Raw, vendor-specific data collected by a crawler before normalization. */
export interface RawVendorOffer {
  vendorId: string;
  productExternalId: string;
  productName: string;
  price: number;
  currency: string;
  inStock: boolean | "unknown";
  estimatedDeliveryMinutes: number | null;
  paymentMethods: string[];
  checkoutAvailable: boolean;
  scrapedAt: string;
}
