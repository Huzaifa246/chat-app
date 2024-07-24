// mongodb+srv://chat_appadmin:chat_appadmin@cluster0.itgppjj.mongodb.net/
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('./db/connection'); // connection to database

// import files
const Users = require('./models/Users');

//App Use
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const port = process.env.PORT || 8000;

// routes
app.get('/', (req, res) => {
    res.send('Hello World');
})
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).send('Please fill the required fields');
        }
        else {
            const isAlreadyRegistered = await Users.findOne({ email });
            if (isAlreadyRegistered) {
                return res.status(400).send('User already registered');
            }
            const user = new Users({ fullName, email });
            const hashedPassword = await bcrypt.hash(password, 10);
            user.set('password', hashedPassword);

            await user.save();
            return res.status(200).send('User registered successfully');
        }
    }
    catch (err) {
        console.log(err);
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).send('Please fill the required fields');
        }

        const user = await Users.findOne({ email });

        if (!user) {
            return res.status(400).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        const payload = {
            userId: user.id,
            email: user.email
        };

        console.log(payload, 'payload')
        const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "JWT_SECRET_KEY";
        
        jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: '84600' }, async (err, token) => {
            if (err) {
                return res.status(500).send('Error generating token');
            }

            await user.updateOne({ _id: user.id }, { $set: { token } });
            return res.status(200).json({ user, token });
        });
    } catch (err) {
        console.log(err);
        res.status(500).send('An error occurred during login');
    }
});


app.listen(port, () => {
    console.log(port, "Server is running on port 8000");
})