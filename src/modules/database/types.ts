export type DatabaseEntry<T extends object> = {
  createdAt: number
  data: T
  lastModified: number
}

export type DummyDB = {
  create: <T extends object>(data: T, id?: string) => void
}

export type DummyDBOptions = {
  debug: boolean
  encoding: BufferEncoding
  rootDirName: string
}

export type SerializedDatabaseEntry<T extends object> = {
  createdAt: string
  data: T
  lastModified: string
}
