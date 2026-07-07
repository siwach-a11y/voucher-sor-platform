let counter = 0

/** Simple, dependency-free id generator for framework-internal use (job ids, log entry ids). Host
 * applications should use their own id strategy (cuid/uuid/db-generated) for persisted entities. */
export function nextId(prefix: string): string {
  counter += 1
  return `${prefix}_${Date.now()}_${counter}`
}
