'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

export default class ButtonControl {
  constructor({type}) {
    this.type = type;
  }
};
