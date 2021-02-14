import { Box, Text } from 'components/atoms'
import { WalletModel } from 'models'
import * as React from 'react'
import { connect } from 'react-redux'
import { Flex } from 'rebass'
import { createStructuredSelector } from 'reselect'
import { selectSiacoinBroadcastResponse } from 'selectors'
import { computeTxSum } from 'utils'

import StepHeader from './StepHeader'
import { Detail } from './Verify'

interface StateProps {
  txids: WalletModel.ProcessedTransaction[]
}

class Broadcast extends React.Component<StateProps, {}> {
  render() {
    const { txids } = this.props
    const isLoading = txids.length === 0 ? true : false
    if (isLoading) {
      return null
    }
    const computedTxs = txids.map(t => computeTxSum(t))
    // We filter for the setup transaction, this may be improved on in the
    // future as we make the wallet more efficient. Setup transactions are not
    // necessary for wallet txs.
    const actualTx = computedTxs.filter(t =>
      t.labels.includes(WalletModel.TransactionTypes.SIACOIN)
    )[0]
    // If the actualTx also includes the SETUP label, it's likely a self
    // transaction.
    const selfTx = actualTx.labels.includes(WalletModel.TransactionTypes.SETUP)
    const scTransacted = parseFloat(actualTx.totalSiacoin) + parseFloat(actualTx.totalMiner)
    const actualTransacted =
      parseInt(actualTx.totalSiafund) !== 0 ? actualTx.totalSiafund : scTransacted
    return (
      <Box>
        <StepHeader title="Broadcast Summary" />
        <Box pb={3}>
          <Text color="mid-gray" fontSize={2}>
            Congratulations! Your transaction was broadcasted to the network successfully.
          </Text>
        </Box>
        <Flex>
          <Detail title="Status" content="Success" />
          <Detail title="Confirmed" content="Unconfirmed" />
          <Detail title="Fees Paid" content={`${actualTx.totalMiner} UXC`} />
          <Detail
            title="Amount Transacted"
            content={`${actualTransacted} UPLO ${selfTx ? '(Self Transaction)' : ''}`}
          />
        </Flex>
        <Flex>
          <Detail title="Transaction ID" content={actualTx.transaction.transactionid} />
        </Flex>
      </Box>
    )
  }
}

export default connect(
  createStructuredSelector({
    txids: selectSiacoinBroadcastResponse
  })
)(Broadcast)
