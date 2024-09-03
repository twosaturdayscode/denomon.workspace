import { copy, ensureDir } from '@std/fs'

const SRC_DIR = Deno.env.get('DENOMON_SRC') || 'unset'
const OUT_DIR = Deno.env.get('DENOMON_OUT') || 'unset'

const PORT = Deno.env.get('PORT') ?? 1234
const BASE_URL = Deno.env.get('BASE_URL') || `http://localhost:${PORT}`
const APP_MAIN = `${BASE_URL}/main.js`

export async function buildStatic() {
  await ensureDir(`${OUT_DIR}`)

  await copy(`${SRC_DIR}/static`, `${OUT_DIR}`, { overwrite: true })

  const html = await Deno.readTextFile(`${SRC_DIR}/static/index.html`)
  const newHtml = html
    .replace(/__BASE__/g, BASE_URL)
    .replace(/__MAIN__/g, APP_MAIN)

  await Deno.writeTextFile(`${OUT_DIR}/index.html`, newHtml)
}

export async function removeAsset(path: string) {
  await Deno.remove(`${OUT_DIR}/${path}`, { recursive: true })
}

export async function cleanAssets() {
  await removeAsset(`${OUT_DIR}`)
}
