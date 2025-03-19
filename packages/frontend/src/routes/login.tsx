import * as React from "react";
import {
  createFileRoute,
  redirect,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { Turnstile } from "@marsidev/react-turnstile";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { useAuth } from "../hooks/useAuth";

const fallback = "/items" as const;

export const Route = createFileRoute("/login")({
  validateSearch: z.object({
    redirect: z.string().optional().catch(""),
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.isInitializing) {
      return;
    }
    if (context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback });
    }
  },
  component: LoginComponent,
});

function LoginComponent() {
  const [captchaToken, setCaptchaToken] = React.useState<string | null>(null);
  const auth = useAuth();
  const router = useRouter();
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const navigate = Route.useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const search = Route.useSearch();

  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setError(null);
    if (!captchaToken) {
      setError("Please complete the captcha");
      return;
    }
    setIsSubmitting(true);
    try {
      e.preventDefault();
      const data = new FormData(e.currentTarget);
      const fieldValue = data.get("email");
      if (!fieldValue) return;
      const email = fieldValue.toString();
      await auth.loginWithEmail(email, captchaToken);
      await router.invalidate();
      await navigate({ to: search.redirect || fallback });
    } catch (error) {
      console.error("Error logging in: ", error);
      setError("Failed to log in. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    if (!captchaToken) {
      setError("Please complete the captcha");
      return;
    }

    setIsSubmitting(true);
    try {
      await auth.loginWithDemo(captchaToken);
      await router.invalidate();
      await navigate({ to: search.redirect || fallback });
    } catch (error) {
      console.error("Error logging in with demo: ", error);
      setError("Failed to start demo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoggingIn = isLoading || isSubmitting;

  return (
    <div className="h-full w-full p-2 grid place-items-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        {search.redirect ? (
          <p className="text-red-500">You need to login to access this page.</p>
        ) : (
          <p>Login to see the cool content in here.</p>
        )}
        <form className="mt-4 max-w-lg" onSubmit={onFormSubmit}>
          <fieldset disabled={isLoggingIn} className="w-full grid gap-2">
            <div className="grid gap-2 items-center min-w-[300px]">
              <label htmlFor="username-input" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email-input"
                name="email"
                placeholder="Enter your email"
                type="text"
                className="border rounded-md p-2 w-full"
                required
              />
            </div>
            <div className="grid gap-2">
              <Turnstile
                siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                onSuccess={(token) => {
                  setCaptchaToken(token);
                  setError(null);
                }}
                onError={() => {
                  setCaptchaToken(null);
                  setError("Captcha verification failed");
                }}
                onExpire={() => {
                  setCaptchaToken(null);
                  setError("Captcha expired, please verify again");
                }}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md w-full disabled:bg-gray-300 disabled:text-gray-500"
            >
              {isLoggingIn ? "Loading..." : "Register/Login"}
            </button>
          </fieldset>
        </form>
        <div className="flex justify-center items-center">
          <span className="h-[1px] w-3 bg-muted-foreground"></span>
          <p className="mx-2 text-sm text-muted-foreground">OR</p>
          <span className="h-[1px] w-3 bg-muted-foreground"></span>
        </div>
        <div className="w-full max-w-lg">
          <button
            onClick={handleDemoLogin}
            disabled={isLoggingIn || !captchaToken}
            className="mt-2 bg-green-500 text-white py-2 px-4 rounded-md w-full disabled:bg-gray-300 disabled:text-gray-500"
          >
            {isLoggingIn ? "Loading..." : "Try Demo"}
          </button>
        </div>
        <div className="text-center">
          {error && <p className="text-red-500">{error}</p>}
          {isSubmitted && !error && (
            <p className="text-red-500">Email sent. Please check your inbox.</p>
          )}
        </div>
      </div>
    </div>
  );
}
