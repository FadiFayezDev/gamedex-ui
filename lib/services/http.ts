import { z } from "zod"

const API_BASE_URL = process.env.NEXT_PUBLIC_GAMEDEX_API_URL ?? ""

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown }

function resolveUrl(path: string) {
  if (!API_BASE_URL) {
    return path
  }

  return `${API_BASE_URL}${path}`
}

async function parseJsonResponse(response: Response) {
  const text = await response.text()
  if (!text) {
    return null
  }

  return JSON.parse(text)
}

export async function request<T>(
  path: string,
  options: RequestOptions,
  schema: z.ZodType<T>
) {
  let headers: Record<string, string> = {}

  if (options.headers) {
    if (options.headers instanceof Headers) {
      headers = Object.fromEntries(options.headers.entries())
    } else if (Array.isArray(options.headers)) {
      headers = Object.fromEntries(options.headers)
    } else {
      headers = options.headers as Record<string, string>
    }
  }

  let body: BodyInit | undefined
  if (options.body instanceof FormData) {
    body = options.body
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json"
    body = JSON.stringify(options.body)
  }

  const response = await fetch(resolveUrl(path), {
    ...options,
    headers,
    body,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error("Server Error Details:", errorData)
    throw new Error(
      `Request failed: ${response.status} - ${JSON.stringify(errorData)}`
    )
  }

  const data = await parseJsonResponse(response)
  return schema.parse(data)
}
