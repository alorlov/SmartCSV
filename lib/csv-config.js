'use babel'

import _ from 'underscore-plus';

export default class CSVConfig {
  constructor(config) {
    if (config == null) { config = {}; }
    this.config = config;
  }

  get(path, config) {
    if (config != null) { return __guard__(this.config[path], x => x[config]); } else { return this.config[path]; }
  }

  set(path, config, value) {
    if (this.config[path] == null) { this.config[path] = {}; }
    return this.config[path][config] = value;
  }

  move(oldPath, newPath) {
    this.config[newPath] = this.config[oldPath];
    return delete this.config[oldPath];
  }

  clear() { return this.config = {}; }

  clearOption(option) {
    return (() => {
      let result = [];
      for (let path in this.config) {
        let config = this.config[path];
        result.push(delete config[option]);
      }
      return result;
    })();
  }

  serialize() {
    return _.clone(this.config);
  }
};

function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
