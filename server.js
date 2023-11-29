const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt")




require('dotenv').config();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: 'false'
}));


mongoose.connect("mongodb+srv://HeavyGunner17:41WidJ7exIU4LyEI@cluster0.wkzcmtc.mongodb.net/?retryWrites=true&w=majority").catch((err => console.log(err)));



const postSchema = mongoose.Schema({
    nombre: String,
    estado: String,
    preguntas: [],
    categoria: String,
});

const Post = mongoose.model("Post", postSchema);



const userSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre es necesario"]
    },
    username: {
        type: String,
        required: [true, "El username es necesario"]
    },
    email: {
        type: String,
        required: [true, "El correo es necesario"],
        unique: true,
    },

    password: {
        type: String,
        required: true,

    },

    rol: {
        type: String,
        default: "usuario",
        required: true
    },
    token: {
        type: String,
        required: false
    }
});


const User = mongoose.model("User", userSchema);



app.put("/update/:id", (req, res) => {
    let body = _.pick(req.body,
        ['nombre', 'username', 'email', 'password', 'rol', 'token']);
    User.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true
    }, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        res.json({
            ok: true,
            User: usuarioDB
        })
    }
    )
});


userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWSPRIVATEKEY, { expiresIn: "7d" })
    console.log(token)
    return token
};


let verificaToken = (req, res, next) => {
    let token = req.get("token");
    jwt.verify(token, process.env.JWSPRIVATEKEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: "Token no válido",
                }
            });
        }
        req.usuario = decoded.usuario;
        next();
    })
};
//     {
//         nombre: req.body.nombre,
//             usuario: req.body.usuario,
//                 email: req.body.email,
//                     password: req.body.password,
//                         rol: req.body.rol
//     })
//     .then((doc) => console.log(doc))
//     .catch((err) => console.log(err));
// });




// const validateUser =(data) =>{
//     const schema = Joi.object({
// nombre:Joi.string().required().label("Nombre"),
// username:Joi.string().required().label("Username"),
// email:Joi.string().email().required().label("Email"),
// password: passwordComplexity().required().label("Password"),
// rol: Joi.string().required().label("rol")
//     });
//     return schema.validate(data)
// };



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
        password: bcrypt.hashSync(req.body.password, 10),
        rol: "usuario",
        token: ""
    })
        .then((doc) => console.log(doc))
        .catch((err) => console.log(err));
});


app.post("/users/:email", (req, res) => {
    User.findOne({ email: req.body.email }).then(user => {
        if (bcrypt.compareSync(req.body.password, user.password)) {
            let token = jwt.sign(
                {
                    User: user,
                },
                process.env.JWTPRIVATEKEY,
                { expiresIn: "7d" }
            );
            let userId = user._id
            User.findByIdAndUpdate(userId, { $set: { token: token } }).then((err, docs) => {
                if (docs) {
                    console.log(docs)
                } else {
                    console.log(err)
                }
            })
            res.json({
                ok: true,
                user: user.username,
                userEmail: user.email,
                userName: user.nombre,
                userRole: user.rol,
                token: token //Provisorio el token de prueba
            })
            res.status(201)
        } else {
            res.status(400)
            res.json({ response: 'el usuario o contraseña son incorrectos' })
        }
    })
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

app.get('/ ', (req, res) => {
    res.send('Bienvenido al servidor del Backend')
});

app.listen(5000, function () {
    console.log('El server esta funcionando')
});
