import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, relative } from 'node:path'
import { inspectArchive, isArchiveName, isDumpName } from './archive-security.mjs'

const root = process.cwd()
const releaseRoot = join(root, 'release')
const stageRoot = join(releaseRoot, 'source')
const archive = join(releaseRoot, 'hebaelsherif-source.tgz')

const excludedRoots = new Set([
  '.git', '.next', 'node_modules', '.pnpm-store', 'release', 'coverage',
  'playwright-report', 'test-results', 'reports', 'exports', '.launch-backups', '.launch-tools', '.namecheap-standalone', 'dist', '.vinext', '.wrangler',
])
const excludedNames = new Set(['.DS_Store', 'tsconfig.tsbuildinfo', 'debug.log'])

function excluded(relativePath, isDirectory) {
  const normalized = relativePath.replaceAll('\\', '/')
  const [top] = normalized.split('/')
  const name = normalized.split('/').at(-1)
  if (excludedRoots.has(top) || excludedNames.has(name)) return true
  if (normalized === 'supabase/.temp' || normalized.startsWith('supabase/.temp/')) return true
  if (name === '.env.example') return false
  if (name === '.env' || name?.startsWith('.env.')) return true
  if (/\.(?:pem|key|p12|pfx)$/i.test(name ?? '')) return true
  // Source releases never carry old release archives or database dumps. The
  // generated archive is inspected recursively after creation as a second gate.
  if (!isDirectory && (isArchiveName(normalized) || isDumpName(normalized))) return true
  if (isDirectory && /(?:^|\/)\.cache$/.test(normalized)) return true
  return false
}

function copyTree(sourceDir) {
  for (const entry of readdirSync(sourceDir, { withFileTypes: true })) {
    const source = join(sourceDir, entry.name)
    const rel = relative(root, source)
    if (excluded(rel, entry.isDirectory())) continue
    const destination = join(stageRoot, rel)
    if (entry.isDirectory()) {
      mkdirSync(destination, { recursive: true })
      copyTree(source)
    } else if (entry.isFile()) {
      mkdirSync(join(destination, '..'), { recursive: true })
      cpSync(source, destination)
    }
  }
}

function listFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const absolute = join(dir, entry.name)
    if (entry.isDirectory()) listFiles(absolute, files)
    else files.push(relative(stageRoot, absolute).replaceAll('\\', '/'))
  }
  return files
}

rmSync(releaseRoot, { recursive: true, force: true })
mkdirSync(stageRoot, { recursive: true })
copyTree(root)

const files = listFiles(stageRoot).sort()
const forbidden = files.filter((file) => /(^|\/)\.env(?:\..+)?$/.test(file) && file !== '.env.example'
  || file.startsWith('supabase/.temp/')
  || /^(?:\.next|node_modules|\.pnpm-store|playwright-report|test-results|reports|exports)(?:\/|$)/.test(file)
  || file === 'debug.log')
if (forbidden.length) throw new Error(`Forbidden release paths: ${forbidden.join(', ')}`)

const risky = files.filter((file) => {
  const absolute = join(stageRoot, file)
  if (statSync(absolute).size > 2_000_000 || /\.(?:png|jpe?g|webp|gif|ico|woff2?|zip|tgz|pdf)$/i.test(file)) return false
  const source = readFileSync(absolute, 'utf8')
  return /sb_secret_[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(source)
})
if (risky.length) throw new Error(`Secret-looking values found in release: ${risky.join(', ')}`)

mkdirSync(releaseRoot, { recursive: true })
writeFileSync(join(releaseRoot, 'manifest.json'), `${JSON.stringify({ generatedAt: new Date().toISOString(), files }, null, 2)}\n`)
if (existsSync(archive)) rmSync(archive)
execFileSync('tar', ['-czf', archive, '-C', stageRoot, '.'], { stdio: 'inherit' })
const archiveFailures = inspectArchive(archive, 'release/hebaelsherif-source.tgz')
if (archiveFailures.length) throw new Error(`Unsafe release archive:\n${archiveFailures.join('\n')}`)
console.log(`package:release passed — ${files.length} files, no local secrets or build/test artifacts`)
