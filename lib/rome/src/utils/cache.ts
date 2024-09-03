export type AnyFunction = (...args: never[]) => unknown

export class Cache<Of> {
  subscribers = new Set<AnyFunction>()

  constructor(private storage = new Map<string, Of>()) {}

  subscribe = (callback: AnyFunction) => {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  get = (): Map<string, Of> => {
    return this.storage
  }

  set = (key: string, value: Of) => {
    const s = new Map(this.storage)
    s.set(key, value)
    this.storage = s

    this.subscribers.forEach((sub) => sub())
  }
}
