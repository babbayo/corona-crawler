const cheerio = require('cheerio');
const request = require('request');

module.exports = {
    crawling: function (callback) {
        const options = {
            url: "http://news.seoul.go.kr/welfare/archives/513105"
        }

        // request 모듈을 사용하여 원하는 url로 call 전송
        request(options, function (error, response, body) {
            // 해당 콜에 대한 응답을 받아 cheerio를 통해 파싱, jQuery처럼 사용하기위해 $변수에 할당
            const $ = cheerio.load(body);
            const $trs = $('#patients table tbody tr');

            const list = [];
            for (let i = 0; i < $trs.length; i = i + 2) {
                const onePersonData = {};
                const $tdsFirst = $($trs[i]).find('td');
                const $tdsSecond = $($trs[i + 1]).find('td');

                for (let j = 0; j < $tdsFirst.length; j++) {
                    if (j === 0) {
                        const $ps = $($tdsFirst[j]).find("p")
                        onePersonData.webIndex = $($ps[0]).text(); // 연번: 77
                        onePersonData.patientNumber = $($ps[1]).text(); //환자번호: (확인중) 또는 #123
                    } else if (j === 1) {
                        onePersonData.patientInfo = $($tdsFirst[j]).text(); //인적사항: 한국인 (남, '87)
                    } else if (j === 2) {
                        onePersonData.patientCaseInfo = $($tdsFirst[j]).text(); //감염경로: 서울65번 접촉자
                    } else if (j === 3) {
                        onePersonData.patientConfirmedAt = $($tdsFirst[j]).text(); //확진일: 2/27
                    } else if (j === 4) {
                        onePersonData.liveInRegion = $($tdsFirst[j]).text(); //거주지: 강남구
                    } else if (j === 5) {
                        onePersonData.liveInRegion = $($tdsFirst[j]).text(); //격리시설: 확인중 또는 서울의료원
                    }
                }

                const $liFromTdsSecond = $($tdsSecond[0]).find("li")
                const pathInfoList = [];
                for (let j = 0; j < $liFromTdsSecond.length; j++) {
                    const rawText = $($liFromTdsSecond[j]).text();
                    const dateStr = $($liFromTdsSecond[j]).find("strong").text(); // 2월 25일 또는 2월 21~22일
                    const description = substract(rawText, dateStr);
                    const dateList = getDate(dateStr)
                    pathInfoList[j] = {
                        "dateStr": dateStr,
                        "date": dateList[0],
                        "endDate": dateList[1],
                        "description": description
                    }
                }
                onePersonData.pathInfoList = pathInfoList
                list[i] = onePersonData
            }
            callback(list)
        });
    }
}

function substract(fullstr, partstr) {
    var start = fullstr.indexOf(partstr);
    var end = start + partstr.length;
    return fullstr.substring(0, start - 1) + fullstr.substring(end);
}

function getDate(dateStr) {
    if (dateStr== null || dateStr === '') {
        return ['', '']
    }
    // var dateString = '2월 23일~26일";
    var reggie = /(\d+)/;
    var dateArray = reggie.exec(dateStr);
    if (dateArray.length < 2) {
        console.log(dateStr)
        return ['', '']
    }
    var monthTemp = dateArray[0];
    var dayTemp = dateArray[1];
    var endMonthTemp = dateArray.length === 4 ? dateArray[2] : monthTemp;
    var endDayTemp = dateArray.length === 3 ? dateArray[2] : (dateArray.length === 4 ? dateArray[3] : '');

    var month = monthTemp.length === 1 ? '0' + monthTemp : monthTemp
    var day = dayTemp.length === 1 ? '0' + dayTemp : dayTemp
    var endMonth = endMonthTemp.length === 1 ? '0' + endMonthTemp : endMonthTemp
    var endDay = endDayTemp.length === 1 ? '0' + endDayTemp : endDayTemp

    var date = `2020-` + month + '-' + day
    var endDate = endDayTemp === '' ? '' : (`2020-` + endMonth + '-' + endDay)
    return [date, endDate];
}