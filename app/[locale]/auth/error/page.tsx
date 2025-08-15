import { Link } from '../../../../i18n/navigation';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error: errorParam } = await searchParams;
  
  const errorMessages = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'Access denied. You do not have permission to sign in.',
    Verification: 'The verification link was invalid or has expired.',
    Default: 'An error occurred during authentication.',
  };

  const error = errorParam as keyof typeof errorMessages || 'Default';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950 text-white flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-black/20 backdrop-blur-sm border border-red-400/30 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-red-300 mb-2">
              Authentication Error
            </h1>
            <p className="text-gray-300 mb-6">
              {errorMessages[error]}
            </p>
          </div>

          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="block w-full text-center px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-medium"
            >
              Try Again
            </Link>
            
            <Link
              href="/"
              className="block w-full text-center px-4 py-3 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black rounded-lg transition-colors font-medium"
            >
              Return Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-red-400/20">
            <p className="text-center text-sm text-gray-400">
              If the problem persists, please try a different authentication method.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}