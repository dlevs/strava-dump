import path from 'path'
import url from 'url'

/**
 * A replacement for legacy `__dirname` CJS behaviour.
 * For use in ESM files, where `__dirname` is not defined.
 *
 * @example
 * fromDir(import.meta.url, './foo.js')
 */
export const fromDir = (moduleUrl, ...paths) => {
  return path.join(path.dirname(url.fileURLToPath(moduleUrl)), ...paths)
}
