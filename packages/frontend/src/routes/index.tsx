import { useRef } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { useLandingBackdrop } from "@/lib/hooks/useLandingBackdrop";
import ThemeToggle from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLandingBackdrop(canvasRef);

  return (
    <div className="h-screen w-screen relative bg-background overflow-y-auto md:overflow-y-visible snap-y snap-mandatory">
      {!isMobile && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}
      <div className="fixed top-4 left-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-16 md:pt-32 min-h-screen snap-start md:min-h-0">
        <div className="mt-36 sm:mt-0 max-w-4xl mx-auto text-center">
          <h1 className="text-[3rem] md:text-[4.5rem] leading-[2] md:leading-[1.5] font-bold mb-8 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-transparent bg-clip-text">
            my shoppingify
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-muted-foreground">
            Transform your shopping experience with smart list generation and
            effortless management.
          </p>

          <div className="grid gap-6 md:grid-cols-2 max-w-xs mx-auto">
            <div className="relative">
              <div className="absolute -z-10 rounded-xl -translate-x-1 -translate-y-1 inset-0 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600" />
              <Link
                to="/items"
                className="relative group transform transition-all duration-200 bg-card shadow-lg rounded-xl p-3 hover:-translate-x-1 hover:-translate-y-1 hover:border hover:border-[var(--accent-color)] hover:shadow-xl backdrop-blur-sm border border-border/50 block"
              >
                <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-transparent bg-clip-text">
                  App
                </h2>
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <span className="absolute left-[-100%] -top-[100%] h-[300%] w-1/2 bg-gradient-to-r from-transparent via-white/60 dark:via-black to-white/15 dark:to-black/15 opacity-0 rotate-45 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300" />
                </div>
              </Link>
            </div>
            
            <div className="relative">
              <div className="absolute -z-10 rounded-xl -translate-x-1 -translate-y-1 inset-0 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600" />
              <a
                href="https://github.com/yuandere/my-shoppingify-2"
                className="relative group transform transition-all duration-200 bg-card shadow-lg rounded-xl p-3 hover:-translate-x-1 hover:-translate-y-1 hover:border hover:border-[var(--accent-color)] hover:shadow-xl backdrop-blur-sm border border-border/50 block"
              >
                <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-orange-500 to-pink-500 dark:from-orange-600 dark:to-pink-600 text-transparent bg-clip-text">
                  About
                </h2>
                <div className="absolute inset-0 overflow-hidden rounded-xl">
                  <span className="absolute left-[-100%] -top-[100%] h-[300%] w-1/2 bg-gradient-to-r from-transparent via-white/60 dark:via-black to-white/15 dark:to-black/15 opacity-0 rotate-45 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300" />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 min-h-screen snap-start md:min-h-0">
        <div className="mt-16 min-h-screen flex flex-col justify-center items-center gap-8 max-w-xs text-left mx-auto md:grid md:max-w-3xl md:min-h-0 md:grid-cols-3">
          <div className="bg-card shadow-lg rounded-lg p-6 backdrop-blur-sm border border-border/50 transition-all hover:border-[var(--accent-color)]">
            <div className="text-primary text-2xl mb-4">✨</div>
            <h3 className="text-lg font-semibold mb-2">Smart Generation</h3>
            <p className="text-muted-foreground">
              Create shopping lists with intelligent suggestions
            </p>
          </div>
          <div className="bg-card shadow-lg rounded-lg p-6 backdrop-blur-sm border border-border/50 transition-all hover:border-[var(--accent-color)]">
            <div className="text-primary text-2xl mb-4">📱</div>
            <h3 className="text-lg font-semibold mb-2">Mobile Ready</h3>
            <p className="text-muted-foreground">
              Access your lists anywhere, anytime
            </p>
          </div>
          <div className="bg-card shadow-lg rounded-lg p-6 backdrop-blur-sm border border-border/50 transition-all hover:border-[var(--accent-color)]">
            <div className="text-primary text-2xl mb-4">🔄</div>
            <h3 className="text-lg font-semibold mb-2">Easy Management</h3>
            <p className="text-muted-foreground">
              Organize and update lists effortlessly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
