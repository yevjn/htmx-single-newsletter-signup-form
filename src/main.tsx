import {
  whitesmokeInit,
  CssImports,
  getHashedPublicUrl,
  getMatchingPathData,
  Outlet,
  whitesmokeDev,
  redirect,
} from "whitesmoke";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";

const app = new Hono();

whitesmokeInit({ app, importMeta: import.meta, serveStatic });

app.post("/newsletter-signup", async (c) => {
  await new Promise((res) => setTimeout(res, 1000));
  const formData = await c.req.formData();
  const email = formData.get("email") as string;
  const isSuccess = Math.random() > 0.25;
  console.log({ email, isSuccess });
  return redirect({
    c,
    to: isSuccess
      ? `/newsletter?success=true&email=${encodeURIComponent(email)}`
      : `/newsletter?error=true&email=${encodeURIComponent(email)}`,
  });
});

app.get("*", async (c) => {
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

          <script
            type="module"
            src={getHashedPublicUrl({ c, url: "public/vendor/htmx.mjs" })}
          ></script>

          <script
            type="module"
            dangerouslySetInnerHTML={{
              __html: `import htmx from './${getHashedPublicUrl({
                c,
                url: "public/vendor/htmx.mjs",
              })}'; window.htmx = htmx;`,
            }}
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

serve({ fetch: app.fetch, port: 8787 }, (info) => {
  console.log(
    `\nListening on http://${
      process.env.NODE_ENV === "development" ? "localhost" : info.address
    }:${info.port}\n`
  );
});
