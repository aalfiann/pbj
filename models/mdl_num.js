function BalikanHeaderFINAL (stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord) {
	var helpernya = require('../definitions/helper');

	var teksnya = helpernya.BalikanHeaderFINALOK(stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord);
	return teksnya;
};

exports.APIOpennumFilterby = function(filterbytypeid, self, req, receivetime){
    var initializePromise = OpennumFilterby(filterbytypeid, self, req, receivetime);
    initializePromise.then(function() {
        
    }, function(err) {
        console.log(err);
        self.json(JSON.parse(BalikanHeaderFINAL("false", err, "error", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
    });
};

function OpennumFilterby(filterbytypeid, self, req, receivetime) {
	return new Promise(function(resolve, reject) {
		var db = DBMS();
        
		try {
			var utkinput = [1, filterbytypeid];

			db.query('SELECT * FROM num_filter_by WHERE status_active_id = $1 AND filter_by_type_id = $2 ORDER BY no_urut ASC', utkinput).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
					self.json(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka data filter by.", "", "Total semua data: " + response.length, JSON.stringify(req), receivetime, JSON.stringify(response), parseInt(response.length))));					
					resolve("Berhasil buka filter by.");
				} else {
					reject("Tidak ada data filter by.");
				}
			});
		} catch(err) {
			reject(err);
		}
	});
};

exports.APIOpennumSortby = function(sortbytypeid, self, req, receivetime){
    var initializePromise = OpennumSortby(sortbytypeid, self, req, receivetime);
    initializePromise.then(function() {
        
    }, function(err) {
        console.log(err);
        self.json(JSON.parse(BalikanHeaderFINAL("false", err, "error", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
    });
};

function OpennumSortby(sortbytypeid, self, req, receivetime) {
	return new Promise(function(resolve, reject) {
		var db = DBMS();
        
		try {
			var utkinput = [1, sortbytypeid];

			db.query('SELECT * FROM num_sort_by WHERE status_active_id = $1 AND sort_by_type_id = $2 ORDER BY no_urut ASC', utkinput).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
					self.json(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka data sort by.", "", "Total semua data: " + response.length, JSON.stringify(req), receivetime, JSON.stringify(response), parseInt(response.length))));					
					resolve("Berhasil buka sort by.");
				} else {
					reject("Tidak ada data sort by.");
				}
			});
		} catch(err) {
			reject(err);
		}
	});
};

exports.APIOpennumTahap = function(self, req, receivetime){
    var initializePromise = OpennumTahap(self, req, receivetime);
    initializePromise.then(function() {
        
    }, function(err) {
        console.log(err);
        self.json(JSON.parse(BalikanHeaderFINAL("false", err, "error", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
    });
};

function OpennumTahap(self, req, receivetime) {
	return new Promise(function(resolve, reject) {
		var db = DBMS();
        
		try {
			db.query('SELECT * FROM num_tahap ORDER BY tahap_id ASC').callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
					self.json(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka data tahap.", "", "Total semua data: " + response.length, JSON.stringify(req), receivetime, JSON.stringify(response), parseInt(response.length))));					
					resolve("Berhasil buka tahap.");
				} else {
					reject("Tidak ada data tahap.");
				}
			});
		} catch(err) {
			reject(err);
		}
	});
};