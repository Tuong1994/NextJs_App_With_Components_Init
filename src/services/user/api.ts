"use server";

import { ApiQuery, Paging } from "../type";
import { User } from "./type";
import { getApiQuery } from "../helpers";
import FetchServer from "../fetch.server";
import userApiPaths from "./path";

export const getUsers = async (query: ApiQuery) => {
  const response = await FetchServer.Get<Paging<User>>(userApiPaths.getList + getApiQuery(query));
  return response;
};

export const getUser = async (query: ApiQuery) => {
  const response = await FetchServer.Get<User>(userApiPaths.getDetail + getApiQuery(query));
  return response;
};

export const createUser = async (data: FormData) => {
  const response = await FetchServer.Post<FormData, User>(userApiPaths.create, data);
  return response;
};

export const updateUser = async (query: ApiQuery, data: FormData) => {
  const response = await FetchServer.Put<FormData, any>(userApiPaths.update + getApiQuery(query), data);
  return response;
};

export const removeUsers = async (query: ApiQuery) => {
  const response = await FetchServer.Delete<any, any>(userApiPaths.remove + getApiQuery(query));
  return response;
};
