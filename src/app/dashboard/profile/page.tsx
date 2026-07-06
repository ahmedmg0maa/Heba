import type { Metadata } from 'next'
import { getMyProfile } from '@/lib/data/dashboard'
import { Card, CardTitle } from '@/components/ui/Card'
import { ProfileForm } from '@/components/dashboard/ProfileForm'

export const metadata: Metadata = { title: 'ملفي الشخصي' }

export default async function ProfilePage() {
  const profile = await getMyProfile()

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-deep-teal">ملفي الشخصي</h1>
        <p className="mt-1 text-text-soft">بياناتك الأساسية كما تظهر في حسابك وشهاداتك.</p>
      </header>
      <Card className="p-8">
        <CardTitle className="mb-6">البيانات الأساسية</CardTitle>
        <ProfileForm profile={profile} />
      </Card>
    </div>
  )
}
