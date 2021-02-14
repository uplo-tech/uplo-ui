import { HostActions } from 'actions'
import { Button, Form, Icon, Input, Modal, Switch, Table, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import { Box, Caps, Card, CardHeader, CardHeaderInner, Text } from 'components/atoms'
import { Stat } from 'components/Card'
import { HostModel } from 'models'
import * as React from 'react'
import { connect, DispatchProp } from 'react-redux'
import { IndexState } from 'reducers'
import { selectFolders, selectHostConfig } from 'selectors'
import BigNumber from 'bignumber.js'
import {
  blocksToWeeks,
  hastingsByteBlockToSCTBMonth,
  hastingsByteToSCTB,
  isValidNumber,
  SCTBMonthToHastingsByteBlock,
  SCTBToHastingsByte,
  weeksToBlocks
} from 'utils'

import IntegerStep from './IntegerStep'
import { Flex } from 'components/atoms/Flex'
import { toSiacoins } from 'uplo-typescript'
import { StyledButton } from 'components/atoms/StyledButton'
import { StyledModal } from 'components/atoms/StyledModal'
import { StyledTable } from 'components/atoms/StyledTable'
import { StyledIcon } from 'components/atoms/StyledIcon'
import { StyledInput, StyledInputGroup } from 'components/atoms/StyledInput'

const { dialog } = require('electron').remote
const checkDiskSpace = require('check-disk-space')
const bytes = require('bytes')

async function getFreeSpace(path: string) {
  try {
    const { free } = await checkDiskSpace(path)
    return free
  } catch (err) {
    console.error(err)
    return 0
  }
}

interface StateProps {
  folders: HostModel.StorageFolder[]
  hostConfig: HostModel.HostGET | null
}

type RenterProps = DispatchProp & StateProps & FormComponentProps

class Host extends React.Component<RenterProps, {}> {
  sliderRef: React.RefObject<IntegerStep>

  state = {
    path: '',
    size: 0,
    visible: false,
    freespace: 0,
    type: 'add'
  }
  constructor(props: RenterProps) {
    super(props)
    this.sliderRef = React.createRef()
  }

  componentDidMount() {
    this.props.dispatch(HostActions.getHostStorage.started())
    this.props.dispatch(HostActions.getHostConfig.started())
    this.props.dispatch(HostActions.startPolling())
  }

  componentWillUnmount() {
    this.props.dispatch(HostActions.stopPolling())
  }

  addFolder = async () => {
    const path = dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    const freespace = await getFreeSpace(path[0])
    this.setState(
      {
        path: path[0],
        freespace,
        type: 'add'
      },
      () => {
        this.showModal()
      }
    )
  }
  editFolder = (path: string) => async (e: any) => {
    const freespace = await getFreeSpace(path)
    this.setState(
      {
        path,
        freespace,
        type: 'resize'
      },
      () => {
        this.showModal()
      }
    )
  }
  showModal = () => {
    this.setState({
      visible: true
    })
  }

  handleOk = (e: any) => {
    if (this.sliderRef.current) {
      const b = this.sliderRef.current.getBytes()
      this.setState(
        {
          size: b
        },
        () => {
          if (this.state.type === 'add') {
            this.props.dispatch(
              HostActions.addFolder.started({
                path: this.state.path,
                size: this.state.size
              })
            )
          } else if (this.state.type === 'resize') {
            console.log('resizing')
            this.props.dispatch(
              HostActions.resizeFolder.started({
                newsize: this.state.size,
                path: this.state.path
              })
            )
          }
        }
      )
    }
    this.setState({
      visible: false
    })
  }

  handleCancel = (e: any) => {
    console.log(e)
    this.setState({
      visible: false
    })
  }

  updateHostSettings = () => {
    const { form } = this.props
    form.validateFields((err: any, values: any) => {
      if (!err) {
        const { downloadprice, storageprice, uploadprice } = values
        const maxduration = weeksToBlocks(values.maxduration).toString()
        const collateral = SCTBMonthToHastingsByteBlock(values.collateral).toString()
        const minstorageprice = SCTBMonthToHastingsByteBlock(storageprice).toString()
        const mindownloadbandwidthprice = SCTBToHastingsByte(downloadprice).toString()
        const minuploadbandwidthprice = SCTBToHastingsByte(uploadprice).toString()

        this.props.dispatch(
          HostActions.updateHostConfig.started({
            maxduration: parseInt(maxduration),
            collateral,
            minstorageprice,
            mindownloadbandwidthprice,
            minuploadbandwidthprice
          })
        )
      }
    })
  }

  toggleAnnounce = (e: any) => {
    this.props.dispatch(HostActions.announceHost.started())
  }
  toggleAcceptingContracts = (checked: any) => {
    if (checked) {
      this.props.dispatch(
        HostActions.updateHostConfig.started({
          acceptingcontracts: true
        })
      )
    } else {
      this.props.dispatch(
        HostActions.updateHostConfig.started({
          acceptingcontracts: false
        })
      )
    }
  }

  render() {
    const { folders, hostConfig } = this.props
    const { getFieldDecorator } = this.props.form
    const minMB = parseInt(
      bytes
        .format(bytes('32gb'), { unitSeparator: ' ', decimalPlaces: 0, unit: 'MB' })
        .split(' ')[0]
    )
    const maxMB = parseInt(
      bytes
        .format(this.state.freespace, { unitSeparator: ' ', decimalPlaces: 0, unit: 'MB' })
        .split(' ')[0]
    )
    if (!hostConfig) {
      return null
    }
    const connectable =
      hostConfig.connectabilitystatus === 'connectable' ? 'Connectable' : 'Offline'
    const totalStorage = bytes(hostConfig.externalsettings.totalstorage, {
      unitSeparator: ' ',
      unit: 'TB'
    })
    const contractCount = hostConfig.financialmetrics.contractcount
    const storageRevenue = toSiacoins(
      new BigNumber(hostConfig.financialmetrics.storagerevenue)
    ).toFixed(2)
    const hasFolderAndConfig = folders.length > 0 && hostConfig
    return (
      <Box>
        <Flex justifyContent="space-between" alignItems="baseline">
          <CardHeader>Host</CardHeader>
          <Box>
            <Flex alignItems="center">
              <Tooltip title={<Text color="near-black">Enable/Disable Accepting Contracts</Text>}>
                <Switch
                  disabled={!hasFolderAndConfig}
                  checked={hostConfig.externalsettings.acceptingcontracts}
                  onChange={this.toggleAcceptingContracts}
                />
              </Tooltip>
              <Box ml={2}>
                <StyledButton disabled={!hasFolderAndConfig} onClick={this.toggleAnnounce}>
                  Announce Host
                </StyledButton>
              </Box>
            </Flex>
          </Box>
        </Flex>
        <Flex>
          <Stat title="Host Connectability" content={connectable} width={1 / 4} />
          <Stat title="Total Storage" content={totalStorage} width={1 / 4} />
          <Stat title="Storage Revenue" content={`${storageRevenue} UPLO`} width={1 / 4} />
          <Stat title="Contract Count" content={contractCount} width={1 / 4} />
        </Flex>
        <StyledModal
          title="Set Folder Storage Size"
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <IntegerStep ref={this.sliderRef} min={minMB} max={maxMB} />
        </StyledModal>
        <Box>
          {hasFolderAndConfig ? (
            <Box mx={2} pt={3}>
              <Flex>
                <Card width={1 / 2} mr={2}>
                  <Flex justifyContent="space-between" alignItems="baseline">
                    <CardHeaderInner>Host Settings</CardHeaderInner>
                    <StyledButton onClick={this.updateHostSettings}>Update</StyledButton>
                  </Flex>
                  <Form layout="inline">
                    {[
                      {
                        title: 'Max Duration (Weeks)',
                        value: blocksToWeeks(hostConfig.internalsettings.maxduration).toFixed(0),
                        suffix: 'W',
                        name: 'maxduration'
                      },
                      {
                        title: 'Collateral Per TB/Month',
                        value: hastingsByteBlockToSCTBMonth(
                          hostConfig.internalsettings.collateral
                        ).toFixed(0),
                        suffix: 'UPLO',
                        name: 'collateral'
                      },
                      {
                        title: 'Storage Per TB/Month',
                        value: hastingsByteBlockToSCTBMonth(
                          hostConfig.externalsettings.storageprice
                        ).toFixed(0),
                        suffix: 'UPLO',
                        name: 'storageprice'
                      },
                      {
                        title: 'Download Per TB',
                        value: hastingsByteToSCTB(
                          hostConfig.externalsettings.downloadbandwidthprice
                        ).toFixed(0),
                        suffix: 'UPLO',
                        name: 'downloadprice'
                      },
                      {
                        title: 'Upload Per TB',
                        value: hastingsByteToSCTB(
                          hostConfig.externalsettings.uploadbandwidthprice
                        ).toFixed(0),
                        suffix: 'UPLO',
                        name: 'uploadprice'
                      }
                    ].map((x, i) => (
                      <Flex key={i} pt={2} alignItems="center">
                        <Text mr={2}>{x.title}</Text>
                        <Box width="200px" ml="auto">
                          <Form.Item>
                            {getFieldDecorator(x.name, {
                              initialValue: x.value,
                              rules: [
                                {
                                  validator: isValidNumber,
                                  message: 'Please type a valid number'
                                }
                              ]
                            })(
                              <StyledInputGroup
                                type="number"
                                size="small"
                                suffix={<Text color="text">{x.suffix}</Text>}
                              />
                            )}
                          </Form.Item>
                        </Box>
                      </Flex>
                    ))}
                  </Form>
                </Card>
                <Card width={1 / 2} ml={2}>
                  <Flex justifyContent="space-between" alignItems="baseline">
                    <CardHeaderInner>Storage Folders</CardHeaderInner>
                    <StyledButton onClick={this.addFolder}>Add Folder</StyledButton>
                  </Flex>
                  <Box>
                    <StyledTable rowKey="path" size="small" dataSource={folders} pagination={false}>
                      <Table.Column
                        title={<Text>Storage Location</Text>}
                        dataIndex="path"
                        key="folderPath"
                        width={150}
                        onCell={() => {
                          return {
                            style: {
                              whiteSpace: 'nowrap',
                              maxWidth: 150
                            }
                          }
                        }}
                        render={v => (
                          <Tooltip placement="bottom" title={<Text>{v}</Text>}>
                            <Text
                              is="div"
                              style={{
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                cursor: 'pointer'
                              }}
                              fontSize={0}
                            >
                              {v}
                            </Text>
                          </Tooltip>
                        )}
                      />
                      <Table.Column
                        title={<Text>Free Space</Text>}
                        dataIndex="capacityremaining"
                        key="freeSpace"
                        render={v => (
                          <Text>
                            {bytes(v, {
                              unitSeparator: ' ',
                              unit: 'GB'
                            })}
                          </Text>
                        )}
                      />
                      <Table.Column
                        title={<Text>Total Space</Text>}
                        dataIndex="capacity"
                        key="totalSpace"
                        render={v => (
                          <Text>
                            {bytes(v, {
                              unitSeparator: ' ',
                              unit: 'GB'
                            })}
                          </Text>
                        )}
                      />
                      <Table.Column
                        title={<Text>Action</Text>}
                        key="action"
                        render={(text, record: any) => {
                          const { path } = record
                          return (
                            <span>
                              {/* <Icon
                                style={{ cursor: 'pointer' }}
                                type="edit"
                                onClick={this.editFolder(path)}
                              />
                              <Divider type="vertical" /> */}
                              <StyledIcon
                                style={{ cursor: 'pointer' }}
                                onClick={() =>
                                  this.props.dispatch(
                                    HostActions.deleteFolder.started({
                                      path
                                    })
                                  )
                                }
                                type="delete"
                              />
                            </span>
                          )
                        }}
                      />
                    </StyledTable>
                    {/* {folders.map(f => (
                      <Text>{f.path}</Text>
                    ))} */}
                  </Box>
                </Card>
              </Flex>
            </Box>
          ) : (
            <Flex justifyContent="center" alignItems="center">
              <Flex
                p={4}
                height="400px"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
              >
                <Box my={3}>
                  <Text color="mid-gray" fontSize={3}>
                    It looks like you don't have any storage added.
                  </Text>
                </Box>
                <StyledButton onClick={this.addFolder} type="ghost" size="large">
                  Add a folder
                </StyledButton>
              </Flex>
            </Flex>
          )}
        </Box>
      </Box>
    )
  }
}

export const mapStateToProps = (state: IndexState) => ({
  folders: selectFolders(state),
  hostConfig: selectHostConfig(state)
})

export default connect(mapStateToProps)(Form.create()(Host))
