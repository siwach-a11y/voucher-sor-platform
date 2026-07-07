/**
 * Generic connector display card. Shows exactly what the framework knows about a connector —
 * Connector name, Status, Score, Execution Time, and a Buy action — nothing vendor-specific.
 * No logos, no fake company branding: a host application may style this however it likes, but the
 * fields shown here are deliberately the only ones the framework has any business rendering.
 */
export interface ConnectorCardProps {
  connectorId: string
  connectorName: string
  status: 'enabled' | 'disabled'
  score?: number
  executionTimeMs?: number
  onBuy?: () => void
  buyDisabled?: boolean
}

export function ConnectorCard({ connectorId, connectorName, status, score, executionTimeMs, onBuy, buyDisabled }: ConnectorCardProps) {
  return (
    <div className="connector-card" data-connector-id={connectorId}>
      <div className="connector-card__header">
        <span className="connector-card__name">{connectorName}</span>
        <span className={`connector-card__status connector-card__status--${status}`}>{status}</span>
      </div>

      <dl className="connector-card__metrics">
        <div>
          <dt>Score</dt>
          <dd>{score != null ? score.toFixed(3) : '—'}</dd>
        </div>
        <div>
          <dt>Execution Time</dt>
          <dd>{executionTimeMs != null ? `${executionTimeMs} ms` : '—'}</dd>
        </div>
      </dl>

      <button type="button" onClick={onBuy} disabled={buyDisabled ?? status === 'disabled'} className="connector-card__buy">
        Buy
      </button>
    </div>
  )
}
