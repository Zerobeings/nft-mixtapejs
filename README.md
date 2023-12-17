# nft-mixtapejs

nft-mixtapejs is a JavaScript library that provides a simple interface for managing and interacting with a SQLite database. It uses the Knex query builder and provides a schema-based approach to defining your data.

This library was created to support the [NFT Mixtape](https://www.npmjs.com/package/mixtapejs/v/0.1.9?activeTab=code) project and to keep the dependencies up to date.

## Installation

```bash
npm install nft-mixtapejs
```

## Usage

First, import the Mixtape class:

```javascript
const Mixtape = require('nft-mixtapejs');
```

Then, create a new instance of Mixtape and initialize it with your configuration:

```javascript
const mixtape = new Mixtape();
await mixtape.init({
  path: process.cwd(),
  config: {
    metadata: { schema: "migrate" },
  },
  schema: {
    metadata: {
      name: {
        type: "string",
        index: true,
      },
      description: {
        type: "string",
        index: true,
      },
      image: {
        type: "string",
        index: true,
      }
    }
  }
});
```

The `init` method takes an options object that can include:

- `path`: The directory where the SQLite database file will be stored. Defaults to the current working directory.
- `config`: An object containing configuration options for the database.
- `schema`: An object defining the schema for the database.

Once the Mixtape instance is initialized, you can use the `write`, `read`, `readOne`, and `rm` methods to interact with the database:

```javascript
await mixtape.write('metadata', { name: 'My Mixtape', description: 'A cool mixtape.', image: 'mixtape.jpg' });
let mixtapes = await mixtape.read('metadata', { name: 'My Mixtape' });
let mixtape = await mixtape.readOne('metadata', { name: 'My Mixtape' });
await mixtape.rm('metadata', { name: 'My Mixtape' });
```

## API

### `init(options)`

Initializes the Mixtape instance. The `options` object can include `path`, `config`, and `schema` properties.

### `write(table, data)`

Writes `data` to the specified `table`. Returns a promise that resolves with the result of the write operation.

### `read(table, query)`

Reads from the specified `table` using the specified `query`. Returns a promise that resolves with the result of the read operation.

### `readOne(table, query)`

Reads a single record from the specified `table` using the specified `query`. Returns a promise that resolves with the result of the read operation.

### `rm(table, where)`

Removes records from the specified `table` where the specified `where` condition is true. Returns a promise that resolves with the result of the remove operation.