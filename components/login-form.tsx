"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useParams } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

const signUpSchema = signInSchema.extend({
  name: z.string().min(2, "Name must be at least 2 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignInData = z.infer<typeof signInSchema>
type SignUpData = z.infer<typeof signUpSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const params = useParams()
  const locale = params?.locale as string || 'en'

  const form = useForm<SignInData | SignUpData>({
    resolver: zodResolver(isSignUp ? signUpSchema : signInSchema),
    defaultValues: {
      email: "",
      password: "",
      ...(isSignUp && { name: "", confirmPassword: "" }),
    },
  })

  const onSubmit = async (data: SignInData | SignUpData) => {
    setIsLoading(true)
    setMessage(null)

    try {
      if (isSignUp) {
        // Register new user
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: data.email,
            password: data.password,
            name: (data as SignUpData).name,
            locale,
          }),
        })

        const result = await response.json()

        if (response.ok) {
          setMessage({ 
            type: 'success', 
            text: 'Registration successful! Please check your email to verify your account.' 
          })
          form.reset()
        } else {
          setMessage({ type: 'error', text: result.error || 'Registration failed' })
        }
      } else {
        // Sign in existing user
        const result = await signIn('credentials', {
          email: data.email,
          password: data.password,
          redirect: false,
        })

        if (result?.error) {
          setMessage({ type: 'error', text: 'Invalid email or password. Please verify your email first.' })
        } else if (result?.ok) {
          // Get user session to redirect to their company
          const response = await fetch('/api/auth/session')
          const session = await response.json()
          const userCid = session?.user?.cid
          if (userCid) {
            window.location.href = `/${locale}/${userCid}`
          } else {
            window.location.href = `/${locale}/chat` // fallback if no cid
          }
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    const email = form.getValues('email')
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address first.' })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      })

      const result = await response.json()
      setMessage({ 
        type: 'success', 
        text: result.message || 'Verification email sent!' 
      })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send verification email.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col items-center gap-2 font-medium">
            <div className="flex size-12 items-center justify-center rounded-md bg-amber-400/10 border border-amber-400/20">
              <span className="text-2xl">☿</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-amber-200">Welcome to IALchemist</h1>
          <div className="text-center text-sm text-gray-300">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setIsSignUp(false)}
                  className="text-amber-400 underline underline-offset-4 hover:text-amber-300"
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button 
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-amber-400 underline underline-offset-4 hover:text-amber-300"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        {message && (
          <div className={cn(
            "p-3 rounded-md text-sm",
            message.type === 'success' 
              ? "bg-green-500/10 text-green-400 border border-green-500/20" 
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          )}>
            {message.text}
            {message.type === 'error' && message.text.includes('verify') && (
              <button
                type="button"
                onClick={handleResendVerification}
                className="ml-2 text-amber-400 underline underline-offset-4 hover:text-amber-300"
                disabled={isLoading}
              >
                Resend verification email
              </button>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isSignUp && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        className="bg-black/20 border-amber-400/20 text-white placeholder:text-gray-500"
                        placeholder="Your name"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="email"
                      className="bg-black/20 border-amber-400/20 text-white placeholder:text-gray-500"
                      placeholder="m@example.com"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password"
                      className="bg-black/20 border-amber-400/20 text-white placeholder:text-gray-500"
                      placeholder="••••••••"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isSignUp && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password"
                        className="bg-black/20 border-amber-400/20 text-white placeholder:text-gray-500"
                        placeholder="••••••••"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button 
              type="submit" 
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-amber-400/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          type="button" 
          className="w-full bg-black/20 border-amber-400/20 text-white hover:bg-black/40"
          onClick={async () => {
            const result = await signIn('google', { 
              redirect: false,
              callbackUrl: `/${locale}`
            })
            if (result?.ok) {
              const response = await fetch('/api/auth/session')
              const session = await response.json()
              const userCid = session?.user?.cid
              if (userCid) {
                window.location.href = `/${locale}/${userCid}`
              } else {
                window.location.href = `/${locale}/chat`
              }
            }
          }}
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </Button>
      </div>
      
      <div className="text-center text-xs text-gray-400">
        By continuing, you agree to our{" "}
        <a href="#" className="text-amber-400 underline underline-offset-4 hover:text-amber-300">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-amber-400 underline underline-offset-4 hover:text-amber-300">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  )
}
