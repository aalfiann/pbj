var sedangjalan = 0;

async function scrapwebtender() {
    var scrapwebnya = require('../definitions/scrapwebtender');
    await scrapwebnya.runScrapper();
    sedangjalan = 0;
};

var AutoRunTender = setInterval(function() {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var tanggalambil = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
    
    if (tanggalambil.substr(11,8) >= "01:00:00" && tanggalambil.substr(11,8) <= "05:00:00") {
        if (sedangjalan == 0) {
            sedangjalan = 1;
            scrapwebtender();
        }
    }
},1000);