"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useParams } from "next/navigation"

export function LogoutButton() {
  const params = useParams()
  const locale = params?.locale as string || 'en'

  const handleLogout = async () => {
    await signOut({
      callbackUrl: `/${locale}/auth/signin`
    })
  }

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="bg-red-600/10 border-red-500/20 text-red-400 hover:bg-red-600/20 hover:text-red-300"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      Logout
    </Button>
  )
}