const seoulPerson = require("./seoul-person");
const seoulMapTrace = require("./seoul-map-trace");

module.exports = {
    crawling: function (callback) {
        seoulPerson.crawling(function (personList) {
            seoulMapTrace.crawling(function (traceList) {
                console.log(personList[82])
                console.log(traceList[0])
                callback(personList)
            })
        })
    }
}