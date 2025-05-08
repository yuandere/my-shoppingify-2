import {
  createFileRoute,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import axios from "redaxios";
import clsx from "clsx";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import PendingRoute from "@/components/PendingRoute";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/useIsMobile";
import { tokenHelper } from "@/lib/utils";

const clearLocalStorage = () => {
  [window.localStorage, window.sessionStorage].forEach((storage) => {
    Object.entries(storage).forEach(([key]) => {
      storage.removeItem(key);
    });
  });
};

export const Route = createFileRoute("/_auth/settings")({
  component: RouteComponent,
  pendingComponent: PendingRoute,
});

function RouteComponent() {
  const isMobile = useIsMobile();
  const { user, handleStoreAuth } = useAuth();
  const navigate = useNavigate();
  const router = useRouter();

  const deleteAccount = async () => {
    try {
      const token = await tokenHelper();
      Promise.resolve(
        await axios({
          method: "DELETE",
          url: import.meta.env.VITE_BACKEND_URL + `/api/v1/auth/delete`,
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      toast.success("Account deleted, redirecting...");
      setTimeout(() => {
        navigate({ to: "/" });
      }, 2000);
      clearLocalStorage();
      handleStoreAuth(null);
      router.invalidate();
    } catch (error) {
      console.error(error);
      toast.error("Error deleting account");
    }
  };

  return (
    <div
      className={clsx(
        "flex h-full flex-col",
        isMobile && "h-[calc(100vh-4rem)]"
      )}
    >
      <ScrollArea className="flex-1">
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-8">Settings</h1>
          <div className="flex flex-col space-y-4">
            {user?.email ? (
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div>{user.email}</div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
            {user?.is_anonymous ? (
              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" onClick={deleteAccount}>
                    Leave Demo
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteAccount}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
