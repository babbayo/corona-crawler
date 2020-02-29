const request = require('request');

module.exports = {
    crawling: function () {
        const options = {
            url: "https://map.seoul.go.kr/smgis/webs/templateMap/templateMap.do?mode=getContentsListByTime",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'User-Agent': 'request'
            },
            form: {themeId: 11101834}
        };

        // request 모듈을 사용하여 원하는 url로 call 전송
        request.post(options, function (error, response, body) {
            // 해당 콜에 대한 응답을 받아 cheerio를 통해 파싱, jQuery처럼 사용하기위해 $변수에 할당
            const resObj = JSON.parse(body)
            console.log(resObj.result[0])
        });
    }
}
