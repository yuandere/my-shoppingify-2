import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import clsx from "clsx";

import { useSidebar } from "@/components/ui/sidebar";
import { SidebarRightContext } from "@/shared/SidebarRightContext";
import { useIsMobile } from "@/hooks/useIsMobile";

function CartButton() {
  const sidebarRightContext = useContext(SidebarRightContext);
  const cartCount = sidebarRightContext?.cartCount;
  const { toggleSidebar } = useSidebar();
  const isMobile = useIsMobile();
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    const handleFlash = () => setIsFlashing(true);
    const handleFlashEnd = () => setIsFlashing(false);
    window.addEventListener("flash-cart", handleFlash);
    window.addEventListener("flash-cart-end", handleFlashEnd);
    return () => {
      window.removeEventListener("flash-cart", handleFlash);
      window.removeEventListener("flash-cart-end", handleFlashEnd);
    };
  }, []);

  const handleClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={!isMobile}
      className={clsx(
        "w-9 h-9 grid place-items-center p-2 transition-all duration-300 relative isolate border-2 border-muted-foreground/50",
        isFlashing && [
          "animate-flash bg-primary text-primary-foreground",
          "after:absolute after:inset-0 after:rounded-md",
          "after:animate-flash after:z-[-1]",
        ]
      )}
    >
      {cartCount && (
        <div
          className="px-[5px] py-[1px] absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full flex items-center
justify-center"
        >
          <p>{cartCount}</p>
        </div>
      )}
      <ShoppingCart className="h-4 w-4" />
    </Button>
  );
}

export default CartButton;
