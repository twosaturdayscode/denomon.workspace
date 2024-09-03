import type { ReactElement } from 'react'

import type { Routing } from './routing.ts'
import type {
  Deps,
  EmptyParams,
  EmptyProps,
  Params,
  Props,
  Search,
} from './screen.ts'

export type LoadContext<Pa extends Params = never, D extends Deps = any> = {
  params: Pa
  search: Search
  deps: D
}

export type ScreenLoad<Pr extends Props, Pa extends Params, D extends Deps> = (
  context: LoadContext<Pa, D>,
) => Promise<Pr>

export type ScreenProps<
  Pr extends Props = EmptyProps & { params: EmptyParams },
  Pa extends Params = EmptyParams,
> = Pr & { readonly params: Pa } & { routing: Routing }

export type ScreenLayoutProps<
  Pr extends Props = EmptyProps,
  Pa extends Params = EmptyParams,
> = Pr & {
  readonly outlet: ReactElement
  readonly params: Pa
  routing: Routing
}
