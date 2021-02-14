import LoadingScreenHeader from 'components/AppHeader/LoadingScreenHeader'
import { Box, DragContiner, Text, Spinner } from 'components/atoms'
import { Flex } from 'components/atoms/Flex'
import { OfflineState } from 'components/EmptyStates'
import { TransitionSiaSpinner } from 'components/GSAP/TransitionSiaSpinner'
import defaultConfig from 'config'
import * as React from 'react'
import { connect, DispatchProp } from 'react-redux'
import { Redirect } from 'react-router'
import { UIReducer } from 'reducers/ui'
import { createStructuredSelector } from 'reselect'
import { selectSiadState } from 'selectors'
import { GlobalActions } from 'actions'
import { PreWrap } from 'components/Modal'
import styled from 'styled-components'
import { themeGet } from 'styled-system'

interface StateProps {
  uplod: UIReducer.SiadState
}

class OfflineView extends React.Component<StateProps & DispatchProp, {}> {
  timer: any = null
  daemonTimeoutTask: any = null
  state = {
    readyForMainView: false,
    hasEntered: false,
    daemonTimeout: false
  }
  componentDidMount() {
    this.props.dispatch(GlobalActions.startPolling())
    this.props.dispatch(GlobalActions.startSiadPolling())
    // wait a full 9 seconds before showing the daemon timeout screen
    this.daemonTimeoutTask = setTimeout(() => {
      this.setState({
        daemonTimeout: true
      })
    }, 9000)
  }
  componentWillUnmount() {
    if (this.daemonTimeoutTask) {
      clearTimeout(this.daemonTimeoutTask)
    }
  }
  handleEntered = () => {
    this.setState({
      hasEntered: true
    })
  }
  handleExit = () => {
    this.setState({
      readyForMainView: true
    })
  }
  render() {
    const { uplod } = this.props
    const StyledPre = styled.pre`
      color: ${themeGet('colors.near-black')};
    `

    return (
      <DragContiner>
        <LoadingScreenHeader />
        <Flex
          height="100vh"
          width="100%"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          bg="white"
        >
          <TransitionSiaSpinner
            in={
              uplod.loading ||
              (uplod.isActive && uplod.isFinishedLoading === null) ||
              (!this.state.daemonTimeout && !this.state.hasEntered)
            }
            onExit={this.handleExit}
          />
          {/* Conditional checks to see if we need to display a module loading logs */}
          {uplod.isFinishedLoading !== null &&
            !uplod.isFinishedLoading &&
            this.state.daemonTimeout &&
            uplod.isActive && (
              <>
                <Box width={600}>
                  <Flex alignItems="center">
                    <Box pr={3}>
                      <Spinner />
                    </Box>
                    <Box>
                      <Text fontSize={3} textAlign="left">
                        UPLO daemon detected, but is not done loading the modules. It may take longer
                        than expected to finish the loading all the modules.
                      </Text>
                    </Box>
                  </Flex>
                  <Box py={2}>
                    <Text fontSize={1} textAlign="left">
                      If Uplo-UI is managing the daemon, the logs will be printed below:
                    </Text>
                  </Box>
                  <PreWrap py={3} height={300}>
                    {uplod.stdout.map(l => (
                      <StyledPre>{l}</StyledPre>
                    ))}
                    {uplod.stderr.map(l => (
                      <StyledPre>{l}</StyledPre>
                    ))}
                  </PreWrap>
                </Box>
              </>
            )}
          {!uplod.isActive && !uplod.loading && this.state.readyForMainView && <OfflineState />}
        </Flex>
        {uplod.isFinishedLoading && uplod.isActive && <Redirect to="/" />}
      </DragContiner>
    )
  }
}

export default connect(
  createStructuredSelector({
    uplod: selectSiadState
  })
)(OfflineView)
