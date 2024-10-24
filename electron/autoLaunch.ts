import { app } from 'electron'
const AutoLaunch = require('auto-launch')

const autoLauncher = new AutoLaunch({
  name: app.getName(),
  path: app.getPath('exe'),
})

export const autoLaunch = {
  async enable() {
    if (!(await this.isEnabled())) {
      return autoLauncher.enable()
    }
  },
  async disable() {
    if (await this.isEnabled()) {
      return autoLauncher.disable()
    }
  },
  async isEnabled() {
    return autoLauncher.isEnabled()
  }
}
