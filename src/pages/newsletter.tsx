import type { ActionArgs, LoaderArgs, PageProps } from "whitesmoke";

export function loader({ c }: LoaderArgs) {
  const { email } = c.req.query();
  return {
    email: email ? decodeURIComponent(email) : undefined,
  };
}

export async function action({ c }: ActionArgs) {
  await new Promise((res) => setTimeout(res, 1000));
  const formData = await c.req.formData();
  const email = formData.get("email") as string;
  const isSuccess = Math.random() > 0.25;
  return { email, success: isSuccess, error: !isSuccess };
}

export default function Newsletter({
  loaderData,
  actionData,
}: PageProps<typeof loader, typeof action>) {
  const success = Boolean(actionData?.success);

  return (
    <main>
      <form
        action="/newsletter"
        method="post"
        aria-hidden={success}
        hx-on={`htmx:beforeRequest:
          this.setAttribute('disabled', 'true');
          document.getElementById('subscribe').style.display='none';
          document.getElementById('subscribing').style.display='unset';
        `}
      >
        <h2>Subscribe!</h2>
        <p>Don't miss any of the action!</p>
        <fieldset disabled={success}>
          <input
            id="email"
            required
            value={actionData?.email ?? loaderData?.email ?? ""}
            aria-label="Email address"
            aria-describedby="error-message"
            type="email"
            name="email"
            placeholder="you@example.com"
            autofocus={Boolean(actionData?.email) && !success}
          />

          {loaderData?.email && (
            <script
              dangerouslySetInnerHTML={{
                __html: 'document.getElementById("email").select()',
              }}
            />
          )}

          <button type="submit">
            <span id="subscribe">Subscribe</span>
            <span id="subscribing" style={{ display: "none" }}>
              Subscribing!
            </span>
          </button>
        </fieldset>

        <p id="error-message">
          {actionData?.error ? "Oops, we messed up!" : <>&nbsp;</>}
        </p>
      </form>

      <div aria-hidden={!success}>
        <h2>You're subscribed!</h2>
        <p>Please check your email to confirm your subscription.</p>
        <a
          href="/newsletter"
          hx-get={`/newsletter?email=${
            actionData?.email ? encodeURIComponent(actionData?.email) : ""
          }`}
          tabindex={!success ? -1 : undefined}
        >
          Start over
        </a>
      </div>
    </main>
  );
}
