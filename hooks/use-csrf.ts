"use client";

export function getCsrfToken() {
  if (typeof document === "undefined") return "";
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrf-token="))
    ?.split("=")[1] ?? "";
}

export function useCsrfToken() {
  return getCsrfToken();
}
