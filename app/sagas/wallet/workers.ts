import { GlobalActions, TpoolActions, WalletActions } from 'actions'
import { uplod } from 'api/uplod'
import { WalletModel } from 'models'
import { SagaIterator } from 'redux-saga'
import { call, put, select } from 'redux-saga/effects'
import { toHastings } from 'uplo-typescript'
import { bindAsyncAction } from 'typescript-fsa-redux-saga'
import { selectConsensus } from 'selectors'

// calls /wallet to get wallet summary object.
export const getWalletWorker = bindAsyncAction(WalletActions.getWallet)(function*(): SagaIterator {
  const response = yield call(uplod.call, '/wallet')
  return response
})

// calls the /wallet/transactions endpoint. takes the sinceHeight param to
// determine the startHeight of the request. endHeight is always set to -1. We
// take the consensus state from our app to determine if the sinceHeight is
// greater than the latest seen height. If not, we don't need to poll for new
// transactions.
export const getTransactionsWorker = bindAsyncAction(WalletActions.getTransactions)(function*(
  params
): SagaIterator {
  let startHeight = 0
  if (params.sinceHeight) {
    startHeight = params.sinceHeight
  }
  const consensus = yield select(selectConsensus)
  // if consensus hasn't synced to the since height, return an empty transaction
  // object.
  if (consensus.height < startHeight) {
    return {
      confirmedtransactions: [],
      unconfirmedtransactions: []
    }
  }
  const response = yield call(
    uplod.call,
    `/wallet/transactions?startheight=${startHeight}&endheight=-1`
  )
  response.confirmedtransactions = response.confirmedtransactions
    ? response.confirmedtransactions
    : []
  response.unconfirmedtransactions = response.unconfirmedtransactions
    ? response.unconfirmedtransactions
    : []
  response.sinceHeight =
    response.confirmedtransactions.length > 0
      ? response.confirmedtransactions[response.confirmedtransactions.length - 1].confirmationheight
      : 0
  return response
})

// broadcasts a siacoin transaction to the uplo network
export const broadcastSiacoinWorker = bindAsyncAction(WalletActions.createSiacoinTransaction, {
  skipStartedAction: true
})(function*(params): SagaIterator {
  const response = yield call(uplod.call, {
    url: '/wallet/siacoins',
    method: 'POST',
    qs: {
      destination: params.destination,
      amount: toHastings(params.amount).toString()
    }
  })
  return response
})

// broadcasts a siafund transaction to the uplo network
export const broadcastSiafundWorker = bindAsyncAction(WalletActions.createSiafundTransaction, {
  skipStartedAction: true
})(function*(params): SagaIterator {
  const response = yield call(uplod.call, {
    url: '/wallet/siafunds',
    method: 'POST',
    qs: {
      destination: params.destination,
      amount: params.amount.toString()
    }
  })
  return response
})

// locks the wallet by posting to /wallet/lock
export const lockWalletWorker = bindAsyncAction(WalletActions.lockWallet, {
  skipStartedAction: true
})(function*(): SagaIterator {
  const response = yield call(uplod.call, {
    url: '/wallet/lock',
    method: 'POST'
  })
  yield put(WalletActions.requestInitialData())
  return response
})

// unlocks the wallet by posting the password to /wallet/unlock
export const unlockWalletWorker = bindAsyncAction(WalletActions.unlockWallet, {
  skipStartedAction: true
})(function*(params): SagaIterator {
  const response = yield call(uplod.call, {
    url: '/wallet/unlock',
    method: 'POST',
    qs: {
      encryptionpassword: params.encryptionpassword
    }
  })
  yield put(WalletActions.requestInitialData())
  return response
})

// calls /wallet/addresses to get receive addresses.
// TODO: we have a new endpoint to get receive addresses in order, so we should use that.
export const receiveAddressWorker = bindAsyncAction(WalletActions.getReceiveAddresses, {
  skipStartedAction: true
})(function*(): SagaIterator {
  const response = yield call(uplod.call, '/wallet/addresses')
  return response
})

//  The /wallet/transaction/:id does not work for unconfirmed transactions, so
//  instead we will fetch all the wallet transactions and filter the specific ID
//  from there.
export const txFromIdWorker = bindAsyncAction(WalletActions.getTxFromId)(function*(
  params
): SagaIterator {
  const response: WalletModel.TransactionsGETResponse = yield call(
    uplod.call,
    `/wallet/transactions?startheight=0&endheight=-1`
  )
  const tx = response.unconfirmedtransactions.filter(t => t.transactionid === params)
  return tx.length === 1 ? tx[0] : []
})

// call the /tpool/fee endpoint to get the estimated transaction fee for the tx.
export const getTpoolFees = bindAsyncAction(TpoolActions.getFee)(function*(): SagaIterator {
  const response = yield call(uplod.call, '/tpool/fee')
  return response
})

// calls /wallet/init for a new wallet. should only be called for a new user.
export const createWallet = bindAsyncAction(WalletActions.createNewWallet, {
  skipStartedAction: true
})(function*(): SagaIterator {
  const response: WalletModel.InitPOSTResponse = yield call(uplod.call, {
    url: '/wallet/init',
    method: 'POST'
  })
  return response
})

// calls /wallet/changepassword with the old password and the new password, puts
// success or failed notification depending on the api result.
export const changePassword = bindAsyncAction(WalletActions.changePassword, {
  skipStartedAction: true
})(function*(params): SagaIterator {
  const { encryptionpassword, newpassword } = params
  try {
    const response = yield call(uplod.call, {
      url: '/wallet/changepassword',
      method: 'POST',
      qs: {
        encryptionpassword,
        newpassword
      }
    })
    yield put(
      GlobalActions.notification({
        title: 'Change Password',
        message: 'Successfully changed password',
        type: 'open'
      })
    )
    return response
  } catch (e) {
    yield put(
      GlobalActions.notification({
        title: 'Change Password Failed',
        message: e.error ? e.error.message : 'Unknown error occurred',
        type: 'open'
      })
    )
  }
})

// starts the init from seed process, should be called for new users only.
export const initFromSeedWorker = bindAsyncAction(WalletActions.initFromSeed, {
  skipStartedAction: true
})(function*(params): SagaIterator {
  const response = yield call(uplod.call, {
    url: '/wallet/init/seed',
    method: 'POST',
    qs: {
      seed: params.primaryseed
    },
    timeout: 864e5
  })
  return response
})

// returns the seed(s) from the wallet, use to display in the 'View Seed' modal.
export const getSeeds = bindAsyncAction(WalletActions.getWalletSeeds, {
  skipStartedAction: true
})(function*(): SagaIterator {
  const response = yield call(uplod.call, '/wallet/seeds')
  return response
})

// creates a new receive address by calling the /wallet/address endpoint.
export const createReceiveAddress = bindAsyncAction(WalletActions.generateReceiveAddress, {
  skipStartedAction: true
})(function*(): SagaIterator {
  const response = yield call(uplod.call, '/wallet/address')
  return response
})
