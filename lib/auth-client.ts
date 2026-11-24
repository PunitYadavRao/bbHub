import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// Same-origin requests, so no base URL is needed.
export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});
