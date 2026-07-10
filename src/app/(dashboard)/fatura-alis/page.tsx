'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FaturaAlisRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/brk-mgmt/stok') }, [router])
  return null
}
