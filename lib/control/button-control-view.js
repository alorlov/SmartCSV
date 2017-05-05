'use babel'

import { CompositeDisposable } from 'event-kit';

class ButtonRunnerView extends HTMLElement {
  initialize(button) {
    this.button = button;
    this.classList.add('entry');
    this.item = document.createElement('button');
    this.dataset.type = this.button.type;
    this.item.classList.add('inline-block', 'btn');
    this.item.textContent = `${this.button.title}`;
    return this.appendChild(this.item);
  }

  removeClasses() {
    this.item.classList.remove('btn-success', 'btn-error', 'btn-warning')
  }

  activate() {
    this.removeClasses()
    this.item.classList.add('btn-success');
  }

  forcedStop() {
    this.removeClasses()
    this.item.classList.add('btn-error')
  }

  manualStop() {
    this.removeClasses()
    this.item.classList.add('btn-warning')
  }

  deactivate() {
    this.removeClasses()
    //this.item.classList.remove('btn-success')
  }

  toggle() {
    if (this.item.classList.contains('btn-success')) {
      return this.deactivate();
    } else {
      return this.activate();
    }
  }
}

export default document.registerElement('elitecsv-control-button', {prototype: ButtonRunnerView.prototype, extends: 'span'});
