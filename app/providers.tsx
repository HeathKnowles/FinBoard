"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { memo, Suspense } from "react";

// Loading fallback for providers
function ProvidersLoading() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-white text-lg flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        Loading FinBoard...
      </div>
    </div>
  );
}

const Providers = memo(function Providers({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <Suspense fallback={<ProvidersLoading />}>
        {children}
      </Suspense>
    </Provider>
  );
});

export default Providers;