// The different between fetch client/server is headers config. Check the code below

import { apiResponseError, BASE_URL, defaultResponse, Method } from "./helpers";
import { ApiConfig, ApiResponse } from "./type";
import { requestManager } from "./manager";

const call = async <TBody, TData = any>(config: ApiConfig<TBody>): Promise<ApiResponse<TData>> => {
  const { apiPath, method, body, auth, token, abortKey, options = {} } = config;

  let apiResponse: ApiResponse<TData> = defaultResponse();
  let controller: AbortController | null = null;
  let finalBody = body as any;
  let res: Response;
  const url = `${BASE_URL}${apiPath}`;
  const defaultHeaders: Record<string, string> = { ...(options.headers as any) };

  // Auto JSON encode
  if (body && !(body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
    if (typeof body === "object") finalBody = JSON.stringify(body);
  }

  // Client token
  if (!token && auth && typeof window !== "undefined") {
    // localStorage may throw (Safari private mode, disabled storage, sandboxed iframe)
    // → If reading token fails, ignore the error and continue without auth header.
    try {
      const t = localStorage.getItem("access_token");
      if (t) defaultHeaders["Authorization"] = `Bearer ${t}`;
    } catch {}
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

  if (abortKey) {
    controller = requestManager.create(abortKey);
    reqConfig.signal = controller.signal;
  }
  // fetch only throws on network errors (CORS, offline, DNS fail...)
  // → HTTP errors (4xx/5xx) DO NOT trigger catch, so we must handle them separately.
  try {
    res = await fetch(url, reqConfig);
  } catch (error: any) {
    if (error.name === "AbortError") {
      if (abortKey) requestManager.abort(abortKey);
      return { ...apiResponse, success: false, error: apiResponseError(-1, error) };
    }
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

const Get = <TData>(apiPath: string, abortKey?: string, options?: RequestInit) => {
  return call<any, TData>({ method: Method.GET, apiPath, abortKey, options });
};

const Post = <TBody, TData>(apiPath: string, body: TBody, abortKey?: string, options?: RequestInit) => {
  return call<TBody, TData>({ method: Method.POST, apiPath, body, abortKey, options });
};

const Put = <TBody, TData>(apiPath: string, body: TBody, abortKey?: string, options?: RequestInit) => {
  return call<TBody, TData>({ method: Method.PUT, apiPath, body, abortKey, options });
};

const Delete = <TBody, TData>(apiPath: string, body?: TBody, abortKey?: string, options?: RequestInit) => {
  return call<any, TData>({ method: Method.DELETE, apiPath, body, abortKey, options });
};

const FetchClient = { Get, Post, Put, Delete };

export default FetchClient;
