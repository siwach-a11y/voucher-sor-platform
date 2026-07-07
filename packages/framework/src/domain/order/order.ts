export type OrderStatus = 'pending' | 'routing' | 'executing' | 'awaiting_approval' | 'completed' | 'failed' | 'cancelled'

export interface Order {
  id: string
  productId: string
  connectorId: string | null
  status: OrderStatus
  sellingPrice: number
  purchasePrice: number | null
  currency: string
  failureReason: string | null
  createdAt: string
  updatedAt: string
}
