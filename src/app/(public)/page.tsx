import { getHomeData } from '@/lib/data/home'
import { getHomeCopy, getPublishedCmsPage, getPublishedHomeSections } from '@/lib/data/cms'
import { HomeSectionRenderer } from '@/components/home/HomeSectionRenderer'
import { hasSupabasePublicConfig } from '@/lib/supabase/public-key'
import { hasSupabaseServerSecret } from '@/lib/supabase/server'
import { isPreviewExperienceEnabled } from '@/lib/preview/experience'
import { PreviewExperienceSpotlight } from '@/components/experience/PreviewExperienceSpotlight'

export const revalidate = 300

export default async function HomePage() {
  const [data, copy, sections, approvedPrivacy] = await Promise.all([getHomeData(), getHomeCopy(), getPublishedHomeSections(), getPublishedCmsPage('privacy')])
  const newsletterEnabled = Boolean(approvedPrivacy) && hasSupabasePublicConfig() && hasSupabaseServerSecret()
  const showPreviewExperience = isPreviewExperienceEnabled()

  return (
    <main>
      {sections.map((section) => (
        <div key={section.id} className="contents">
          <HomeSectionRenderer section={section} copy={copy} data={data} newsletterEnabled={newsletterEnabled} />
          {showPreviewExperience && section.kind === 'hero' && <PreviewExperienceSpotlight />}
        </div>
      ))}
    </main>
  )
}
