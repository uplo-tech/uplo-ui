import { ConsensusModel } from 'models'
import { reducerWithInitialState } from 'typescript-fsa-reducers'
import { ConsensusActions } from 'actions'

export namespace ConsensusRootReducer {
  export type State = ConsensusModel.ConsensusGETResponse

  const InitialState: ConsensusModel.ConsensusGETResponse = {
    currentblock: '0',
    difficulty: 0,
    height: 0,
    synced: false,
    target: [0]
  }

  export const Reducer = reducerWithInitialState(InitialState).case(
    ConsensusActions.fetchConsensus.done,
    (_, payload) => payload.result
  )
}
