import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";

export function LogoutDialog() {
  return (
    <Dialog>
      <DialogTrigger>Sign Out</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure you want to sign out?</DialogTitle>
          <DialogDescription>
            This action will log you out. If you want to return to your account,
            you will need to log in again.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <Button variant="outline">Sign Out</Button>
          <DialogClose render={<Button variant="default">Go Back</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
