import { writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { LogEntry, Logger, LoggerOptions, LogLevel } from './types'

export const logEntries: LogEntry[] = []

const defaultConfig: LoggerOptions = {
  debug: false,
  format: 'time — [level]: msg',
}

/**
 * Adds a new log entry to the logEntries array.
 *
 * @param config The logger configuration options.
 * @param level The log level of the entry.
 * @param msg The message to log.
 * ---
 * @author CasperSocio
 * @since 0.1.0
 * @internal
 */
export function addEntry(
  config: LoggerOptions,
  level: LogLevel,
  msg: string,
): void {
  const time: number = Date.now()

  const entry: LogEntry = {
    level,
    msg,
    time,
  }

  logEntries.push(entry)

  printEntry(config, entry)
}

/**
 * Exports the log entries to a file.
 *
 * @param config The logger configuration options.
 * ---
 * @author CasperSocio
 * @since 0.1.0
 * @internal
 */
export function exportLog(config: LoggerOptions): void {
  const formattedEntries: string[] = logEntries.map((entry) =>
    formatEntry(config.format, entry),
  )

  const logPath: string = join(resolve('.'), 'dummy-db.log')

  try {
    writeFileSync(logPath, formattedEntries.join('\n'), 'utf-8')
  } catch (err) {
    console.error('Failed to write log file:', err)
  }
}

/**
 * Formats a log entry using the specified template.
 *
 * @param template The template to use for formatting.
 * @param entry The log entry to format.
 * @returns The formatted log entry.
 *
 * @example
 * formatEntry('time — [level]: msg', {
 *   level: 'info',
 *   msg: 'This is an info message',
 *   time: 1629780000000,
 * })
 * // Returns '2021-08-24T12:00:00.000Z — [info]: This is an info message'
 * ---
 * @author CasperSocio
 * @since 0.1.0
 * @internal
 */
export function formatEntry(template: string, entry: LogEntry): string {
  let formattedEntry: string = template
  const timestamp = new Date(entry.time).toISOString()

  formattedEntry = formattedEntry.replace('time', timestamp)
  formattedEntry = formattedEntry.replace('level', entry.level)
  formattedEntry = formattedEntry.replace('msg', entry.msg)

  return formattedEntry
}

/**
 * Creates a new logger with the specified options.
 *
 * @param options The logger configuration options.
 * @returns A new logger instance.
 * ---
 * @author CasperSocio
 * @since 0.1.0
 * @public
 */
export function getLogger(options: Partial<LoggerOptions> = {}): Logger {
  const config: LoggerOptions = { ...defaultConfig, ...options }

  const enableDebug = (): void => {
    config.debug = true
  }

  const error = (msg: string, err?: Error): void => {
    let formattedMessage: string = msg

    if (err) {
      formattedMessage += `\n\t${err.message}`

      if (err.stack) {
        const formattedStack = err.stack
          .split('\n')
          .map((line) => `\t${line}`)
          .join('\n')
        formattedMessage += `\n${formattedStack}`
      }
    }

    addEntry(config, 'error', formattedMessage)
  }

  return {
    debug: (msg: string) => addEntry(config, 'debug', msg),
    enableDebug,
    error,
    export: () => exportLog(config),
    info: (msg: string) => addEntry(config, 'info', msg),
    log: (msg: string) => addEntry(config, 'none', msg),
    warn: (msg: string) => addEntry(config, 'warn', msg),
  }
}

/**
 * Prints a log entry to the console with the appropriate log level.
 *
 * @param config The logger configuration options.
 * @param entry The log entry to print.
 * ---
 * @author CasperSocio
 * @since 0.1.0
 * @internal
 */
export function printEntry(config: LoggerOptions, entry: LogEntry): void {
  switch (entry.level) {
    case 'debug':
      if (config.debug) console.debug(formatEntry(config.format, entry))
      break
    case 'error':
      console.error(entry.msg)
      break
    case 'info':
      console.info(entry.msg)
      break
    case 'none':
      console.log(entry.msg)
      break
    case 'warn':
      console.warn(entry.msg)
      break
  }
}
