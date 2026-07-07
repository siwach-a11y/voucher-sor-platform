import { ConnectorCard, type ConnectorCardProps } from './ConnectorCard.js'

export interface ConnectorListProps {
  connectors: ConnectorCardProps[]
}

/** Ranked list of connectors — the routing engine's candidate set, rendered with no vendor branding. */
export function ConnectorList({ connectors }: ConnectorListProps) {
  return (
    <div className="connector-list">
      {connectors.map((connector) => (
        <ConnectorCard key={connector.connectorId} {...connector} />
      ))}
    </div>
  )
}
