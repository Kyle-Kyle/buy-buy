var express = require('express');
var app = require('./index');

app.use(express.static('../Frontend'));
