const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose')



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
    respuestas: [],
    categoria: [],
});

const userSchema = mongoose.Schema({
    nombre: String,
    username: String,
    email: String,
    password: String,
    rol: String,
});


const Post = mongoose.model("Post", postSchema);
const User = mongoose.model("User", userSchema);




app.post('/adm', (req, res) => {
    Post.create({
        nombre: req.body.nombre,
        estado: req.body.estado,
        preguntas: req.body.preguntas,
        respuestas: req.body.respuestas,
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
            respuestas: req.body.respuestas,
            categoria: req.body.categoria
        })
        .then((doc) => console.log(doc))
        .catch((err) => console.log(err));
});


app.get('/ ', (req, res) => {
    res.send('Bienvenido al servidor del Backend')
});

app.listen(5000, function () {
    console.log('El server esta funcionando')
});
