/**
 * A utility class for working with `DENOMON_` environment variables.
 */
export class Env {
  /**
   * Retrieve the value of a `DENOMON_` environment variable.
   *
   * @param name The name of the environment variable without the `DENOMON_` prefix.
   * @returns The value of the environment variable or `'unset'` if it's not set.
   */
  static get(name: string): 'unset' | (string & Record<never, never>) {
    return Deno.env.get(`DENOMON_${name}`) ?? 'unset'
  }

  /**
   * Set the value of a `DENOMON_` environment variable.
   *
   * @param name The name of the environment variable without the `DENOMON_` prefix.
   * @param value The value to set.
   */
  static set(name: string, value: string): void {
    Deno.env.set(`DENOMON_${name}`, value)
  }

  /**
   * Convert all `DENOMON_` environment variables to a record.
   *
   * @returns A record of all `DENOMON_` environment variables.
   */
  static toRecord(): Record<string, string> {
    const vars = Deno.env.toObject()

    return Object.fromEntries(
      Object.entries(vars).filter(([key]) => key.startsWith('DENOMON_')),
    )
  }
}
