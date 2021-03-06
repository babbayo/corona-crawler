const express = require('express')
const request = require('request');
const moment = require('moment-timezone');
const seoul = require("./crawler/seoul");
// const seoulMapTrace = require("./seoul-map-trace");

// mongo setting
const mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect(process.env.MONGODB_URI);
var Seoul = mongoose.model('Seoul', new Schema({}, {strict: false, timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }}));

// web setting
const path = require('path')
const PORT = process.env.PORT || 5000

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/time', (req, res) => res.json(Date.now().toString()))
    .get('/seoul', (req, res) => {
        const query = {}
        if (req.query.webIndex) query.webIndex = req.query.webIndex
        if (req.query.patientNumber) query.patientNumber = req.query.patientNumber
        Seoul.find(query, function (err, list) {
            if (err) return res.status(500).send({error: 'database failure'});
            const result = list.map(function (el) {
                const obj = el.toObject()
                obj.updatedAt = moment(el.updatedAt).tz('Asia/Seoul').format();
                obj.createdAt = moment(el.createdAt).tz('Asia/Seoul').format();
                return obj
            })
            res.json(result);
        })
    })
    .get('/seoul/crawl', (req, res) => {
        seoul.crawling(function (personList) {
            res.send(personList[0])
        })
    })
    .get('/seoul/crawl-and-save', (req, res) => {
        // var now = new Date()
        var now = moment().tz('Asia/Seoul').format();
        seoul.crawling(function (personList) {
            personList.forEach((el, idx) => {
                Seoul.findOneAndUpdate({"webIndex": el.webIndex}, el, {
                    new: true,
                    upsert: true // Make this update into an upsert
                }, function (err, updatedEl) {
                    if (err) return res.status(500).json({error: 'database failure'});
                    if (idx === 0) {
                        res.send(updatedEl)
                    }
                });
            });

        })
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`))