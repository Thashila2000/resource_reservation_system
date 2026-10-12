"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { showToast } from "@/lib/alerts";

/**
 * Drop this component into any page that should greet the user after login.
 * It detects `?welcome=1` in the URL, fires a SweetAlert toast, then
 * silently removes the query param so it only fires once per visit.
 */
export function WelcomeToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      // Fire the toast
      showToast("Signed in successfully! Welcome back 👋", "success");

      // Remove the ?welcome=1 from the URL without a hard reload
      const params = new URLSearchParams(searchParams.toString());
      params.delete("welcome");
      const newUrl = params.toString() ? `${pathname}?${params}` : pathname;
      router.replace(newUrl, { scroll: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
