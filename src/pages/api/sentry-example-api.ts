import * as Sentry from "@sentry/nextjs";

// Custom error class for Sentry testing
class SentryExampleAPIError extends Error {
  constructor(message: string | undefined) {
    super(message);
    this.name = "SentryExampleAPIError";
  }
}
// Optional faulty response for Sentry testing — set SENTRY_EXAMPLE_THROW=1 to enable.
export default function handler(_req, res) {
  Sentry.logger.info("Sentry example API called");
  if (process.env.SENTRY_EXAMPLE_THROW === "1") {
    throw new SentryExampleAPIError(
      "This error is raised on the backend called by the example page."
    );
  }
  return res.status(200).json({ name: "John Doe" });
}
