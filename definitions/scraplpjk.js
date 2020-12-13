var https = require('follow-redirects').https;
var fs = require('fs');

var qs = require('querystring');

var options = {
    'method': 'POST',
    'hostname': 'search.lpjk.net',
    'path': '/search_badan_usaha/searching_bu',
    'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
    },
    'maxRedirects': 20
};

function prepareParameter(querySearch, option, isActive) {
    return qs.stringify({
        'racord': querySearch,
        'option': option,
        'status_reg': isActive ? 'aktif' : 'proses'
    });
}

const CallSearchLPJK = async (querySearch, option, isActive) => {
    var postData = prepareParameter(querySearch, option, isActive);
    var req = https.request(options, function (res) {
        var chunks = [];
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
        res.on("end", function (chunk) {
            var body = Buffer.concat(chunks);
            /** 
             * Returning Data As JSON
             */
            var data = JSON.parse(body.toString());

            var dataRecord = data.record;
            var links = [];
            dataRecord.forEach(elem1 => {
                links.push(elem1.link);

            });
            data.records.forEach((elem2) => {
                if (links.includes(elem2.link)) {
                    console.log("data match:" + elem2.link);
                } else {
                    links.push(elem2.link);
                }
            });
            console.log(data.record);
        });
        res.on("error", function (error) {
            console.error(error);
        });
    });
    req.write(postData);
    req.end();
    
}
module.exports = {
    CallSearchLPJK
}