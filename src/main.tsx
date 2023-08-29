import {
  whitesmokeInit,
  CssImports,
  getHashedPublicUrl,
  getMatchingPathData,
  Outlet,
} from "whitesmoke";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import {
  DevLiveRefreshScript,
  devSetup,
  LIVE_REFRESH_PATH,
  refreshMiddleware,
} from "@whitesmokejs/dev";

devSetup();

const app = new Hono();

whitesmokeInit({ app, importMeta: import.meta, serveStatic });

app.use(LIVE_REFRESH_PATH, refreshMiddleware());

app.get("*", async (c) => {
  const activePathData = await getMatchingPathData({ c });

  if (activePathData.fetchResponse) return activePathData.fetchResponse;

  return c.html(
    `<!DOCTYPE html>` +
    (
      <html lang="en">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />

          <DevLiveRefreshScript />
          <CssImports c={c} />

          <script
            type="module"
            src={getHashedPublicUrl({ c, url: "public/vendor/htmx.mjs" })}
          ></script>

          <meta
            name="htmx-config"
            content={JSON.stringify({
              defaultSwapStyle: "outerHTML",
              selfRequestsOnly: true,
              refreshOnHistoryMiss: true,
            })}
          ></meta>
        </head>

        <body hx-boost="true" hx-target="this" hx-swap="outerHTML">
          <Outlet activePathData={activePathData} />
        </body>
      </html>
    )
  );
});

app.notFound((c) => {
  return c.text("404 Not Found", 404);
});

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(
    `\nListening on http://${
      process.env.NODE_ENV === "development" ? "localhost" : info.address
    }:${info.port}\n`
  );
});
