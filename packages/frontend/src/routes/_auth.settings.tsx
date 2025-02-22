import { createFileRoute, useNavigate } from "@tanstack/react-router";
import axios from "redaxios";
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
import { useAuth } from "@/hooks/useAuth";
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
});

function RouteComponent() {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    } catch (error) {
      console.error(error);
      toast.error("Error deleting account");
    }
  };

  return (
    <div className="flex h-full flex-col ml-8 mr-2 mt-8 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="flex flex-col space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div>{user?.email}</div>
            </div>
          </CardContent>
        </Card>

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
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account.
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
            {/* <Button variant="destructive" onClick={deleteAccount}>
              Delete Account
            </Button> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
