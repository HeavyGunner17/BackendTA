const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken')
const User = require("../server");
const app = express();

app.post("/login", (req, res) => {
let body = req.body;
User.findOne({ email: body.email }, (err, usuarioDB) =>
{
//Si hay un error de conexión
if (err) {
return res.status(500).json({
ok: false,
err,
});
}
//Si el usuario no existe
if (!usuarioDB) {
return res.status(400).json({
ok: false,
err: {
message: "Usuario o contraseña incorrectos",
},
});
}
//Si el usuario existe chequeamos la contraseña
if (!bcrypt.compareSync(body.password,
usuarioDB.password)) {
18
return res.status(400).json({
ok:false,
err:{
message:'Usuario o contraseña incorrectos'
}
});
}
let token = jwt.sign(
    {
    User: usuarioDB,
    },
    process.env.SEED,
    { expiresIn: process.env.CADUCIDAD_TOKEN }
    );
    
//Si todo está ok
res.json({
ok:true,
User:usuarioDB,
token: token //Provisorio el token de prueba
})
});
});






module.exports = app;