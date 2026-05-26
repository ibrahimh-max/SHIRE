'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')

    const finishLogin = async () => {
      if (!code) {
        router.replace('/login')
        return
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        router.replace('/login')
        return
      }

      router.replace('/dashboard')
    }

    void finishLogin()
  }, [router, searchParams])

  return <p>Signing you in...</p>
}