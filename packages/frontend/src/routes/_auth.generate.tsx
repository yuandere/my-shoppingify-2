import clsx from "clsx";
import { createFileRoute } from "@tanstack/react-router";
import { Image, Link2, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/Spinner";
import { useIsMobile } from "@/hooks/useIsMobile";
import { generateList } from "@/lib/actions/generate";
import { queryClient } from "@/lib/queryClient";
import type { IMethod } from "@/lib/actions/generate";

const prompts: string[] = [
  "a kids birthday party",
  "game night snacks",
  "a picnic",
  "back to school supplies",
  "a low effort meal",
  "spaghetti dinner",
  "cheap meal prep",
];

export const Route = createFileRoute("/_auth/generate")({
  component: RouteComponent,
});

function RouteComponent() {
  const isMobile = useIsMobile();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (method: IMethod["method"]) => {
    setGenerating(true);
    try {
      //@ts-expect-error res has type Response<unknown>
      const res: { data: { success: boolean; message: string } } =
        await generateList(method, inputValue);
      // console.log(res);
      if (res.data.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["items"] }),
          queryClient.invalidateQueries({ queryKey: ["lists"] }),
          queryClient.invalidateQueries({ queryKey: ["categories"] }),
        ]);

        toast.success("List generated successfully");
      } else {
        toast.error(res.data.message ?? "Failed to generate list");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    const scroll = () => {
      if (scrollRef.current) {
        scrollRef.current.scrollLeft += 1;
        if (
          scrollRef.current.scrollLeft >=
          (scrollRef.current.scrollWidth - scrollRef.current.clientWidth) / 2
        ) {
          scrollRef.current.scrollLeft = 0;
        }
      }
    };

    const intervalId = setInterval(scroll, 50);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div
      className={clsx(
        "flex h-screen flex-col",
        isMobile && "h-[calc(100vh-4rem)]"
      )}
    >
      <ScrollArea className="flex-1">
        <div className="h-full p-6">
          <main>
            <div className="flex flex-col items-center gap-10 mt-4 md:gap-20 md:mt-16">
              <div className="flex space-x-2">
                <h1 className="text-2xl font-semibold">
                  Generate lists with AI
                </h1>
                <Sparkles></Sparkles>
              </div>
              <div className="flex flex-col items-center gap-4 w-[90dvw] md:w-[50dvw]">
                <h2 className="text-xl font-semibold">Create a list for...</h2>
                <p className="-mt-2 mb-1 text-sm text-muted-foreground">
                  (be more descriptive for better results!)
                </p>
                <div className="w-full relative overflow-hidden rounded-lg bg-muted/30 p-4">
                  <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-hidden whitespace-nowrap"
                    style={{ willChange: "scroll-position" }}
                  >
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-4">
                        {prompts.map((prompt, index) => (
                          <button
                            key={`${i}-${index}`}
                            onClick={() => setInputValue(prompt)}
                            className="inline-flex shrink-0 items-center rounded-md bg-background px-4 py-2 text-sm 
                                     shadow-md transition-all hover:scale-105 hover:bg-accent hover:text-accent-foreground
                                     border border-border/50"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <Input
                  placeholder="Enter your prompt"
                  className=""
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button
                  className="self-end bg-primary hover:bg-primary/90"
                  onClick={() => {
                    if (generating) return;
                    handleGenerate("prompt");
                  }}
                  disabled={inputValue === ""}
                >
                  {generating ? <Spinner /> : "Generate"}
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 mt-16">
              <h2 className="text-xl font-semibold">
                Generate shopping lists from a recipe or image
              </h2>
              <div className="grid grid-cols-1 w-[90dvw] md:w-[50dvw] sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="flex h-auto flex-col items-start gap-2 p-6"
                  onClick={() => {
                    console.log("Generate from URL");
                  }}
                  disabled={true}
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <Link2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Load from recipe URL</p>
                    <p className="text-sm text-muted-foreground">
                      Paste a link to a recipe online
                    </p>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="flex h-auto flex-col items-start gap-2 p-6"
                  onClick={() => {
                    console.log("Generate from image");
                  }}
                  disabled={true}
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <Image className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Upload screenshot</p>
                    <p className="text-sm text-muted-foreground">
                      Upload an image of a recipe or item list
                    </p>
                  </div>
                </Button>
              </div>
            </div>
            {isMobile && <div className="h-8" />}
          </main>
        </div>
      </ScrollArea>
    </div>
  );
}
