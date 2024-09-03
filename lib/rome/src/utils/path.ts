import { inject } from 'regexparam'
import { Params, Search } from '../concepts/screen.ts'

interface InterpolationContext {
  params?: Params
  search?: Search
}

export function interpolate(path: string, ctx: InterpolationContext) {
  const { params = {}, search = {} } = ctx

  const intrp = inject(path, params)

  if (search && Object.values(search).filter(NotUndefined).length > 0) {
    const searchParams = new URLSearchParams()

    // Filter out undefined values
    for (const [key, value] of Object.entries(search)) {
      if (value != null) {
        searchParams.set(key, value)
      }
    }

    return `${intrp}?${searchParams.toString()}`
  }

  return intrp
}

const NotUndefined = <T>(x: T): x is Exclude<T, undefined> => x != null
