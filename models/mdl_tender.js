function BalikanHeaderFINAL (stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord) {
	var helpernya = require('../definitions/helper');

	var teksnya = helpernya.BalikanHeaderFINALOK(stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord);
	return teksnya;
};

exports.APIOpenListTender = function(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime){
    var initializePromise = OpenListTender(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime);
    initializePromise.then(function() {
        
    }, function(err) {
        console.log(err);
        self.json(JSON.parse(BalikanHeaderFINAL("false", err, "error", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
    });
};

function OpenListTender(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime) {
	return new Promise(function(resolve, reject) {
        var db = DBMS();
        var async = require('async');
		var buatjson = [];

        if (page < 0 || typeof page != "number") {
			reject('Nilai halaman tidak bisa kurang dari 0 (nol).');
		}
		if (limit < 0 || typeof limit != "number") {
			reject('Jumlah row tiap halaman tidak bisa kurang dari 0 (nol).');
        }
		try {
            var utkinput = [1];
            var sambungwhere = "WHERE (dt_tender.status_active_id = $1) ";
            if (katakunci != undefined && katakunci != null && katakunci != '') {
                katakunci =  "%" + katakunci.toLowerCase() + "%";
                utkinput =  [1, katakunci];
                sambungwhere = sambungwhere + "AND ((dt_tender.kode like $2) OR (dt_tender.nama_paket like $2) OR (dt_tender.tender_label like $2) OR (dt_tender.instansi like $2) OR (dt_tender.tahap like $2) OR (dt_tender.kategori like $2) OR (dt_tender.sistem_pengadaan like $2) OR (dt_tender.tahun_anggaran like $2) OR (dt_tender.nilai_kontrak like $2)) ";
            } else {
                katakunci =  "%" + katakunci.toLowerCase() + "%";
                utkinput =  [1, katakunci];
                sambungwhere = sambungwhere + "AND (dt_tender.kode like $2) ";
            }
            var sambungorderby = "";
            var sambunglimitoffset = "";

            var nilaiasc = "DESC "; //descending
            if (sortbyasc == 1) {
                nilaiasc = "ASC ";  //ascending
            }
            if (sortby == 1) {
                sambungorderby = "ORDER BY dt_tender.kode " + nilaiasc;
            } else if (sortby == 2) {
                sambungorderby = "ORDER BY dt_tender.nama_paket " + nilaiasc;
            } else if (sortby == 3) {
                sambungorderby = "ORDER BY dt_tender.tender_label " + nilaiasc;
            } else if (sortby == 4) {
                sambungorderby = "ORDER BY dt_tender.instansi " + nilaiasc;
            } else if (sortby == 5) {
                sambungorderby = "ORDER BY dt_tender.nilai_kontrak " + nilaiasc;
            } else {
                sambungorderby = "ORDER BY dt_tender.kode DESC ";
            }
            if (page > 0 && limit > 0) {
                var pagenya = (page - 1) * limit;
                sambunglimitoffset = "LIMIT " + limit + " OFFSET " + pagenya;
            }
            if (filterby.length > 0) {
                if (filterby.length <= filter.length) {
                    var nilaiparam = 0;
                    for (var i=0;i<filterby.length;i++) {
                        nilaiparam = i+3;
                        if (filterby[i] == 1) {
                            sambungwhere = sambungwhere + "AND (LOWER(dt_tender.url_tender_id) like $" + nilaiparam + ") ";
                            utkinput.push('%'+ filter[i].toLowerCase() + '%');
                        } else if (filterby[i] == 2) {
                            sambungwhere = sambungwhere + "AND (LOWER(dt_tender.instansi) like $" + nilaiparam + ") ";
                            utkinput.push('%'+ filter[i].toLowerCase() + '%');
                        } else if (filterby[i] == 3) {
                            sambungwhere = sambungwhere + "AND ((LOWER(dt_tender_peserta.nama_peserta) like $" + nilaiparam + ") OR (LOWER(REPLACE(REPLACE(dt_tender_peserta.npwp,'.',''),'-','')) like $" + nilaiparam +")) ";
                            utkinput.push('%'+ filter[i].toLowerCase().replace(/\./g,'').replace(/-/g,'') + '%');
                        } else if (filterby[i] == 4) {
                            sambungwhere = sambungwhere + "AND (LOWER(dt_tender.tahap) like $" + nilaiparam + ") ";
                            utkinput.push('%'+ filter[i].toLowerCase() + '%');
                        } else if (filterby[i] == 5) {
                            sambungwhere = sambungwhere + "AND (LOWER(dt_tender.kategori) like $" + nilaiparam + ") ";
                            utkinput.push('%'+ filter[i].toLowerCase() + '%');
                        } else if (filterby[i] == 6) {
                            if (filter[i].toString() == '2') {
                                sambungwhere = sambungwhere + "AND (dt_tender.hps_terjemahan <= 2500000000) ";
                            } else if (filter[i].toString() == '3') {
                                sambungwhere = sambungwhere + "AND (dt_tender.hps_terjemahan > 2500000000 AND dt_tender.hps_terjemahan <= 10000000000) ";
                            } else if (filter[i].toString() == '4') {
                                sambungwhere = sambungwhere + "AND (dt_tender.hps_terjemahan > 10000000000 AND dt_tender.hps_terjemahan <= 50000000000) ";
                            } else if (filter[i].toString() == '5') {
                                sambungwhere = sambungwhere + "AND (dt_tender.hps_terjemahan > 50000000000 AND dt_tender.hps_terjemahan <= 100000000000) ";
                            } else if (filter[i].toString() == '6') {
                                sambungwhere = sambungwhere + "AND (dt_tender.hps_terjemahan > 100000000000) ";
                            }
                        }
                    }
                } else {
                    reject("Filter by tidak bisa lebih besar dari Filter.");
                }
            }
            
            db.query('SELECT dt_tender.*, dt_tender.tender_id as tender_idnya, (select count(*) as jumlah FROM (SELECT dt_tender.* FROM dt_tender LEFT JOIN dt_tender_peserta ON dt_tender.tender_id = dt_tender_peserta.tender_id ' + sambungwhere + ' GROUP BY dt_tender.tender_id, dt_tender.url_tender_id, dt_tender.url_tender_link, dt_tender.kode, dt_tender.nama_paket, dt_tender.tender_label, dt_tender.instansi, dt_tender.tahap, dt_tender.hps, dt_tender.kategori, dt_tender.sistem_pengadaan, dt_tender.tahun_anggaran, dt_tender.nilai_kontrak, dt_tender.created_date, dt_tender.modified_date, dt_tender.status_active_id) as jumlahnya) as jumlahsemua FROM dt_tender LEFT JOIN dt_tender_peserta ON dt_tender.tender_id = dt_tender_peserta.tender_id ' + 
            sambungwhere + ' GROUP BY dt_tender.tender_id, dt_tender.url_tender_id, dt_tender.url_tender_link, dt_tender.kode, dt_tender.nama_paket, dt_tender.tender_label, dt_tender.instansi, dt_tender.tahap, dt_tender.hps, dt_tender.kategori, dt_tender.sistem_pengadaan, dt_tender.tahun_anggaran, dt_tender.nilai_kontrak, dt_tender.created_date, dt_tender.modified_date, dt_tender.status_active_id ' + sambungorderby + sambunglimitoffset, utkinput).callback(function(err, response) {
                if (err) throw err;

                if (response.length > 0) {
                    var index = 0;
                    var jumlahdata = response[0].jumlahsemua;
                    async.each(response, function(isinya, callback) {
                        var buatjsonarr = {
                            tender_id: response[index].tender_idnya,
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
                        callback("");
                    }, function(err) {
                        if (err) throw err;
                    });
                    if (buatjson.length > 0) {
                        self.json(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka data tender.", "", "Total semua data: " + jumlahdata, JSON.stringify(req), receivetime, JSON.stringify(buatjson), jumlahdata)));					
                        resolve("Berhasil buka data tender.");
                    } else {
                        reject("Tidak ada data tender.");
                    }
                } else {
                    reject("Tidak ada data tender.");
                }
        });
		} catch(err) {
			reject(err);
		}
	});
};