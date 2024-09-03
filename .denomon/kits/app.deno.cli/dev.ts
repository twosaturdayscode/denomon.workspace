import { basename } from '@std/path'
import { debounce } from '@std/async/debounce'

const SRC_DIR = Deno.env.get('DENOMON_SRC') || 'unset'
const OUT_DIR = Deno.env.get('DENOMON_OUT') || 'unset'

const decoder = new TextDecoder()

/**
 * Compile the main.ts file in the src directory, with all permissions.
 *
 * It watches for changes in the source and recompiles the project in the
 * output directory.
 */
async function main() {
  const watcher = Deno.watchFs(SRC_DIR)

  const cmd = new Deno.Command(Deno.execPath(), {
    args: [
      'compile',
      '--allow-all',
      '--output',
      OUT_DIR + '/' + basename(SRC_DIR),
      `${SRC_DIR}/main.ts`,
    ],
    stdout: 'piped',
    stderr: 'piped',
  })

  console.log(`[kit:deno.cli] Compiling ${SRC_DIR}...`)
  const proc = cmd.spawn()

  await proc.output()

  const action = debounce(async (_: Deno.FsEvent) => {
    console.log('Changes detected, recompiling...')

    const { success, stderr, signal } = await proc.output()

    if (signal === 'SIGINT') {
      Deno.env.set(
        'PATH',
        Deno.env.get('PATH')?.replace(`${OUT_DIR}`, '') || '',
      )
    }

    if (success) return

    Deno.env.set('PATH', Deno.env.get('PATH')?.replace(`${OUT_DIR}`, '') || '')

    console.error('Error compiling:', decoder.decode(stderr))
  }, 500)

  for await (const event of watcher) {
    action(event)
  }
}

main()
