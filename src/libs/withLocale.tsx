import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import type { ComponentType } from "react";

export type ParamProps = { id?: string; locale: string };

export default function withLocale<P>(Component: ComponentType<P & { locale: string }>) {
  return function Wrapper({ params, ...rest }: { params: Promise<ParamProps> } & P) {
    const { locale, id } = use(params);

    let paramsProps: ParamProps = { locale };

    if (typeof window === "undefined") setRequestLocale(locale);

    if (id) paramsProps = { ...paramsProps, id };

    return <Component {...(rest as P)} {...paramsProps} />;
  };
}
