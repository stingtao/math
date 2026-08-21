/** Cloudflare Worker entry point for Math. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface WorkerEnv extends Cloudflare.Env {
  AUTH_HMAC_SECRET: string;
}

function withSecurityHeaders(response: Response): Response {
  const nonce = crypto.randomUUID().replaceAll("-", "");
  let secured = new Response(response.body, response);

  if (secured.headers.get("content-type")?.includes("text/html") && typeof HTMLRewriter !== "undefined") {
    secured = new HTMLRewriter()
      .on("script", {
        element(element) {
          element.setAttribute("nonce", nonce);
        },
      })
      .transform(secured);
  }

  secured.headers.set("Content-Security-Policy", `default-src 'self'; object-src 'none'; script-src 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' https://accounts.google.com/gsi/client https://pagead2.googlesyndication.com https: http:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-src https:; worker-src 'self' blob: https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`);
  secured.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  secured.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  secured.headers.set("X-Content-Type-Options", "nosniff");
  secured.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  secured.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return secured;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      const imageResponse = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const outputFormat = format as "image/jpeg" | "image/png" | "image/gif" | "image/webp" | "image/avif";
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format: outputFormat, quality });
          return result.response();
        },
      }, allowedWidths);
      return withSecurityHeaders(imageResponse);
    }

    const response = await handler.fetch(request, env, ctx);
    return withSecurityHeaders(response);
  },
};

export default worker;
