exports.install = function() {
    CORS('/num/*', ['get', 'post', 'put', 'delete'], true);
    
	ROUTE('POST /num/sortby/', sortby, ['authorize', 25000]);
	ROUTE('POST /num/sortby/', error401, ['unauthorize', 25000]);
	ROUTE('POST /num/filterby/', filterby, ['authorize', 25000]);
	ROUTE('POST /num/filterby/', error401, ['unauthorize', 25000]);
	ROUTE('POST /num/tahap/', datatahap, ['authorize', 25000]);
	ROUTE('POST /num/tahap/', error401, ['unauthorize', 25000]);
	ROUTE('POST /num/lpse/', lpse, ['authorize', 25000]);
	ROUTE('POST /num/lpse/', error401, ['unauthorize', 25000]);
	ROUTE('POST /num/kategori/', kategori, ['authorize', 25000]);
	ROUTE('POST /num/kategori/', error401, ['unauthorize', 25000]);
	ROUTE('POST /num/hps/', hps, ['authorize', 25000]);
	ROUTE('POST /num/hps/', error401, ['unauthorize', 25000]);
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

function datatahap() {
	var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
	
	var modelnya = require('../models/mdl_num');
	var self = this;

	self.model = self.body;

    modelnya.APIOpennumTahap(self, self.model, receivetime);
};

function sortby() {
	var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
	
	var modelnya = require('../models/mdl_num');
	var self = this;

	self.model = self.body;

	if (self.model.sortbytypeid === undefined) {
		self.json(JSON.parse(BalikanHeaderFINAL("false", "Invalid Parameter!", "invalidparameter", "Perhatikan parameter yang dikirimkan, ada yang kurang.", JSON.stringify(self.model), receivetime, "", 0)));
	} else {
		if (self.model.sortbytypeid === "") {
			self.json(JSON.parse(BalikanHeaderFINAL("false", "Parameter tidak boleh kosong.", "tidakbolehkosong", "Perhatikan parameter yang dikirimkan, ada yang tidak boleh kosong.", JSON.stringify(self.model), receivetime, "", 0)));
		} else {
			modelnya.APIOpennumSortby(self.model.sortbytypeid, self, self.model, receivetime);
		}
	}
};

function filterby() {
	var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
	
	var modelnya = require('../models/mdl_num');
	var self = this;

	self.model = self.body;

	if (self.model.filterbytypeid === undefined) {
		self.json(JSON.parse(BalikanHeaderFINAL("false", "Invalid Parameter!", "invalidparameter", "Perhatikan parameter yang dikirimkan, ada yang kurang.", JSON.stringify(self.model), receivetime, "", 0)));
	} else {
		if (self.model.filterbytypeid === "") {
			self.json(JSON.parse(BalikanHeaderFINAL("false", "Parameter tidak boleh kosong.", "tidakbolehkosong", "Perhatikan parameter yang dikirimkan, ada yang tidak boleh kosong.", JSON.stringify(self.model), receivetime, "", 0)));
		} else {
			modelnya.APIOpennumFilterby(self.model.filterbytypeid, self, self.model, receivetime);
		}
	}
};

function lpse() {
	var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
	
	var modelnya = require('../models/mdl_num');
	var self = this;

	self.model = self.body;

	modelnya.APIOpennumLPSE(self, self.model, receivetime);
};

function kategori() {
	var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
	
	var modelnya = require('../models/mdl_num');
	var self = this;

	self.model = self.body;

	modelnya.APIOpennumKategori(self, self.model, receivetime);
};

function hps() {
	var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
	
	var modelnya = require('../models/mdl_num');
	var self = this;

	self.model = self.body;

	modelnya.APIOpennumHPS(self, self.model, receivetime);
};