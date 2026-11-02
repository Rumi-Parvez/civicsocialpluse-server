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
const eventsCollection = db.collection('events');
const joinedEventsCollection = db.collection('joinedEvents');
await joinedEventsCollection.createIndex(
  {
    "eventData._id": 1,
    "userData.email": 1,
  },
  {
    unique: true,
    name: "unique_user_event_join",
  }
);
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



app.post('/events', verifyToken, async (req, res) => {
  const event = req.body;
  const result = await eventsCollection.insertOne(event);
  res.send(result);
});



app.get('/events', async (req, res) => {
  const events = await eventsCollection.find().toArray();
  res.send(events);
});


app.get("/events/recent-upcoming", async (req, res) => {
  
    const today = new Date().toISOString().split("T")[0];

    const events = await eventsCollection.find({
        eventDate: { $gte: today },
      }).sort({ eventDate: 1 }).limit(6).toArray();

    res.status(200).send(events);
  
});

app.get("/events/completed", async (req, res) => {

    const today = new Date().toISOString().split("T")[0];

    const completedEvents = await eventsCollection.find({
        eventDate: { $lt: today },
      }).sort({ eventDate: -1 }).limit(6).toArray();

    res.status(200).send(completedEvents);
});

app.get("/events/my-events", verifyToken, async (req, res) => {

    const email = res.locals.user.email;

    const events = await eventsCollection
      .find({ createdBy: email })
      .toArray();

    res.send(events);
  
});
app.get('/events/:id', async (req, res) => {
  const { id } = req.params;
  const event = await eventsCollection.findOne({ _id: new ObjectId(id) });  
  res.send(event);
});


app.patch("/events/:id", verifyToken, async (req, res) => {

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

    res.send(result);
  
});

app.delete("/events/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  const result = await eventsCollection.deleteOne({
    _id: new ObjectId(id),
    createdBy: res.locals.user.email,
  });

  res.send(result);
});



app.post("/join", verifyToken, async (req, res) => {

    const { eventData, userData } = req.body;
    const userEmail = res.locals.user.email;

    const alreadyJoined = await joinedEventsCollection.findOne({
      "eventData._id": eventData._id,
      "userData.email": userEmail,
    });

    if (alreadyJoined) {
      return res.status(409).send({
        message: "You have already joined this event.",
        isJoined: true,
      });
    }

    const joinRecord = {
      eventData,
      userData: {
        name: res.locals.user.name,
        email: userEmail,
        image: userData?.image || "",
      },
    };

    const result = await joinedEventsCollection.insertOne(joinRecord);

    res.status(201).send({
      success: true,
      message: "Successfully joined the event.",
      isJoined: true,
      insertedId: result.insertedId,
    });
  
});


app.get("/join", verifyToken, async (req, res) => {

    const result = await joinedEventsCollection.find().toArray();

    res.send(result);
 
}); 

app.get("/join/:email", verifyToken, async (req, res) => {

    const email = req.params.email;

    const joinedEvents = await joinedEventsCollection.find({ "userData.email": email }).toArray();

    res.send(joinedEvents);
  
});


app.get("/join/:eventId", verifyToken, async (req, res) => {

    const { eventId } = req.params;
    const userEmail = res.locals.user.email;

    const joinedRecord = await joinedEventsCollection.findOne({
      "eventData._id": eventId,
      "userData.email": userEmail,
    });



    res.status(200).send({
      isJoined: Boolean(joinedRecord),
    });
  
});



app.delete("/join/:eventId", verifyToken, async (req, res) => {

    const { eventId } = req.params;
    const userEmail = res.locals.user.email;

    const result = await joinedEventsCollection.deleteOne({
      "eventData._id": eventId,
      "userData.email": userEmail,
    });

    res.status(200).send({
      success: true,
      message: "Successfully left the event.",
    });
  
});




app.get("/join/event/:eventId", async (req, res) => {

    const { eventId } = req.params;

    const joinedRecords = await joinedEventsCollection.find(
        { "eventData._id": eventId },
        {
          projection: {
            _id: 1,
          },
        }
      ).toArray();

    return res.status(200).send(joinedRecords);
  
});



app.get('/', (req, res) => {
  res.send({message: 'Welcome to Civic Social Pluse Server!'});
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app 