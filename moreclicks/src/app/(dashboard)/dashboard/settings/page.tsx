'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Email</label>
            <p className="text-muted-foreground mt-1">{session?.user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Name</label>
            <p className="text-muted-foreground mt-1">{session?.user?.name || 'Not set'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={async () => {
              try {
                await signOut({ callbackUrl: '/' })
              } catch (error) {
                console.error('Sign out error:', error)
                // Fallback: redirect manually if signOut fails
                window.location.href = '/'
              }
            }}
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

