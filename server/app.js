// mongodb+srv://chat_appadmin:chat_appadmin@cluster0.itgppjj.mongodb.net/
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const io = require('socket.io')(8080, {
  cors: {
    origin: 'http://localhost:3000',
  }
})

require("./db/connection"); // connection to database

// import files
const Users = require("./models/Users");
const Conversations = require("./models/Conversation");
const Messages = require("./models/Messages");

//App Use
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT || 8000;

//Socket .io
let users = [];
io.on('connection', socket => {
  socket.on('addUser', userId => {
    const isUserExist = users?.find(user => user?.userId === userId)
    if (!isUserExist) {
      const user = { userId, socketId: socket?.id }
      users.push(user);
      io.emit('getUsers', users)
    }
  });
  socket?.on('sendMessage', async ({
    senderId, receiverId, conversationId, message
  }) => {
    const socketReceiver = users.find(user => user?.userId === receiverId)
    const socketSender = users.find(user => user?.userId === receiverId)
    const user = await Users.findById(senderId)

    if (socketReceiver) {
      io?.to(socketReceiver.socketId).to(socketSender?.socketId).emit('getMessage', { // (to) used for private msg and then emit used to send msg
        senderId,
        message,
        conversationId,
        receiverId,
        user: { id: user?._id, fullName: user?.fullName, email: user?.email }
      })
    }
  })

  // filtering data and disconnecting 
  // and again send get req as user 
  socket.on('disconnect', () => {
    users = users?.filter(user => user.socketId !== socket?.id)
    io.emit('getUsers', users)
  })
})

// routes
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill required fields" });
    } else {
      const isAlreadyRegistered = await Users.findOne({ email });
      if (isAlreadyRegistered) {
        return res.status(400).json({ message: "User already registered" });
      }
      const user = new Users({ fullName, email });
      const hashedPassword = await bcrypt.hash(password, 10);
      user.set("password", hashedPassword);

      await user.save();
      return res.status(200).json({ message: "User registered successfully" });
    }
  } catch (err) {
    res.status(500).json({ message: "An error occurred during registration" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send("Please fill the required fields");
    }

    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).send("Invalid credentials");
    }

    const payload = {
      userId: user.id,
      email: user.email,
    };

    console.log(payload, "payload");
    const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "JWT_SECRET_KEY";

    jwt.sign(
      payload,
      JWT_SECRET_KEY,
      { expiresIn: "84600" },
      async (err, token) => {
        if (err) {
          return res.status(500).send("Error generating token");
        }

        await user.updateOne({ _id: user.id }, { $set: { token } });
        return res.status(200).json({ user, token });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred during login");
  }
});

app.post("/api/conversation", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const newConversation = new Conversations({
      members: [senderId, receiverId],
    });
    await newConversation.save();
    res.status(200).send({ message: "Successfully created conversation" });
  } catch (err) {
    res.status(500).send({ message: "Error creating conversation" });
  }
});
// get the conversation
app.get("/api/conversations/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    //Conversation model me check kare gy ID where $in = include
    const conversations = await Conversations.find({
      members: { $in: [userId] },
    });
    //Now handle USER DATA(USER list)
    const conversationUserData = Promise.all(
      conversations.map(async (conversation) => {
        const receiverId = conversation.members.find(
          (member) => member !== userId
        );
        const userUniqueData = await Users.findById(receiverId);
        return {
          data: {
            receiverId: userUniqueData._id,
            email: userUniqueData.email,
            fullName: userUniqueData.fullName,
          },
          conversationId: conversation._id,
        };
      })
    );

    res.status(200).json(await conversationUserData);
  } catch (err) {
    res.status(500).json(err, "error at conversation");
  }
});

//messages
app.post("/api/message", async (req, res) => {
  try {
    const { conversationId, senderId, message, receiverId = "" } = req.body;
    if (!senderId || !message)
      return res.status(400).send("Please fill in required information");
    if (conversationId === "new" && receiverId) {
      const newConversation = new Conversations({
        members: [senderId, receiverId],
      });
      await newConversation.save();
      const newMessage = new Messages({
        conversationId: newConversation._id,
        senderId,
        message,
      });
      await newMessage.save();
      return res.status(200).send("Message sent successfully");
    } else if (!conversationId && !receiverId) {
      return res.status(400).send("Please fill in all required fields");
    }
    const newMessage = new Messages({ conversationId, senderId, message });
    await newMessage.save();

    res.status(200).send("Message Sent Successfully");
  } catch (err) {
    console.log(err, "Error at message");
    return res.status(500).send("Error at sending message");
  }
});

app.get("/api/message/:conversationId", async (req, res) => {
  try {
    const checkMessages = async (conversationId) => {
      const messages = await Messages.find({ conversationId });
      //IF i Want detailed messages data with user name and email we will use below code
      const messageUserData = Promise.all(
        messages.map(async (message) => {
          const user = await Users.findById(message.senderId);
          return {
            user: {
              id: user._id,
              fullName: user.fullName,
              email: user.email,
            },
            message: message.message,
          };
        })
      );
      return res.status(200).json(await messageUserData)
    }

    const conversationId = req.params.conversationId;
    if (conversationId === 'new') {
      //checking if sender
      const checkConversation = await Conversations.find({
        members: {
          $all: [req.query.senderId, req.query.receiverId]
        }
      });
      if (checkConversation.length > 0) {
        checkMessages(checkConversation[0]?._id);
      } else {
        return res.status(200).json([])
      }
    }
    else {
      checkMessages(conversationId)
    }
  } catch (err) {
    console.log("Error ", err);
    res.status(500).json({ message: 'Internal server error', error: err });
  }
});

app.get("/api/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    //where _id not equal to userId
    const allUsers = await Users.find({ _id: { $ne: userId } });

    const usersData = Promise.all(
      allUsers?.map((user) => {
        return {
          user: {
            fullName: user.fullName,
            email: user.email,
            receiverId: user._id,
          },
        };
      })
    );
    res.status(200).json(await usersData);
  } catch (err) {
    return res.status(500).json(err, "error");
  }
});
app.listen(port, () => {
  console.log(port, "Server is running on port 8000");
});
