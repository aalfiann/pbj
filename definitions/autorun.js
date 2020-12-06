function scrapweb() {
    var scrapwebnya = require('../definitions/scrapweb');
    scrapwebnya.runScrapper();
};

var AutoRunTender = setInterval(function() {
    //scrapweb();
    clearInterval(AutoRunTender);
},2000);