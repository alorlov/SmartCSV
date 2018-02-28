'use babel'

import { CompositeDisposable } from 'event-kit';

class ButtonView extends HTMLElement {
  initialize(button) {
    this.button = button;
    this.classList.add('entry');
    this.dataset.type = this.button.type;
    this.item = document.createElement('button');
    this.item.classList.add('inline-block', 'btn');
    this.item.textContent = `${this.button.title}`;

    this.button.getValue() ? this.activate() : this.deactivate()

    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(this.button.onDidChange(status => {
      status ? this.activate() : this.deactivate()
    }))
    return this.appendChild(this.item);
  }

  activate() {
    this.item.classList.add('selected');
  }

  deactivate() {
    this.item.classList.remove('selected')
  }
}

export default document.registerElement('elitecsv-button', {prototype: ButtonView.prototype, extends: 'span'});
