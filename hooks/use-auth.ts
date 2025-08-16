import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function useAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = !!session?.user;

  const updateProfile = useCallback(
    async (data: any) => {
      await update(data);
    },
    [update]
  );

  const redirectToSignIn = useCallback(
    (callbackUrl?: string) => {
      const url = new URL("/auth/signin", window.location.origin);
      if (callbackUrl) {
        url.searchParams.set("callbackUrl", callbackUrl);
      }
      router.push(url.toString());
    },
    [router]
  );

  return {
    session,
    user: session?.user,
    isLoading,
    isAuthenticated,
    updateProfile,
    redirectToSignIn,
  };
}