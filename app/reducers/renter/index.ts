import { RenterActions } from 'actions'
import { isEqual } from 'lodash'
import { RenterModel } from 'models'
import { combineReducers } from 'redux'
import { reducerWithInitialState, reducerWithoutInitialState } from 'typescript-fsa-reducers'

export namespace RenterReducer {
  export interface State {
    isLoaded: boolean
    summary: RenterModel.RenterGETResponse
    contracts: RenterModel.ContractsGETResponse
    pricing: RenterModel.PricesGETResponse
  }

  const InitialContractsState: RenterModel.ContractsGETResponse = {
    activecontracts: [],
    expiredcontracts: [],
    inactivecontracts: []
  }

  const InitialPricingState: RenterModel.PricesGETResponse = {
    downloadterabyte: '0',
    formcontracts: '0',
    funds: '0',
    hosts: 0,
    period: 0,
    renewwindow: 0,
    storageterabytemonth: '0',
    uploadterabyte: '0',
    expecteddownload: 0,
    expectedredundancy: 0,
    expectedstorage: 0,
    expectedupload: 0
  }

  const ContractReducer = reducerWithInitialState(InitialContractsState).case(
    RenterActions.fetchContracts.done,
    (state, payload) => {
      const response = payload.result
      const activeContractsEqual = isEqual(response.activecontracts, state.activecontracts)
      const iacEqual = isEqual(response.inactivecontracts, state.inactivecontracts)
      const eEqual = isEqual(response.expiredcontracts, state.expiredcontracts)
      const allEqual = activeContractsEqual && iacEqual && eEqual
      if (allEqual) {
        return state
      }
      return {
        activecontracts: response.activecontracts || [],
        inactivecontracts: response.inactivecontracts || [],
        expiredcontracts: response.expiredcontracts || []
      }
    }
  )

  const PricingReducer = reducerWithInitialState(InitialPricingState).case(
    RenterActions.getFeeEstimates.done,
    (_, payload) => {
      return { ...payload.result }
    }
  )

  const SummaryReducer = reducerWithInitialState<RenterModel.RenterGETResponse>({
    currentperiod: 0,
    financialmetrics: {
      contractfees: '0',
      contractspending: '0',
      downloadspending: '0',
      storagespending: '0',
      totalallocated: '0',
      unspent: '0',
      siaadspending: '0'
    },
    settings: {
      allowance: {
        funds: '0',
        hosts: 0,
        period: 0,
        renewwindow: 0
      },
      maxdownloadspeed: 0,
      maxuploadseed: 0,
      streamcachesize: 0
    }
  }).case(RenterActions.getRenterDetails.done, (_, payload) => payload.result)

  const LoadedReducer = reducerWithInitialState(false).case(
    RenterActions.fetchContracts.done,
    (_, payload) => true
  )

  export const Reducer = combineReducers<State>({
    isLoaded: LoadedReducer,
    contracts: ContractReducer,
    pricing: PricingReducer,
    summary: SummaryReducer
  })
}
