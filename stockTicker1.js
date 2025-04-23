const { MongoClient, ServerApiVersion } = require('mongodb');
//uses fs and readline to read in the csv file
var fs = require('fs');
var readline = require('readline');

const url = "mongodb+srv://cherylkirgan:jw7DTCCkPyuB3oQx@publiccompanies.vkbaftj.mongodb.net/";
const fileName = "companies.csv";

//asynchronous function that connects to database, reads file, and inputs contents
async function run() {
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(url, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

  try {
     // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("Stock").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const db = client.db("Stock");
    const collection = db.collection('PublicCompanies');

    //file stream for reading csv, need to convert to utf8 to ensure it's plaintext
    const fileStream = fs.createReadStream(fileName, { encoding: 'utf8' });
    const header = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    //skips the first line of the csv since it's the header
    let isFirstLine = true;
    //array to hold companies being inserted
    const insertedComps = [];

    for await (const line of header) {
      if (isFirstLine) {
        isFirstLine = false; 
        continue;
      }

      //insert lines from csv file
      const [companyName, ticker, stockPrice] = line.split(',');
      if (companyName && ticker && stockPrice) {

        const insertedComp = collection.insertOne({
          //use trim to remove any whitespace
          //source: https://stackoverflow.com/questions/10800355/remove-whitespaces-inside-a-string-in-javascript
          companyName: companyName.trim(),
          ticker: ticker.trim(),
          stockPrice: parseFloat(stockPrice.trim())
        });

        insertedComps.push(insertedComp);
      }
    }

    //reference: https://www.geeksforgeeks.org/promises-in-node-js/
    await Promise.all(insertedComps); // wait for all insertions to complete
    console.log("Insert complete");
    // Ensures that the client will close when you finish/error
    await client.close();
  } catch (err) {
    console.error('Error:', err);
    await client.close();
  }
}

run().catch(console.dir);
