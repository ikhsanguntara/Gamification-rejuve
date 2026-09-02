import { createRequire } from 'module'
import path from 'path'
import { fileURLToPath } from 'url'
import { createJiti } from 'jiti'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const jiti = createJiti(import.meta.url, {
  alias: {
    '~': __dirname,
    '@': __dirname
  }
})

await jiti.import('./test_all_cruds.mjs')
