'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

export default class RunRequest {
  constructor({cellsMap, matrixName, threadName}) {
    this.cellsMap = cellsMap;
    this.matrixName = matrixName;
    this.threadName = threadName;
  }
}
