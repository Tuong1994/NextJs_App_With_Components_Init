// The different between fetch client/server is headers config. Check the code below

import { cookies } from "next/headers";
import { apiResponseError, BASE_URL, defaultResponse, Method } from "./helpers";
import { requestManager } from "./manager";
import { ApiConfig, ApiResponse } from "./type";

const call = async <TBody, TData = any>(config: ApiConfig<TBody>): Promise<ApiResponse<TData>> => {
  const { apiPath, method, body, abortKey, options = {} } = config;

  let apiResponse: ApiResponse<TData> = defaultResponse();
  let controller: AbortController | null = null;
  let finalBody = body as any;
  let res: Response;
  const url = `${BASE_URL}${apiPath}`;
  const defaultHeaders: Record<string, string> = {
    ...(options.headers as any),
    Cookie: (await cookies()).toString(),
  };

  // Auto JSON encode
  if (body && !(body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
    if (typeof body === "object") finalBody = JSON.stringify(body);
  }

  const reqConfig: RequestInit = {
    method,
    headers: defaultHeaders,
    credentials: "include",
    // ❗ Default: no-cache for mutations, cache for GET
    ...(method === Method.GET
      ? { next: { revalidate: options?.next?.revalidate ?? 60 } }
      : { cache: "no-store" }), // ISR optional
    ...options,
    body: method !== Method.GET ? finalBody : undefined,
  };

  // fetch only throws on network errors (CORS, offline, DNS fail...)
  // → HTTP errors (4xx/5xx) DO NOT trigger catch, so we must handle them separately.
  try {
    res = await fetch(url, reqConfig);
  } catch (error: any) {
    // Network-level error → status is unknown (set 0)
    return { ...apiResponse, success: false, error: apiResponseError(0, error) };
  }
  const isJson = res.headers.get("content-type")?.includes("application/json");
  // Server responded but with an HTTP error (4xx/5xx)
  // → fetch resolved successfully, but res.ok is false.
  if (!res.ok) {
    let errJson: any = null;
    try {
      errJson = isJson ? await res.json() : await res.text();
    } catch {}
    return { ...apiResponse, success: false, error: apiResponseError(res.status, errJson) };
  }
  const data = isJson ? await res.json() : await res.text();
  return { ...apiResponse, success: true, data };
};

const Get = <TData>(apiPath: string, options?: RequestInit) => {
  return call<any, TData>({ method: Method.GET, apiPath, options });
};

const Post = <TBody, TData>(apiPath: string, body: TBody, options?: RequestInit) => {
  return call<TBody, TData>({ method: Method.POST, apiPath, body, options });
};

const Put = <TBody, TData>(apiPath: string, body: TBody, options?: RequestInit) => {
  return call<TBody, TData>({ method: Method.PUT, apiPath, body, options });
};

const Delete = <TBody, TData>(apiPath: string, body?: TBody, options?: RequestInit) => {
  return call<any, TData>({ method: Method.DELETE, apiPath, body, options });
};

const FetchServer = { Get, Post, Put, Delete };

export default FetchServer;
