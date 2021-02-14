const path = require('path')
const fs = require('fs')
const merge = require('lodash/merge')
const isEqual = require('lodash/isEqual')
const set = require('lodash/set')
const electron = require('electron')
const appRootDir = require('app-root-dir')
const getPlatform = require('./get-platform')

const app = electron.app || electron.remote.app

const isProd = process.env.NODE_ENV === 'production'

const daemonPath = isProd
  ? path.join(process.resourcesPath, 'bin')
  : path.join(appRootDir.get(), 'bin', getPlatform())

// Setup the default path for Siad
const defaultSiadPath = path.join(
  daemonPath,
  `${process.platform === 'win32' ? 'uplod.exe' : 'uplod'}`
)

const defaultSiacPath = path.join(
  daemonPath,
  `${process.platform === 'win32' ? 'uploc.exe' : 'uploc'}`
)

// User config path
const userConfigFolder = path.join(app.getPath('userData'), 'uplo')
const userConfigPath = path.join(userConfigFolder, 'config.json')
// Default config
let defaultConfig = {
  darkMode: false,
  debugMode: false,
  developmentMode: !isProd,
  uplod: {
    useCustomBinary: false,
    path: defaultSiadPath,
    datadir: path.join(app.getPath('userData'), './uplo')
  },
  uploc: {
    useCustomBinary: false,
    path: defaultSiacPath
  },
  logPath: userConfigFolder,
  userConfigPath
}

let userConfig
try {
  const userConfigBuffer = fs.readFileSync(userConfigPath)
  userConfig = JSON.parse(userConfigBuffer.toString())
  defaultConfig = merge(defaultConfig, userConfig)
  // check useCustomBinary flags
  if (!defaultConfig.uplod.useCustomBinary) {
    set(defaultConfig, 'uplod.path', defaultSiadPath)
  }
  if (!defaultConfig.uploc.useCustomBinary) {
    set(defaultConfig, 'uploc.path', defaultSiacPath)
  }
} catch (err) {
  console.error('error reading user config file:', err)
}

try {
  if (!isEqual(userConfig, defaultConfig)) {
    fs.writeFileSync(userConfigPath, JSON.stringify(defaultConfig, null, 4))
  }
} catch (err) {
  console.error('error saving user config file:', err)
}

module.exports = defaultConfig
