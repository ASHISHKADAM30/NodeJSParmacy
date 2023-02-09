const express = require('express');
const server = express();
const mongoose = require('mongoose');

require("dotenv").config();

const PORT = process.env.PORT;

const userRoutes = require('./routes/users.routes');
const medicineRoutes = require('./routes/medicines.routes');

server.use('/static', express.static(__dirname + '/public'));

server.use(express.urlencoded({ extended: true }));

server.use(express.json());

(async function () {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/medicine');
        console.log('Database connection successful.');
    } catch (err) {
        console.log(err);
    }
})();

server.get('/', (req, res) => {
    res.json({
        'msg': 'Hello ASK_Pharmacy.'
    });
});

server.use('/users', userRoutes);
server.use('/medicines', medicineRoutes);

server.get('**', (req, res) => {
    res.sendStatus(404);
});

server.use((err, req, res, next) => {
    res.sendStatus(500);
});

/* ----------------TO START DATABASE----------------
    mongod --dbpath="./databases" --logpath=./databases/mylogs.log
 */

server.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000`);
});