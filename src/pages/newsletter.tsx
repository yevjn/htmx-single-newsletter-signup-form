import { LoaderArgs, PageProps } from "whitesmoke";

export function loader(args: LoaderArgs) {
  const { success, error, email } = args.c.req.query();
  return {
    success: Boolean(success),
    error: Boolean(error),
    email: email ? decodeURIComponent(email) : undefined,
  };
}

export default function Newsletter({ data }: PageProps<typeof loader>) {
  const { success, error, email } = data;

  console.log({ data }); // this will only log on the server

  return (
    <main>
      <form hx-post="/newsletter-signup" aria-hidden={success}>
        {email && !success && !error && (
          <script
            dangerouslySetInnerHTML={{
              __html: 'document.getElementById("input").select()',
            }}
          />
        )}
        <h2>Subscribe!</h2>
        <p>Don't miss any of the action!</p>
        <fieldset>
          <input
            id="input"
            value={email ?? ""}
            aria-label="Email address"
            aria-describedby="error-message"
            type="email"
            name="email"
            placeholder="you@example.com"
            autofocus={Boolean(email) && !success}
          />
          <button
            type="submit"
            onclick="document.getElementById('subscribe').remove();document.getElementById('subscribing').style.display='unset'"
          >
            <span id="subscribe">Subscribe</span>
            <span id="subscribing" style={{ display: "none" }}>
              Subscribing!
            </span>
          </button>
        </fieldset>

        <p id="error-message">{error ? "Oops, we messed up!" : <>&nbsp;</>}</p>
      </form>

      <div aria-hidden={!success}>
        <h2 tabIndex={-1} autofocus={success}>
          You're subscribed!
        </h2>
        <p>Please check your email to confirm your subscription.</p>
        <a
          href="/newsletter"
          hx-get={`/newsletter?email=${email ? encodeURIComponent(email) : ""}`}
        >
          Start over
        </a>
      </div>
    </main>
  );
}
