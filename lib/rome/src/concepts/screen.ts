import type { RouteParams } from 'regexparam'
import type { ReactElement } from 'react'

export type EmptyProps = Omit<
  { readonly [N: string | symbol]: never },
  'params'
>

export type EmptyArray = never[]
export type EmptyParams = { readonly [N: string | symbol]: never }

export type Props =
  | Omit<{ readonly [N: string | symbol]: unknown }, 'params'>
  | EmptyProps
  | never

export type Params =
  | { readonly [N: string]: string | undefined }
  | EmptyParams
  | never

export type Search = { readonly [N: string]: string | undefined }

export type Deps = unknown[] | never[] | never

/**
 * A `Load` function is a function that receives a context object and returns a promise
 * that resolves to a set of props.
 *
 * The context object contains the current route's params, search query (i.e. "?foo=bar")
 * and an array of dependencies.
 *
 * The array of dependencies is defined when you build the router and can be used to pass
 * any kind of data or functions to the load function.
 */
export interface Load<Pa extends Params, D extends Deps, Pr extends Props> {
  (context: { params: Pa; deps: D; search: Search }): Promise<Pr>
}

/**
 * A `Render` function is a function that receives a set of props and returns a JSX element.
 */
export interface Render<
  Pr extends Props = EmptyProps,
  Pa extends Params = EmptyParams,
> {
  (props: Pr & { readonly params: Pa }): ReactElement
}

/**
 * A screen is simply an object that has at least one method called `render` that
 * returns a JSX element.
 *
 * It may specify a `load` method that will be called before the `render` method.
 * This function will be responsible for preparing the screen's rendering props.
 */
export type Screen<
  Pa extends Params = EmptyParams,
  D extends Deps = never,
  Pr extends Props = never,
> =
  | ScreenWithLoad<Pa, D, Pr>
  | ScreenWithoutLoad<Pa, Pr>

export type ScreenWithLoad<
  Pa extends Params,
  D extends Deps,
  Pr extends Props,
  L extends Load<Pa, D, Pr> = Load<Pa, D, Pr>,
> = {
  load: Load<Pa, D, Pr>
  render: Render<PropsOf<L>, ParamsOf<L>>
}

export type ScreenWithoutLoad<Pa extends Params, Pr extends Props> = {
  render: Render<Pr, Pa>
}

export type ScreenLayoutWithLoad<
  Pa extends Params,
  D extends Deps,
  Pr extends Props,
> = {
  load: Load<Pa, D, Pr>
  render: Render<Pr & { outlet: ReactElement }, Pa>
}

export type ScreenLayoutWithoutLoad<Pa extends Params, Pr extends Props> = {
  render: Render<Pr & { outlet: ReactElement }, Pa>
}

export type ScreenLayout<
  Pa extends Params = EmptyParams,
  D extends Deps = EmptyArray,
  Pr extends Props = EmptyProps,
> = ScreenLayoutWithLoad<Pa, D, Pr> | ScreenLayoutWithoutLoad<Pa, Pr>

export type OnlyPathsWithParams<
  T extends string,
  O extends RouteParams<T>,
> = T extends string ? (RouteParams<T> extends O ? T : never) : never

type PropsOf<L> = L extends Load<never, never, infer Pr> ? Pr : never
type ParamsOf<L> = L extends Load<infer Pa, never, never> ? Pa : never
