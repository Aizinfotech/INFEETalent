import { postgresAdapter } from '@payloadcms/db-postgres'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
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
const schemaPush = process.env.PAYLOAD_ENABLE_SCHEMA_PUSH === 'true'
const isVercel = Boolean(process.env.VERCEL)
const allowEphemeralSQLiteOnVercel = process.env.PAYLOAD_ALLOW_EPHEMERAL_SQLITE === 'true'

const originListFromEnv = (value?: string) =>
  value
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []

const normalizeOrigin = (origin?: string) => {
  if (!origin) {
    return undefined
  }

  const trimmedOrigin = origin.trim().replace(/\/+$/, '')

  if (!trimmedOrigin) {
    return undefined
  }

  const originWithProtocol = /^https?:\/\//i.test(trimmedOrigin)
    ? trimmedOrigin
    : `https://${trimmedOrigin}`

  try {
    return new URL(originWithProtocol).origin
  } catch {
    return undefined
  }
}

const isIPAddress = (hostname: string) => /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)

const getOriginVariants = (origin?: string) => {
  const normalizedOrigin = normalizeOrigin(origin)

  if (!normalizedOrigin) {
    return []
  }

  const originUrl = new URL(normalizedOrigin)
  const variants = [normalizedOrigin]
  const shouldAddWwwVariant =
    !originUrl.hostname.includes('localhost') &&
    !originUrl.hostname.endsWith('.vercel.app') &&
    !isIPAddress(originUrl.hostname)

  if (shouldAddWwwVariant) {
    const alternateHostname = originUrl.hostname.startsWith('www.')
      ? originUrl.hostname.slice(4)
      : `www.${originUrl.hostname}`

    variants.push(`${originUrl.protocol}//${alternateHostname}${originUrl.port ? `:${originUrl.port}` : ''}`)
  }

  return variants
}

const allowedOrigins = Array.from(
  new Set(
    [
      siteConfig.url,
      process.env.NEXT_PUBLIC_SITE_URL,
      process.env.NEXT_PUBLIC_SERVER_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL,
      process.env.VERCEL_URL,
      ...originListFromEnv(process.env.PAYLOAD_ALLOWED_ORIGINS),
      ...localOrigins,
    ].flatMap(getOriginVariants),
  ),
)

const getDatabaseUrl = () => {
  const configuredDatabaseUrl = process.env.DATABASE_URL?.trim()
  const isConfiguredSqlite = configuredDatabaseUrl ? /^file:/i.test(configuredDatabaseUrl) : false

  if (isVercel && (!configuredDatabaseUrl || isConfiguredSqlite) && !allowEphemeralSQLiteOnVercel) {
    throw new Error(
      'Payload admin requires a persistent DATABASE_URL on Vercel. Use a hosted Postgres database for live admin edits, or set PAYLOAD_ALLOW_EPHEMERAL_SQLITE=true only for throwaway preview deployments.',
    )
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
