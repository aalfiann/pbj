const AutoRepairHPSTerjemahan = async () => {
    const initial = await repairbukahpsterjemahan();
};

module.exports = {
    AutoRepairHPSTerjemahan
};

function repairbukahpsterjemahan(){
	var waktumulaiINSERT = new Date();
	var async = require('async');
	var db = DBMS();
	db.query('SELECT * FROM dt_tender').callback(function(err, response) {
		if (err) throw err;

		console.log("REPAIR: " + response.length);
		if (response.length > 0) {
			async.each(response, function(isinya, callback) {
				var buattambahnol = '';
				var hps_terjemahan = '0';
				var hpsnya = isinya.hps;
				if (hpsnya != undefined && hpsnya != null && hpsnya != '') {
					if (hpsnya.toLowerCase().search("rb") != -1) {
						buattambahnol = "000";
					} else if (hpsnya.toLowerCase().search("jt") != -1) {
						buattambahnol = "000000";
					} else if (hpsnya.toLowerCase().search("m") != -1) {
						buattambahnol = "000000000";
					} else if (hpsnya.toLowerCase().search("t") != -1) {
						buattambahnol = "000000000000";
					}
					if (hpsnya.toLowerCase().search(",") > 0 || hpsnya.toLowerCase().search(".") > 0) {
						buattambahnol = buattambahnol.substr(0,buattambahnol.length-1);
					}
					hps_terjemahan = hpsnya.toLowerCase().replace(',','').replace('.','').replace('rb','').replace('jt','').replace('m','').replace('t','').replace('j','').replace(' ','');
					hps_terjemahan = hps_terjemahan + buattambahnol;
				}
				
				var utkupdate = [isinya.tender_id, hps_terjemahan];
				db.query('UPDATE dt_tender SET hps_terjemahan = $2 WHERE tender_id = $1', utkupdate).callback(function(err, response) {
					if (err) throw err;
					console.log("Check: " + hps_terjemahan);
				});
			}, function(err) {
				console.log(err);
			});
			hitungwaktu("REPAIR HPS", waktumulaiINSERT);
		} else {
			console.log("err: " + response.length);
			hitungwaktu("REPAIR HPS", waktumulaiINSERT);
		}
	});
};

function hitungwaktu(judulnya, waktumulai) {
    var waktuselesai = new Date();
    console.log("===" + judulnya + "===");
    var durasimsnya = Math.abs(waktuselesai.getTime() - waktumulai.getTime());
    var durasidetiknya = durasimsnya / 1000;
    console.log("Durasi: " + durasimsnya + " ms (" + durasidetiknya + " s)");
};