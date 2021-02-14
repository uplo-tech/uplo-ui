require('dotenv').config()
const { notarize } = require('electron-notarize')

const password = `@keychain:AC_PASSWORD`

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context
  if (electronPlatformName !== 'darwin') {
    return
  }

  const appName = context.packager.appInfo.productFilename

  return await notarize({
    appBundleId: 'tech.nebulous.SiaUI',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: password
  })
}
