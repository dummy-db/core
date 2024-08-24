/* eslint-disable @typescript-eslint/no-require-imports */
import {
  addEntry,
  exportLog,
  formatEntry,
  getLogger,
  logEntries,
  printEntry,
} from '../../src/modules/logger/main'
import type { LogEntry, LoggerOptions } from '../../src/modules/logger/types'

describe('addEntry', () => {
  const defaultConfig: LoggerOptions = {
    debug: false,
    format: 'time — [level]: msg',
  }

  beforeEach(() => {
    logEntries.splice(0, logEntries.length)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('adds a new log entry to the logEntries array', () => {
    const entry: LogEntry = {
      level: 'debug',
      msg: 'This is a debug entry',
      time: 1724497819298,
    }

    jest.spyOn(Date, 'now').mockReturnValue(entry.time)

    expect(logEntries).toHaveLength(0)

    addEntry(defaultConfig, entry.level, entry.msg)

    expect(logEntries).toHaveLength(1)
  })

  it('creates a timestamp for the log entry', () => {
    const entry: LogEntry = {
      level: 'debug',
      msg: 'This is a debug entry',
      time: 1724497819298,
    }

    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(entry.time)

    expect(logEntries).toHaveLength(0)

    addEntry(defaultConfig, entry.level, entry.msg)

    expect(dateNowSpy).toHaveBeenCalled()
  })
})

describe('exportLog', () => {
  const defaultConfig: LoggerOptions = {
    debug: false,
    format: 'time — [level]: msg',
  }

  beforeEach(() => {
    logEntries.splice(0, logEntries.length)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('exports the log entries to a file and triggers the correct console behaviour', () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()
    const writeFileSyncSpy = jest
      .spyOn(require('node:fs'), 'writeFileSync')
      .mockImplementation(() => {})

    expect(logEntries).toHaveLength(0)

    addEntry(defaultConfig, 'debug', 'This is a debug entry')
    addEntry(defaultConfig, 'error', 'This is an error entry')
    addEntry(defaultConfig, 'info', 'This is an info entry')
    addEntry(defaultConfig, 'none', 'This is a general entry')
    addEntry(defaultConfig, 'warn', 'This is a warning entry')

    expect(logEntries).toHaveLength(5)
    expect(consoleDebugSpy).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
    expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
    expect(consoleLogSpy).toHaveBeenCalledTimes(1)
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
    expect(writeFileSyncSpy).not.toHaveBeenCalled()

    exportLog(defaultConfig)

    expect(writeFileSyncSpy).toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
  })

  it('logs an error message if the log file cannot be written', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(require('node:fs'), 'writeFileSync').mockImplementation(() => {
      throw new Error('Failed to write log file')
    })

    addEntry(defaultConfig, 'debug', 'This is a debug entry')

    expect(consoleErrorSpy).not.toHaveBeenCalled()

    exportLog(defaultConfig)

    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})

describe('formatEntry', () => {
  it('formats templates containing time, level, and message', () => {
    const entry: LogEntry = {
      level: 'debug',
      msg: 'This is a debug entry',
      time: 1724497819298,
    }

    const formattedEntry = formatEntry('time | level | msg', entry)

    expect(formattedEntry).toBe(
      `2024-08-24T11:10:19.298Z | debug | ${entry.msg}`,
    )
  })
})

describe('getLogger', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns a logger object', () => {
    const logger = getLogger()

    expect(logger).toHaveProperty('debug')
    expect(logger).toHaveProperty('enableDebug')
    expect(logger).toHaveProperty('error')
    expect(logger).toHaveProperty('export')
    expect(logger).toHaveProperty('info')
    expect(logger).toHaveProperty('log')
    expect(logger).toHaveProperty('warn')
  })

  describe('enableDebug', () => {
    it('enables debug mode', () => {
      const logger = getLogger()

      const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()

      logger.debug('This is a debug entry')

      expect(consoleDebugSpy).not.toHaveBeenCalled()

      logger.enableDebug()
      logger.debug('This is another debug entry')

      expect(consoleDebugSpy).toHaveBeenCalled()
    })
  })

  describe('error', () => {
    it('logs an error message', () => {
      const logger = getLogger()

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      logger.error('This is an error entry')

      expect(consoleErrorSpy).toHaveBeenCalledWith('This is an error entry')
    })

    it('logs an error message with an error object', () => {
      const logger = getLogger()

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      logger.error('This is an error entry', {
        message: 'An error occured',
        stack: 'Stack line 1\nStack line 2',
      } as Error)

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'This is an error entry\n\tAn error occured\n\tStack line 1\n\tStack line 2',
      )
    })
  })
})

describe('printEntry', () => {
  const defaultConfig: LoggerOptions = {
    debug: false,
    format: 'time — [level]: msg',
  }

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('prints a debug entry to the console when debug is enabled', () => {
    const entry: LogEntry = {
      level: 'debug',
      msg: 'This is a debug entry',
      time: 1724497819298,
    }

    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()

    printEntry({ ...defaultConfig, debug: true }, entry)

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      `2024-08-24T11:10:19.298Z — [debug]: ${entry.msg}`,
    )
  })

  it('does not print a debug entry to the console when debug is disabled', () => {
    const entry: LogEntry = {
      level: 'debug',
      msg: 'This is a debug entry',
      time: Date.now(),
    }

    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation()

    printEntry(defaultConfig, entry)

    expect(consoleDebugSpy).not.toHaveBeenCalled()
  })

  it('prints an error entry to the console', () => {
    const entry: LogEntry = {
      level: 'error',
      msg: 'This is an error entry',
      time: Date.now(),
    }

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    printEntry(defaultConfig, entry)

    expect(consoleErrorSpy).toHaveBeenCalledWith(entry.msg)
  })

  it('prints an info entry to the console', () => {
    const entry: LogEntry = {
      level: 'info',
      msg: 'This is an info entry',
      time: Date.now(),
    }

    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation()

    printEntry(defaultConfig, entry)

    expect(consoleInfoSpy).toHaveBeenCalledWith(entry.msg)
  })

  it('prints a general entry to the console', () => {
    const entry: LogEntry = {
      level: 'none',
      msg: 'This is a general entry',
      time: Date.now(),
    }

    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

    printEntry(defaultConfig, entry)

    expect(consoleLogSpy).toHaveBeenCalledWith(entry.msg)
  })

  it('prints a warning entry to the console', () => {
    const entry: LogEntry = {
      level: 'warn',
      msg: 'This is a warning entry',
      time: Date.now(),
    }

    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    printEntry(defaultConfig, entry)

    expect(consoleWarnSpy).toHaveBeenCalledWith(entry.msg)
  })
})
