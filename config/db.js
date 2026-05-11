require('dotenv').config()
const mongoose = require('mongoose')
dbString = process.env.connectionString
mongoose.connect(dbString).then(() => {
    console.log('connect to mongodb');

})
    .catch((err) => {
        console.log('error:', err);

    })


