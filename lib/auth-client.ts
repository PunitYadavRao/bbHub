import { createAuthClient } from "better-auth/react";

// Same-origin requests, so no base URL is needed.
export const authClient = createAuthClient();
