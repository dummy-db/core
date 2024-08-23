type DummyDBOptions = {
  debug: boolean
  encoding: BufferEncoding
  rootDir: string
}

export const defaultOptions: DummyDBOptions = {
  debug: false,
  encoding: 'utf-8',
  rootDir: '.dummy-db',
}
