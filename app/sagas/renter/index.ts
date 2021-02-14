import { RenterActions } from 'actions'
import { spawn, take, takeLatest } from 'redux-saga/effects'

import { wrapSpawn } from '../utility'
import {
  createBackupWorker,
  getContractsWorker,
  getRenterWorker,
  restoreBackupWorker,
  setAllowanceWorker,
  listBackupWorker
} from './workers'

/**
 * Watchers generally take actions with params and pass them down to a worker.
 * Occasionally, the data needs to be moedified or transformed before it's
 * passed down. It is an infinite loop process.
 */

// takes a destination string and spawns a backup worker to create a backup (1.4.0 only)
function* createBackupWatcher() {
  while (true) {
    const params = yield take(RenterActions.createBackup.started)
    const { destination } = params.payload
    yield spawn(createBackupWorker, {
      destination: destination
    })
  }
}

// watches for a list backup call and passes on the worker to handle the api request (1.4.1+ only)
function* listBackupWatcher() {
  while (true) {
    yield take(RenterActions.listBackups.started)
    yield spawn(listBackupWorker)
  }
}

// takes a source string and attempts to restore from a backup file (1.4.0 only)
function* restoreBackupWatcher() {
  while (true) {
    const params = yield take(RenterActions.restoreBackup.started)
    const { source } = params.payload
    yield spawn(restoreBackupWorker, {
      source
    })
  }
}

// takes an allowance amount and calls the setAllowance worker.
function* setAllowanceWatcher() {
  while (true) {
    const params = yield take(RenterActions.setAllowance.started)
    yield spawn(setAllowanceWorker, {
      ...params.payload
    })
  }
}

export const renterSagas = [
  takeLatest(RenterActions.fetchContracts.started, wrapSpawn(getContractsWorker)),
  createBackupWatcher(),
  restoreBackupWatcher(),
  setAllowanceWatcher(),
  listBackupWatcher()
]

export * from './workers'
