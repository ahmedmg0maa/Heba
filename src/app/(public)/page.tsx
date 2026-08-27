import { getHomeData } from '@/lib/data/home'
import { getHomeCopy, getPublishedHomeSections } from '@/lib/data/cms'
import { HomeSectionRenderer } from '@/components/home/HomeSectionRenderer'

export const revalidate = 300

export default async function HomePage() {
  const [data, copy, sections] = await Promise.all([getHomeData(), getHomeCopy(), getPublishedHomeSections()])

  return (
    <main>
      {sections.map((section) => <HomeSectionRenderer key={section.id} section={section} copy={copy} data={data} />)}
    </main>
  )
}
