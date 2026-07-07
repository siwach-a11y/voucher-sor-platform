import type { PurchaseRequest, PurchaseResult, SearchRequest, SearchResult, VerificationResult, VerifyRequest } from '../../domain/index.js'

/**
 * Contract every vendor integration must implement. The framework depends ONLY on this interface —
 * routing, scoring, execution, and the UI never reference a concrete vendor. Analogous to a payment
 * gateway or database driver interface: this repo owns the contract, not the implementations.
 */
export interface VendorConnector {
  readonly id: string
  readonly name: string

  search(request: SearchRequest): Promise<SearchResult[]>
  buy(request: PurchaseRequest): Promise<PurchaseResult>
  verify(request: VerifyRequest): Promise<VerificationResult>
}
