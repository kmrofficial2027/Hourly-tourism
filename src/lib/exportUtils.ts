// ============================================================================
// Hourly Tourism - CSV Export Utility
// ============================================================================

export interface ExportColumn<T> {
  header: string
  key: keyof T | string
  formatter?: (item: T) => string | number | null | undefined
}

export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  data: T[],
  columns: ExportColumn<T>[]
) {
  if (!data || data.length === 0) {
    alert('No data to export.')
    return
  }

  const headers = columns.map((col) => `"${col.header.replace(/"/g, '""')}"`).join(',')

  const rows = data.map((item) => {
    return columns
      .map((col) => {
        let val: any
        if (col.formatter) {
          val = col.formatter(item)
        } else {
          val = item[col.key]
        }

        if (val === null || val === undefined) {
          return '""'
        }

        const stringVal = String(val).replace(/"/g, '""')
        return `"${stringVal}"`
      })
      .join(',')
  })

  const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

