// mongodb+srv://chat_appadmin:chat_appadmin@cluster0.itgppjj.mongodb.net/
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.listen(port, () => {
    console.log(port, "Server is running on port 8000");
})


app.get('/', (req, res) => {
    res.send('Hello World');

})