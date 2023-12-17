const path = require('path')
class Table {
  constructor(folder, table, knex, options) {
    this.path = folder
    this.table = table
    this.knex = knex
    this.options = options
  }
  async write(o) {
    try {
      await this.knex(this.table).insert(o)
    } catch (e) {
      // mode := reject|filter|migrate
      let mode = (this.options && this.options.schema ? this.options.schema : "reject")
      if (mode === "reject") {
        // default is "reject" mode
        throw e
      } else {
        let re = /.*SQLITE_ERROR: table .+ has no column named (.+)$/g
        let match = re.exec(e.message)
        if (match && match.length > 0) {
          if (mode === "filter") {
            throw e
          } else if (mode === "migrate") {
            // try migrating with the attribute name as string type
            let attr = match[1]
            await this.migrate({
              [attr]: {
                index: true,
              }
            })
            await this.write(o)
          }
        } else {
          throw e
        }
      }
    }
  }
  async migrate(schema) {
    let keys = Object.keys(schema)
    await this.knex.schema.table(this.table, (table) => {
      for(let key of keys) {
        let def = schema[key]
        let type = (def.type ? def.type : "string")
        let r;
        if (type === 'string' && def.maxLength) {
          r = table[type](key, def.maxLength)
        } else {
          r = table[type](key)
        }
        if (def.notNullable) r = r.notNullable()
        if (def.primary) r = r.primary()
        if (def.defaultTo) r = r.defaultTo(def.defaultTo)
        if (def.index) {
          table.index(key, `${this.table}_${key}_index`)
        }
      }
    })
    this.columns = await this.knex(this.table).columnInfo()
  }
  async init(schema) {
    /******************************************************
    *  schema := {
    *    id: {
    *      type: "string",
    *      notNullable: true,
    *      primary: true,
    *      defaultTo: Date.now(),
    *      index: true
    *    },
    *    value: {
    *      type: "integer",
    *    }
    *  }
    ******************************************************/
    try {
      let keys = Object.keys(schema)
      await this.knex.schema.createTable(this.table, (table) => {
        for(let key of keys) {
          let def = schema[key]
          let type = (def.type ? def.type : "string")
          let r;
          if (type === 'string' && def.maxLength) {
            r = table[type](key, def.maxLength)
          } else {
            r = table[type](key)
          }
          if (def.notNullable) r = r.notNullable()
          if (def.primary) r = r.primary()
          if (def.defaultTo) r = r.defaultTo(def.defaultTo)
          if (def.index) {
            table.index(key, `${this.table}_${key}_index`)
          }
        }
      })
    } catch (e) {
      // do nothing
    }
    this.columns = await this.knex(this.table).columnInfo()
  }
  /******************************************************
  *  {
  *    select: [<col>, <col>, .. ],
  *    where: {
  *      <key>: <val>,
  *      <key>: <val>,
  *    }
  *  }
  ******************************************************/
  async readOne(query) {
    query.from = this.table
    let promise = (query.select ? this.knex.select(...query.select) : this.knex.select())
    promise = promise.from(query.from)
    promise = promise.limit(1)
    if (query.join) promise = promise.join(...query.join)
    if (query.where) {
      if (Array.isArray(query.where)) {
        promise = promise.where(...query.where)
      } else {
        promise = promise.where(query.where)
      }
    }
    if (query.offset) promise = promise.offset(query.offset)
    if (query.order) promise = promise.orderBy(...query.order)
    if (query.where) promise = promise.where(query.where)
    let response = await promise
    if (response.length > 0) {
      return response[0]
    } else {
      return null
    }
  }
  /******************************************************
  *  can only insert token. users are auto-generated
  *
  *  {
  *    select: [<col>, <col>, .. ],
  *    join: [args],
  *    where: {
  *      <key>: <val>,
  *      <key>: <val>,
  *    },
  *    order: <orderBy>,
  *    limit: <limit>,
  *    offset: <offset>
  *  }
  ******************************************************/
  async read(query) {
    query.from = this.table
    let promise = (query.select ? this.knex.select(...query.select) : this.knex.select())
    promise = promise.from(query.from)
    if (query.join) promise = promise.join(...query.join)
    if (query.where) {
      if (Array.isArray(query.where)) {
        promise = promise.where(...query.where)
      } else {
        promise = promise.where(query.where)
      }
    }
    if (query.limit) promise = promise.limit(query.limit)
    if (query.offset) promise = promise.offset(query.offset)
    if (query.order) promise = promise.orderBy(...query.order)
    let response = await promise
    return response
  }
  /******************************************************
  *  where := {
  *    <key>: <val>,
  *    <key>: <val>,
  *  }
  ******************************************************/
  async rm(where) {
    if (Array.isArray(where)) {
      await this.knex(this.table).where(...where).del()
    } else if (typeof where === 'object') {
      await this.knex(this.table).where(where).del()
    } else {
      throw new Error("the condition must be either array or a non-empty object")
    }
  }
}
module.exports = Table