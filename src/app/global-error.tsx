"use client";

import { useEffect } from "react";

/**
 * Global error boundary — catches unhandled errors including layout-level crashes.
 * Prevents Next.js default ugly "Application error" page from flashing.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            backgroundColor: "#0f1117",
            color: "#e5e7eb",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <div
              style={{
                width: "4rem",
                height: "4rem",
                borderRadius: "1rem",
                backgroundColor: "rgba(239,68,68,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                fontSize: "1.5rem",
              }}
            >
              ⚠️
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Algo salió mal
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
              Ha ocurrido un error inesperado. Pulsa reintentar o recarga la página.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.5rem",
                  border: "none",
                  backgroundColor: "#2563EB",
                  color: "white",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Reintentar
              </button>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                style={{
                  padding: "0.625rem 1.25rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #374151",
                  backgroundColor: "transparent",
                  color: "#e5e7eb",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                }}
              >
                Ir al Dashboard
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
