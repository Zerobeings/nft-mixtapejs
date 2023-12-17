const Mixtape = require('../index')
const mixtape = new Mixtape();
(async () => {
  await mixtape.init({
    config: {
      metadata: { schema: "migrate" }
    }
  })
  // loop through 100 items and insert
  for(let i=0; i<100; i++) {
    await mixtape.write("metadata", {
      name: i,
      description: "token " + i,
      attributes: [{
        trait_type: "index",
        value: i
      }]
    })
  }
})();