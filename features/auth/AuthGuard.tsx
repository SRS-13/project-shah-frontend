"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useGetMeQuery } from "./authQuery";
import { readTokens } from "./tokenStorage";
import { useAppSelector } from "@/lib/store/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = ["/", "/login", "/register"].includes(pathname);

  return isPublic ? children : <ProtectedRoute>{children}</ProtectedRoute>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const user = useAppSelector((state) => state.auth.user);
  const { data, error, isFetching, refetch } = useGetMeQuery(undefined, {
    skip: !ready,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const unauthorized = !isFetching && error && "status" in error && error.status === 401;

  useEffect(() => {
    if (!readTokens()) {
      router.replace("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  useEffect(() => {
    if (ready && (unauthorized || !readTokens())) router.replace("/login");
  }, [ready, unauthorized, user, router]);

  if (!ready || isFetching || unauthorized || !user || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center" role="status">
        {error && !unauthorized ? (
          <div className="text-center">
            <p>Unable to verify your session. Please try again.</p>
            <button className="mt-3 underline" onClick={() => refetch()}>Retry</button>
          </div>
        ) : "Checking your session…"}
      </div>
    );
  }

  return children;
}
