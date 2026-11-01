import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import { createRemoteJWKSet, jwtVerify } from "jose";
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

const authBaseURL = process.env.BETTER_AUTH_URL;

if (!authBaseURL) {
  throw new Error("BETTER_AUTH_URL is missing.");
}

const JWKS = createRemoteJWKSet(
  new URL(`${authBaseURL}/api/auth/jwks`)
);

const verifyToken = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      return res.status(401).send({
        message: "Authentication token is required.",
      });
    }

    const token = authorization.split(" ")[1];

    console.log(token);
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: authBaseURL,
      audience: authBaseURL,
    });

    if (!payload.sub) {
      return res.status(401).send({
        message: "Invalid user token.",
      });
    }

    res.locals.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };

    next();
  } catch (error) {
    console.error("JWT verification failed:", error);

    return res.status(401).send({
      message: "Invalid or expired token.",
    });
  }
};



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

app.get("/events/my-events", verifyToken, async (req, res) => {
  try {
    const email = res.locals.user.email;

    const events = await eventsCollection
      .find({ createdBy: email })
      .toArray();

    res.send(events);
  } catch (error) {
    console.error("My Events Error:", error);

    res.status(500).send({
      message: "Failed to fetch events",
    });
  }
});
app.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  const event = await eventsCollection.findOne({ _id: new ObjectId(id) });  
  res.send(event);
});


app.patch("/events/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await eventsCollection.updateOne(
      {
        _id: new ObjectId(id),
        createdBy: res.locals.user.email,
      },
      {
        $set: req.body,
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).send({
        message: "Event not found or unauthorized",
      });
    }

    res.send(result);
  } catch (error) {
    res.status(500).send({
      message: "Failed to update event",
    });
  }
});

app.delete("/events/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await eventsCollection.deleteOne({
    _id: new ObjectId(id),
    createdBy: res.locals.user.email,
  });

  res.send(result);
});


app.get('/', (req, res) => {
  res.send({message: 'Hello, World!'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default {app , verifyToken};