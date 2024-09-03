import { exists, walk } from '@std/fs'
import * as JSONC from '@std/jsonc'

import { Env } from './env.ts'

type KitsAssociationsConfig = {
  associations: Record<string, string>
}

const KITS_FILE = Env.get('KITS_FILE')
const KITS_DIR = Env.get('KITS_DIR')

export class Kits {
  /**
   * Retrieve the dev-kit of a dist package.
   *
   * The kits file is just a text file where each line is a tuple of
   * package name and kit name separated by a space.
   */
  static async readPackageKit(pkg: string): Promise<string> {
    if (KITS_FILE === 'unset') {
      throw new Error('KITS_FILE environment variable is not set.')
    }

    const file = await Deno.readTextFile(KITS_FILE)

    const { associations } = JSONC.parse(file) as KitsAssociationsConfig

    if (associations[pkg]) {
      return associations[pkg]
    }

    throw new Error(
      `No kit found for package ${pkg}. Please check that you've added the right entry in the kits file at ${KITS_FILE}.`,
    )
  }

  static async findKit(name: string): Promise<string> {
    if (KITS_DIR === 'unset') {
      throw new Error('KITS_DIR environment variable is not set.')
    }

    for await (const entry of (walk(KITS_DIR))) {
      if (entry.isDirectory && await exists(entry.path + '/deno.json')) {
        const config_file = await Deno.readTextFile(
          entry.path + '/deno.json',
        )

        const config = JSON.parse(config_file) as { name?: string }

        if (config.name == null) {
          console.warn(
            `Kit ${entry.path} does not have a name. It won't be found by the CLI.`,
          )

          continue
        }

        if (config.name === name) return entry.path
      }
    }

    throw new Error(
      `No kit found by the name «${name}». Check that it has a name in its config file.`,
    )
  }
}
