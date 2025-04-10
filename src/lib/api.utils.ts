import type { ResponseData } from "~/types/api.types";

/*
 * Make API calls to the backend and get the response.
 * Throws an error when the API call fails so that the caller can handle it.
 */
export async function sendApiRequest<T>(
  path: `/${string}`,
  options: {
    method: "GET" | "POST";
    body?: BodyInit | null | undefined;
    params?: Record<string, string>;
  },
): Promise<T> {
  // Append query params if provided
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    // Append params to path with correct query separator
    path += (path.includes("?") ? "&" : "?") + searchParams.toString();
  }

  // Avoid sending a body with GET requests
  if (options.method === "GET" && options.body) {
    console.warn(
      "GET request should not have a body. Ignoring the body parameter.",
    );
    options.body = undefined;
  }

  const res = await fetch(`/api/v1/${path}`, {
    method: options.method,
    body: options.body,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Parse response even if it'll be used for error details
  const data: ResponseData<T> = await res.json();

  if (res.ok) {
    return data;
  }

  // Handle 4xx errors by including error details on the thrown error
  if (res.status >= 400 && res.status < 500) {
    throw new ClientError(data.message, res.status);
  }

  throw new Error("Unexpected response");
}

export class ClientError extends Error {
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ClientError";
    this.status = status;
  }
}
