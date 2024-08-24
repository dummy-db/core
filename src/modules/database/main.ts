import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { getLogger } from '../logger'
import type { DummyDB, DummyDBOptions } from './types'

const logger = getLogger()

const defaultConfig: DummyDBOptions = {
  debug: false,
  encoding: 'utf-8',
  rootDirName: '.dummy-db',
}

export function generateEntryId(): string {
  return randomUUID().replace(/-/g, '')
}

export function initializeDummyDB(
  options: Partial<DummyDBOptions> = {},
): DummyDB {
  const config: DummyDBOptions = { ...defaultConfig, ...options }
  const rootPath = join(resolve('.'), config.rootDirName)

  if (config.debug) {
    logger.enableDebug()
  }

  logger.debug('Initializing DummyDB...')

  if (!existsSync(rootPath)) {
    logger.debug('Root directory not found')
    runInitialSetup(config)
  } else {
    logger.debug(`Using root directory: ${rootPath}`)
  }

  return {
    create: (data, id) => {
      const entryId = id ?? generateEntryId()
      logger.warn('Method not implemented.')
      logger.debug(`Creating entry "${entryId}": ${data}`)
    },
  }
}

export function runInitialSetup(config: DummyDBOptions) {
  logger.log('Initializing first-time setup for DummyDB')

  const rootPath = join(resolve('.'), config.rootDirName)

  logger.debug(`Creating root directory at: ${rootPath}`)
  try {
    mkdirSync(rootPath)
    logger.debug('Root directory created successfully')
  } catch (err) {
    if (err instanceof Error) {
      logger.error('Failed to create root directory', err)
    } else {
      logger.warn(
        'fs.mkdirSync threw an object that was not an instance of Error',
      )
      logger.error(JSON.stringify(err))
    }
    logger.export()
    throw new Error(
      'An unexpected error occurred while initializing the root directory for DummyDB. Please check the logs for more information.',
    )
  }

  logger.debug('First-time setup complete')
}
