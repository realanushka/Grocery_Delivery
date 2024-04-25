const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const Stripe = require('stripe');

// console.log(process.env);
const app = express();
app.use(cors());
app.use(express.json({limit:'20mb'}));
//{limit:20mb}

// MongoDB connection
console.log(process.env.MONGODB_URL);
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL)
.then(() => console.log("DB connected Successfully!"))
.catch((err) => console.log(err));

// Schema
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: {
        type : String,
        unique : true
    },
    password: String,
    confirmPassword: String,
    image: String,
});

// Models
const userModel = mongoose.model("user", userSchema);

// api
app.get('/', (req, res) => {
    res.send("Server is running");
})

// Sign Up API
app.post("/signup", async(req, res) => {
    console.log(req.body);
    const {email} = req.body;

    // userModel.findOne({email: email}, (err, result) => {
    //     console.log(result);
    //     console.log(err);
    //     if (result){
    //         res.send({message: "Email ID is already Registered!"});
    //     }
    //     else{
    //         const data = userModel(req.body);
    //         const save = data.save();
    //         res.send({message: "Successfully Registered!"});
    //     }
    // });

    try {
        const existingUser = await userModel.findOne({email:email});
        if (existingUser) {
            res.send({message: "User already Registered!", alert: false});
        }
        else {
            const newUser = new userModel(req.body);
            await newUser.save();
            res.send({message: "Successfully Registered!", alert: true});
        }
        
    } 
    catch (error) {
        console.log(error);
        res.status(500).send({message: "An error occurred while processing your request."});
    }
})

// Login API
app.post('/login',async(req, res) => {
    // console.log(req.body);

    const {email} = req.body; 
    // userModel.findOne({email: email}, (err, result) => {
    //     if (result){
    //         const dataSend ={
    //             _id : result._id,
    //             firstName : result.firstName,
    //             lastName : result.lastName,
    //             email : result.email,
    //             image: result.image,
    //         };
    //         console.log(dataSend);
    //         res.send({message: "Login Successfully!", alert: true, data: dataSend});
    //     }
    //     else{
    //         res.send({message: "Invalid Email", alert: false})
    //     }
    // })



    try {
        const user = await userModel.findOne({email:email});
        if (user) {
            const dataSend = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                image: user.image,
            }
            console.log(dataSend);
            res.send({message: "Login Successfully!", alert: true, data: dataSend});
        }
        else {
            res.send({message: "Invalid Email", alert: false})
        }
    } 
    catch (error) {
        console.log(error);
        res.status(500).send({message: "An error occurred while processing your request."});
    }
})


// New Product API
// Save Product in Database
const schemaProduct = mongoose.Schema({
    name: String,
    category: String,
    image: String,
    price: String,
    description: String,
})
const productModel = mongoose.model('Product', schemaProduct);

// app.post('/uploadProduct', async (req, res) => {
//     try {
//         const productData = req.body; // Assuming your request body contains the product data

//         const newProduct = new productModel(productData);
//         const savedProduct = await newProduct.save();

//         console.log(savedProduct);
//         res.send({ message: "Upload Successfully!" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send({ message: "Error while uploading product." });
//     }
// });

// app.post('/uploadProduct', async function (req, res) {
//     console.log(req.body);

//     productModel(req.body)
//         // .then(data  => {
//         //     return data.save();
//         // })
//         .then(dataSave => {
//             console.log(dataSave);
//             res.send({ message: "Upload Successfully!" });
//         })
//         .catch(error => {
//             console.error(error);
//             res.status(200).send({ message: "Error while uploading product." });
//         });
// });

app.post('/uploadProduct',async (req, res) => {
        console.log(req.body);

        const data = await productModel(req.body);
        const dataSave = await data.save();
        console.log(dataSave);
        // res.send({ message: "Upload Successfully!" });
        productModel.create(req.body)
            .then(dataSave => {
                
                console.log(dataSave);
                res.send({ message: "Upload Successfully!" });
            })
            .catch(error => {
                console.log(error);
                res.status(200).send({ message: "Error while uploading product." });
            });
    });
//


// app.post('/uploadProduct', async (req, res) => {
//     console.log(req.body);
//     try {
//         const data = await productModel(req.body);
//         const dataSave = await data.save();
//         console.log(dataSave);
//         res.send({ message: "Upload Successfully!" });
//     } 
//     catch (error) {
//         console.error(error);
//         res.status(500).send({ message: "Error while uploading product." });
//     }
// });


// app.post('/uploadProduct', async(req, res) => {
//     console.log(req.body);
//     const data = await productModel(req.body);
//     // data.save();
//     const dataSave = await data.save();
//     console.log(dataSave);
//     res.send({message: "Upload Successfully!"});
// });


//
app.get('/product', async(req, res) => {
    const data = await productModel.find({});
    res.send(JSON.stringify(data));
})



/*****PAYMENT GATEWAY*****/
// console.log(process.env.STRIPE_SECRET_KEY);

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
app.post("/checkout-payment", async(req, res) => {
    // console.log(req.body); 

    try {
        const params = {
            submit_type: 'pay',
            mode: 'payment',
            payment_method_types: ['card'],
            billing_address_collection: 'auto',
            shipping_options: [{shipping_rate : "shr_1NoUdzSIBdoyzxtfyaPxQFDe"}],

            line_items : req.body.map((item) => {
                return{
                    price_data: {
                        currency: "inr",
                        product_data:{
                            name: item.name,
                            // images: [item.image]
                        },
                        unit_amount : item.price * 100,
                    },
                    adjustable_quantity : {
                        enabled: true,
                        minimum: 1,
                    },
                    quantity: item.qty
                }
            }),

            success_url : `${process.env.FRONTEND_URL}/success`,
            cancel_url : `${process.env.FRONTEND_URL}/cancel`
        }
        const session = await stripe.checkout.sessions.create(params);
        res.status(200).json(session.id);
    } 
    catch (error) {
        res.status(error.statusCode || 500).json(error.message);
    }
    
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=> console.log("Server is running at Port:" + PORT));