const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('Orders'));
app.use(express.static('services'));
app.use(fileUpload());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tpdhc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect((err) => {
	const servicesCollection = client.db('creativeAgency').collection('services');
	const reviewsCollection = client.db('creativeAgency').collection('reviews');
	const adminCollection = client.db('creativeAgency').collection('admins');
	const ordersCollection = client.db('creativeAgency').collection('orders');

	console.log('ManPower Supply Agency DataBase Connected');

	 // loading all orders
	 app.get('/allOrders', (req, res) => {
        ordersCollection.find({})
        .toArray((err, docs) => res.send(docs));
    })
    
    // loading orders by email
    app.get('/allOrders/:email', (req, res) => {
        ordersCollection.find({email: req.params.email})
        .toArray((err, docs) => res.send(docs));
    })

    // adding order
    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        ordersCollection.insertOne(newOrder)
        .then(result => res.send(result.insertedCount > 0))
    })

    // loading all Reviews
    app.get('/allReviews', (req, res) => {
        reviewsCollection.find({})
        .toArray((err, docs) => res.send(docs));
    })

    // adding review
    app.post('/addReview', (req, res) => {
        const newReview = req.body;
        reviewsCollection.insertOne(newReview)
        .then(result => res.send(result.insertedCount > 0))
    })

    // checking for admin
    app.get('/checkAdmin/:email', (req, res) => {
        adminCollection.find({email: req.params.email})
        .toArray((err, docs) => res.send(docs.length > 0));
    })

    // loading all services
    app.get('/allServices', (req, res) => {
        servicesCollection.find({})
        .toArray((err, docs) => res.send(docs));
    })

    // adding new service
    app.post('/addService', (req, res) => {
        const name = req.body.name;
        const desc = req.body.description;
        const file = req.files.file;
        const filePath = `${__dirname}/icons/${file.name}`;
        file.mv(filePath, err => {
            if(err) { console.log(err) }
            const encodeImg = fs.readFileSync(filePath, 'base64');
            const image = { 
                contentType: file.mimetype,
                size: file.size,
                img: Buffer(encodeImg, 'base64')
            }
            const newService = {name, desc, image};
            servicesCollection.insertOne(newService)
            .then(result => {
                fs.remove(filePath)
                res.send(result.insertedCount > 0)
            })
        })
    })

    // adding new admin
    app.post('/makeAdmin', (req, res) => {
        const newAdmin = req.body;
        adminCollection.insertOne(newAdmin)
        .then(result => res.send(result.insertedCount > 0))
    })

    // updating order
    app.patch('/edit/:id', (req, res) => {
        ordersCollection.updateOne({_id: ObjectId(req.params.id)},
        {$set: {
            status: req.body.status
        }})
        .then(result => res.send(result.modifiedCount > 0))
    })
});


app.get('/', (req, res) => {
	res.send('<h1>Welcome to ManPower Supply Server</h1>');
});

app.listen(process.env.PORT || 5050, () => console.log('I am listening from 5050'));