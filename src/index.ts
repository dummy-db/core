import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defaultOptions } from './config'
import Logger from './logger'

type DbEntry<T extends object> = {
  createdAt: string
  data: T
  lastModified: string
}

class DummyDB<T extends object> {
  public static readonly rootPath: string = join(
    resolve('.'),
    defaultOptions.rootDir,
  )

  private readonly _resourcePath: string

  constructor(public readonly name: string) {
    this._resourcePath = join(DummyDB.rootPath, name)

    DummyDB._init()
    this._init()
  }

  private _entryExists(id: string): boolean {
    return existsSync(join(this._resourcePath, `${id}.json`))
  }

  /**
   * Initializes the root directory for DummyDB.
   * If the directory does not exist, it will be created.
   */
  private static _init(): void {
    Logger.debug('Initializing DummyDB...')
    try {
      if (!existsSync(DummyDB.rootPath)) {
        Logger.debug('Root directory not found')
        Logger.log('Initializing first-time setup for DummyDB')
        Logger.debug(`Creating root directory at: ${DummyDB.rootPath}`)
        mkdirSync(DummyDB.rootPath)
        Logger.debug('Root directory initialization complete')
      } else {
        Logger.debug(`Using root directory: ${DummyDB.rootPath}`)
      }
    } catch (err) {
      if (err instanceof Error) {
        Logger.error('Failed to initialize root directory', err)
      } else {
        Logger.warn(
          'fs.existsSync or fs.mkdirSync threw an object that was not an instance of Error',
        )
        Logger.error(JSON.stringify(err))
      }
      throw new Error(
        'An unexpected error occurred while initializing the root directory for DummyDB. Please check the logs for more information.',
      )
    } finally {
      Logger.debug('DummyDB initialization complete')
    }
  }

  /**
   * Initializes the database directory.
   * If the directory does not exist, it will be created.
   */
  private _init(): void {
    try {
      if (!existsSync(this._resourcePath)) {
        Logger.debug('Database directory not found')
        Logger.log(`Creating new database: ${this.name}`)
        Logger.debug(`Creating database directory at: ${this._resourcePath}`)
        mkdirSync(this._resourcePath)
        Logger.debug('Database initialization complete')
      } else {
        Logger.debug(`Using database directory: ${this._resourcePath}`)
      }
    } catch (err) {
      if (err instanceof Error) {
        Logger.error('Failed to initialize database directory', err)
      } else {
        Logger.error(JSON.stringify(err))
      }
      throw new Error(
        `An unexpected error occurred while initializing the database "${this.name}". Please check the logs for more information.`,
      )
    }
  }

  public createSync(data: T, id: string = randomUUID()): void {
    // Check if an entry with the same ID already exists
    if (this._entryExists(id)) {
      throw new Error(
        `An entry with the ID "${id}" already exists in the database`,
      )
    }

    const timestamp: string = String(new Date().getTime())
    const entry: DbEntry<T> = {
      createdAt: timestamp,
      data,
      lastModified: timestamp,
    }

    const filePath: string = join(this._resourcePath, `${id}.json`)

    try {
      writeFileSync(filePath, JSON.stringify(entry), defaultOptions.encoding)
      Logger.log(`Entry created at: ${filePath}`)
    } catch (error) {
      if (error instanceof Error) {
        Logger.error(`Failed to create entry at: ${filePath}`, error)
      } else {
        throw error
      }
    }
  }
}

type User = {
  email: string
  uid: string
}

const db = new DummyDB<User>('users')

const john: User = {
  email: 'john.doe@example.com',
  uid: randomUUID(),
}

db.createSync(john, john.uid)
