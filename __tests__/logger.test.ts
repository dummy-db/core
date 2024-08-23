import { defaultOptions } from '../src/config'
import Logger from '../src/logger'

jest.mock('../src/config', () => {
  const originalModule = jest.requireActual('../src/config')

  return {
    __esModule: true,
    ...originalModule,
    defaultOptions: {
      debug: false,
      encoding: 'utf-8',
      rootDir: '.test-db',
    },
  }
})

describe('Logger', () => {
  beforeEach(() => {
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('mocked-time')
    jest.spyOn(console, 'debug').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(console, 'info').mockImplementation()
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should not log a debug message if debug mode is disabled', () => {
    defaultOptions.debug = false

    Logger.debug('Debug message')
    expect(console.debug).not.toHaveBeenCalled()
  })

  it('should log a debug message and print it to the console if debug mode is enabled', () => {
    defaultOptions.debug = true

    Logger.debug('Debug message')
    expect(console.debug).toHaveBeenCalledWith('[mocked-time] Debug message')
  })

  it('should log an error message and print it to the console', () => {
    Logger.error('Error message')
    expect(console.error).toHaveBeenCalledWith('Error message')
  })

  it('should log an error message with the error object and print it to the console', () => {
    const error = new Error('Test error')
    Logger.error('Error message', error)
    expect(console.error).toHaveBeenCalledWith(
      expect.stringMatching(
        /^Error\smessage\n\tTest\serror\n\tError:\sTest\serror/,
      ),
    )
  })

  it('should log an info message and print it to the console', () => {
    Logger.info('Info message')
    expect(console.info).toHaveBeenCalledWith('Info message')
  })

  it('should log a general message and print it to the console', () => {
    Logger.log('General message')
    expect(console.log).toHaveBeenCalledWith('General message')
  })

  it('should log a warning message and print it to the console', () => {
    Logger.warn('Warning message')
    expect(console.warn).toHaveBeenCalledWith('Warning message')
  })
})
