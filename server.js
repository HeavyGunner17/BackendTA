const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const passwordComplexity = require("joi-password-complexity")
const bcrypt =require("bcrypt")
const router = require("express").Router();

require('dotenv').config();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: 'false'
}));


mongoose.connect("mongodb://localhost:27017/truthDB").catch((err => console.log(err)));





const postSchema = mongoose.Schema({
    nombre: String,
    estado: String,
    preguntas: [],
    categoria: String,
});

const userSchema = mongoose.Schema({
    nombre: String,
    username: String,
    email: String,
    password: String,
    rol: String,
});


const Post = mongoose.model("Post", postSchema);

userSchema.methods.generateAuthToken= function() {
    const token = jwt.sign({_id:this._id}, process.env.JWSPRIVATEKEY,{ expiresIn: "7d"})
    return token
};


const User = mongoose.model("User", userSchema);

const validateUser =(data) =>{
    const schema = Joi.object({
nombre:Joi.string().required().label("Nombre"),
username:Joi.string().required().label("Username"),
email:Joi.string().email().required().label("Email"),
password: passwordComplexity().required().label("Password"),
rol: Joi.string().required().label("rol")
    });
    return schema.validate(data)
};



app.post('/adm', (req, res) => {
    Post.create({
        nombre: req.body.nombre,
        estado: req.body.estado,
        preguntas: req.body.preguntas,
        categoria: req.body.categoria
    })
        .then((doc) => console.log(doc))
        .catch((err) => console.log(err));
});

app.post('/users', (req, res) => {
    User.create({
        nombre: req.body.nombre,
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        rol: "usuario"
    })
        .then((doc) => console.log(doc))
        .catch((err) => console.log(err));
});


app.get("/users", (req, res) => {
    User.find().then(items => res.json(items))
        .catch((err) => console.log(err))
});

app.get("/posts", (req, res) => {
    Post.find().then(items => res.json(items))
        .catch((err) => console.log(err))
});


app.delete("/delete/:id", (req, res) => {
    Post.findByIdAndDelete({ _id: req.params.id })
        .then((doc) => console.log(doc))
        .catch((err) => console.log(err));
});

app.put("/update/:id", (req, res) => {
    Post.findByIdAndUpdate({ _id: req.params.id },
        {
            nombre: req.body.nombre,
            estado: req.body.estado,
            preguntas: req.body.preguntas,
            categoria: req.body.categoria
        })
        .then((doc) => console.log(doc))
        .catch((err) => console.log(err));
});


//Routes/users
router.post("/", async (req,res) =>{
    try{
        const {error} = validate(req.body);
        if (error)
        return res.status(400).send({
    message: error.details[0].message});
    const user = await User.findOne({email:req.body.email});
    if (user)
    return res.status(409).send({
message:"Este email ya existe"});

const salt= await bcrypt.genSalt(Number(process.env.SALT));
const hashPassword = await bcrypt.hash(req.body.password,salt);

await new User({...req.body,password:hashPassword}).save()
res.status(201).send({message:"Usuario creado exitosamente."})

    }catch (error){
res.status(500).send({message:"error en el servidor"})
    }
})

//Routes/auth
router.post("/", async(req,res) =>{
    try{
const {error} = validate(req,body);
if (error)
return res.status(400).send({message:error.details[0].message});
if (!user)
return res.status(401).send({message:"Contraseña o Email invalido"});

const validPassword =await bcrypt.compare(
    req.body.password, User.password
);
if(!validPassword)
return res.status(401).send({message:"Contraseña o Email invalido"});

const token = User.generateAuthToken();
res.status(200).send({data:token, message:"Se conectó exitosamente"})

    }catch(error){
res.status(500).send({message:"error interno en el servidor"})
    }
})

const validate = (data) => {
    const schema =Joi.object({
        email:Joi.string().email().required().label("Email"),
        password:Joi.string().required().label("Password")
    });
    return schema.validate(data);
}

app.get('/ ', (req, res) => {
    res.send('Bienvenido al servidor del Backend')
});

app.listen(5000, function () {
    console.log('El server esta funcionando')
});
