import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table, TBody, TD, TH, THead, TR } from '@/components/ui/Table'

export type AdminColumn<Row> = {
  key: string
  label: string
  className?: string
  render: (row: Row) => React.ReactNode
}

export function AdminDataTable<Row>({
  rows, columns, rowKey, emptyTitle = 'لا توجد سجلات', emptyDescription = 'لم تُضف بيانات مطابقة حتى الآن.',
  page = 1, pageSize = 25, total = rows.length, pageHref,
}: {
  rows: Row[]
  columns: AdminColumn<Row>[]
  rowKey: (row: Row) => string
  emptyTitle?: string
  emptyDescription?: string
  page?: number
  pageSize?: number
  total?: number
  pageHref?: (page: number) => string
}) {
  if (rows.length === 0) return <EmptyState title={emptyTitle} description={emptyDescription} />
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="space-y-4">
      <Table>
        <THead><tr>{columns.map((column) => <TH key={column.key} className={column.className}>{column.label}</TH>)}</tr></THead>
        <TBody>{rows.map((row) => <TR key={rowKey(row)}>{columns.map((column) => <TD key={column.key} className={column.className}>{column.render(row)}</TD>)}</TR>)}</TBody>
      </Table>
      {pages > 1 && pageHref && (
        <nav aria-label="صفحات النتائج" className="flex items-center justify-between text-sm text-text-soft">
          <span>صفحة {page} من {pages} · {total.toLocaleString('ar-EG')} سجل</span>
          <div className="flex gap-2">
            {page > 1 && <Link className="rounded-xl border border-line px-4 py-2 hover:bg-surface-raised" href={pageHref(page - 1)}>السابق</Link>}
            {page < pages && <Link className="rounded-xl border border-line px-4 py-2 hover:bg-surface-raised" href={pageHref(page + 1)}>التالي</Link>}
          </div>
        </nav>
      )}
    </div>
  )
}
