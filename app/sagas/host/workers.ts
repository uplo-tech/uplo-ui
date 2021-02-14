import { HostActions } from 'actions'
import { uplod } from 'api/uplod'
import { HostModel } from 'models'
import { SagaIterator } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import { bindAsyncAction } from 'typescript-fsa-redux-saga'

// calls /hostdb/active to get active hosts.
export const activeHostWorker = bindAsyncAction(HostActions.getActiveHosts, {
  skipStartedAction: true
})(function*(): SagaIterator {
  const response: HostModel.hostdbActiveGET = yield call(uplod.call, '/hostdb/active')
  return response
})

// calls /host/storage to get host storage settings
export const getStorageWorker = bindAsyncAction(HostActions.getHostStorage, {
  skipStartedAction: true
})(function*(): SagaIterator {
  const response: HostModel.StorageGETResponse = yield call(uplod.call, '/host/storage')
  return response
})

// calls /host/announce to announce the host
export const announceHostWorker = bindAsyncAction(HostActions.announceHost, {
  skipStartedAction: true
})(function*(): SagaIterator {
  const response = yield call(uplod.call, {
    url: '/host/announce',
    method: 'POST'
  })
  yield put(HostActions.getHostConfig.started())
  return response
})

// updates the host config by posting the config to /host
export const updateHostConfigWorker = bindAsyncAction(HostActions.updateHostConfig, {
  skipStartedAction: true
})(function*(params): SagaIterator {
  const response = yield call(uplod.call, {
    url: '/host',
    method: 'POST',
    qs: { ...params }
  })
  yield put(HostActions.getHostConfig.started())
  return response
})

// adds a new folder with the path and size passed down from the watcher
export const addFolderWorker = bindAsyncAction(HostActions.addFolder, {
  skipStartedAction: true
})(function*(params): SagaIterator {
  const response = yield call(uplod.call, {
    url: '/host/storage/folders/add',
    method: 'POST',
    qs: {
      path: params.path,
      size: params.size
    }
  })
  yield put(HostActions.getHostStorage.started())
  return response
})

// resizes a folder with path and newsize from watcher.
export const resizeFolderWorker = bindAsyncAction(HostActions.resizeFolder, {
  skipStartedAction: true
})(function*(params): SagaIterator {
  const response = yield call(uplod.call, {
    url: '/host/storage/folders/resize',
    method: 'POST',
    qs: {
      path: params.path,
      size: params.newsize
    }
  })
  yield put(HostActions.getHostStorage.started())
  return response
})

// deletes a host folder.
export const deleteFolderWorker = bindAsyncAction(HostActions.deleteFolder, {
  skipStartedAction: true
})(function*(params): SagaIterator {
  const response = yield call(uplod.call, {
    url: '/host/storage/folders/remove',
    method: 'POST',
    qs: {
      path: params.path
    }
  })
  yield put(HostActions.getHostStorage.started())
  return response
})

// gets the /host endpoint to return the host config object.
export const hostConfigWorker = bindAsyncAction(HostActions.getHostConfig, {
  skipStartedAction: true
})(function*(): SagaIterator {
  const response: HostModel.HostGET = yield call(uplod.call, '/host')
  return response
})
