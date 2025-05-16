import { useState, useRef, useEffect, useContext } from "react";
import clsx from "clsx";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Image, Link2, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/Spinner";
import PendingRoute from "@/components/PendingRoute";
import { useIsMobile } from "@/hooks/useIsMobile";
import useScrollHideNav from "@/hooks/useScrollHideNav";
import { SidebarRightContext } from "@/shared/SidebarRightContext";
import { generateList } from "@/lib/actions/generate";
import { queryClient } from "@/lib/queryClient";
import { isValidURL } from "@/lib/utils";

const prompts: string[] = [
  "a kids birthday party",
  "game night snacks",
  "a picnic",
  "6th grade back to school supplies",
  "a low effort meal for two",
  "spaghetti dinner",
  "cheap meal prep",
];

export const Route = createFileRoute("/_auth/generate")({
  component: RouteComponent,
  pendingComponent: PendingRoute,
});

function RouteComponent() {
  const sidebarRightContext = useContext(SidebarRightContext);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [url, setUrl] = useState<string | null>("");
  const [urlError, setUrlError] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async (method: "prompt" | "url" | "image") => {
    if (generating) return;
    setGenerating(true);
    try {
      //@ts-expect-error res has type Response<unknown>
      const res: {
        data: { success: boolean; message: string; newListId: string | null };
      } = await generateList({
        method,
        prompt: method === "prompt" ? inputValue : method,
        url: url ?? undefined,
        image: image ?? undefined,
      });
      // console.log(res);
      if (res.data.success && res.data.newListId) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["items"] }),
          queryClient.invalidateQueries({ queryKey: ["lists"] }),
          queryClient.invalidateQueries({ queryKey: ["categories"] }),
        ]);
        toast.success(res.data.message);
        navigate({ to: "/items" });
        sidebarRightContext?.handleResetSidebarStates();
        sidebarRightContext?.setSelectedListId(res.data.newListId ?? null);
        sidebarRightContext?.setOpen(true);
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

  useScrollHideNav(scrollAreaRef);

  return (
    <div
      className={clsx(
        "flex h-screen flex-col",
        isMobile && "h-[calc(100vh-4rem)]"
      )}
    >
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className={clsx("h-full", isMobile ? "p-4" : "p-6")}>
          <main>
            <div className="flex flex-col items-center gap-10 mt-8 md:gap-20 md:mt-16">
              <div className="flex space-x-2">
                <h1 className="text-2xl font-semibold underline underline-offset-4 bg-gradient-to-r from-red-400 to-[#8B4F65] bg-clip-text text-transparent">
                  Generate lists with AI
                </h1>
                <Sparkles className="text-[#8B4F65]"></Sparkles>
              </div>
              <div className="flex flex-col items-center gap-4 w-[90dvw] md:w-[50dvw]">
                <h2 className="text-xl font-semibold mt-8 sm:mt-0">
                  Create a list for...
                </h2>
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
                  disabled={generating}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleGenerate("prompt");
                    }
                  }}
                />
                <Button
                  className="self-end bg-primary hover:bg-primary/90"
                  onClick={() => handleGenerate("prompt")}
                  disabled={inputValue === "" || generating}
                >
                  {generating ? <Spinner /> : "Generate"}
                </Button>
              </div>
            </div>

            {isMobile && (
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#8B4F65] to-transparent mt-16"></div>
            )}

            <div className="flex flex-col items-center gap-8 mt-16 md:mt-24">
              <h2 className="text-xl text-center font-semibold">
                Generate shopping lists from a recipe or image
              </h2>
              <div className="grid grid-cols-1 w-[90dvw] md:w-[50dvw] sm:grid-cols-2 gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex h-auto flex-col items-start gap-2 p-6"
                      type="button"
                      onClick={() => {
                        setUrl("");
                        setUrlError(false);
                      }}
                      //disabled={true}
                    >
                      <div className="rounded-full bg-primary/10 p-2">
                        <Link2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Load from recipe URL</p>
                        <p className="text-sm text-muted-foreground">
                          Paste a link to a recipe or list online
                        </p>
                      </div>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Generate from the web</DialogTitle>
                      <DialogDescription>
                        Paste a link to a recipe or list online
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right">
                          URL
                        </Label>
                        <Input
                          id="url"
                          value={
                            url ??
                            "https://allrecipes.com/recipe/152243/lolahs-chicken-adobo/"
                          }
                          className="col-span-3"
                          onChange={(e) => {
                            setUrl(e.target.value);
                            setUrlError(!isValidURL(e.target.value));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              if (!url || !isValidURL(url)) return;
                              handleGenerate("url");
                            }
                          }}
                        />
                      </div>
                      {urlError && (
                        <p className="text-red-500 text-sm text-right">
                          Please enter a valid URL
                        </p>
                      )}
                    </div>
                    <DialogFooter>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!url || !isValidURL(url)) return;
                          handleGenerate("url");
                        }}
                      >
                        <Button
                          type="submit"
                          disabled={url === "" || generating}
                        >
                          {generating ? <Spinner /> : "Generate"}
                        </Button>
                      </form>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex h-auto flex-col items-start gap-2 p-6"
                      type="button"
                      // disabled={true}
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
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Generate from image</DialogTitle>
                      <DialogDescription>
                        Click select file or drag and drop an image
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                          Image
                        </Label>
                        <Input
                          id="image"
                          type="file"
                          className="col-span-3 cursor-pointer "
                          onChange={(e) => {
                            if (!e.target.files) return;
                            setImage(e.target.files?.[0]);
                          }}
                          accept=".jpg .jpeg .png .webp .heic .heif"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!image) return;
                          handleGenerate("image");
                        }}
                      >
                        <Button
                          type="submit"
                          disabled={image === null || generating}
                        >
                          {generating ? <Spinner /> : "Upload"}
                        </Button>
                      </form>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            {isMobile && <div className="h-8" />}
          </main>
        </div>
      </ScrollArea>
    </div>
  );
}
