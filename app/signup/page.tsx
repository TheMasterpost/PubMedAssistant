"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, User } from "lucide-react";
import { signIn } from "next-auth/react";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Signup failed");
      }

      router.push("/login");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Directly trigger Google login
      await signIn("google", { redirectTo: "/" });
    } catch (error) {
      console.error("Google login error:", error);
      setError("Failed to login with Google");
      setLoading(false); // Ensure loading resets on error
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // Directly trigger GitHub login
      await signIn("github", { redirectTo: "/" });
    } catch (error) {
      console.error("GitHub login error:", error);
      setError("Failed to login with GitHub");
      setLoading(false); // Ensure loading resets on error
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-md mx-auto p-8 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2 mb-12 mt-48">
          <h1 className="text-5xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
              Create Account
            </span>
          </h1>
          <p className="text-gray-600">Join PubMed Assistant today</p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Name Input */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                name="name"
                placeholder="Full name"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10 h-14 text-lg rounded-lg border-2 border-gray-200 focus:border-blue-500"
                disabled={loading}
                required
              />
            </div>

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

            {/* Confirm Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
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
              "Create Account"
            )}
          </Button>

          {/* Google Login Button */}
          <Button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-14 text-lg bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-lg transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-500 border-t-transparent" />
            ) : (
              "Continue with Google"
            )}
          </Button>

          {/* GitHub Login Button */}
          <Button
            type="button"
            onClick={handleGitHubLogin}
            disabled={loading}
            className="w-full h-14 text-lg bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-200 rounded-lg transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-500 border-t-transparent" />
            ) : (
              "Continue with GitHub"
            )}
          </Button>

          {/* Additional Links */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-800">
                Sign in
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}