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

import reactor from 'app/reactor';
import api from 'app/services/api';
import { Uploader } from 'app/services/fileTransfer';
import Logger from 'app/lib/logger';
import * as AT from './actionTypes';

const logger = Logger.create('flux/fileTransfer/actions');

export function uploadFile(file) {
  const { name } = file;

  const handleProgress = completed => {
    const json = {
      id: name,
      completed
    };

    reactor.dispatch('PROGRESS', json);
  };

  const handleCompleted = () => {
    reactor.dispatch('DONE', { id: name });
  };

  const handleFailed = err => {
    logger.error("failed to download a file", err)
  }

  const url = `/v1/webapi/sites/one/nodes/one/root/scp/relative/${name}`;
  const uploader = new Uploader();
  uploader.on('progress', handleProgress);
  uploader.on('completed', handleCompleted);
  uploader.on('failed', handleFailed);
  uploader.upload(url, file)

  reactor.dispatch(AT.ADD_FILE, { name });
  return uploader;
}

export function close() {
  reactor.dispatch(AT.SET_OPEN, false)
}

export function open() {
  reactor.dispatch(AT.SET_OPEN, true)
}

export function downloadFile(json) {
  const fileId = json.path;
  //reactor.dispatch(START_TRANSFER, json)
  api.downloadFile(json)
    .progress(completed => {
      const json = {
        id: json.path,
        completed
      };

      reactor.dispatch('PROGRESS', json);
    })
    .done(() => {
      reactor.dispatch('DONE', { id: fileId });
    })
    .fail(err => {
      logger.error("failed to download a file", err)
    })
}

