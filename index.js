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
			img: Buffer.from(encodeImg, 'base64')
		}
		const newService = {name, desc, image};
		servicesCollection.insertOne(newService)
		.then(result => {
			fs.remove(filePath)
			res.send(result.insertedCount > 0)
		})
	})
})
app.delete('/delete/:id' ,(req, res) => {
    const id = ObjectID(req.params.id);
    servicesCollection.deleteOne({_id: id})
    .then(result => {
      res.send(result.deletedCount > 0)
    })
  })


	// Added Review Information
	app.post('/addReviews', (req, res) => {
		const newVolunteer = req.body;
		reviewsCollection.insertMany(newVolunteer).then((result) => {
			console.log(result, 'Review Inserted');
			res.send(result.insertedCount > 0);
		});
	});

	// Get all reviewsInformation
	app.get('/Reviews', (req, res) => {
		reviewsCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// Added Customer Review
	app.post('/addSingleReview', (req, res) => {
		const NewReview = req.body;
		reviewsCollection.insertOne(NewReview).then((result) => {
			res.send(result);
			console.log(result.insertedCount);
		});
	});

	// Added a new admin
	app.post('/addAdmin', (req, res) => {
		const userAdmin = req.body;
		adminCollection.insertOne(userAdmin).then((result) => {
			res.send(result);
			console.log(result.insertedCount);
		});
	});

	// Added admin access
	app.get('/getAdmin', (req, res) => {
		adminCollection.find({ email: req.query.email }).toArray((err, documents) => {
			res.send(documents.length > 0);
		});
	});


	// adding order
    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        ordersCollection.insertOne(newOrder)
        .then(result => res.send(result.insertedCount > 0))
    })

	// Added Order Information
	app.post('/addNewOrder', (req, res) => {
		const file = req.files.file;
		const img = req.body.img;
		const name = req.body.name;
		const email = req.body.email;
		const price = req.body.price;
		const company_name = req.body.company_name;
		const details = req.body.details;
		const status = req.body.status;
		const newImg = file.data;
		const encImg = newImg.toString('base64');

		var image = {
			contentType: file.mimetype,
			size: file.size,
			img: Buffer.from(encImg, 'base64')
		};

		ordersCollection
			.insertOne({
				name,
				email,
				image,
				price,
				company_name,
				details,
				status,
				img
			})
			.then((result) => {
				res.send(result.insertedCount > 0);
				console.log(result.insertedCount);
			});
	});

	// Get Order Information
	app.get('/getAllOrder', (req, res) => {
		ordersCollection.find({}).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// Get Customer Information
	app.get('/getMyOrder', (req, res) => {
		ordersCollection.find({ email: req.query.email }).toArray((err, documents) => {
			res.send(documents);
		});
	});

	// Update order status
	app.patch('/updateStatus/:id', (req, res) => {
		ordersCollection
			.updateOne(
				{ _id: ObjectId(req.params.id) },
				{
					$set: { status: req.body.status }
				}
			)
			.then((result) => {
				res.send(result);
			});
	});
});

app.get('/', (req, res) => {
	res.send('<h1>Welcome to ManPower Supply Server</h1>');
});

app.listen(process.env.PORT || 5050, () => console.log('I am listening from 5050'));