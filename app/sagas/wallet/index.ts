import { GlobalActions, WalletActions } from 'actions'
import { WalletModel } from 'models'
import { actionChannel, all, call, put, select, spawn, take, takeLatest } from 'redux-saga/effects'
import { consensusWorker, gatewayWorker } from 'sagas'
import { activeHostWorker } from 'sagas/host'
import { selectTransactionHeight } from 'selectors'

import { getFeeWorker, getRenterWorker } from '../renter'
import { wrapSpawn } from '../utility'
import {
  broadcastSiacoinWorker,
  broadcastSiafundWorker,
  changePassword,
  createReceiveAddress,
  createWallet,
  getSeeds,
  getTpoolFees,
  getTransactionsWorker,
  getWalletWorker,
  initFromSeedWorker,
  lockWalletWorker,
  receiveAddressWorker,
  txFromIdWorker,
  unlockWalletWorker
} from './workers'

// these calls are spawned once at the start of the wallet load. they spin off a
// bunch of various workers to retrieve data the app will consume.
function* initialDataCalls() {
  yield spawn(getWalletWorker)
  yield spawn(consensusWorker)
  const sinceHeight = yield select(selectTransactionHeight)
  yield spawn(getTransactionsWorker, { count: 100, sinceHeight })
  yield spawn(getTpoolFees)
  yield spawn(receiveAddressWorker)
  // move to global
  yield spawn(gatewayWorker)
  yield spawn(activeHostWorker)
  yield spawn(getFeeWorker)
  yield spawn(getRenterWorker)
}

// One time watcher for wallet initialization
function* initializeWalletWatcher() {
  yield takeLatest(WalletActions.requestInitialData, initialDataCalls)
}

// passes siacoin tx details to the siacoin tx worker.
function* broadcastSiacoinWatcher() {
  while (true) {
    const params = yield take(WalletActions.createSiacoinTransaction.started.type)
    yield spawn(broadcastSiacoinWorker, params.payload)
  }
}

// passes siafund tx details to the siafund tx worker.
function* broadcastSiafundWatcher() {
  while (true) {
    const params = yield take(WalletActions.createSiafundTransaction.started.type)
    yield spawn(broadcastSiafundWorker, params.payload)
  }
}

// attempts to fetch the transaction details on completion. Otherwise, spawn an error.
function* fetchUnconfirmedTxOnBroadcastCompletion() {
  while (true) {
    const response = yield take(WalletActions.createSiacoinTransaction.done.type)
    try {
      const processed: WalletModel.ProcessedTransaction[] = yield all(
        response.payload.result.transactionids.map((txid: string) => call(txFromIdWorker, txid))
      )
      yield put(WalletActions.broadcastedTransactionDetails(processed))
    } catch (err) {
      // TODO error handling
      yield put(
        GlobalActions.notification({
          title: 'Broadcasting Transaction Failed',
          message: err.error ? err.error.message : err,
          type: 'open'
        })
      )
    }
  }
}

// pass password params down to the changePassword worker.
function* changePasswordWatcher() {
  while (true) {
    const params = yield take(WalletActions.changePassword.started)
    yield spawn(changePassword, params.payload)
  }
}

// pass the password to the unlockWallet worker.
function* unlockWalletWatcher() {
  const chan = yield actionChannel(WalletActions.unlockWallet.started)
  while (true) {
    const params = yield take(chan)
    yield spawn(unlockWalletWorker, params.payload)
  }
}

// create a new wallet by spawning createWallet worker.
function* createWalletWatcher() {
  while (true) {
    const params = yield take(WalletActions.createNewWallet.started)
    yield spawn(createWallet, params.payload)
  }
}

// get the seed from uplod by spawning the getSeeds worker.
function* getSeedWatcher() {
  while (true) {
    yield take(WalletActions.getWalletSeeds.started)
    yield spawn(getSeeds)
  }
}

// init from seed process that takes a seed and passes it to the initFromSeed worker.
function* initFromSeedWatcher() {
  while (true) {
    const params = yield take(WalletActions.initFromSeed.started)
    yield spawn(initFromSeedWorker, params.payload)
  }
}

// list of all wallet sagas, passed to the RootSaga for processing.
export const walletSagas = [
  fetchUnconfirmedTxOnBroadcastCompletion(),
  changePasswordWatcher(),
  broadcastSiacoinWatcher(),
  broadcastSiafundWatcher(),
  initializeWalletWatcher(),
  unlockWalletWatcher(),
  createWalletWatcher(),
  getSeedWatcher(),
  initFromSeedWatcher(),
  takeLatest(WalletActions.lockWallet.started, wrapSpawn(lockWalletWorker)),
  takeLatest(WalletActions.getReceiveAddresses.started, wrapSpawn(receiveAddressWorker)),
  takeLatest(WalletActions.generateReceiveAddress.started, wrapSpawn(createReceiveAddress))
]

export * from './workers'
