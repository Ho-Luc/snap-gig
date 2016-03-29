'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const User = require(__dirname + '/../models/users-schema');
const http = require('http');
const fs = require('fs');
const auth = require(__dirname + '/../lib/authentication');

module.exports = (publicRouter) => {
  publicRouter.route('/user')
    .post((req, res) => {
      req.on('data', (data) => {
        req.body = JSON.parse(data);
        console.log('INCOMING MOCHA DATA : ', req.body);
        console.log(req.body);
        let newUser = new User(req.body);
        newUser.save((err, user) => {
          if (err) {
            res.status(404).json({msg: 'Username already exists'});
            res.end();
          } else {
            res.status(200);
            res.json(user);
            res.end();
          };
        });
      });
    });

    publicRouter.route('/user/:id')
    .put(auth, (req, res) => {
      let userInfo = req.user._id;
      req.on('data', (data) => {
        req.body = JSON.parse(data);
        if (req.params.id == userInfo) {
          User.update({_id: req.params.id}, req.body, (err, user) => {
            if (err) {
              res.status(404).json({msg: 'User not found'});
              res.end();
            }
            res.status(200);
            res.json(user);
            res.end();
          });
        } else {
          res.status(404).json({msg: 'You do not have permissions to patch this user!'});
        }
      });
    })
    .delete(auth, (req, res) => {
      console.log('delete route hit');
      console.log('req user id is ', req.user._id);
      console.log('req params id is ', req.params.id);
      let userInfo = req.user._id;
      if (req.params.id == userInfo) {
        User.findById(req.params.id, (err, user) => {
          console.log('user is: ' + user);
          console.log('error is: ' + err);
          if (err) {
            res.status(404).json({msg: 'User not found'});
            res.end();
          }
          user.remove((err, user) => {
            if (err) {
              res.status(404).json({msg: 'User coundn\'t be deleted'});
              res.end();
            }
            res.status(200);
            res.json({msg: 'User ' + req.params.id + ' has been deleted.'});
            res.end();
          });
        });
      } else {
        console.log('in else no permission');
        res.status(404).json({msg: 'You do not have permissions to delete this user!'});
        res.end();
      }
    });
};
