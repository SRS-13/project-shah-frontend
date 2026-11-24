"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import { Suspense } from "react";
import { AuthGuard } from "@/features/auth/AuthGuard";

export function Providers({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: any;
}) {
  return (
    <Provider store={store}>
      <Suspense fallback={<div role="status">Loading…</div>}>
        <AuthGuard>{children}</AuthGuard>
      </Suspense>
    </Provider>
  );
}
