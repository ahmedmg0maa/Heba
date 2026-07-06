import { PublicHeader } from '@/components/layout/PublicHeader'
import { PublicFooter } from '@/components/layout/PublicFooter'
import { getFeatureFlags } from '@/lib/data/cms'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const flags = await getFeatureFlags()
  return (
    <>
      <PublicHeader flags={flags} />
      <div className="flex flex-1 flex-col">{children}</div>
      <PublicFooter />
    </>
  )
}
