'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

export default class ButtonControl {
  constructor({type, title}) {
    this.type = type;
    this.title = title;
  }
};
