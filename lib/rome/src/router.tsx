import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { parse, type RouteParams } from 'regexparam'
import { Link, Redirect, Route, useSearch } from 'wouter'
import hash from 'object-hash'

import type {
  Deps,
  EmptyArray,
  OnlyPathsWithParams,
  Params,
  Props,
  Screen,
  ScreenLayout,
  ScreenWithLoad,
  Search,
} from './concepts/screen.ts'

import { interpolate } from './utils/path.ts'
import { Cache } from './utils/cache.ts'
import type {
  MakeLink,
  MakeRedirect,
  PathOf,
  Routing,
  RoutingState,
} from './concepts/routing.ts'
import { isRedirect, REDIRECT_SYMBOL } from './load-redirect.ts'

const PROPS_CACHE = new Cache<{ layout: Props; screen: Props }>()

/**
 * Customize default behavior of the signpost.
 *
 * - `fallback`: Screen to render when no route matches.
 * - `errorBoundary`: Screen to render when an error occurs and no error
 *    boundary is defined in the route it occurred.
 */
type SignpostOptions = {
  fallback?: React.ReactElement
  errorBoundary?: React.ReactElement
}

class SignpostInternals {
  readonly _routes: Map<Screen<any, any, any>, string> = new Map()
  readonly _deps: Map<
    Screen<any, any, any> | ScreenLayout<any, any, any>,
    Deps
  > = new Map()
  readonly _layouts: Map<
    Screen<any, any, any>,
    ScreenLayout<any, any, any> | undefined
  > = new Map()
  _currentLayout: ScreenLayout<any, any, any> | undefined = undefined
}

/**
 * Signpost is a router that allows you to census/define in one place all the
 * routes of your application.
 */
export class Signpost<RPa extends Params> {
  static create(options: SignpostOptions = {}) {
    return new Signpost(options)
  }

  private constructor(
    private readonly opts: SignpostOptions = {},
    private readonly config = new SignpostInternals(),
  ) {}

  /**
   * Add a route to the Signpost.
   *
   * @param path The path of at which render the screen, supports every pattern of [regexparam](https://github.com/lukeed/regexparam).
   * @param screen Any {@link Screen} object.
   * @param deps If the screen has a load method, its dependencies can be passed here.
   */
  route = <
    P extends string,
    D extends Deps = EmptyArray,
    S extends Screen<RouteParams<P> & RPa, D, Props> = Screen<
      RouteParams<P> & RPa,
      D,
      Props
    >,
  >(
    path: OnlyPathsWithParams<P, RouteParams<P> & RPa>,
    screen: S & S extends ScreenWithLoad<any, any, any>
      ? ScreenWithLoad<RouteParams<P> & RPa, D, any>
      : S,
    ...deps: D extends never | EmptyArray ? [] : [D]
  ) => {
    this.config._routes.set(screen, path)
    this.config._deps.set(screen, deps ?? [])

    this.config._layouts.set(screen, this.config._currentLayout)

    return this
  }

  /**
   * Defines the layout for the next routes. When  you've finished defining the
   * routes that will use this layout, call `withoutLayout` to stop using it.
   *
   * @param screen This must be a {@link ScreenLayout} i.e. a Screen which its render method accepts an `outlet` prop.
   * @param deps If the screen has a load method, its dependencies can be passed here.
   *
   * @note This method returns a new Signpost instance.
   */
  withLayout<Pa extends Params, D extends Deps = never>(
    screen: ScreenLayout<Pa, D, Props>,
    ...deps: D extends never ? [] : [D]
  ) {
    this.config._currentLayout = screen
    this.config._deps.set(screen, deps ?? [])

    return new Signpost<Pa>(this.opts, this.config)
  }

  /**
   * Removes the current layout.
   *
   * @note This method returns a new Signpost instance.
   * @note If there is no layout to remove, it will return the same instance.
   */
  withoutLayout() {
    this.config._currentLayout = undefined
    return new Signpost<Params>(this.opts, this.config)
  }

  make() {
    const routes = Array.from(this.config._routes.keys())
    return (
      <div>
        {routes.map((screen) => this.makeRouteFor(screen))}
        {this.opts.fallback}
      </div>
    )
  }

  // ─── Router Building ───────────────────────────────────────────────────
  private makeRouteFor = (screen: Screen<any, any, any>) => {
    const pttrn = this.pathPatternOf(screen)
    const layout = this.layoutOf(screen)
    const deps = this.depsOf(screen)

    const lDeps = layout ? this.depsOf(layout) : []

    const tools = {
      makeLinkTo: this.makeLinkTo.bind(this),
      makeRedirectTo: this.makeRedirectTo.bind(this),
      urlOf: this.makeUrlOf.bind(this),
      pathOf: this.pathOf.bind(this),
    }

    return (
      <Route path={pttrn} key={pttrn}>
        {(p) => {
          const srch = Object.fromEntries(new URLSearchParams(useSearch()))

          /**
           * Hash of the current url (path + params + search). Used as key
           * to store the props to avoid loading them again.
           */
          const hsh = hash([this.pathOf(screen, { params: p, search: srch })])

          /**
           * Save previous hash to be able to retrieve the previous props
           * and returns it while the new props are being loaded.
           *
           * This avoids global loading from showing again after first load.
           *
           * This with the usage of routing state allows a better handling of
           * the loading state.
           */
          const prev = useRef(hsh)

          /**
           * Using `useSyncExternalStore` to store the props of the screen
           * allow us in the future to enable users the option to provide
           * their own cache implementation.
           */
          const cache = useSyncExternalStore(
            PROPS_CACHE.subscribe,
            PROPS_CACHE.get,
          )

          const [loading, setLoading] = useState(!cache)
          /**
           * This is used just to have a way to rnevererender on demand.
           */
          const [rfrsh, setRefresh] = useState(0)
          const refresh = () => setRefresh((r) => r++)

          const [shouldRedirectTo, setShouldRedirect] = useState<
            [
              Screen<any, any, any>,
              { search?: Search } | { params: Params; search?: Search },
            ]
          >()

          const state: RoutingState = { loading }

          useEffect(() => {
            const loaders = []

            if ('load' in screen && screen.load) {
              loaders.push(screen.load({ params: p, deps, search: srch }))
            }

            if (layout && 'load' in layout) {
              loaders.push(
                layout.load({
                  params: p,
                  deps: lDeps,
                  search: srch,
                }),
              )
            }

            /** If there's nothing to load */
            if (loaders.length === 0) {
              prev.current = hsh
              PROPS_CACHE.set(hsh, { layout: {}, screen: {} })
              setLoading(false)
              return
            }

            // @todo Is this necessary?
            setLoading(true)

            Promise.all(loaders)
              .then((props) => {
                const [screenPs, layoutPs] = props

                if (isRedirect(layoutPs)) {
                  setShouldRedirect(layoutPs[REDIRECT_SYMBOL] as any)
                  return
                }

                if (isRedirect(screenPs)) {
                  setShouldRedirect(screenPs[REDIRECT_SYMBOL] as any)
                  return
                }

                prev.current = hsh
                PROPS_CACHE.set(hsh, { layout: layoutPs, screen: screenPs })
              })
              .catch(console.error)
              .finally(() => setLoading(false))
          }, [hsh, rfrsh])

          if (shouldRedirectTo) {
            const [screen, context] = shouldRedirectTo
            return this.makeRedirectTo(screen, context as any)
          }

          const props = cache.get(hsh) || cache.get(prev.current)

          if (!props) return this.opts.fallback

          const { layout: layoutProps = {}, screen: screenProps = {} } = props

          const routing: Routing = {
            makeLinkTo: tools.makeLinkTo,
            makeRedirectTo: tools.makeRedirectTo,
            pathOf: tools.pathOf,
            urlOf: tools.urlOf,
            state,
            reload: refresh,
          }

          if (layout) {
            const outlet = React.createElement(screen.render, {
              params: p,
              routing,
              ...screenProps,
            })

            return React.createElement(layout.render, {
              params: p,
              routing,
              outlet,
              ...layoutProps,
            })
          }

          return React.createElement(screen.render, {
            params: p,
            routing,
            ...screenProps,
          })
        }}
      </Route>
    )
  }

  // ─── Private tools ─────────────────────────────────────────────────
  private pathPatternOf(screen: Screen<any, any, any>) {
    const p = this.config._routes.get(screen)
    if (!p) throw new Error(`No screen found for path pattern: ${p}`)
    return p
  }

  private layoutOf(screen: Screen<any, any, any>) {
    return this.config._layouts.get(screen)
  }

  private depsOf(screen: Screen<any, any, any> | ScreenLayout<any, any, any>) {
    return this.config._deps.get(screen) || []
  }

  // ─── Routing tools ──────────────────────────────────────────────────
  // @ts-ignore Needs more studying
  private pathOf: PathOf = (screen, context = {}) => {
    const ptrn = this.pathPatternOf(screen)
    return interpolate(ptrn, context)
  }

  // @ts-ignore Needs more studying
  private makeRedirectTo: MakeRedirect = (screen, context) => {
    // @ts-ignore Needs more studying
    const path = this.pathOf(screen, context)
    return <Redirect to={path} replace />
  }

  // @ts-ignore Needs more studying
  private makeUrlOf: PathOf = (screen, context) => {
    // @ts-ignore Needs more studying
    const path = this.pathOf(screen, context)
    const host = window.location.host
    const protocol = window.location.protocol
    return `${protocol}//${host}${path}`
  }

  // @ts-ignore Needs more studying
  private makeLinkTo: MakeLink = (screen, content, context) => {
    const pttrn = this.pathPatternOf(screen)
    // @ts-ignore Needs more studying
    const href = this.pathOf(screen, context)

    /**
     * @todo The usage of `window` will prevent us from using this function in
     * server-side rendering.
     */
    const location = window.location.pathname

    const isActive = parse(pttrn).pattern.test(location)

    if (React.isValidElement(content)) {
      return (
        <Link href={href}>
          <content.type {...content.props} isActive={isActive} />
        </Link>
      )
    }

    if (typeof content === 'string') {
      return (
        <Link href={href} key={href}>
          <span>{content}</span>
        </Link>
      )
    }

    if (typeof content === 'function') {
      return (
        <Link href={href} key={href}>
          {React.createElement(content, { href, isActive })}
        </Link>
      )
    }

    return (
      <Link href={href} key={href}>
        {React.createElement('span', { children: href })}
      </Link>
    )
  }
}
