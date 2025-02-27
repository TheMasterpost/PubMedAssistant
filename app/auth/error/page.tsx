import { AlertCircle } from 'lucide-react';

export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-900">Authentication Error</h1>
        </div>
        <p className="mt-4 text-gray-600">
          There was an error signing in. Please try again or contact support if the problem persists.
        </p>
        <a
          href="/"
          className="mt-6 block rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-blue-700"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
} 