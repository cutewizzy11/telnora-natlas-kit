"use client";
import { useEffect, useMemo, useState } from "react";
import { Natlas } from "@telnora/natlas";

/** Endpoint settings shared by the sample pages. URL is remembered; the API key lives only in this tab (sessionStorage). */
export function useNatlas() {
  const [mode, setMode] = useState<"demo" | "custom">("demo");
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [asrUrl, setAsrUrl] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
    try {
      setBaseUrl(localStorage.getItem("natlas.baseUrl") ?? "");
      setAsrUrl(localStorage.getItem("natlas.asrUrl") ?? "");
      setApiKey(sessionStorage.getItem("natlas.apiKey") ?? "");
      if (localStorage.getItem("natlas.mode") === "custom") setMode("custom");
    } catch {
      /* storage unavailable: fine */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("natlas.baseUrl", baseUrl);
      localStorage.setItem("natlas.asrUrl", asrUrl);
      localStorage.setItem("natlas.mode", mode);
      sessionStorage.setItem("natlas.apiKey", apiKey);
    } catch {
      /* ignore */
    }
  }, [baseUrl, asrUrl, apiKey, mode]);

  const effectiveUrl = mode === "demo" ? (origin ? `${origin}/api/mock/v1` : "") : baseUrl;
  const client = useMemo(
    () => (effectiveUrl ? new Natlas({ baseUrl: effectiveUrl, apiKey: apiKey || undefined }) : null),
    [effectiveUrl, apiKey]
  );
  const asrClient = useMemo(
    () =>
      mode === "custom" && asrUrl ? new Natlas({ baseUrl: asrUrl, apiKey: apiKey || undefined }) : undefined,
    [mode, asrUrl, apiKey]
  );

  return { mode, setMode, baseUrl, setBaseUrl, apiKey, setApiKey, asrUrl, setAsrUrl, client, asrClient };
}
