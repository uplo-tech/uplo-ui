import { Button } from 'antd'
import { Box, Text } from 'components/atoms'
import { Flex } from 'components/atoms/Flex'
import { StyledModal } from 'components/atoms/StyledModal'
import QRCode from 'qrcode.react'
import * as React from 'react'

interface QRCodeModalProps {
  visible: boolean
  address: string
  onOk?(): void
}

  
export const QRCodeModal = ({ visible, address, onOk }: QRCodeModalProps) => {
  return (
    <div>
      <StyledModal
        visible={visible}
        onOk={onOk}
        onCancel={onOk}
        closable={false}
        footer={[
          <Button key="submit" type="primary" onClick={onOk}>
            Done
          </Button>
        ]}
      >
        <Box my={1}>
            <Flex flexDirection="column" alignItems="center" height="100%">
                <QRCode value={address} size={220} includeMargin={true}/>
                <Text is="div" width={1} mt={3}>
                    <Text color="text-subdued">Address:</Text> {address}
                </Text>
            </Flex>
        </Box>
      </StyledModal>
    </div>
  )
}
