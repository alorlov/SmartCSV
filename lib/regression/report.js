'use babel'

import { CompositeDisposable, Emitter } from 'event-kit';

export default class Report {
  constructor({path}) {
    this.path = path
  }

  getObject(path) {
    let rawObject = this.parseXml(path);
    if(rawObject == null) {
      return []
    }
    let object = (() => {
      let result = [];
      for (let cell of Array.from(rawObject.cells.cell)) {
        let res = {
          id: cell.id[0],
          type: cell.type[0],
          row: cell.row[0] * 1,
          column: cell.col[0] * 1,
          name: cell.name[0],
          actual: cell.actual[0],
          parent: cell.parent[0]
        };

        if (cell.field != null) {
          var resf;
          res.field = Array.from(cell.field).map((field) =>
            (resf = {
              expected: field.expected[0],
              actual: field.actual[0],
              result: field.result[0],
              name: field.name[0]
            },
            resf));
        }
        result.push(res);
      }
      return result;
    })();
    return object;
  }


  parseXml(string) {
    let result = [];
    let parser = new xml2js.Parser();
    parser.parseString(string, (err, rawObject) => {
      if (err) { atom.notifications.addWarning("ParseXML failed", {detail: err}); }
      if(rawObject == null) {
        return []
      }
      let object = (() => {
        for (let cell of Array.from(rawObject.cells.cell)) {
          let res = {
            id: cell.id[0],
            type: cell.type[0],
            row: cell.row[0] * 1,
            column: cell.col[0] * 1,
            name: cell.name[0],
            actual: cell.actual[0],
            parent: cell.parent[0]
          };

          if (cell.field != null) {
            var resf;
            res.field = Array.from(cell.field).map((field) =>
              (resf = {
                expected: field.expected[0],
                actual: field.actual[0],
                result: field.result[0],
                name: field.name[0]
              },
              resf));
          }
          result.push(res);
        }
        return result;
      })();
      return object;
    })
    return result
  }
}
