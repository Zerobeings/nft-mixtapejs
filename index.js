const Knex = require('knex')
const Token = require("./token")
const Metadata = require("./metadata")
const path = require("path")
const fs = require('fs')
///////////////////////////////////////////////////
//
//  const mixtape = new Mixtape()
//  await mixtape.init({
//    path: process.cwd(),
//    config: {
//      metadata: { schema: "migrate" },
//    },
//    schema: {
//      metadata: {
//        name: {
//          type: "string",
//          index: true,
//        },
//        description: {
//          type: "string",
//          index: true,
//        },
//        image: {
//          type: "string",
//          index: true,
//        }
//      }
//    }
//  })
//
///////////////////////////////////////////////////
class Mixtape {
  async init(options) {
    if (options.file) {
      this.file = options.file
      this.path = path.dirname(this.file)
    } else {
      this.path = (options && options.path ? options.path : process.cwd())
      this.file = path.resolve(this.path, "mixtape.db")
    }
    this.config = (options && options.config ? options.config : {})
    this.schema = (options && options.schema ? options.schema : {}) 
    this.knex = Knex({
      useNullAsDefault: true,
      client: "sqlite3",
      connection: {
        filename: this.file,
      },
      migrations: {
        tableName: 'knex_migrations',
        directory: __dirname + '/migrations'
      }
    })
    let tokenConfig = (this.config.token ? this.config.token : {})
    let metadataConfig = (this.config.metadata ? this.config.metadata : {})
    this.token = new Token(this.path, "token", this.knex, tokenConfig)
    this.metadata = new Metadata(this.path, "metadata", this.knex, metadataConfig)
    await fs.promises.mkdir(this.path, { recursive: true }).catch((e) => {})
    let metaSchema = (this.schema.metadata ? this.schema.metadata : {})
    let tokenSchema = (this.schema.token ? this.schema.token : {}) 
    await this.metadata.init(metaSchema)
    await this.token.init(tokenSchema)
  }
  async write(table, data) {
    let r = await this[table].write(data)
    return r
  }
  async read(table, query) {
    let r = await this[table].read(query)
    return r
  }
  async readOne(table, query) {
    let r = await this[table].readOne(query)
    return r
  }
  async rm(table, where) {
    let r = await this[table].rm(where)
    return r
  }
}
module.exports = Mixtape