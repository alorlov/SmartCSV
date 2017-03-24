'use babel'

import { CompositeDisposable } from 'atom';
import { $, View } from 'atom-space-pen-views';

export default class ResizableView extends View {
  constructor(...args) {
    super(...args);
    this.resizeStarted = this.resizeStarted.bind(this);
    this.resizeStopped = this.resizeStopped.bind(this);
    this.resizeView = this.resizeView.bind(this);
  }

  static content() {
    return this.div({class: 'view-resizer tool-panel', 'data-show-on-right-side': this.showOnRightSide}, () => {
      this.div({class: 'view-scroller', outlet: 'scroller'}, () => {
        return this.innerContent();
      });
      return this.div({class: 'view-resize-handle', outlet: 'resizeHandle'});
    }
    );
  }

  initialize(state) {
    this.disposables = new CompositeDisposable;

    return this.handleEvents();
  }

  detached() {
    return this.resizeStopped();
  }

  deactivate() {
    return this.disposables.dispose();
  }

  handleEvents() {
    this.on('dblclick', '.view-resize-handle', () => {
      return this.resizeToFitContent();
    }
    );

    return this.on('mousedown', '.view-resize-handle', e => this.resizeStarted(e));
  }

  resizeStarted() {
    $(document).on('mousemove', this.resizeView);
    return $(document).on('mouseup', this.resizeStopped);
  }

  resizeStopped() {
    $(document).off('mousemove', this.resizeView);
    return $(document).off('mouseup', this.resizeStopped);
  }

  resizeView({pageX, which}) {
    let width;
    if (which !== 1) { return this.resizeStopped(); }

    if (this.showOnRightSide) {
      width = $(document.body).width() - pageX;
    } else {
      width = pageX;
    }
    return this.width(width);
  }

  resizeToFitContent() {
    this.width(1); // Shrink to measure the minimum width of list
    return this.width(this.scroller.find('>').outerWidth());
  }
};
