const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = "mongodb+srv://admin:bCToURYNvDA3AcjJ@cluster0.h9fvaqq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri,  {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
        }
    }
);

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connection to mongodb successful");
  } catch{}
}
run().catch(console.dir);

module.exports = {run, client}
