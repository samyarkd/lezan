import { signIn, signOut, useSession } from "next-auth/react";

import { Button } from "./ui/button";

const AuthButton = () => {
  const auth = useSession();

  return (
    <div className="ms-auto flex flex-col items-center justify-center gap-4">
      {auth.status === "authenticated" && (
        <div className="flex w-full items-center justify-between gap-3">
          <Button variant="outline" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      )}
      {auth.status === "unauthenticated" && (
        <Button onClick={() => signIn()} variant="default">
          Sign in
        </Button>
      )}
      {auth.status !== "authenticated" && auth.status !== "unauthenticated" && (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default AuthButton;
