/*
token {
  signed: boolean,
  cid: string,
  id: string,
  metadata: string,
  sender: string,
  value: integer,

}
*/
const stringify = require('json-stringify-deterministic')
const ipfsh = require('ipfsh')
const Table = require('./table')
class Token extends Table {
  async write(token) {
    let tokenCid = await ipfsh.file(new TextEncoder().encode(stringify(token)))
    let transformed = {
      signed: (token.body.signature ? true : false),
      self: tokenCid,
      id: token.body.id,
      encoding: token.body.encoding,
      cid: token.body.cid,
      sender: token.body.sender,
      receiver: token.body.receiver,
      value: token.body.value,
      start: token.body.start,
      end: token.body.end,
      sendersHash: token.body.sendersHash,
      receiversHash: token.body.receiversHash,
      puzzleHash: token.body.puzzleHash,
      created_at: Date.now()
    }
    await super.write(transformed)
  }
  async migrate(schema) {
    await super.migrate(schema)
  }
  async init() {
    await super.init({
      signed: {
        type: "boolean",
        index: true
      },
      self: {
        notNullable: true,
        primary: true,
        index: true,
      },
      id: {
        notNullable: true,
        index: true,
      },
      encoding: {
        type: "integer",
        notNullable: true,
      },
      cid: {
        notNullable: true
      },
      sender: {
        index: true
      },
      receiver: {
        index: true
      },
      value: {
        type: "bigInteger",
        index: true
      },
      start: {
        type: "integer"
      },
      end: {
        type: "integer"
      },
      sendersHash: {
        index: true
      },
      receiversHash: {
        index: true
      },
      puzzleHash: {
        index: true
      },
      created_at: {
        type: "bigInteger",
        index: true,
      },
    })
  }
}
module.exports = Token