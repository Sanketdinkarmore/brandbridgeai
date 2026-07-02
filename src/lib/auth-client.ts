"use client";

/** Full-page redirect so the httpOnly auth cookie is picked up reliably. */
export function redirectAfterAuth(path: string) {
  window.location.assign(path);
}
