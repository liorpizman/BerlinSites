var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var cors = require('cors');
app.use(cors());
var DB = require('./app/DataBase');
var jwt = require('jsonwebtoken');
var path = require('path');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api', appRoutes);

app.use(express.static(__dirname + '/public'));


const port = process.env.PORT || 3000;

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + "/public/app/views/index.html"));
});

app.listen(port, () => {
    console.log('Running server on port ' + port);
});

