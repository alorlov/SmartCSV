'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

export default class ButtonControl {
  constructor({type, title, tooltip, selected}) {
    this.type = type;
    this.title = title;
    this.tooltip = tooltip
  }
};
