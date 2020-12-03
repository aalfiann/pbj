exports.install = function() {
    ROUTE('/urltender', urltender);
    ROUTE('/scrapweb', scrapweb);
};

function urltender() {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
    var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
    
    var helpernya = require('../definitions/helper');
	var self = this;
    self.model = self.body;

    var initializePromise =  helpernya.geturltender('lpse', self.model, receivetime);
    initializePromise.then(function(result) {
        console.log(result);
    }, function(err) {
        console.log(err);
    });
};

function scrapweb() {
    var scrapwebnya = require('../definitions/scrapweb');
	scrapwebnya.runScrapper();
};