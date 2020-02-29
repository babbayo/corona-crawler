const cheerio = require('cheerio');
const request = require('request');

module.exports = {
    crawling: function () {
        const options = {
            url: "http://news.seoul.go.kr/welfare/archives/513105"
        }

        // request 모듈을 사용하여 원하는 url로 call 전송
        request(options, function (error, response, body) {
            // 해당 콜에 대한 응답을 받아 cheerio를 통해 파싱, jQuery처럼 사용하기위해 $변수에 할당
            const $ = cheerio.load(body);
            const $trs = $('#patients table tbody tr');

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
                    const date = $($liFromTdsSecond[j]).find("strong").text(); // 2월 25일 또는 2월 21~22일
                    const description = substract(rawText, date);
                    pathInfoList[j] = {
                        "date": date,
                        "description": description
                    }
                }
                onePersonData.pathInfoList = pathInfoList
                if (i == 0) {
                    console.log(onePersonData)
                }

            }
        });
    }
}

function substract(fullstr, partstr) {
    var start = fullstr.indexOf(partstr);
    var end = start + partstr.length;
    return fullstr.substring(0, start - 1) + fullstr.substring(end);
}