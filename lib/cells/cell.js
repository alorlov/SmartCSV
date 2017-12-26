module.exports = class Cell {
  constructor(arg) {
    this.parent = arg.parent
    this.row = arg.row
    this.column = arg.col
    this.name = arg.name
    this.type = arg.type
    this.id = arg.id
    this.field = arg.field
    this.actual = arg.actual
    this.result = arg.result
    this.screenshot = arg.screenshot
  }
}
