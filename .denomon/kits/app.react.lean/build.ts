import { buildJS } from './src/build/esbuild.ts'
import { buildCSS } from './src/build/tailwind.ts'
import { buildStatic, cleanAssets } from './src/shared/static.ts'

async function main(): Promise<void> {
  await cleanAssets()
  await Promise.all([buildStatic(), buildJS(), buildCSS()])
  return
}

main()
