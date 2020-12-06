function BalikanHeaderFINAL (stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord) {
	var teksnya;
	var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var responsetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
	var ttl = 0;
	if (receivetime !== undefined && receivetime !== "") {
		ttl = new Date(responsetime) - new Date(receivetime);
	}
	if (datanya == '') {
		teksnya = '{"sts_res":"' + stsres + '", "sts_des":"' + stsdes + '", "sts_fal":"' + stsfal + '", "totalrecord":"' + parseInt(totalrecord) + '", "note":"' + note + '", "time_req":"' + receivetime + '", "time_res":"' + responsetime + '", "ttl":"' + ttl + ' ms", "param_req":[' + req + ']}';
	} else {
		if (datanya.length > 0) {
			teksnya = '{"sts_res":"' + stsres + '", "sts_des":"' + stsdes + '", "sts_fal":"' + stsfal + '", "totalrecord":"' + parseInt(totalrecord) + '","note":"' + note + '", "time_req":"' + receivetime + '", "time_res":"' + responsetime + '", "ttl":"' + ttl + ' ms", "param_req":[' + req + '], "data":' + datanya + '}';
		} else {
			teksnya = '{"sts_res":"' + stsres + '", "sts_des":"' + stsdes + '", "sts_fal":"' + stsfal + '", "totalrecord":"' + parseInt(totalrecord) + '","note":"' + note + '", "time_req":"' + receivetime + '", "time_res":"' + responsetime + '", "ttl":"' + ttl + ' ms", "param_req":[' + req + '], "data":[' + datanya + ']}';
		}
	}
	return teksnya;
};

exports.BalikanHeaderFINALOK = function(stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord) {
	var teksnya = BalikanHeaderFINAL(stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord);
	return teksnya;
};

exports.geturltender = function (type, req, receivetime) {
    return new Promise(function(resolve, reject) {
       try {
            var initializePromise = geturltender(type, req, receivetime); 
            initializePromise.then(function(result) {
                resolve(result);
            }, function(err) {
				reject(err);
            });
       } catch(err) {
           reject(JSON.parse(BalikanHeaderFINAL("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
       }
   });
};

function geturltender(type, req, receivetime){
	return new Promise(function(resolve, reject) {
		var db = DBMS();

		try {
			db.query('SELECT * FROM num_url_tender WHERE status_active_id=1 OR url_tender_type=$1', [type]).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
					resolve(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka URL.", "", "Perhatikan URL yang tampil.", JSON.stringify(req), receivetime, JSON.stringify(response), response.length)));
				} else {
					reject(JSON.parse(BalikanHeaderFINAL("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
				}
            });
		} catch(err) {
			reject(JSON.parse(BalikanHeaderFINAL("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
		}
	});
};