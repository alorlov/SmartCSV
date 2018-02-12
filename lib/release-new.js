'use babel'

import { CompositeDisposable } from 'atom';
import { $, View } from 'atom-space-pen-views';

export default class ReleaseControl {
  constructor() {
    this.disposables = new CompositeDisposable;
    this.element = this.getView()
    this.handleEvents()
  }

  getView () {
    let element = document.createElement('div')

    let report1 = document.createElement('input')
    report1.classList.add('report1')
    element.appendChild(report1)

    let button1 = document.createElement('button')
    button1.classList.add('button1', 'inline-block', 'btn', 'icon', 'icon-checklist');
    element.appendChild(button1)

    return element
  }

  deactivate() {
    return this.disposables.dispose();
  }

  handleEvents() {
    this.element.addEventListener('click', (e) => {
      alert('button1 clicked ' + e.target.classList)
    });

    //return this.on('mousedown', '.view-resize-handle', e => this.resizeStarted(e));
  }
};
