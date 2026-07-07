import type { ConnectorEntity, ExecutionLogEntity, OfferEntity, OrderEntity, RoutingDecisionEntity } from './entities.js'

/** Generic CRUD contract every entity repository implements. The framework never implements these
 * itself — a host application backs them with Postgres, SQLite, an in-memory store, whatever it needs. */
export interface Repository<TEntity, TId = string> {
  findById(id: TId): Promise<TEntity | null>
  findMany(filter?: Partial<TEntity>): Promise<TEntity[]>
  create(entity: TEntity): Promise<TEntity>
  update(id: TId, patch: Partial<TEntity>): Promise<TEntity>
  delete(id: TId): Promise<void>
}

export type OrderRepository = Repository<OrderEntity>
export type OfferRepository = Repository<OfferEntity>
export type ConnectorRepository = Repository<ConnectorEntity>
export type ExecutionLogRepository = Repository<ExecutionLogEntity>
export type RoutingDecisionRepository = Repository<RoutingDecisionEntity>
