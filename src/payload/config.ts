import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { collections } from '@/collections'
import { SiteSettings } from '@/globals/SiteSettings'
import { siteConfig } from '@/lib/site'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const localOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://192.168.1.9:3000']
const allowedOrigins = Array.from(new Set([siteConfig.url, ...localOrigins]))
const schemaPush = process.env.PAYLOAD_ENABLE_SCHEMA_PUSH === 'true'
const bundledSQLiteFileName = 'infe-talent.sqlite'
const writableTempDir = process.platform === 'win32' ? tmpdir() : '/tmp'
const vercelSQLitePath = path.join(writableTempDir, bundledSQLiteFileName)

const getSQLitePath = (databaseUrl = `file:./${bundledSQLiteFileName}`) => databaseUrl.replace(/^file:/i, '')

const toAbsoluteSQLitePath = (sqlitePath: string) =>
  path.isAbsolute(sqlitePath) ? sqlitePath : path.resolve(process.cwd(), sqlitePath)

const findFileUpwards = (startDir: string, fileName: string, maxDepth = 8) => {
  let currentDir = startDir

  for (let depth = 0; depth <= maxDepth; depth += 1) {
    const candidate = path.join(currentDir, fileName)

    if (existsSync(candidate)) {
      return candidate
    }

    const parentDir = path.dirname(currentDir)

    if (parentDir === currentDir) {
      return undefined
    }

    currentDir = parentDir
  }

  return undefined
}

const getExistingSQLiteSourcePath = (databaseUrl?: string) => {
  const configuredPath = databaseUrl ? toAbsoluteSQLitePath(getSQLitePath(databaseUrl)) : undefined
  const bundledPath = path.resolve(process.cwd(), bundledSQLiteFileName)
  const candidates = Array.from(
    new Set([
      configuredPath,
      bundledPath,
      findFileUpwards(process.cwd(), bundledSQLiteFileName),
      findFileUpwards(dirname, bundledSQLiteFileName),
    ].filter(Boolean)),
  ) as string[]

  return candidates.find((candidate) => existsSync(candidate))
}

const hasDifferentFileContents = (sourcePath: string, targetPath: string) => {
  if (!existsSync(targetPath)) {
    return true
  }

  if (statSync(sourcePath).size !== statSync(targetPath).size) {
    return true
  }

  return !readFileSync(sourcePath).equals(readFileSync(targetPath))
}

const copySQLiteToWritableVercelPath = (databaseUrl?: string) => {
  const sourcePath = getExistingSQLiteSourcePath(databaseUrl)
  const targetPath = vercelSQLitePath

  if (!sourcePath) {
    if (existsSync(targetPath)) {
      return `file:${targetPath}`
    }

    throw new Error(`Unable to find ${bundledSQLiteFileName} in the deployment output.`)
  }

  if (hasDifferentFileContents(sourcePath, targetPath)) {
    mkdirSync(path.dirname(targetPath), { recursive: true })
    copyFileSync(sourcePath, targetPath)
  }

  return `file:${targetPath}`
}

const getDatabaseUrl = () => {
  const configuredDatabaseUrl = process.env.DATABASE_URL?.trim()
  const isConfiguredSqlite = configuredDatabaseUrl ? /^file:/i.test(configuredDatabaseUrl) : false
  const isConfiguredPostgres = configuredDatabaseUrl ? /^postgres(ql)?:\/\//i.test(configuredDatabaseUrl) : false
  const shouldUsePostgresOnVercel =
    process.env.PAYLOAD_DATABASE_ADAPTER === 'postgres' ||
    process.env.PAYLOAD_DB_ADAPTER === 'postgres' ||
    process.env.PAYLOAD_USE_POSTGRES === 'true'

  if (process.env.VERCEL && (!configuredDatabaseUrl || isConfiguredSqlite)) {
    return copySQLiteToWritableVercelPath(configuredDatabaseUrl)
  }

  if (process.env.VERCEL && isConfiguredPostgres && !shouldUsePostgresOnVercel) {
    return copySQLiteToWritableVercelPath()
  }

  if (configuredDatabaseUrl) {
    return configuredDatabaseUrl
  }

  return 'file:./infe-talent.sqlite'
}

const databaseUrl = getDatabaseUrl()
const isPostgres = /^postgres(ql)?:\/\//i.test(databaseUrl)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname, '..'),
    },
    meta: {
      titleSuffix: ` - ${siteConfig.name}`,
    },
  },
  collections,
  globals: [SiteSettings],
  cors: allowedOrigins,
  csrf: allowedOrigins,
  db: isPostgres
    ? postgresAdapter({
        push: schemaPush,
        pool: {
          connectionString: databaseUrl,
        },
      })
    : sqliteAdapter({
        push: schemaPush,
        client: {
          url: databaseUrl,
        },
      }),
  editor: lexicalEditor(),
  secret:
    process.env.PAYLOAD_SECRET ||
    'local-development-secret-change-before-production-5f6c2d9e1a0b4c8d',
  serverURL: siteConfig.url,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, '../payload-types.ts'),
  },
})
