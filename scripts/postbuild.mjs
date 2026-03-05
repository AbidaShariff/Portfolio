import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'

const DIST = 'dist'

async function getFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await getFiles(full)))
    } else if (/\.(html|css|js)$/.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

async function main() {
  const files = await getFiles(DIST)
  let count = 0
  for (const file of files) {
    const original = await readFile(file, 'utf-8')
    const replaced = original
      .replace(/data-astro-image/g, 'data-img')
      .replace(/\[data-astro-image\]/g, '[data-img]')
      .replace(/astro-island/g, 'c-island')
      .replace(/astro-slot/g, 'c-slot')
      .replace(/astro-cid-[a-z0-9]+/g, (match) => 'sc-' + match.slice(10))
      .replace(/astro:page-load/g, 'app:page-load')
      .replace(/astroPrefetch/g, 'dataPrefetch')
      .replace(/data-astro-prefetch/g, 'data-prefetch')
    if (replaced !== original) {
      await writeFile(file, replaced)
      count++
    }
  }
  console.log(`Sanitized ${count} files`)
}

main()
