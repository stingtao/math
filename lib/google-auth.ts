import { createRemoteJWKSet, jwtVerify } from "jose";
import { getRuntimeEnv } from "@/db/bootstrap";

const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));

export async function verifyGoogleCredential(credential: string) {
  const clientId = getRuntimeEnv().GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error("Google sign-in is not configured yet.");
  const { payload } = await jwtVerify(credential, googleKeys, {
    audience: clientId,
    issuer: ["https://accounts.google.com", "accounts.google.com"],
  });
  if (!payload.sub) throw new Error("Google did not return a stable account subject.");
  return payload.sub;
}

export function googleClientId() {
  return getRuntimeEnv().GOOGLE_CLIENT_ID ?? "";
}
