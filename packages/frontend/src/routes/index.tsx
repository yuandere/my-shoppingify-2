import { Link, createFileRoute } from "@tanstack/react-router";
import { useRef } from "react";

import { useLandingBackdrop } from "@/hooks/useLandingBackdrop";
import ThemeToggle from "@/components/ThemeToggle";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useLandingBackdrop(canvasRef);

  return (
    <div className="min-h-screen relative bg-background">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      <div className="fixed top-4 left-4 z-20">
        <ThemeToggle />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-32">
        <div className="mt-36 sm:mt-0 max-w-4xl mx-auto text-center">
          <h1 className="text-[3rem] md:text-[4.5rem] leading-[2] md:leading-[1.5] font-bold mb-8 text-primary">
            my shoppingify
          </h1>
          <p className="text-xl md:text-2xl mb-12 text-muted-foreground">
            Transform your shopping experience with smart list generation and
            effortless management.
          </p>

          <div className="grid gap-6 md:grid-cols-2 max-w-xs mx-auto">
            <Link
              to="/items"
              className="transform hover:scale-105 transition-all duration-200 bg-card shadow-lg rounded-xl p-3 hover:border hover:border-[var(--accent-color)] hover:shadow-xl backdrop-blur-sm border border-border/50"
            >
              <h2 className="text-xl font-semibold mb-2 text-primary">App</h2>
            </Link>
            <a
              href="https://github.com/yuandere/my-shoppingify-2"
              className="transform hover:scale-105 transition-all duration-200 bg-card shadow-lg rounded-xl p-3 hover:border hover:border-[var(--accent-color)] hover:shadow-xl backdrop-blur-sm border border-border/50"
            >
              <h2 className="text-xl font-semibold mb-2 text-primary">About</h2>
            </a>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-3xl mx-auto text-left">
            <div className="bg-card shadow-lg rounded-lg p-6 backdrop-blur-sm border border-border/50 transition-all hover:border-[var(--accent-color)]">
              <div className="text-primary text-2xl mb-4">✨</div>
              <h3 className="text-lg font-semibold mb-2">Smart Generation</h3>
              <p className="text-muted-foreground">
                Create shopping lists instantly with intelligent suggestions
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
    </div>
  );
}
