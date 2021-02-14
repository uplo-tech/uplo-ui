import { Col, InputNumber, Row, Slider } from 'antd'
import { Text, Box } from 'components/atoms'
import * as React from 'react'
import { Flex } from 'rebass'

const bytes = require('bytes')

interface Props {
  min: number
  max: number
}

class IntegerStep extends React.Component<Props> {
  state = {
    inputValue: this.props.min,
    error: ''
  }

  onChange = (value: any) => {
    if (parseInt(value) < 32768) {
      this.setState({
        error:
          'The minimum requirement for storage is 32 GB. We generally recommend allocating 2 TB or more to be a competitive host.'
      })
    } else {
      this.setState({
        error: ''
      })
    }
    if (typeof value === 'number') {
      this.setState({
        inputValue: value
      })
    } else {
      this.setState({
        inputValue: parseInt(value.replace(/[^\d]/g, ''))
      })
    }
  }

  getBytes = () => bytes.parse(`${this.state.inputValue}mb`)

  render() {
    const { inputValue } = this.state
    const { min, max } = this.props
    return (
      <Box>
        <Row>
          <Col span={12}>
            <Slider
              min={min}
              max={max}
              onChange={this.onChange}
              value={typeof inputValue === 'number' ? inputValue : 0}
            />
          </Col>
          <Col span={6}>
            <InputNumber
              min={min}
              max={max}
              step={1}
              style={{ marginLeft: 16 }}
              value={inputValue}
              onChange={this.onChange}
            />
          </Col>
          <Col span={6}>
            <Flex ml={2} flexDirection="column">
              <Text color="mid-gray" fontSize={0}>
                {inputValue} MB
              </Text>
              <Text>
                {bytes.format(bytes.parse(`${inputValue}mb`), {
                  unitSeparator: ' ',
                  decimalPlaces: 2
                })}
              </Text>
            </Flex>
          </Col>
        </Row>
        <Box>{this.state.error && <Text>{this.state.error}</Text>}</Box>
      </Box>
    )
  }
}

export default IntegerStep
