import { getHomeData } from '@/lib/data/home'
import { getHomeCopy, getPublishedCmsPage, getPublishedHomeSections } from '@/lib/data/cms'
import { HomeSectionRenderer } from '@/components/home/HomeSectionRenderer'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { hasSupabaseServerSecret } from '@/lib/supabase/server'

export const revalidate = 300

export default async function HomePage() {
  const [data, copy, sections, approvedPrivacy] = await Promise.all([getHomeData(), getHomeCopy(), getPublishedHomeSections(), getPublishedCmsPage('privacy')])
  const newsletterEnabled = Boolean(approvedPrivacy) && hasSupabasePublicConfig() && hasSupabaseServerSecret()

  return (
    <main>
      {sections.map((section) => <HomeSectionRenderer key={section.id} section={section} copy={copy} data={data} newsletterEnabled={newsletterEnabled} />)}
    </main>
  )
}
