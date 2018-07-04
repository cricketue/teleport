/*
Copyright 2015 Gravitational, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { Component } from 'react';
import connect from './../connect';
import { close, uploadFile } from 'app/flux/fileTransfer/actions';
import { getters } from 'app/flux/fileTransfer';
import cfg from 'app/config';
import _ from 'lodash';
import { FileToReceive, FileToSend } from './file';
import { DownloadFileInput, UploadFileInput } from './inputPanes';

class FileTransfer extends Component {

  constructor() {
    super()
    this.state = {
      files: []
    }
  }

  createFile(name, isUpload, blob) {
    let routerParams = {
      siteId: 'one',
      nodeId: 'one',
      login: 'root'
    }

    let url = cfg.api.getScpUrl(routerParams);
    if (name.startsWith('/')) {
      url = `${url}/absolute${name}`
    } else {
      url = `${url}/relative/${name}`
    }

    const id = new Date().getTime() + name;
    return {
      url,
      name,
      isUpload,
      id,
      blob: blob
    }
  }

  onDownloadFile = fileName => {
    let newFile = this.createFile(fileName, false, [])
    this.state.files.unshift(newFile);
    this.setState({});
  }

  onUploadFiles = blobs => {
    for (var i = 0; i < blobs.length; i++) {
      const newFile = this.createFile(blobs[i].name, true, blobs[i]);
      this.state.files.unshift(newFile);
    }

    this.setState({})
  }

  onRemoveFile = id => {
    _.remove(this.state.files, {
      id: id
    })

    this.setState({})
  }

  render() {
    const { onClose, store } = this.props;
    const { isOpen } = store;
    if (!isOpen) {
      return null;
    }

    const { files } = this.state;
    return (
      <div className="grv-file-transfer p-sm">
        <div className="grv-file-transfer-header m-b-sm">
          Download
          <DownloadFileInput onClick={this.onDownloadFile} />
        </div>
        <div className="grv-file-transfer-header m-b-sm">
          Upload
          <UploadFileInput onSelect={this.onUploadFiles} />
        </div>
        <FileList files={files} onRemove={this.onRemoveFile}/>
        <div className="grv-file-transfer-footer m-t">
          <button onClick={onClose}
            className="btn btn-sm btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }
}

const FileList = ({ files, onRemove }) => {
  if (files.length === 0) {
    return null;
  }

  const $files = files.map(file => {
    const props = {
      ...file,
      onRemove: onRemove,
      key: file.id,
    }

    return file.isUpload ?
      <FileToSend {...props} /> :
      <FileToReceive {...props} />
  });

  return (
    <div className="m-t">
      {/*<div className="grv-file-transfer-header m-t m-b-sm">
        FILE TRANSFER
      </div>
      <div className="grv-file-transfer-file-list-cols">
        <div> File Path </div>
        <div> Status </div>
        <div> </div>
  </div>*/}
      <div className="grv-file-transfer-content">
        <div className="grv-file-transfer-file-list">
          {$files}
        </div>
      </div>
    </div>
  )

}

function mapStateToProps() {
  return {
    store: getters.store,
  }
}

function mapActionsToProps() {
  return {
    onClose: close,
    uploadFile: uploadFile
  }
}

export default connect(mapStateToProps, mapActionsToProps)(FileTransfer);
