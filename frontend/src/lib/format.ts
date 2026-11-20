export const lps = (n: number) =>
  `L ${n.toLocaleString('es-HN', { minimumFractionDigits: 0 })}`

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })

export const shortDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-HN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'America/Tegucigalpa' })
