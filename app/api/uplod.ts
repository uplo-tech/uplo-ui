import defaultConfig from 'config'
import { Client } from 'uplo-typescript'
import { uplodLogger } from 'utils/logger'
import { reduxStore } from 'containers/Root'
import { GlobalActions } from 'actions'
import { ChildProcess } from 'child_process'

export interface SiadConfig {
  path: string
  datadir: string
  rpcaddr: string
  hostaddr: string
  detached: boolean
  address: string
}

export let globalSiadProcess: any = null

export const setGlobalSiadProcess = p => {
  globalSiadProcess = p
}

export const getGlobalSiadProcess = (): ChildProcess => {
  return globalSiadProcess
}

export const uplod = new Client({
  dataDirectory: defaultConfig.uplod.datadir
})

export const initSiad = () => {
  const p = uplod.launch(defaultConfig.uplod.path)
  return p
}

export const launchSiad = () => {
  return new Promise((resolve, reject) => {
    const p = initSiad()
    p.stdout.on('data', data => {
      const log = data.toString()
      reduxStore.dispatch(GlobalActions.uplodAppendLog(log))
      uplodLogger.info(log)
    })
    p.stderr.on('data', data => {
      const log = data.toString()
      reduxStore.dispatch(GlobalActions.uplodAppendErr(log))
      uplodLogger.error(log)
    })
    const timeout = setTimeout(() => {
      clearInterval(pollLoaded)
      resolve(false)
    }, 20000)
    const pollLoaded = setInterval(() => {
      if (uplod.isRunning()) {
        clearInterval(pollLoaded)
        clearInterval(timeout)
        resolve(p)
      }
    }, 2000)
  })
}
