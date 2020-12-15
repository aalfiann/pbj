exports.install = function() {
    CORS('/perusahaan/*', ['get', 'post', 'put', 'delete'], true);
    ROUTE('POST /perusahaan/dataperusahaan/', dataperusahaan, ['authorize', 35000]);
	ROUTE('POST /perusahaan/dataperusahaan/', error401, ['unauthorize', 35000]);
};

function BalikanHeaderFINAL (stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord) {
	var helpernya = require('../definitions/helper');

	var teksnya = helpernya.BalikanHeaderFINALOK(stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord);
	return teksnya;
};

function error401() {
	var self = this;
	var buatbalikanreg = '{}';
	self.json(JSON.parse(buatbalikanreg));
};

function dataperusahaan() {
	var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
	
	var modelnya = require('../models/mdl_tender_peserta');
	var self = this;

	self.model = self.body;
    if (self.model.katakunci === undefined || self.model.sortby === undefined || self.model.sortbyasc === undefined || self.model.filterby === undefined || self.model.filter === undefined || self.model.page === undefined || self.model.limit === undefined) {
		self.json(JSON.parse(BalikanHeaderFINAL("false", "Invalid Parameter!", "invalidparameter", "Perhatikan parameter yang dikirimkan, ada yang kurang.", JSON.stringify(self.model), receivetime, "", 0)));
	} else {
		if (self.model.filterby === "" || self.model.page === "" || self.model.limit === "") {
			self.json(JSON.parse(BalikanHeaderFINAL("false", "Parameter tidak boleh kosong.", "tidakbolehkosong", "Perhatikan parameter yang dikirimkan, ada yang tidak boleh kosong.", JSON.stringify(self.model), receivetime, "", 0)));
		} else {
			modelnya.APIOpenPerusahaan(self.model.katakunci, self.model.sortby, self.model.sortbyasc, self.model.filterby, self.model.filter, self.model.page, self.model.limit, self, self.model, receivetime);
		}
	}
};