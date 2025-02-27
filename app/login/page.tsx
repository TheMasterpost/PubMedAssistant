"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Mail } from "lucide-react"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      router.push("/")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { callbackUrl: "/" })
    } catch (error) {
      setError("Failed to login with Google")
    }
  }

  const handleEmailLogin = async () => {
    if (!formData.email) {
      setError("Please enter your email")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/email-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Email login failed")
      }

      setError("Check your email for the login link!")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Email login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-md mx-auto p-8 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2 mb-12 mt-48">
          <h1 className="text-5xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              Welcome Back
            </span>
          </h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Email Input */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="pl-10 h-14 text-lg rounded-lg border-2 border-gray-200 focus:border-blue-500"
                disabled={loading}
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="pl-10 h-14 text-lg rounded-lg border-2 border-gray-200 focus:border-blue-500"
                disabled={loading}
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-fadeIn">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            ) : (
              "Sign In"
            )}
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-b from-white to-gray-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-14 text-lg bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-lg transition-colors"
          >
            <img src="/google.svg" alt="Google" className="w-6 h-6 mr-2" />
            Continue with Google
          </Button>

          {/* Email Login Button */}
          <Button
            type="button"
            onClick={handleEmailLogin}
            disabled={loading}
            className="w-full h-14 text-lg bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-lg transition-colors"
          >
            <Mail className="mr-2 h-5 w-5" />
            Continue with Email
          </Button>

          {/* Additional Links */}
          <div className="text-center space-y-2">
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
              Forgot your password?
            </a>
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-600 hover:text-blue-800">
                Sign up
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
} 