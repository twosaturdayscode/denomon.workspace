import type { ReactElement } from 'react'

import type {
  EmptyParams,
  Params,
  Screen,
  ScreenWithLoad,
  ScreenWithoutLoad,
  Search,
} from './screen.ts'

type MakeLinkElement =
  | React.FC<{ href?: string; onClick?: () => void; isActive?: boolean }>
  | ReactElement<{ href?: string; onClick?: () => void; isActive?: boolean }>

export type MakeLink = <
  Pa extends Params = EmptyParams,
  S extends Screen<Pa, any, any> = Screen<Pa, any, any>,
>(
  screen: S extends ScreenWithLoad<any, any, any> ? ScreenWithLoad<Pa, any, any>
    : S,
  content: MakeLinkElement,
  ...context: Pa extends EmptyParams ? Partial<[{ search?: Search }]>
    : Pa extends never ? Partial<[{ search?: Search }]>
    : [{ params: Pa; search?: Search }]
) => ReactElement

export type MakeRedirect = <Pa extends Params = never | EmptyParams>(
  screen: Screen<Pa, any, any>,
  ...context: Readonly<
    Pa extends EmptyParams | never ? Partial<[{ search?: Search }]>
      : [{ params: Pa; search?: Search }]
  >
) => ReactElement

export type PathOf = <Pa extends Params = never | EmptyParams>(
  screen: Screen<Pa, any, any>,
  ...context: Readonly<
    Pa extends EmptyParams | never ? Partial<[{ search?: Search }]>
      : [{ params: Pa; search?: Search }]
  >
) => string

type RoutingTools = {
  makeLinkTo: MakeLink
  makeRedirectTo: MakeRedirect
  pathOf: PathOf
  urlOf: PathOf
  reload: () => void
}

export type RoutingState = {
  loading: boolean
}

export type Routing = RoutingTools & { state: RoutingState }
