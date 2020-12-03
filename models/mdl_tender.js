function BalikanHeaderFINAL (stsres, stsdes, stsfal, note, req, receivetime, datanya) {
	var helpernya = require('../definitions/helper');

	var teksnya = helpernya.BalikanHeaderFINALOK(stsres, stsdes, stsfal, note, req, receivetime, datanya);
	return teksnya;
};

exports.APIOpenListTender = function(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime){
    var initializePromise = OpenListTender(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime);
    initializePromise.then(function() {
        
    }, function(err) {
        console.log(err);
        self.json(JSON.parse(BalikanHeaderFINAL("false", err, "error", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "")));
    });
};

function OpenListTender(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime) {
	return new Promise(function(resolve, reject) {
        var async = require('async');
		var nosql = NOSQL('dt_tender');
		var buatjson = [];
		var buatjsonbaru = [];
		var totalpagenya = 1;

		if (page < 0 || typeof page != "number") {
			reject('Nilai halaman tidak bisa kurang dari 0 (nol).');
		}
		if (limit < 0 || typeof limit != "number") {
			reject('Jumlah row tiap halaman tidak bisa kurang dari 0 (nol).');
		}
		try {
			nosql.find().make(function(builder) {
                builder.where('status_active_id', 1);
                if (katakunci != undefined && katakunci != '') {
                    builder.or();
                    builder.search('kode', katakunci);
                    builder.search('nama_paket', katakunci);
                    builder.search('tendel_label', katakunci);
                    builder.search('instansi', katakunci);
                    builder.search('tahap', katakunci);
                    builder.search('kategori', katakunci);
                    builder.search('sistem_pengadaan', katakunci);
                    builder.search('tahun_anggaran', katakunci);
                    builder.search('nilai_kontrak', katakunci);
                    builder.end();
                }
                if (page > 0 && limit > 0) {
                    builder.paginate(page, limit);
                }
                var nilaiasc = false; //descending
                if (sortbyasc == 1) {
                    nilaiasc = true;  //ascending
                }
                if (sortby == 1) {
                    builder.sort('kode', nilaiasc);
                } else if (sortby == 2) {
                    builder.sort('nama_paket', nilaiasc);
                } else if (sortby == 3) {
                    builder.sort('tender_label', nilaiasc);
                } else if (sortby == 4) {
                    builder.sort('instansi', nilaiasc);
                } else if (sortby == 5) {
                    builder.sort('nilai_kontrak', nilaiasc);
                } else {
                    builder.sort('kode', false); //descending
                }
				builder.callback(function(err, response, count) {
					if (err) throw(err);
					
					if (count > 0) {
                        var index = 0;
						async.each(response, function(isinya, callback) {
                            var buatjsonarr = {
                                tender_id: response[index].tender_id,
                                url_tender_id: response[index].url_tender_id,
                                url_tender_link: response[index].url_tender_link,
                                kode: response[index].kode,
                                nama_paket: response[index].nama_paket,
                                tender_label: response[index].tender_label,
                                instansi: response[index].instansi,
                                tahap: response[index].tahap,
                                hps: response[index].hps,
                                kategori: response[index].kategori,
                                sistem_pengadaan: response[index].sistem_pengadaan,
                                tahun_anggaran: response[index].tahun_anggaran,
                                nilai_kontrak: response[index].nilai_kontrak,
                                created_date: response[index].created_date,
                                modified_date: response[index].modified_date,
                                status_active_id: response[index].status_active_id,
                             }
                            buatjson.push(buatjsonarr);
                            index = index + 1;
                            callback(null, "");
						}, function(err) {
                            if (err) throw err;
                        });
                        if (buatjson.length > 0) {
                            self.json(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka Data Tender.", "", "Total semua data: " + count, JSON.stringify(req), receivetime, JSON.stringify(buatjson))));					
                            resolve("Berhasil buka data tender.");
                        } else {
                            reject("Tidak ada data tender.");
                        }
					} else {
						reject("Tidak ada data tender.");
					}
				});
			});
		} catch(err) {
			reject(err);
		}
	});
};