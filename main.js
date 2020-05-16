const http = require("http");

const MongoClient = require("mongodb").MongoClient;
const uri =
    "mongodb+srv://dbUser:dbPassword@cluster.mongodb.net/test?retryWrites=true&w=majority"; // This needs to be updated with actual credentials and cluster name for a MongoDB database

http.createServer(async (req, res) => {
    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    const db = await client.db("sample_mflix");
    const collection = await db.collection("movies");
    const collectionStats = await collection.stats();

    res.writeHead(200, {
        "Access-Control-Allow-Origin": "*",
        "Transfer-Encoding": "chunked",
        "Content-Length": collectionStats.size,
    });

    const moviesCursor = await collection.find();
    let firstMovie = true;

    res.write("["); // Open array to collect all documents in

    moviesCursor.on("data", (movie) => {
        res.write(`${firstMovie ? "" : ","}${JSON.stringify(movie)}`); // Only write preceding comma if document are not the first one to comply with JSON format
        firstMovie = false;
    });

    moviesCursor.once("end", () => {
        res.write("]");
        res.end();
    });
}).listen(8080);
