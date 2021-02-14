import { GatewayActions } from 'actions'
import { GatewayModel } from 'models'
import { reducerWithInitialState } from 'typescript-fsa-reducers'

export namespace GatewayReducer {
  export type State = GatewayModel.GetwayGET

  const initialState: State = {
    peers: [],
    netaddress: ''
  }

  export const Reducer = reducerWithInitialState(initialState).case(
    GatewayActions.fetchGateway.done,
    (_, payload) => {
      return payload.result
    }
  )
}
