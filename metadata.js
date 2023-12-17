const stringify = require('json-stringify-deterministic')
const ipfsh = require('ipfsh')
const Table = require('./table')
class Metadata extends Table {
  async write(metadata) {
    /******************************************************
    *  metadata := {
    *   name: <name>,
    *   description: <description>,
    *   mime: {
    *     [cid]: <mime>
    *   },
    *   <key>: <val>,
    *   <attributes>: [{
    *     trait_type: <key>,
    *     value: <val>
    *   }, {
    *     ...
    *   }]
    *  }
    ******************************************************/
    // get key/value pairs
    let keys = Object.keys(metadata)
    let cid = await ipfsh.file(new TextEncoder().encode(stringify(metadata)))
    let transformed = { self: cid }
    for(let key of keys) {
      if (key === "attributes") {
        let attributes = metadata.attributes
        for(let keyVal of attributes) {
          if (typeof keyVal.trait_type !== "undefined" && typeof keyVal.value !== "undefined") {
            transformed[keyVal.trait_type] = keyVal.value
          } else {
            if (typeof keyVal.trait_type !== "undefined") {
              transformed["" + keyVal.trait_type] = true
            } else if (typeof keyVal.value !== "undefined") {
              transformed["" + keyVal.value] = true
            }
          }
        }
      } else {
        transformed[key] = metadata[key]
      }
    }
    let mode = (this.options && this.options.schema ? this.options.schema : "reject")
    if (mode === "filter") {
      transformed = await this.filter(transformed)
    }
    await super.write(transformed)
  }
  async migrate(schema) {
    await super.migrate(schema)
  }
  async init(schema) {
    /******************************************************
    *  schema := {
    *   Mouth: {
    *     type: "string"
    *   },
    *   Background: {
    *     type: "string"
    *   },
    *   Hat: {
    *     type: "string"
    *   }
    *  }
    ******************************************************/
    await super.init(Object.assign({}, {
      self: {
        notNullable: true,
        primary: true,
        index: true,
      }
    }, schema))
  }
  async filter(o) {
    let filtered = {}
    for(let key in o) {
      if (this.columns[key]) {
        filtered[key] = o[key] 
      }
    }
    return filtered
  }
}
module.exports = Metadata