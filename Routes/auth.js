const router = require("express").Router();
const {User} = require("../server");
const Joi = require("joi");
const bcrypt = require("bcrypt");



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

module.exports= router