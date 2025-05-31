import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "../lib/hooks/useAuth";

export const Route = createFileRoute("/auth/confirm")({
  component: RouteComponent,
});

function RouteComponent() {
  const auth = useAuth();
  const urlParams = new URLSearchParams(window.location.search);
  const tokenHash = urlParams.get("token_hash");
  if (tokenHash) {
    try {
      auth.verifyOtp(tokenHash);
    } catch (error) {
      console.error("Error verifying OTP: ", error);
      const err = error as Error;
      const message = err.message || "Something went wrong";
      return (
        <div>
          <p>Error verifying OTP: {message}</p>
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      );
    }
  }
  if (auth.isAuthenticated) {
    Navigate({ to: "/items" });
  }
  return "Redirecting...";
}
