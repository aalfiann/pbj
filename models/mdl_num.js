function BalikanHeaderFINAL (stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord) {
	var helpernya = require('../definitions/helper');

	var teksnya = helpernya.BalikanHeaderFINALOK(stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord);
	return teksnya;
};

exports.APIOpennumTahap = function(self, req, receivetime){
    var initializePromise = OpennumTahap(self, req, receivetime);
    initializePromise.then(function() {
        
    }, function(err) {
        console.log(err);
        self.json(JSON.parse(BalikanHeaderFINAL("false", err, "error", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, ""), 0));
    });
};

function OpennumTahap(self, req, receivetime) {
	return new Promise(function(resolve, reject) {
		var nosql = NOSQL('num_tahap');
        
		try {
			nosql.find().make(function(builder) {
                builder.sort('tahap', false);
				builder.callback(function(err, response, count) {
					if (err) throw(err);
					
					if (count > 0) {
                        self.json(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka data tahap.", "", "Total semua data: " + count, JSON.stringify(req), receivetime, JSON.stringify(response), parseInt(count))));					
                        resolve("Berhasil buka data tahap.");
					} else {
						reject("Tidak ada data tahap.");
					}
				});
			});
		} catch(err) {
			reject(err);
		}
	});
};