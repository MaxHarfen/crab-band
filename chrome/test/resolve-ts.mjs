import { registerHooks } from 'node:module'
registerHooks({
  resolve(specifier, context, next) {
    try { return next(specifier, context) } catch (err) {
      if (/^\.\.?\//.test(specifier) && !/\.[cm]?[jt]sx?$/.test(specifier)) return next(`${specifier}.ts`, context)
      throw err
    }
  },
})
