exports.install = function() {
    //ROUTE('/urltender', urltender);
    //ROUTE('/bukapostgresql', bukapostgresql);
    //ROUTE('/insertpostgresql', insertpostgresql);

    //ROUTE('/scrapwebpengumuman', scrapwebpengumuman);

    ROUTE('/scraplpse', scraplpse);
    ROUTE('/scrapweb', scrapweb);
    ROUTE('/scrapwebpeserta', scrapwebpeserta);
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

function scraplpse() {
    var scraplpsenya = require('../definitions/scraplpse');
	scraplpsenya.getLpseURL();
};

function scrapwebpengumuman() {
    var scrapwebpengumumannya = require('../definitions/scrapwebpengumuman');
	scrapwebpengumumannya.getWebPengumuman();
};

function scrapwebpeserta() {
    var scrapwebpesertanya = require('../definitions/scrapwebpeserta');
	scrapwebpesertanya.getWebPeserta();
};

function bukapostgresql() {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
    var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
    
    var postgresqlnya = require('../definitions/postgresql');
	var self = this;
    self.model = self.body;

    var initializePromise =  postgresqlnya.bukapostgresql(self.model, receivetime);
    initializePromise.then(function(result) {
        console.log(result);
    }, function(err) {
        console.log(err);
    });
};

function insertpostgresql() {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
    var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
    
    var postgresqlnya = require('../definitions/postgresql');
	var self = this;
    self.model = self.body;

    var initializePromise =  postgresqlnya.insertpostgresql(self.model, receivetime);
    initializePromise.then(function(result) {
        console.log(result);
    }, function(err) {
        console.log(err);
    });
};