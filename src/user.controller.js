const bcrypt = require("bcrypt");
const User = require("./User");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const express = require("express");
const Cronometro = "./Cronometro";
var { expressjwt: ejwt } = require("express-jwt");
const pool = require("./database");

 const signToken = (user) =>
  jwt.sign({ user }, "mi-string-secreto", { expiresIn: "2 days" });

const endpoints = {
  register: async (req, res) => {
    const { body } = req;

    try {
      let query = await pool.query(
        "SELECT username FROM users where username = ?",[body.username],
        function (err, results) {
    
            if (results.length > 0) {
              res.status(403).send(`User ${body.username} already in use`);
              console.log("User already in use: ", body.username);
              return;
            }
            let createNewUser = async () => {
              const newUser = await pool.query("INSERT INTO users (username,password,name,lastname,rol) values(?,?,?,?,?)", [body.username,body.password,body.name,body.lastname,1]);
              console.log(`Username: ${body.username} is created`);
              console.log('newUser',newUser)
              res.status(200).send(`User ${body.username} has been created`)
            };
            createNewUser()
        }
      );

      //const salt = await bcrypt.genSalt();
      // const hashed = await bcrypt.hash(body.password, salt);
      //   const user = await User.create({
      //     username: body.username,
      //     password: hashed,
      //     salt,
      //   });

      // const signed = signToken(user._id);
      //   console.log(signed);
    } catch (err) {
      console.log(err);
      res.status(500).send(err);
    }
  },

  login: async (req, res) => {
    const { body } = req;
    try {
       await pool.query("SELECT username,password FROM users where username = ?",[body.username],async(err,results)=>{
        
        console.log('log del query', results[0].password)
        if (results.length===0) {
          res.status(403).send("User doesnt exist");
          console.log("User doesnt exist");
        } else {
          if (results[0].password===body.password) {
            const signed = signToken(results);
            res.status(200).send({ token: signed, username: results[0].username });
            console.log(
              `User: ${results[0].username} is connected with token: ${signed}`
            );
          } else {
            res.status(403).send("User or password are invalid");
            console.log("User or password are invalid");
          }
        }
       })
     
    } catch (err) {
      res.status(500).send(err.message);
      console.log(err);
    }
  },

  protect: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(403).send("no hay token");
    }

    jwt.verify(token, "mi-string-secreto", function (err, user) {
      console.log(err);
      if (err) return res.sendStatus(403);
      req.user = user.user[0].username;
      next();
    });
  },
  protected: async(req, res, next) => {
    console.log("LINEA 98",req.user);
    console.log(req.body.username)
    const userQuery = await pool.query('SELECT username FROM users where username = ?',[req.body.username])
    var subjectsQueries = []
    let rows= ''
     await pool.query('SELECT * FROM subjects', async(err,rows)=>{
      
      if(err){throw err}
      else{
        setValue(rows)
      }
    })
    let setValue = (value) => {
      subjectsQueries = value   
      console.log('queries: ', {user:req.user, subjects: subjectsQueries})
    res.status(200).send({user: req.user, subjects: subjectsQueries})

    }
    
  
    
  },
};

module.exports = endpoints;
