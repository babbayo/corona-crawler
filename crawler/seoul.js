const seoulPerson = require("./seoul-person");
const seoulMapTrace = require("./seoul-map-trace");

module.exports = {
    crawling: function (callback) {
        seoulPerson.crawling(function (personList) {
            seoulMapTrace.crawling(function (traceList) {
                const traceMap = toMap(traceList)
                const result = personList.map(el => {
                    var key = el.patientNumber
                    el.geoInfoList =  traceMap[key] || []
                    return el;
                })
                callback(result)
            })
        })
    }
}

function toMap(arr) {
    return arr.reduce(function (map, obj) {
        const rawIdx = obj["cot_conts_id"]
        // console.log(rawIdx)
        const list = parseRawIdx(rawIdx)
        obj.personNumberAndSeqs = list
        obj.personNumbers = list.map(el => el[0]).filter(onlyUnique)
        // console.log(obj)
        for (var i=0; i<obj.personNumbers.length; i++) {
            var key = obj.personNumbers[i]
            var tempList = map[key] || []
            // console.log(list)
            map[key] = tempList
            tempList.push(obj)
        }
        // console.log(map)
        return map;
    }, {});
}

function parseRawIdx(word) {
    if (word == null) {
        console.error(word)
        return []
    }

    // var dateString = '0003_001";
    // 0017_007+009
    // 0029_003+0030_002
    // 0029_005+0030_008+0083_004

    var regexFirst = /(\d+_\d+)/g;
    var regexSecond = /([1-9]\d*)/g;
    var listFirst = word.match(regexFirst)
    if (listFirst.length < 1) {
        console.error(listFirst)
        return []
    }
    var listSecond = [];
    for (var i = 0; i< listFirst.length; i++) {
        var it = listFirst[i]
        // console.log(it)
        var tempList = it.match(regexSecond)
        if (tempList.length === 1) {
            listSecond[i] = [listSecond[i-1][0], tempList[0]]
        } else {
            listSecond[i] = tempList
        }
    }
    return listSecond
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}