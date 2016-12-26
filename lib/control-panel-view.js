'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';
import { $, View } from 'atom-space-pen-views';
import _ from 'underscore-plus';
import ButtonControl from './button-control';
import ButtonControlView from './button-control-view';

export default class ControlPanelView extends View {
  constructor(...args) {
    super(...args);
    this.consumeStatusBar = this.consumeStatusBar.bind(this);
  }

  static initClass() {
    this.prototype.panel = null;
  }

  static content() {
    return this.div({class: 'smartcsv-control-panel'}, () => {
      return this.div({outlet: 'row'});
    }
    );
  }

  initialize(runner) {
    this.runner = runner;
    let button = new ButtonControl({type: 'selected'});
    let view = new ButtonControlView();
    view.initialize(button);
    this.row[0].appendChild(view);

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.runner.onDidStart(() => view.toggle()));
    this.subscriptions.add(this.runner.onDidStop(() => view.toggle()));

    this.handleEvents();
    return this.show();
  }
    //@update()

  show() {
    return this.attach();
  }

  attach() {
    if (_.isEmpty(atom.project.getPaths())) { return; }
    return this.panel;
  }

  detach() {
    this.panel.destroy();
    return this.panel = null;
  }

  handleEvents() {
    this.on('click', '.entry', e => {
      // This prevents accidental collapsing when a .entries element is the event target
      if (e.target.classList.contains('entries')) { return; }

      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) { return this.entryClicked(e); }
    }
    );

    return atom.commands.add('tablr-editor',
     {'smartcsv:run-from': () => this.toggleRunSelected()});
  }

    //atom.commands.add 'smartcsv-control-panel',
    // 'smartcsv:run-from': => @runFrom()

  setModel(runner) {
    this.runner = runner;
  }

  consumeStatusBar(statusBar) {
    this.statusBar = statusBar;
    return this.panel = this.statusBar.addLeftTile({item: this, priority: 100});
  }

  update() {
    this.button = document.createElement('span');
    this.button.classList.add('entry');
    this.button.dataset.name = 'run-from';
    this.button.textContent = 'run-from';
    this.row[0].appendChild(this.button);

    this.button = document.createElement('span');
    this.button.classList.add('entry');
    this.button.dataset.name = 'run-selected';
    this.button.textContent = 'run-selected';
    this.row[0].appendChild(this.button);

    this.button = document.createElement('span');
    this.button.classList.add('entry');
    this.button.dataset.name = 'run-all';
    this.button.textContent = 'run-all';
    return this.row[0].appendChild(this.button);
  }




  entryClicked(e) {
    let entry = e.currentTarget;
    switch (entry.dataset.type) {
      case 'from': this.toggleRunFrom(); break;
      case 'selected': this.toggleRunSelected(); break;
      case 'all': this.toggleRunAll(); break;
    }

    console.log(e);
    console.log(e.currentTarget);
    entry.toggle();

    return false;
  }

  toggleRunFrom() {}

  toggleRunSelected() {
    return this.runner.toggleRunSelected();
  }

  toggleRunAll() {}
};
ControlPanelView.initClass();
