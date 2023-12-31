import {
  whitesmokeInit,
  CssImports,
  getHashedPublicUrl,
  getMatchingPathData,
  Outlet,
  whitesmokeDev,
  Htmx,
} from "whitesmoke";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

whitesmokeInit({ app, importMeta: import.meta, serveStatic });

app.all("*", async (c) => {
  const activePathData = await getMatchingPathData({ c });

  if (activePathData.fetchResponse) return activePathData.fetchResponse;

  return c.html(
    `<!DOCTYPE html>` +
    (
      <html lang="en" hx-ext="morph">
        <head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1" />

          {whitesmokeDev?.DevLiveRefreshScript()}
          <link
            rel="stylesheet"
            href="https://unpkg.com/modern-normalize@1.1.0/modern-normalize.css"
          />
          <CssImports c={c} />

          <Htmx
            location={getHashedPublicUrl({ c, url: "public/vendor/htmx.mjs" })}
          />

          <script
            defer
            src="https://unpkg.com/idiomorph/dist/idiomorph-ext.min.js"
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

        <body
          hx-boost="true"
          hx-target="this"
          hx-swap="morph:innerHTML"
          style={{
            background: `url(${getHashedPublicUrl({
              c,
              url: "public/bg.svg",
            })}) no-repeat center center fixed`,
          }}
        >
          <Outlet activePathData={activePathData} />
        </body>
      </html>
    )
  );
});

app.notFound((c) => {
  return c.text("404 Not Found", 404);
});

serve({ fetch: app.fetch, port: 8788 }, (info) => {
  console.log(
    `\nListening on http://${
      process.env.NODE_ENV === "development" ? "localhost" : info.address
    }:${info.port}\n`
  );
});
