const mongoose = require('mongoose');
const url = `mongodb+srv://chat_appadmin:chat_appadmin@cluster0.itgppjj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database connected');
}).catch(err => {
    console.log(err);
});