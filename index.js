const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('Orders'));
app.use(express.static('services'));
app.use(fileUpload());


app.get('/', (req, res) => {
	res.send('<h1>Welcome to Creative Agency Server</h1>');
});

app.listen(process.env.PORT || 8080, () => console.log('I am listening from 8080'));