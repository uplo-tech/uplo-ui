import { WalletActions } from 'actions'
import { Button, Steps } from 'antd'
import {
  Box,
  ButtonWithAdornment,
  Card,
  defaultFieldState,
  FormItemProps,
  Text
} from 'components/atoms'
import { WalletModel } from 'models'
import * as React from 'react'
import { connect, DispatchProp } from 'react-redux'
import { Flex } from 'rebass'
import { ValidatorType } from 'utils'

import Broadcast from './SendSteps/Broadcast'
import Setup from './SendSteps/Setup'
import Verify from './SendSteps/Verify'

const { Step } = Steps

export const SetupDescText = ({ children }: any) => (
  <Text color="silver" css={{ textTransform: 'uppercase' }}>
    {children}
  </Text>
)

const SendStep = ({ step }: any) => (
  <Steps progressDot current={step} size="small">
    <Step title={<SetupDescText>Setup</SetupDescText>} />
    <Step title={<SetupDescText>Verify</SetupDescText>} />
    <Step title={<SetupDescText>Broadcast</SetupDescText>} />
  </Steps>
)

export interface SendState {
  step: number
  walletAddress: FormItemProps
  amount: FormItemProps
  currencyType: WalletModel.CurrencyTypes
  transaction: TransactionType | undefined
}

const mockState: SendState = {
  step: 0,
  walletAddress: {
    value: '597a0bf487a4641edbfdc624fbd1aa7a1efbf74f23d6a80edb54744dea4eaf16081c339754ac',
    validateStatus: 'success',
    help: undefined
  },
  amount: {
    value: 1,
    validateStatus: 'success',
    help: undefined
  },
  currencyType: WalletModel.CurrencyTypes.SC,
  transaction: undefined
}

const emptyState: SendState = {
  step: 0,
  walletAddress: defaultFieldState,
  amount: defaultFieldState,
  currencyType: WalletModel.CurrencyTypes.SC,
  transaction: undefined
}

const { CurrencyTypes } = WalletModel

export interface TransactionType {
  amount: number
  destination: string
  type: WalletModel.CurrencyTypes
  fee: string
}

interface SendProps {
  fee: string
}

class Send extends React.Component<SendProps & DispatchProp, SendState> {
  state = emptyState
  setCurrency = (currency: WalletModel.CurrencyTypes) => {
    this.setState({
      currencyType: currency,
      amount: defaultFieldState
    })
  }
  setField = (validator: ValidatorType) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const name = e.target.name
    this.setState(curr => ({
      ...curr,
      [name]: {
        ...validator(value),
        value
      }
    }))
  }
  generateTransaction = () => {
    const { amount, walletAddress, currencyType } = this.state
    const { fee } = this.props
    if (parseFloat(amount.value as any) && walletAddress.value && currencyType) {
      if (walletAddress.validateStatus !== 'success' || amount.validateStatus !== 'success') {
        return
      }
      const transaction: TransactionType = {
        amount: parseFloat(amount.value as any),
        destination: walletAddress.value as any,
        type: currencyType,
        fee
      }
      this.setState(
        {
          transaction
        },
        () => {
          this.nextStep()
        }
      )
    }
    return false
  }
  broadcastTransaction = () => {
    const { transaction } = this.state
    if (transaction) {
      if (transaction.type === WalletModel.CurrencyTypes.SC) {
        this.props.dispatch(
          WalletActions.createSiacoinTransaction.started({
            amount: transaction.amount,
            destination: transaction.destination
          })
        )
      } else if (transaction.type === WalletModel.CurrencyTypes.SF) {
        this.props.dispatch(
          WalletActions.createSiafundTransaction.started({
            amount: transaction.amount,
            destination: transaction.destination
          })
        )
      }
      this.nextStep()
    } else {
      this.resetState()
    }
  }
  prevStep = () => {
    if (this.state.step >= 1) {
      this.setState({
        step: this.state.step -= 1
      })
    }
  }
  nextStep = () => {
    if (this.state.step < 2) {
      this.setState({
        step: this.state.step += 1
      })
    }
  }
  resetState = () => {
    this.props.dispatch(WalletActions.resetTransactionDetails())
    this.setState({
      step: 0,
      walletAddress: defaultFieldState,
      amount: defaultFieldState,
      currencyType: CurrencyTypes.SC
    })
  }

  render() {
    const { step, transaction } = this.state
    return (
      <div>
        <Box mx={2} my={4}>
          <SendStep step={step} />
        </Box>
        <Card mx={2} p={4} minHeight="308px" pb={5} position="relative">
          {step === 0 && (
            <Flex>
              <Setup {...this.state} setCurrency={this.setCurrency} setField={this.setField} />
            </Flex>
          )}
          {step === 1 && transaction && <Verify transaction={transaction} />}
          {step === 2 && <Broadcast />}
          <Box position="absolute" bottom="32px">
            <Button.Group>
              {step === 0 && (
                <ButtonWithAdornment
                  type="ghost"
                  size="default"
                  onClick={this.generateTransaction}
                  iconType="right"
                  after
                >
                  Generate Transaction
                </ButtonWithAdornment>
              )}
              {step == 1 && (
                <>
                  <ButtonWithAdornment before iconType="left" type="ghost" onClick={this.prevStep}>
                    Back
                  </ButtonWithAdornment>
                  <ButtonWithAdornment
                    after
                    iconType="right"
                    type="primary"
                    onClick={this.broadcastTransaction}
                  >
                    Broadcast
                  </ButtonWithAdornment>
                </>
              )}
              {step == 2 && (
                <Button type="primary" size="default" onClick={this.resetState}>
                  Finish
                </Button>
              )}
            </Button.Group>
          </Box>
        </Card>
      </div>
    )
  }
}

export default connect()(Send)
