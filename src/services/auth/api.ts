import { getApiQuery } from "../helpers";
import { ApiQuery } from "../type";
import {
  Auth,
  AuthInfo,
  AuthChangePassword,
  AuthSignIn,
  AuthSignUp,
  AuthForgotPassword,
  AuthResetPassword,
} from "./type";
import { BASE_URL } from "../helpers";
import authApiPaths from "./path";
import localStorageKey from "@/common/constant/storage";
import FetchClient from "../fetch.client";

export const signIn = async (data: AuthSignIn) => {
  const response = await FetchClient.Post<AuthSignIn, Auth>(authApiPaths.signIn, data, "signIn");
  if(response.data) localStorage.setItem(localStorageKey.AUTH, JSON.stringify(response.data))
  return response;
};

export const signUp = async (data: AuthSignUp) => {
  const response = await FetchClient.Post<AuthSignUp, AuthInfo>(authApiPaths.signUp, data, "signUp");
  return response;
};

export const googleSignIn = async () => {
  if (typeof window === "undefined") return;
  window.location.href = `${BASE_URL}${authApiPaths.google.signIn}`;
};

export const getOAuthInfo = async () => {
  const response = await FetchClient.Get<Auth>(authApiPaths.oauthInfo);
  return response;
};

export const refresh = async () => {
  const response = await FetchClient.Post<any, any>(authApiPaths.refresh, null, "refresh");
  return response;
};

export const changePassword = async (query: ApiQuery, data: AuthChangePassword) => {
  const response = await FetchClient.Post<AuthChangePassword, any>(
    authApiPaths.changePassword + getApiQuery(query),
    data,
    "changePassword"
  );
  return response;
};

export const forgotPassword = async (query: ApiQuery, data: AuthForgotPassword) => {
  const response = await FetchClient.Post<AuthForgotPassword, any>(
    authApiPaths.forgotPassword + getApiQuery(query),
    data,
    "forgotPassword"
  );
  return response;
};

export const resetPassword = async (data: AuthResetPassword) => {
  const response = await FetchClient.Put<AuthResetPassword, any>(
    authApiPaths.resetPassword,
    data,
    "resetPassword"
  );
  return response;
};

export const logout = async (query: ApiQuery) => {
  const response = await FetchClient.Post<any, any>(authApiPaths.logout, null, "logout");
  if (response.success) localStorage.removeItem(localStorageKey.AUTH);
  return response;
};
