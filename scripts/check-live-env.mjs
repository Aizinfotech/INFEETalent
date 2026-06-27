import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const rootDir = path.resolve(dirname, '..')
const envFiles = ['.env', '.env.local', '.env.production', '.env.production.local']
const fileEnv = {}

for (const envFile of envFiles) {
  const envPath = path.join(rootDir, envFile)

  if (!existsSync(envPath)) {
    continue
  }

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/)

  for (const line of lines) {
    const trimmedLine = line.trim()

    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue
    }

    const match = trimmedLine.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)

    if (!match) {
      continue
    }

    const [, key, rawValue] = match
    fileEnv[key] = rawValue.replace(/^['"]|['"]$/g, '')
  }
}

const getEnv = (key) => process.env[key]?.trim() || fileEnv[key]?.trim() || ''
const required = ['PAYLOAD_SECRET', 'NEXT_PUBLIC_SITE_URL', 'DATABASE_URL']

const missing = required.filter((key) => !getEnv(key))
const databaseUrl = getEnv('DATABASE_URL')
const isPostgres = /^postgres(ql)?:\/\//i.test(databaseUrl)
const isLocalSecret =
  !getEnv('PAYLOAD_SECRET') ||
  getEnv('PAYLOAD_SECRET') === 'development-dev-secret' ||
  getEnv('PAYLOAD_SECRET').includes('replace-with')

if (missing.length > 0) {
  console.error(`Missing live environment variables: ${missing.join(', ')}`)
  process.exitCode = 1
}

if (databaseUrl && !isPostgres) {
  console.error('DATABASE_URL must be a hosted Postgres URL for live Payload admin edits.')
  process.exitCode = 1
}

if (isLocalSecret) {
  console.error('PAYLOAD_SECRET must be a long, random production value.')
  process.exitCode = 1
}

if (!process.exitCode) {
  console.log('Live environment variables look ready for Payload admin.')
}
