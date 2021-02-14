import { HostActions } from 'actions'
import BigNumber from 'bignumber.js'
import { HostReducer } from 'reducers/hosts'
import { select, spawn, take, takeLatest } from 'redux-saga/effects'
import { selectHost } from 'selectors'

import { wrapSpawn } from '../utility'
import {
  addFolderWorker,
  announceHostWorker,
  deleteFolderWorker,
  getStorageWorker,
  hostConfigWorker,
  resizeFolderWorker,
  updateHostConfigWorker
} from './workers'

function* hostConfigWatcher() {
  while (true) {
    const params = yield take(HostActions.updateHostConfig.started)
    yield spawn(updateHostConfigWorker, params.payload)
  }
}

// adds a folder by passing its modified params down to the addFolder worker.
function* addFolderWatcher() {
  while (true) {
    const params = yield take(HostActions.addFolder.started)
    const host: HostReducer.State = yield select(selectHost)
    if (host.host) {
      const { size, path } = params.payload
      const sectorSize = host.host.externalsettings.sectorsize
      const b = new BigNumber(size)
      let roundedBytes: any = b.minus(b.modulo(64 * sectorSize))
      if (roundedBytes.isNegative()) {
        roundedBytes = '0'
      }
      roundedBytes = roundedBytes.toString()

      yield spawn(addFolderWorker, {
        path,
        size: roundedBytes
      })
    }
  }
}

// resizes a host folder by passing the roundedBytes to the worker.
function* resizeFolderWatcher() {
  while (true) {
    const params = yield take(HostActions.resizeFolder.started)
    const host: HostReducer.State = yield select(selectHost)
    if (host.host) {
      const { newsize, path } = params.payload
      const sectorSize = host.host.externalsettings.sectorsize
      const b = new BigNumber(newsize)
      let roundedBytes: any = b.minus(b.modulo(64 * sectorSize))
      if (roundedBytes.isNegative()) {
        roundedBytes = '0'
      }
      roundedBytes = roundedBytes.toString()

      yield spawn(resizeFolderWorker, {
        path,
        newsize: roundedBytes
      })
    }
  }
}

// removes a host folder
function* removeFolderWatcher() {
  while (true) {
    const params = yield take(HostActions.deleteFolder.started)
    const { path } = params.payload
    yield spawn(deleteFolderWorker, {
      path
    })
  }
}

// list of all host sagas
export const hostSagas = [
  takeLatest(HostActions.getHostStorage.started, wrapSpawn(getStorageWorker)),
  takeLatest(HostActions.getHostConfig.started, wrapSpawn(hostConfigWorker)),
  takeLatest(HostActions.announceHost.started, wrapSpawn(announceHostWorker)),
  hostConfigWatcher(),
  addFolderWatcher(),
  resizeFolderWatcher(),
  removeFolderWatcher()
]

export * from './workers'
