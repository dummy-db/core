export type LogEntry = {
  readonly level: LogLevel
  readonly msg: string
  readonly time: number
}

export type Logger = {
  debug: (msg: string) => void
  enableDebug: () => void
  error: (msg: string, err?: Error) => void
  export: () => void
  info: (msg: string) => void
  log: (msg: string) => void
  warn: (msg: string) => void
}

export type LoggerOptions = {
  debug: boolean
  format: string
}

export type LogLevel = 'debug' | 'error' | 'info' | 'none' | 'warn'
