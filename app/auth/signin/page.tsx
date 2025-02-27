'use client';

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800">
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Welcome Back
            </span>
          </h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="flex w-full items-center justify-center space-x-3 rounded-lg border-2 border-gray-200 bg-white px-4 py-6 text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Image
              src="/google.svg"
              alt="Google"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="text-base font-medium">Continue with Google</span>
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          By signing in, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
} 