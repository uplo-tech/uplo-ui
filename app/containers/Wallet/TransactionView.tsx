import { Icon, Tooltip } from 'antd'
import { Box, Text } from 'components/atoms'
import { Flex } from 'components/atoms/Flex'
import { StyledTable } from 'components/atoms/StyledTable'
import { StyledTag } from 'components/atoms/StyledTag'
import { transactionFormatTool } from 'components/Transaction'
import { clipboard } from 'electron'
import { isEqual } from 'lodash'
import { WalletModel } from 'models'
import * as React from 'react'
import { connect } from 'react-redux'
import { IndexState } from 'reducers'
import { ConsensusRootReducer } from 'reducers/consensus'
import { OrganizedTx, selectConsensus, selectOrganizedTx } from 'selectors'

interface StateProps {
  transactions: OrganizedTx
  consensus: ConsensusRootReducer.State
}

type Props = StateProps
class TransactionView extends React.Component<Props, {}> {
  shouldComponentUpdate = (nextProps: Props, _: any) => {
    if (
      isEqual(this.props.transactions, nextProps.transactions) &&
      nextProps.consensus.height === this.props.consensus.height
    ) {
      return false
    }
    return true
  }

  render() {
    const TableTitle = ({ children }: any) => (
      <Text color="silver" css={{ textTransform: 'uppercase' }}>
        {children}
      </Text>
    )
    const { transactions, consensus } = this.props
    const currHeight = consensus.height
    return (
      <>
        <StyledTable
          rowKey="txid"
          columns={[
            {
              title: () => <TableTitle>Amount</TableTitle>,
              width: 180,
              align: 'right',
              dataIndex: 'UPLO',
              key: 'sum',
              render: (value: any) => {
                const isRed = parseFloat(value) < 0 ? true : false
                return (
                  <Flex>
                    <Box pr="2px">
                      <Icon
                        style={{
                          color: isRed ? '#999' : '#2CA2F8',
                          fontWeight: 800,
                          opacity: 1
                        }}
                        type={isRed ? 'down-circle' : 'up-circle'}
                      />
                    </Box>
                    <Text fontSize="14px" fontWeight={500} color="mid-gray" ml="auto">
                      {parseFloat(value).toLocaleString('en-US')} <Text color="gray">UPLO</Text>
                    </Text>
                  </Flex>
                )
              },
              sorter: (a, b) => a.sc - b.sc,
              sortDirections: ['descend', 'ascend']
            },
            {
              title: () => <TableTitle>Transaction ID</TableTitle>,
              dataIndex: 'txid',
              key: 'txid',
              render: (value: any) => {
                const copy = () => {
                  clipboard.writeText(value)
                }
                const len = 8
                const transformId = value.slice(0, len) + '...' + value.slice(value.length - len)
                return (
                  <Tooltip placement="bottom" title={<Text color="text">{value}</Text>}>
                    <Text
                      css={{ cursor: 'pointer' }}
                      onClick={copy}
                      fontSize="14px"
                      fontWeight={3}
                      color="gray"
                    >
                      {transformId}
                    </Text>
                  </Tooltip>
                )
              }
            },
            {
              title: () => <TableTitle>Time</TableTitle>,
              width: 200,
              dataIndex: 'time',
              key: 'time',
              render: (value: any) => (
                <Text fontSize="14px" fontWeight={3} color="gray">
                  {value}
                </Text>
              )
            },
            {
              title: () => <TableTitle>Type</TableTitle>,
              width: 150,
              dataIndex: 'tags',
              key: 'tags',
              render: (tags: string[]) => {
                let filteredTags = tags
                if (filteredTags.length > 1) {
                  filteredTags = tags.filter(t => t !== 'UPLOCOIN')
                }
                return (
                  <span>
                    {filteredTags.map((t: string) => (
                      <Box py={2} key={t}>
                        <StyledTag key={t}>{t}</StyledTag>
                      </Box>
                    ))}
                  </span>
                )
              },
              filters: WalletModel.TransactionTypesList.map(v => ({
                value: v,
                text: v
              })),
              filterMultiple: true,
              onFilter: (value, record) => {
                if (value === 'UPLOCOIN') {
                  return record.tags.length === 1 && record.tags.includes(value)
                } else {
                  return record.tags.includes(value)
                }
              }
            },
            {
              title: () => <TableTitle>Status</TableTitle>,
              width: 120,
              align: 'center',
              dataIndex: 'confirmationheight',
              key: 'confirmationheight',
              render: (x: number) => {
                const confs = currHeight - x
                return confs < 6 ? (
                  <Flex alignItems="center" color="mid-gray" justifyContent="center">
                    <Text fontSize="14px" fontWeight={400}>
                      {currHeight - x}/6
                    </Text>
                  </Flex>
                ) : (
                  <Flex alignItems="center" justifyContent="center">
                    <Tooltip title={`${confs} Confirmations`}>
                      <Icon style={{ color: '#2CA2F8' }} type="check-circle" />
                    </Tooltip>
                  </Flex>
                )
              }
            }
          ]}
          dataSource={transactions.confirmed.map((x: any) => transactionFormatTool(x))}
        />
      </>
    )
  }
}

const mapStateToProps = (state: IndexState): StateProps => ({
  consensus: selectConsensus(state),
  transactions: selectOrganizedTx(state)
})

export default connect(mapStateToProps)(TransactionView)
