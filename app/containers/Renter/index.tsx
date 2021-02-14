import { RenterActions } from 'actions'
import { Button, Card, Collapse, Dropdown, Icon, Menu } from 'antd'
import { Box, CardHeader, ElectronLink, Text } from 'components/atoms'
import { Flex } from 'components/atoms/Flex'
import { Stat } from 'components/Card'
import FileManager from 'components/FileManager'
import { AllowanceModal } from 'components/Modal'
import { WalletDetails } from 'containers/Wallet'
import { RenterModel } from 'models'
import * as React from 'react'
import { connect, DispatchProp } from 'react-redux'
import { RouteComponentProps, Switch, withRouter } from 'react-router'
import BigNumber from 'bignumber.js'
import { Link, Route } from 'react-router-dom'
import { IndexState } from 'reducers'
import { UIReducer } from 'reducers/ui'
import {
  ContractSums,
  selectContractDetails,
  selectPricing,
  selectRenterSummary,
  selectRentStorage,
  selectSpending,
  selectWalletBalanceDetails,
  SpendingTotals
} from 'selectors'
import { toSiacoins } from 'uplo-typescript'
import { TransitionSiaOnlySpin } from 'components/GSAP/TransitionSiaSpinner'
import { TransitionGroup } from 'react-transition-group'
import defaultConfig from 'config'
import { BackupModal } from 'components/Modal/BackupModal'
import { RestoreModal } from 'components/Modal/RestoreModal'
import { StyledButton } from 'components/atoms/StyledButton'
import { StyledModal } from 'components/atoms/StyledModal'
import { IsLoadedHOC } from 'components/IsLoadedHOC/IsLoadedHOC'
import { useMappedState, useDispatch } from 'redux-react-hook'

const { Panel } = Collapse

const Metrics = () => (
  <Collapse bordered={false} style={{ backgroundColor: '#fdfdfd' }} defaultActiveKey={['1']}>
    <Panel header="Developer Guides" key="1" style={{ borderBottom: 0 }}>
      <Flex>
        <Flex width={1 / 2} mx={2}>
          <Card
            title="Building on the Uplo Platform"
            style={{ alignSelf: 'stretch' }}
            extra={
              <ElectronLink
                href="https://github.com/uplo-tech/uplo/blob/master/doc/API.md"
                target="_blank"
              >
                Docs
              </ElectronLink>
            }
          >
            <Text fontWeight={300} lineHeight="title">
              Learn about how decentralized storage works on Uplo. Leverage your understanding of
              smart-contracts and blockchains to upload your first file through Uplo.
            </Text>
          </Card>
        </Flex>
        <Flex width={1 / 2} mx={2}>
          <Card
            title="Decentralized Youtube on Uplo"
            style={{ alignSelf: 'stretch' }}
            extra={<a href="#">Learn</a>}
          >
            <Text fontWeight={300} lineHeight="title">
              Already a seasoned developer? Get your hands dirty and build a decentralized YouTube
              clone using the Uplo platform to serve video content!
            </Text>
          </Card>
        </Flex>
      </Flex>
    </Panel>
    <Panel header="File Metrics (Fake Data)" key="2" style={{ borderBottom: 0 }}>
      <Flex>
        <Flex width={1 / 2} mx={2}>
          <Card
            title="Building on the Uplo Platform"
            style={{ alignSelf: 'stretch' }}
            extra={<a href="#">Docs</a>}
          >
            <Text fontWeight={300} lineHeight="title">
              Learn about how decentralized storage works on Uplo. Leverage your understanding of
              smart-contracts and blockchains to build a cloud Plex-drive.
            </Text>
          </Card>
        </Flex>
        <Box width={1 / 2}>
          <Flex flexDirection="column">
            <Flex mb={2}>
              <Stat content="82GB" title="Storage Used" width={1 / 2} />
              <Stat content="~2 week" title="Contract Renewal" width={1 / 2} />
            </Flex>
            <Flex>
              <Stat content="50" title="Active Contracts" width={1 / 2} />
              <Stat content="150 UPLO" title="Locked in Contracts" width={1 / 2} />
            </Flex>
            {/* <Box mx={2}>
                        <Text>hi</Text>
                      </Box> */}
          </Flex>
        </Box>
      </Flex>
    </Panel>
    <Panel header="UL/DL Metrics (Fake Data)" key="3" style={{ borderBottom: 0 }}>
      <Flex>
        <Flex width={1 / 2} mx={2}>
          <Card
            title="Building on the Uplo Platform"
            style={{ alignSelf: 'stretch' }}
            extra={<a href="#">Docs</a>}
          >
            <Text fontWeight={300} lineHeight="title">
              Learn about how decentralized storage works on Uplo. Leverage your understanding of
              smart-contracts and blockchains to build a cloud Plex-drive.
            </Text>
          </Card>
        </Flex>
        <Box width={1 / 2}>
          <Flex flexDirection="column">
            <Flex mb={2}>
              <Stat content="82GB" title="Storage Used" width={1 / 2} />
              <Stat content="~2 week" title="Contract Renewal" width={1 / 2} />
            </Flex>
            <Flex>
              <Stat content="50" title="Active Contracts" width={1 / 2} />
              <Stat content="150 UPLO" title="Locked in Contracts" width={1 / 2} />
            </Flex>
            {/* <Box mx={2}>
                        <Text>hi</Text>
                      </Box> */}
          </Flex>
        </Box>
      </Flex>
    </Panel>
  </Collapse>
)

const FM = () => (
  <div>
    <FileManager />
  </div>
)

interface StateProps {
  contracts: ContractSums
  spending: SpendingTotals
  pricing: RenterModel.PricesGETResponse
  renterSummary: RenterModel.RenterGETResponse
  rentStorage: UIReducer.ErrorState
  balances: WalletDetails
}

interface State {
  allowanceModalVisible: boolean
  backupModalVisible: boolean
  restoreModalVisible: boolean
}

type RenterProps = RouteComponentProps & DispatchProp & StateProps
class Renter extends React.Component<RenterProps, State> {
  state = {
    allowanceModalVisible: false,
    backupModalVisible: false,
    restoreModalVisible: false
  }
  constructor(props) {
    super(props)
    this.fileNavRef = React.createRef()
  }
  componentDidMount() {
    this.props.dispatch(RenterActions.fetchContracts.started())
    this.props.dispatch(RenterActions.startPolling())
  }
  componentWillUnmount() {
    this.props.dispatch(RenterActions.stopPolling())
  }
  openAllowanceModal = () => {
    this.setState({
      allowanceModalVisible: true
    })
  }
  closeAllowanceModal = () => {
    this.setState({
      allowanceModalVisible: false
    })
  }

  openBackupModal = () => {
    this.setState({
      backupModalVisible: true
    })
  }
  closeBackupModal = () => {
    this.setState({
      backupModalVisible: false
    })
  }

  openRestoreModal = () => {
    this.setState({
      restoreModalVisible: true
    })
  }

  closeRestoreModal = () => {
    this.setState({
      restoreModalVisible: false
    })
  }
  confirmCancelAllowance = () => {
    const props = this.props
    StyledModal.confirm({
      title: 'Confirm Allowance Cancellation',
      content:
        'Are you sure you want to cancel your allowance? Your files will be lost at the end of the period.',
      onOk() {
        return new Promise((resolve, reject) => {
          props.dispatch(
            RenterActions.setAllowance.started({
              expecteddownload: 0,
              expectedstorage: 0,
              expectedupload: 0,
              funds: '0',
              hosts: 0,
              period: 0,
              renewwindow: 0,
              expectedredundancy: 0
            })
          )
          resolve(true)
        })
      },
      onCancel() {}
    })
  }

  render() {
    const { match }: { match: any } = this.props
    const { contracts, spending, rentStorage, pricing, renterSummary, balances } = this.props
    const { confirmedBalance } = balances
    const totalAllocated = toSiacoins(
      new BigNumber(renterSummary.financialmetrics.totalallocated)
    ).toFixed(2)
    const totalSpent = toSiacoins(
      new BigNumber(0)
        .plus(new BigNumber(renterSummary.financialmetrics.storagespending))
        .plus(new BigNumber(renterSummary.financialmetrics.downloadspending))
        .plus(new BigNumber(renterSummary.financialmetrics.uploadspending))
        .plus(new BigNumber(renterSummary.financialmetrics.contractfees))
    ).toFixed(2)

    const storageSpending = toSiacoins(
      new BigNumber(renterSummary.financialmetrics.storagespending)
    ).toFixed(2)

    const hasEnoughContracts = contracts.active > 30
    const hasFiles = contracts.inactive > 0

    return (
      <Box>
        <AllowanceModal
          rentStorage={rentStorage}
          pricing={pricing}
          visible={this.state.allowanceModalVisible}
          openModal={this.openAllowanceModal}
          closeModal={this.closeAllowanceModal}
          renterSummary={renterSummary}
        />
        <BackupModal
          visible={this.state.backupModalVisible}
          openModal={this.openBackupModal}
          closeModal={this.closeBackupModal}
        />
        <RestoreModal
          visible={this.state.restoreModalVisible}
          openModal={this.openRestoreModal}
          closeModal={this.closeRestoreModal}
          fileNav={this.fileNavRef}
        />
        <Flex justifyContent="space-between" alignItems="baseline">
          <CardHeader>File Manager</CardHeader>
          <Box ml="auto">
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item onClick={this.openAllowanceModal} key="1">
                    <a>Modify Allowance</a>
                  </Menu.Item>
                  <Menu.Item onClick={this.confirmCancelAllowance} key="2">
                    <a>Cancel Allowance</a>
                  </Menu.Item>
                  <Menu.Item onClick={this.openBackupModal} key="3">
                    <a>Backup Files</a>
                  </Menu.Item>
                  <Menu.Item onClick={this.openRestoreModal} key="4">
                    <a>Restore Files</a>
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
            >
              <Text color="silver" css={{ cursor: 'pointer', textTransform: 'uppercase' }}>
                More <Icon type="down" />
              </Text>
            </Dropdown>
          </Box>
        </Flex>
        <Flex>
          <Stat content={`${contracts.active}`} title="Contracts Active" width={1 / 4} />
          <Stat content={`${totalAllocated} UPLO`} title="Total Allocated" width={1 / 4} />
          <Stat content={`${totalSpent} UPLO`} title="Total Spent" width={1 / 4} />
          <Stat content={`${storageSpending} UPLO`} title="Storage Spending" width={1 / 4} />
        </Flex>
        {hasFiles || hasEnoughContracts ? (
          <Box mx={2} pt={3}>
            {/* <Switch>
              <Route exact path={`${match.path}/metrics`} component={Metrics} />
              <Route
                exact
                path={`${match.path}/settings`}
                component={() => <Text>Coming soon</Text>}
              />
              <Route exact path={`${match.path}`} component={FM} />
            </Switch> */}
            <FileManager getFileNavRef={this.fileNavRef} />
          </Box>
        ) : contracts.active > 0 ? (
          <Flex
            p={5}
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <TransitionGroup>
              <TransitionSiaOnlySpin />
            </TransitionGroup>
            <Text color="mid-gray" p={4}>
              We're setting up your contracts right now!
            </Text>
          </Flex>
        ) : (
          <Flex justifyContent="center" alignItems="center">
            <Flex
              p={4}
              height="400px"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Box my={3}>
                <Text color="mid-gray" fontSize={3}>
                  It looks like you don't have any contracts yet.
                </Text>
              </Box>
              <Flex>
                <Box>
                  <StyledButton onClick={this.openAllowanceModal} type="ghost" size="large">
                    Setup Allowance
                  </StyledButton>
                </Box>
                <Box pl={2}>
                  <StyledButton onClick={this.openRestoreModal} type="ghost" size="large">
                    Restore Files
                  </StyledButton>
                </Box>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Box>
    )
  }
}

export const mapStateToProps = (state: IndexState) => ({
  contracts: selectContractDetails(state),
  spending: selectSpending(state),
  pricing: selectPricing(state),
  rentStorage: selectRentStorage(state),
  renterSummary: selectRenterSummary(state),
  balances: selectWalletBalanceDetails(state)
})

const RenterComp = connect(mapStateToProps)(withRouter(Renter))

// RenterHOC wraps the Renter Component with the IsLoadedHOC with some
// additional side-effects. We ensure contract fetching is dispatched, and watch
// for the `renterLoaded` state before rendering the view.
const RenterHOC = () => {
  const dispatch = useDispatch()
  const mapState = React.useCallback(
    (state: IndexState) => ({
      renterLoaded: state.renter.isLoaded
    }),
    []
  )
  const { renterLoaded } = useMappedState(mapState)
  React.useEffect(() => {
    dispatch(RenterActions.fetchContracts.started())
  }, [])

  return <IsLoadedHOC loading={!renterLoaded} Component={RenterComp} />
}
export default RenterHOC

{
  /* <Flex>
            <PaddedMenuItemLink to={`${match.path}`}>
              <MenuIconButton iconType="file" title="Uplo Explorer" pathname="/renter" />
            </PaddedMenuItemLink>
            <PaddedMenuItemLink to={`${match.path}/metrics`}>
              <MenuIconButton iconType="project" title="Usage Metrics" pathname="/renter/metrics" />
            </PaddedMenuItemLink>
            <PaddedMenuItemLink to={`${match.path}/settings`}>
              <MenuIconButton iconType="tool" title="Renter Settings" pathname="/renter/settings" />
            </PaddedMenuItemLink>
          </Flex> */
}
