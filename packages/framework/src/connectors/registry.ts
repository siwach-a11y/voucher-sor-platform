import type { VendorConnector } from './base/connector.interface.js'

/**
 * The single place the framework knows connectors exist. Nothing outside this class ever imports
 * a concrete connector — callers register instances at startup (e.g. from a config-driven loader),
 * and everything downstream (routing, scoring, execution, UI) only ever asks the registry.
 */
export class ConnectorRegistry {
  private readonly connectors = new Map<string, VendorConnector>()

  register(connector: VendorConnector): void {
    if (this.connectors.has(connector.id)) {
      throw new Error(`Connector "${connector.id}" is already registered`)
    }
    this.connectors.set(connector.id, connector)
  }

  unregister(connectorId: string): void {
    this.connectors.delete(connectorId)
  }

  get(connectorId: string): VendorConnector | undefined {
    return this.connectors.get(connectorId)
  }

  list(): VendorConnector[] {
    return [...this.connectors.values()]
  }
}
