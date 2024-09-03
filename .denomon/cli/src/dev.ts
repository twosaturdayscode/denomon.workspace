import * as Denomon from './denomon/index.ts'
import { denoPath } from './system/deno-path.ts'

const WORKSPACE_DIR = Denomon.Env.get('WORKSPACE_DIR')
const ARTIFACTS_DIR = Denomon.Env.get('ARTIFACTS_DIR')

/**
 * Develop command.
 */
export async function develop(dir: string) {
  const src = WORKSPACE_DIR + '/dist' + `/${dir}`
  const dst = ARTIFACTS_DIR + `/${dir}`

  const { readPackageKit, findKit } = Denomon.Kits

  const kit_name = await readPackageKit(dir)
  const kit = await findKit(kit_name)

  Deno.env.set('DENOMON_SRC', src)
  Deno.env.set('DENOMON_OUT', dst)

  const deno = await denoPath()

  if (!deno) {
    throw new Error('Deno not found')
  }

  const dev = new Deno.Command(deno, {
    args: ['run', '-A', kit + '/dev.ts'],
    env: { ...Deno.env.toObject() },
  })

  console.log(
    `Starting development of project «${dir}» with «${kit_name}» kit...`,
  )
  const chld = dev.spawn()

  await chld.output().catch(console.error)
}
