import { Form, Icon, Input, Select, Steps } from 'antd'
import { Box, Text } from 'components/atoms'
import { WalletModel } from 'models'
import * as React from 'react'
import { connect } from 'react-redux'
import { IndexState } from 'reducers'
import { selectSiafundBalance } from 'selectors'
import {
  validateSiaAddress,
  validateSiaBalance,
  validateSiafundBalance,
  ValidatorType
} from 'utils'

import { SendState } from '../Send'
import StepHeader from './StepHeader'
import { StyledInputGroup } from 'components/atoms/StyledInput'
import { StyledIcon } from 'components/atoms/StyledIcon'

const { Step } = Steps
const { Option } = Select

const { CurrencyTypes } = WalletModel

interface SetupProps {
  setField: (v: ValidatorType) => (e: React.ChangeEvent<HTMLInputElement>) => void
  setCurrency: (c: WalletModel.CurrencyTypes) => void
  // generateTransaction: () => void
}

interface StateProps {
  state: IndexState
  siafundBalance: string
}

type Props = SendState & SetupProps & StateProps

const mapStateToProps = (state: IndexState) => ({
  state,
  siafundBalance: selectSiafundBalance(state)
})

export default connect(mapStateToProps)(
  ({
    state,
    walletAddress,
    amount,
    currencyType,
    setField,
    setCurrency,
    siafundBalance
  }: Props) => (
    <Box width={1}>
      <StepHeader title="Create Transaction" />
      <Form>
        <Box>
          <Box>
            <Text color="mid-gray">Recipient Address</Text>
          </Box>
          <Form.Item hasFeedback {...walletAddress}>
            <StyledInputGroup
              placeholder="Wallet Address"
              name="walletAddress"
              prefix={<StyledIcon type="wallet" />}
              value={walletAddress.value}
              onChange={setField(validateSiaAddress)}
            />
          </Form.Item>
        </Box>
        <Box>
          <Box>
            <Text color="mid-gray">Amount</Text>
          </Box>
          <Form.Item {...amount}>
            <Input.Group compact>
              <Select defaultValue={currencyType} onChange={setCurrency} style={{ width: '100px' }}>
                <Option value={CurrencyTypes.SC}>UploCoin</Option>
                <Option
                  disabled={parseFloat(siafundBalance) > 0 ? false : true}
                  value={CurrencyTypes.SF}
                >
                  Siafund
                </Option>
              </Select>
              <StyledInputGroup
                step={1}
                name="amount"
                onChange={
                  currencyType === CurrencyTypes.SC
                    ? setField(validateSiaBalance(state))
                    : setField(validateSiafundBalance(state))
                }
                value={amount.value}
                placeholder="Amount to Send"
                style={{ width: 'calc(100% - 100px)' }}
                suffix={<Text>{currencyType}</Text>}
              />
            </Input.Group>
          </Form.Item>
        </Box>
      </Form>
    </Box>
  )
)
