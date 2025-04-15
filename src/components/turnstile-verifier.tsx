import { useState, type ReactNode } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { env } from "~/env";
import { useVerifyTurnstile } from "~/hooks/api.hooks";
import { turnstileTokenAtom } from "~/lib/storage/global.atom";

interface TurnstileVerifierProps {
  children: ReactNode;
}

const TurnstileVerifier = ({ children }: TurnstileVerifierProps) => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const setTurnstileToken = useSetAtom(turnstileTokenAtom);

  const verifyTurnstile = useVerifyTurnstile();

  if (verified) return <>{children}</>;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Are you a human?</DialogTitle>
          <DialogDescription>
            Making sure you are a real human...
          </DialogDescription>
        </DialogHeader>
        {(loading || verifyTurnstile.isPending) && (
          <LoaderIcon className="animate-spin" />
        )}
        <Turnstile
          siteKey={env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={async (token) => {
            verifyTurnstile.mutate(token, {
              onSuccess: () => {
                setTurnstileToken(token);
                setOpen(false);
                setVerified(true);
                toast.success("Verification successful!");
              },
              onError: () => {
                setTurnstileToken("");
                setOpen(true);
              },
            });
          }}
          onLoadScript={() => {
            setLoading(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TurnstileVerifier;
