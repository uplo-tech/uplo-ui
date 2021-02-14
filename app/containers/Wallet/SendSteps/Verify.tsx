import { Box, Text } from 'components/atoms'
import * as React from 'react'
import { Flex } from 'rebass'

import { TransactionType } from '../Send'
import StepHeader from './StepHeader'

export const Detail = ({ title, content }: any) => (
  <Box mb={3} mr={3}>
    <Text is="div" fontSize={0} lineHeight="20px">
      {title}
    </Text>
    <Text is="div">{content}</Text>
  </Box>
)

const currMap = {
  SC: 'UploCoin',
  SF: 'UploFund'
}

export default ({ transaction }: { transaction: TransactionType }) => (
  <Box>
    <StepHeader title="Verify Transaction" />
    <Flex>
      <Detail title="Currency" content={currMap[transaction.type]} />
      <Detail title="Amount" content={`${transaction.amount} ${transaction.type}`} />
    </Flex>
    <Detail title="Recipient Address" content={transaction.destination} />
    <Detail title="Est. Network Fees" content={`${transaction.fee} UPLO / KB`} />
  </Box>
)
