/**
 * @file TurnstileVerifier
 * @description This component provides a wrapper around the application to ensure user verification via Turnstile before accessing the application's features.
 * It uses a provider-like approach, where the entire app is wrapped within the `TurnstileVerifier`.
 * No functionality will be available until the user successfully completes the verification process.
 *
 * @remarks
 * The Turnstile token obtained after successful verification is intended to be stored in a global jotai atom.
 * This token should then be included with each API call to authenticate the user.
 *
 * @example
 * ```tsx
 * <TurnstileVerifier
 *   title="Verification Required"
 *   description="Please complete the verification to continue."
 *   trigger={<Button>Continue</Button>}
 * >
 *   <Turnstile
 *     sitekey="your_site_key"
 *     callback={(token) => {
 *       // Handle the token and store it in global storage
 *       console.log("Turnstile Token:", token);
 *     }}
 *   />
 *   <Button onClick={() => {}}>Submit</Button>
 * </TurnstileVerifier>
 * ```
 */
import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { useSetAtom } from "jotai";
import { LoaderIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { turnstileTokenAtom } from "~/lib/storage/global.atom";

const TurnstileVerifier = () => {
  const [open, setOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  // turnstie token setter
  const setTurnstileToken = useSetAtom(turnstileTokenAtom);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>Are you a human?</DialogTitle>
          <DialogDescription>
            Making sure you are a real human...
          </DialogDescription>
        </DialogHeader>
        {loading && <LoaderIcon className="animate-spin" />}
        <Turnstile
          siteKey={"1x00000000000000000000AA"}
          onSuccess={(token) => {
            setTurnstileToken(token);
            setOpen(false);
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
