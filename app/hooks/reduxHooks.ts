import { useDispatch, useMappedState } from 'redux-react-hook'
import { useCallback } from 'react'
import { IndexState } from 'reducers'

// useConsensus returns the redux state of consensus
export const useConsensus = () => {
  // Declare your memoized mapState function
  const mapState = useCallback(
    (state: IndexState) => ({
      consensus: state.consensus
    }),
    []
  )
  const { consensus } = useMappedState(mapState)
  return consensus
}

// useSiadUIState returns the redux state describing the lifecycle of the uplod
// process
export const useSiadUIState = () => {
  const mapState = useCallback(
    (state: IndexState) => ({
      uplod: state.ui.uplod
    }),
    []
  )

  const { uplod } = useMappedState(mapState)
  return uplod
}
