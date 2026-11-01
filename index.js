import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());




const client = new MongoClient(process.env.MONGODB_URL);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const dbClient = await connectToMongoDB();
const db = dbClient.db('CivicSocialPluse-DB');
const usersCollection = db.collection('user');
const eventsCollection = db.collection('events');


app.post('/events', async (req, res) => {
  const event = req.body;
  const result = await eventsCollection.insertOne(event);
  res.send(result);
});



app.get('/events', async (req, res) => {
  const events = await eventsCollection.find().toArray();
  res.send(events);
});

app.get("/events/recent-upcoming", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const events = await eventsCollection.find({
        eventDate: { $gte: today },
      }).sort({ eventDate: 1 }).limit(6).toArray();

    res.status(200).send(events);
  } catch (error) {
    console.error("Failed to fetch recent events:", error);
    res.status(500).send({
      message: "Failed to fetch recent upcoming events",
    });
  }
});

app.get("/events/completed", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const completedEvents = await eventsCollection
      .find({
        eventDate: { $lt: today },
      }).sort({ eventDate: -1 }).limit(6).toArray();

    res.status(200).send(completedEvents);
  } catch (error) {
    console.error("Failed to fetch completed events:", error);

    res.status(500).send({
      message: "Failed to fetch completed events",
    });
  }
});


app.get('/', (req, res) => {
  res.send({message: 'Hello, World!'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});