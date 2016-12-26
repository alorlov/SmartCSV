'use babel'

let xml2js;
import jsonfile from 'node-jsonfile';
let fs = require('fs',
xml2js = require('xml2js'));
import { CompositeDisposable, Emitter } from 'event-kit';
import Runner from './runner';
//PathWatcher = require 'pathwatcher'

export default class RunnerChild extends Runner {

  dif() {
    return console.log('im a child');
  }
};
