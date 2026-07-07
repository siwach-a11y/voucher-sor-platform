/** A sellable item the framework routes purchase requests for. Deliberately generic — no vendor,
 * brand, or category vocabulary baked in; callers attach whatever attributes their domain needs. */
export interface Product {
  id: string;
  name: string;
  category?: string;
  attributes?: Record<string, unknown>;
}
