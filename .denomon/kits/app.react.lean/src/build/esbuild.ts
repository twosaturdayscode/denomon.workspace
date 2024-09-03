import { default as esbuild } from 'esbuild'
import { denoPlugins } from 'esbuild-deno-plugin'

const WORKSPACE_DIR = Deno.env.get('DENOMON_WORKSPACE_DIR') || 'unset'

const SRC_DIR = Deno.env.get('DENOMON_SRC') || 'unset'
const OUT_DIR = Deno.env.get('DENOMON_OUT') || 'unset'

const env = Object.fromEntries(
  Object.entries(Deno.env.toObject()).filter(([k]) => k.startsWith('WEB_'))
    .map(([k, v]) => [k.slice(4), v])
    .map(([k, v]) => [`process.env.${k}`, JSON.stringify(v)]),
)

const ctx = await esbuild.context({
  entryPoints: [`${SRC_DIR}/main.tsx`],
  outdir: OUT_DIR,
  bundle: true,
  jsx: 'automatic',
  minify: true,
  keepNames: true,
  sourcemap: false,
  plugins: [
    ...denoPlugins({
      configPath: `${WORKSPACE_DIR}/deno.jsonc`,
    }),
  ],
  define: {
    'globalThis': 'window',
    'globalThis._IS_PRODUCTION_': 'true',
    ...env,
  },
})

export const buildJS = async () => await ctx.rebuild()
