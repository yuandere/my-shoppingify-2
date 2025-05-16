import { useContext, useEffect } from "react";
import { SidebarRightContext } from "../shared/SidebarRightContext";

const useScrollHideNav = (scrollAreaRef: React.RefObject<HTMLDivElement>) => {
  const sidebarRightContext = useContext(SidebarRightContext);

  useEffect(() => {
    if (!sidebarRightContext) return;
    const root = scrollAreaRef.current;
    if (!root) return;

    const viewport = root.querySelector(
      "div[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement;
    if (!viewport) return;
    let lastScrollY = viewport.scrollTop;
    let ticking = false;

    const handleScroll = () => {
      const currentScrollY = viewport.scrollTop;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (currentScrollY > lastScrollY && currentScrollY > 56) {
            sidebarRightContext.setIsNavbarVisible(false);
          } else {
            sidebarRightContext.setIsNavbarVisible(true);
          }
          lastScrollY = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };
    viewport.addEventListener("scroll", handleScroll);
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [sidebarRightContext, scrollAreaRef]);
};

export default useScrollHideNav;
