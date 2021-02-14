import { Box, Text } from 'components/atoms'
import * as React from 'react'

export default ({ title }: any) => (
  <Box pb={3}>
    <Text is="div" color="silver" fontSize={1} css={{ textTransform: 'uppercase' }}>
      {title}
    </Text>
  </Box>
)
