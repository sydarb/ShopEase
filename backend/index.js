const pkg= require("body-parser") ;
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const {urlencoded, json}=pkg;
const app = express();
// app.use(cors());
app.use(express.json());
app.use(cors());
app.use(urlencoded({
  extended:true,
}))
app.use((req, res, next) => {
  // res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
})



// app.use(
//   urlencoded({
//     extendend:true,
//   })
// );
// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/sparkathon", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define User schema and model using Mongoose
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName:{
    type: String,
    required: true,
  },
  uid:{
    type: String,
    required: true,
    unique: true,
  },
  messageWindows: [
    {
      messages: [
        {
          items: [
            {
              imageLink: String,
              redirectUrl: String,
              price: String,
              title: String
            }
          ],
          productNames: [String],
          message: String,
          user: String,
        },
      ],
      sessionId: String
    },
  ],
});

const User = mongoose.model("user", userSchema);

app.get("/", (req, resp) => {
  resp.send("App is Working");

});
// Handle signup routea

app.post("/signup", async (req, res) => {
  console.log(req.body);
  const   messageWindows
    =[];
  const { firstName, email, password, uid } = req.body;
  try {
    const newUser = new User({ email, password, firstName, uid, messageWindows});
    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Error registering user" });
  }
});

// Handle login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, password });
    if (user) {
      res.status(200).json({ message: "Login successful", user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ error: "Error during login" });
  }
});

// Handle Save logic
app.put("/chat", async (req, res) => {
  const { email, messageWindows } = req.body;
  console.log("email");
  console.log(messageWindows);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.messageWindows = messageWindows;
    await user.save();
    res.status(200).json({ message: "Message saved successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error saving message" });
  }
});

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
