import { WalletActions } from 'actions'
import { Dropdown, Icon, Menu, Tabs, Tag } from 'antd'
import { Box, Card, CardHeader, StyledTag, Text } from 'components/atoms'
import { Flex } from 'components/atoms/Flex'
import { Stat } from 'components/Card'
import { BackupModel, QRCodeModal } from 'components/Modal'
import { ChangePasswordModal } from 'components/Modal/ChangePassword'
import { RequireWalletData } from 'components/RequireData'
import { clipboard } from 'electron'
import * as React from 'react'
import { connect, DispatchProp } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import {
  selectCurrAddress,
  selectFeeEstimate,
  selectGroupedTx,
  selectReceiveAddresses,
  selectWalletBalanceDetails,
  StructuredTransaction
} from 'selectors'

import Send from './Send'
import TransactionView from './TransactionView'
import { StyledButton } from 'components/atoms/StyledButton'

const TabPane = Tabs.TabPane
const TabPanelWrap = ({ children }: any) => <Box height="calc(100vh - 200px)">{children}</Box>

interface RecievedAddressCardProps {
    address: string
}

class ReceiveAddressCard extends React.Component<RecievedAddressCardProps> {
  state = {
    QRCodeModalVisible: false,
    address: ''
  }
  closeQRCodeModal = () => {
    this.setState({
      QRCodeModalVisible: false
    })
  }
  openQRCodeModal = ({address}: any) => {
    this.setState({
      QRCodeModalVisible: true,
    })
  }
  render() {
      const { address } = this.props
      const { QRCodeModalVisible } = this.state
    
      return (   
        <div>
            <QRCodeModal
                onOk={this.closeQRCodeModal}
                address={address}
                visible={QRCodeModalVisible}
            />
            <Card my={2}>
              <Flex>
                <Text color="mid-gray">{address}</Text>
                <Box ml="auto">
                  <Tag>
                    <Icon onClick={this.openQRCodeModal} type="qrcode" />
                  </Tag>
                  <Tag>
                    <Icon onClick={() => clipboard.writeText(address)} type="copy" />
                  </Tag>
                </Box>
              </Flex>
            </Card>
        </div>
      )
  }
}

export interface WalletDetails {
  confirmedBalance: string
  unconfirmedBalance: string
  siafundBalance: string
  siacoinClaimBalance: string
}

export interface TransactionGroup {
  confirmed: StructuredTransaction[]
  unconfirmed: StructuredTransaction[]
}

interface StateProps {
  balances: WalletDetails
  transactions: any
  feeEstimate: string
  receiveAddresses: string[]
  currAddress: string
  // usdPrice: number
}

type WalletProps = StateProps & DispatchProp

// function showConfirm() {
//   confirm({
//     title: 'Sweep a seed',
//     content: (
//       <Box>
//         <TextInput type="text" />
//       </Box>
//     ),
//     onOk(e) {
//       console.log('e', e)
//       return new Promise((resolve, reject) => {
//         setTimeout(Math.random() > 0.5 ? resolve : reject, 1000)
//       }).catch(() => console.log('Oops errors!'))
//     },
//     onCancel() {}
//   })
// }

class Wallet extends React.Component<WalletProps, {}> {
  state = {
    backupModal: false,
    changePasswordModal: false
  }
  componentDidMount() {
    this.props.dispatch(WalletActions.startPolling())
  }
  componentWillUnmount() {
    this.props.dispatch(WalletActions.stopPolling())
  }

  handleBackupModal = () => {
    this.setState({
      backupModal: false
    })
    this.props.dispatch(WalletActions.clearSeed())
  }
  openBackupModal = () => {
    this.setState({
      backupModal: true
    })
  }
  closeChangePasswordModal = () => {
    this.setState({
      changePasswordModal: false
    })
  }
  openChangePasswordModal = () => {
    this.setState({
      changePasswordModal: true
    })
  }
  generateAddress = () => {
    this.props.dispatch(WalletActions.generateReceiveAddress.started())
  }
  copy = (value: string) => () => {
    clipboard.writeText(value)
  }
  render() {
    const {
      confirmedBalance,
      unconfirmedBalance,
      siafundBalance,
      siacoinClaimBalance
    } = this.props.balances
    const { transactions, feeEstimate, receiveAddresses, currAddress } = this.props
    // const usdBalance = new BigNumber(confirmedBalance)
    //   .multipliedBy(usdPrice)
    //   .toFixed(2)
    //   .toString()

    const balanceWithSeperator = parseFloat(confirmedBalance).toLocaleString('en-US') + ' ' + 'UPLO'
    const siafunds = parseInt(siafundBalance)
    const siafundBalanceWithSeperator =
      parseFloat(siafundBalance).toLocaleString('en-US') + ' ' + 'UCF'
    return (
      <div>
        <BackupModel visible={this.state.backupModal} onOk={this.handleBackupModal} />
        <ChangePasswordModal
          closeModal={this.closeChangePasswordModal}
          visible={this.state.changePasswordModal}
        />
        <RequireWalletData>
          <Box>
            <Flex justifyContent="space-between" alignItems="baseline">
              <CardHeader>Balance</CardHeader>
              <Box ml="auto">
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="0">
                        <a onClick={this.openBackupModal}>View Seed</a>
                      </Menu.Item>
                      {/* <Menu.Divider />
                      <Menu.Item key="1">
                        <a onClick={showConfirm}>Sweep Seed</a>
                      </Menu.Item> */}
                      <Menu.Divider />
                      <Menu.Item key="2">
                        <a onClick={this.openChangePasswordModal}>Change Password</a>
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={['click']}
                >
                  <Text color="silver" style={{ cursor: 'pointer', textTransform: 'uppercase' }}>
                    More <Icon type="down" />
                  </Text>
                </Dropdown>
              </Box>
            </Flex>
            <Flex>
              <Stat content={balanceWithSeperator} title="UploCoin" width={1 / 3} />
              {siafunds > 0 && (
                <Stat content={siafundBalanceWithSeperator} title="Uplofunds" width={1 / 3} />
              )}
              {parseFloat(siacoinClaimBalance) > 0 && (
                <Stat content={siacoinClaimBalance} title="UploFund Revenue" width={1 / 3} />
              )}
            </Flex>
            <Box height="25px">
              <Flex mx={2} pt={2} pb={3}>
                {/* <Tag>${usdBalance} USD</Tag> */}
                {!!parseFloat(unconfirmedBalance) && (
                  <StyledTag>{unconfirmedBalance} UPLO (Unconfirmed)</StyledTag>
                )}
              </Flex>
            </Box>
          </Box>
          <Box mt={2} mx={2}>
            <Tabs tabBarStyle={{ margin: 0 }} defaultActiveKey="1">
              <TabPane
                tab={
                  <Text color="mid-gray" fontSize={2}>
                    Transactions
                  </Text>
                }
                key="1"
              >
                <TabPanelWrap>
                  <TransactionView />
                </TabPanelWrap>
              </TabPane>
              <TabPane
                tab={
                  <Text color="mid-gray" fontSize={2}>
                    Send
                  </Text>
                }
                key="2"
              >
                <TabPanelWrap>
                  <Send fee={feeEstimate} />
                </TabPanelWrap>
              </TabPane>
              <TabPane
                tab={
                  <Text color="mid-gray" fontSize={2}>
                    Receive
                  </Text>
                }
                key="3"
              >
                <TabPanelWrap>
                  <Flex py={3} justifyContent="space-between" alignItems="center">
                    <Text color="silver" fontSize={1} style={{ textTransform: 'uppercase' }}>
                      Latest Address
                    </Text>
                    <StyledButton type="default" onClick={this.generateAddress}>
                      Generate New Address
                    </StyledButton>
                  </Flex>
                  <Box my={2}>
                    {currAddress ? (
                        <ReceiveAddressCard address={currAddress} />
                    ) : (
                        <Card>
                          <Flex>
                            <Text color="silver">
                                Use any address below, or generate a new one here.
                            </Text>
                          </Flex>
                        </Card>
                    )}
                  </Box>
                  <Box py={3}>
                    <Text color="silver" fontSize={1} css={{ textTransform: 'uppercase' }}>
                      Previous Addresses
                    </Text>
                  </Box>
                  <Box>
                    {receiveAddresses.map(a => {
                      return <ReceiveAddressCard key={a} address={a} />
                    })}
                  </Box>
                </TabPanelWrap>
              </TabPane>
            </Tabs>
          </Box>
        </RequireWalletData>
      </div>
    )
  }
}

export default connect(
  createStructuredSelector({
    balances: selectWalletBalanceDetails,
    transactions: selectGroupedTx,
    feeEstimate: selectFeeEstimate,
    receiveAddresses: selectReceiveAddresses,
    currAddress: selectCurrAddress
    // usdPrice: selectPrice
  })
)(Wallet)
