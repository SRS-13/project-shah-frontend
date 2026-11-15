"use client";

import { Provider } from "react-redux";
import { store } from "@/lib/store/store";
import { useState } from "react";

export function Providers({
  children,
  lang,
}: {
  children: React.ReactNode;
  lang: any;
}) {
  return <Provider store={store}>{children}</Provider>;
}
