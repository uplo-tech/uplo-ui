import { WalletActions } from 'actions'
import { isEqual } from 'lodash'
import { WalletModel } from 'models'
import { combineReducers } from 'redux'
import { reducerWithInitialState } from 'typescript-fsa-reducers'
import { merge } from 'lodash'
import { arrayUnique } from 'utils'

export namespace WalletRootReducer {
  export interface ReceiveState {
    address: string
    addresses: string[]
  }

  export interface SeedState {
    primaryseed: string
    error: string
  }

  export interface State {
    summary: WalletModel.WalletGET
    transactions: TransactionState
    siacoinBroadcastResponse: WalletModel.ProcessedTransaction[]
    receive: ReceiveState
    seed: SeedState
  }

  // Summary State
  const InitialSummaryState: WalletModel.WalletGET = {
    encrypted: false,
    height: 0,
    rescanning: false,
    unlocked: false,
    confirmedsiacoinbalance: 0,
    unconfirmedoutgoingsiacoins: 0,
    unconfirmedincomingsiacoins: 0,
    siacoinclaimbalance: 0,
    siafundbalance: '0',
    dustthreshold: 0
  }

  interface TransactionState {
    byID: { [id: string]: WalletModel.ProcessedTransaction }
    confirmedtransactionids: string[]
    unconfirmedtransactionids: string[]
    sinceHeight: number
  }
  const InitialTransactionsState: TransactionState = {
    byID: {},
    confirmedtransactionids: [],
    unconfirmedtransactionids: [],
    sinceHeight: 0
  }

  const InitialReceiveState: ReceiveState = {
    address: '',
    addresses: []
  }

  const ReceiveReducer = reducerWithInitialState(InitialReceiveState)
    .case(WalletActions.getReceiveAddresses.done, (state, payload) => {
      const addresses = [state.address, ...state.addresses]
      if (isEqual(addresses, state.addresses)) {
        return state
      }
      return {
        address: '',
        addresses: payload.result.addresses
      }
    })
    .case(WalletActions.generateReceiveAddress.done, (state, payload) => {
      let newAddresses = state.addresses
      if (state.address) {
        newAddresses = [state.address, ...state.addresses]
      }
      return {
        address: payload.result.address,
        addresses: newAddresses
      }
    })

  const SummaryReducer = reducerWithInitialState(InitialSummaryState)
    .case(WalletActions.getWallet.done, (_, payload) => {
      return payload.result
    })
    .case(WalletActions.unlockWallet.done, (state, _) => {
      return { ...state, ...{ unlocked: true } }
    })

  const TransactionReducer = reducerWithInitialState(InitialTransactionsState).case(
    WalletActions.getTransactions.done,
    (state, payload) => {
      const newState = { ...state }
      let ctx = payload.result.confirmedtransactions
      let utx = payload.result.unconfirmedtransactions
      if (!ctx) {
        ctx = []
      }
      if (!utx) {
        utx = []
      }
      for (let c of ctx) {
        newState.byID[c.transactionid] = c
      }
      for (let u of utx) {
        newState.byID[u.transactionid] = u
      }

      const latestSeenTransaction = ctx.length > 0 ? ctx[ctx.length - 1] : false
      const latestSeenHeight = latestSeenTransaction ? latestSeenTransaction.confirmationheight : 0
      newState.sinceHeight = latestSeenHeight

      const ctxIDs = ctx.map(c => c.transactionid)
      const utxIDs = utx.map(u => u.transactionid)
      newState.confirmedtransactionids = arrayUnique([...state.confirmedtransactionids, ...ctxIDs])
      newState.unconfirmedtransactionids = arrayUnique([
        ...state.unconfirmedtransactionids,
        ...utxIDs
      ])

      return newState
    }
  )

  const SCBroadcastReducer = reducerWithInitialState([] as WalletModel.ProcessedTransaction[])
    .case(WalletActions.broadcastedTransactionDetails, (_, payload) => {
      return payload
    })
    .case(WalletActions.resetTransactionDetails, _ => [])

  const SeedReducer = reducerWithInitialState({
    primaryseed: '',
    error: ''
  })
    .case(WalletActions.createNewWallet.done, (_, payload) => ({
      error: '',
      primaryseed: payload.result.primaryseed
    }))
    .case(WalletActions.createNewWallet.failed, (_, payload) => ({
      error: payload.error.message,
      primaryseed: ''
    }))
    .cases([WalletActions.clearSeed, WalletActions.lockWallet.started], () => ({
      error: '',
      primaryseed: ''
    }))
    .case(WalletActions.getWalletSeeds.done, (_, payload) => ({
      primaryseed: payload.result.primaryseed,
      error: ''
    }))

  // End Summary State
  export const Reducer = combineReducers<State>({
    summary: SummaryReducer,
    transactions: TransactionReducer,
    siacoinBroadcastResponse: SCBroadcastReducer,
    receive: ReceiveReducer,
    seed: SeedReducer
  })
}
