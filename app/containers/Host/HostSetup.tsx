import { Button, Steps } from 'antd'
import { Box, Text } from 'components/atoms'
import { Stat } from 'components/Card'
import * as React from 'react'
import { Flex } from 'rebass'

class HostSetup extends React.Component {
  render() {
    return (
      <Box>
        <Flex>
          <Stat content="Hello" title="UploCoin" width={1 / 3} />
        </Flex>
        <Box>
          <Box>
            <Text fontSize={5}>Welcome to Hosting</Text>
          </Box>
          <Flex alignItems="center">
            <Box pt={2}>
              <Text fontSize={3}>
                Let's get started by choosing a folder to store your Uplo data.
              </Text>
            </Box>
            <Box pt={3}>
              <Button>Choose a Folder</Button>
            </Box>
          </Flex>
        </Box>
      </Box>
    )
  }
}

export default HostSetup
