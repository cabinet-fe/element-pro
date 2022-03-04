import { provideGlobalConfig } from '@element-pro/hooks'
import { version } from './version'
import type { App, Plugin } from 'vue'
import type { ConfigProviderContext } from '@element-pro/tokens'

const INSTALLED_KEY = Symbol('INSTALLED_KEY')

export const makeInstaller = (components: Plugin[] = []) => {
  const install = (app: App, options: ConfigProviderContext = {}) => {
    if (app[INSTALLED_KEY]) return

    app[INSTALLED_KEY] = true
    components.forEach((c) => app.use(c))
    provideGlobalConfig(options, app, true)
  }

  return {
    version,
    install,
  }
}
