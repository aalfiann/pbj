exports.install = function() {
    CORS('/num/*', ['get', 'post', 'put', 'delete'], true);
    ROUTE('POST /num/tahap/', datatahap, ['authorize', 25000]);
	ROUTE('POST /num/tahap/', error401, ['unauthorize', 25000]);
};

function BalikanHeaderFINAL (stsres, stsdes, stsfal, note,  req, receivetime, datanya, totalrecord) {
	var helpernya = require('../definitions/helper');

	var teksnya = helpernya.BalikanHeaderFINALOK(stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord);
	return teksnya;
};

function error401() {
	var self = this;
	var buatbalikanreg = '{}';
	self.json(JSON.parse(buatbalikanreg));
};

function datatahap() {
	var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
	
	var modelnya = require('../models/mdl_num');
	var self = this;

	self.model = self.body;

    modelnya.APIOpennumTahap(self, self.model, receivetime);
};