const express = require("express");
var { expressjwt: ejwt } = require("express-jwt");
const endpoints = require("./src/user.controller");
const cors = require("cors");
const User = require("./src/User");
const jwt = require("jsonwebtoken");
const pool = require('./src/database')

const app = express();
const port = 3050;

app.use(cors());
app.use(express.json());

app.post('/register', endpoints.register)
app.post('/login',endpoints.login)
app.get('/getResources', endpoints.protect, endpoints.protected)

app.get('/aqui', async(req,res)=>{
  const isUser = await pool.query('SELECT * FROM users',function(err,results,fields){
    console.log(results)
  })

  res.send('listas iran aqui')
})

app.listen(port, () => {
  console.log(`Server api is running at port ${port}`);
});
