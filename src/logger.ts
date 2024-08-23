import { defaultOptions } from './config'

type LogLevel = 'debug' | 'error' | 'info' | 'none' | 'warn'

type LogEntryInfo = {
  readonly level: LogLevel
  readonly msg: string
  readonly time: string
}

const logFormat: string = 'time — [level]: msg'

class LogEntry implements LogEntryInfo {
  public readonly time: string

  constructor(
    public readonly msg: string,
    public readonly level: LogLevel,
  ) {
    this.time = new Date().toISOString()
  }

  public get formatted(): string {
    return logFormat
      .replace('time', this.time)
      .replace('level', this.level)
      .replace('msg', this.msg)
  }

  public print(): void {
    switch (this.level) {
      case 'debug':
        if (defaultOptions.debug) {
          console.debug(`[${this.time}] ${this.msg}`)
        }
        break
      case 'error':
        console.error(this.msg)
        break
      case 'info':
        console.info(this.msg)
        break
      case 'none':
        console.log(this.msg)
        break
      case 'warn':
        console.warn(this.msg)
        break
    }
  }

  public toJSON(): LogEntryInfo {
    return {
      level: this.level,
      msg: this.msg,
      time: this.time,
    }
  }
}

export default class Logger {
  private static _entries: LogEntry[] = []

  private static _addEntry(entry: LogEntry): void {
    this._entries.push(entry)

    entry.print()
  }

  /**
   * Logs a debug message and prints it to the console if debug mode is enabled.
   * @param message The debug message to log.
   */
  public static debug(message: string): void {
    this._addEntry(new LogEntry(message, 'debug'))
  }

  /**
   * Logs an error message and prints it to the console.
   * @param message The error message to log.
   * @param err The error object to log.
   */
  public static error(message: string, err?: Error): void {
    let formattedMessage = message

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

    this._addEntry(new LogEntry(formattedMessage, 'error'))
  }

  /**
   * Logs an info message and prints it to the console.
   * @param message The info message to log.
   */
  public static info(message: string): void {
    this._addEntry(new LogEntry(message, 'info'))
  }

  /**
   * Logs a general message and prints it to the console.
   * @param message The message to log.
   */
  public static log(message: string): void {
    this._addEntry(new LogEntry(message, 'none'))
  }

  /**
   * Logs a warning message and prints it to the console.
   * @param message The warning message to log.
   */
  public static warn(message: string): void {
    this._addEntry(new LogEntry(message, 'warn'))
  }
}
