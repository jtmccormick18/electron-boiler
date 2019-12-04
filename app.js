const express = require('express');
const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 5000;
var serveStatic = require('serve-static');
var multer= require("multer");
const fileUpload = require('express-fileupload');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(express.static(path.join(__dirname, 'public')));
app.use('/image', serveStatic('C:/Temp/pics'));
app.use(fileUpload());


const db = require("./models");

//pull in API Routes
require('./routes/api-routes')(app);

// app.get('*', function (req, res) {
//     res.sendFile(path.join(__dirname, 'public','index.html'), function (err) {
//         if (err) {
//             res.status(500).send(err)
//         }
//     })
// })

db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
        console.log(`App listening on PORT ${PORT}`);
    });
}).catch(function (err) {
    app.listen(PORT, function () {
        console.log(err);
    })
})