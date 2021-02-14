import defaultConfig from 'config'
import * as path from 'path'
const pty = require('electron').remote.require('node-pty-prebuilt-multiarch')

const isWindows = process.platform === 'win32'

// find the dirname for uploc instead of the direct binary path
const siacBasePath = path.dirname(defaultConfig.uploc.path)

// use the bin name (usually uploc), but can be set in the config.json file
const siacBinName = isWindows
  ? defaultConfig.uploc.path
  : `./${path.basename(defaultConfig.uploc.path)}`

export const createShell = (command = '') => {
  let args = command.split(' ')
  if (args[0] === 'uploc' || args[0] === './uploc' || args[0] === './uploc.exe') {
    args = [...args.splice(1)]
  }
  var term = pty.spawn(siacBinName, args, {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    // use base path as cwd so arv0 is uploc
    cwd: siacBasePath,
    env: process.env
  })

  term.pause()
  return term
}
