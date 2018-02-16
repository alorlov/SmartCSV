'use babel'

import { CompositeDisposable } from 'event-kit';
import Report from './report-model'

class ReportModalView extends HTMLElement {
  initialize (model) {
    this.model = model
    this.classList.add('entry', 'report-modal')

    var usersEl = document.createElement('div')
    usersEl.classList.add('users')

    this.appendChild()

    return this
  }

  toggle() {
    if (this.item.classList.contains('btn-success')) {
      return this.deactivate();
    } else {
      return this.activate();
    }
  }
}

export default document.registerElement('elitecsv-report-modal', {prototype: ReportModalView.prototype, extends: 'div'});
