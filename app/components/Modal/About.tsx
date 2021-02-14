import { Button } from 'antd'
import { uplod } from 'api/uplod'
import Wordmark from 'assets/svg/draco.svg'
import { Box, Caps, SVGBox, Text } from 'components/atoms'
import { Flex } from 'components/atoms/Flex'
import { StyledButton } from 'components/atoms/StyledButton'
import { StyledModal } from 'components/atoms/StyledModal'
import defaultConfig from 'config'
import { shell } from 'electron'
import { version } from 'package.json'
import * as React from 'react'

interface AboutModalProps {
  visible: boolean
  onOk?(): void
}

const AboutButton = props => (
  <Box pt={2} width={200}>
    <StyledButton style={{ width: '100%' }} {...props} />
  </Box>
)
const VersionInfo = ({ title, value }) => (
  <Text is="div" py={1}>
    <Text color="text-subdued">{title}:</Text> {value}
  </Text>
)

export const AboutModal: React.SFC<AboutModalProps> = ({ visible, onOk }) => {
  const openSiaDir = React.useCallback(() => {
    const path = defaultConfig.uplod.datadir
    shell.openItem(path)
  }, [])

  const [updateInfo, setUpdateInfo] = React.useState({
    available: false,
    version: 'unknown',
    error: '',
    loaded: false
  })

  const [versionInfo, setVersionInfo] = React.useState({
    version: 'Unknown',
    gitrevision: 'Unknown',
    buildtime: 'Unknown',
    error: ''
  })

  const openSiaLink = React.useCallback(() => {
    shell.openExternal('https://uplo.tech/get-started')
  }, [])

  const checkForUpdates = React.useCallback(async () => {
    try {
      const version = await uplod.call('/daemon/update')
      setUpdateInfo({ ...version, loaded: true })
    } catch (e) {
      if (e.error && e.error.message) {
        setUpdateInfo({ ...updateInfo, error: e.error.message })
      } else {
        setUpdateInfo({ ...updateInfo, error: 'Unknown error occured' })
      }
    }
  }, [updateInfo])

  const getVersion = React.useCallback(async () => {
    try {
      const versionInfo = await uplod.call('/daemon/version')
      setVersionInfo(versionInfo)
    } catch (e) {
      console.log('error loading version', e)
    }
  }, [versionInfo])

  React.useEffect(() => {
    if (visible) {
      getVersion()
    }
  }, [visible])

  return (
    <div>
      <StyledModal
        title="About Uplo-UI"
        visible={visible}
        onOk={onOk}
        onCancel={onOk}
        closable={false}
        footer={[
          <Button key="submit" type="primary" onClick={onOk}>
            Ok
          </Button>
        ]}
      >
        <Flex alignItems="center" height="100%">
          <Box width={1 / 2} my="auto">
            <Flex flexDirection="column" alignItems="center" height="100%">
              <SVGBox height="150px">
                <Wordmark viewBox="0 0 400 400" />
              </SVGBox>
            </Flex>
          </Box>
          <Box width={1 / 2} height="100%" mb="auto">
            <Box>
              <Caps fontSize={3}>Uplo-UI</Caps>{' '}
              <Caps fontSize={3} color="text-subdued">
                v1.0
              </Caps>
            </Box>
            <Box py={2}>
              <VersionInfo title="UI Version" value={version} />
              <VersionInfo title="Daemon" value={versionInfo.version} />
              <VersionInfo title="Git Revision" value={versionInfo.gitrevision} />
            </Box>
            <Box>
              {updateInfo.loaded ? (
                updateInfo.available ? (
                  <Text is="a" onClick={openSiaLink}>
                    Version {updateInfo.version} Available!
                  </Text>
                ) : (
                  <Text>No Updates Available</Text>
                )
              ) : null}
              {updateInfo.error && <Text>{updateInfo.error}</Text>}
            </Box>
            <AboutButton onClick={checkForUpdates}>Check for Updates</AboutButton>
            <AboutButton onClick={openSiaDir}>Open Data Folder</AboutButton>
            <Box pt={2}>{updateInfo.error && <Text>{updateInfo.error}</Text>}</Box>
            <Box />
          </Box>
        </Flex>
      </StyledModal>
    </div>
  )
}
