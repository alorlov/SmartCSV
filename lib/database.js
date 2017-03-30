'use babel'

import mysql from 'mysql'

export default class Database {

  constructor() {
    this.fatal = false
    this.connection = null
    this.protocol = 'mysql'
    this.type = 'connection'
    this.child_type = 'database'
    this.timeout = 5000 //time ot is set in 5s. queries should be fast.

    this.host = '10.44.116.9',
    this.user = 'orlov',
    this.password = 'orlpa$$',
    this.database = 'eliteconnect'
    this.info = {
      host: atom.config.get('smartcsv.db.host'),
      user: atom.config.get('smartcsv.db.user'),
      password: atom.config.get('smartcsv.db.password'),
      database: atom.config.get('smartcsv.db.database')
    }

    this.connect((err) => {
      if (err != null) {
        console.log('mysql connection error: ' + err);
      }
    })
  }

  connect (callback) {
    this.connection = mysql.createConnection(this.info)
    this.connection.on('error', (err) => {
      if (err && err.code == 'PROTOCOL_CONNECTION_LOST') {
        this.fatal = true
        console.log('mysql connection lost')
      }
    })
    this.connection.connect(callback)
  }

  dispose () {
    this.close()
  }

  close () {
    this.connection.end()
  }
  query (text, callback = {}) {
    return new Promise(resolve => {
      if (this.fatal) {
        this.connection = mysql.createConnection(this.info)
        this.connection.on('error', (err) => {
          if (err && err.code == 'PROTOCOL_CONNECTION_LOST'){
            this.fatal = true
          }
        })
        this.fatal = false
      }

      this.connection.query({sql: text, timeout: this.timeout }, (err, rows, fields) => {
        if (err) {
          this.fatal = err.fatal
          console.log(err.toString())
          throw err.toString() + ` (${text})`
          //callback({type: 'error' , content: err.toString()})
        }
        else if (!fields)
          resolve(rows.affectedRows+" row(s) affected")
          //callback({type: 'success', content:  rows.affectedRows+" row(s) affected"})
        else if (fields.length == 0 || (!Array.isArray(fields[0]) && fields[0] != null))
          resolve(rows)
          //callback(null, rows, fields)
        else {//-- Multiple Statements
          affectedRows = rows.map((row) => {
            if (row.affectedRows != null)
              return row.affectedRows
            else
              return 0
          })
          affectedRows = affectedRows.reduce((r1,r2) => r1+r2)
          if (fields[0] != null && affectedRows == 0)
            resolve(rows[0])
            //callback(null, rows[0], fields[0])
          else
            resolve(affectedRows+" row(s) affected")
            //callback({type: 'success', content:  affectedRows+" row(s) affected"})
        }
      })
    })
  }
  query2 (text, callback = {}) {
    if (this.fatal) {
      this.connection = mysql.createConnection(this.info)
      this.connection.on('error', (err) => {
        if (err && err.code == 'PROTOCOL_CONNECTION_LOST'){
          this.fatal = true
        }
      })
      this.fatal = false
    }

    this.connection.query({sql: text, timeout: this.timeout }, (err, rows, fields) => {
      if (err) {
        this.fatal = err.fatal
        console.log(err.toString())
        callback({type: 'error' , content: err.toString()})
      }
      else if (!fields)
        callback({type: 'success', content:  rows.affectedRows+" row(s) affected"})
      else if (fields.length == 0 || (!Array.isArray(fields[0]) && fields[0] != null))
        callback(null, rows, fields)
      else {//-- Multiple Statements
        affectedRows = rows.map((row) => {
          if (row.affectedRows != null)
            return row.affectedRows
          else
            return 0
        })
        affectedRows = affectedRows.reduce((r1,r2) => r1+r2)
        if (fields[0] != null && affectedRows == 0)
          callback(null, rows[0], fields[0])
        else
          callback({type: 'success', content:  affectedRows+" row(s) affected"})
      }
    })
  }
}
