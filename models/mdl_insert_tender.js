exports.insertdttender = function (tender_id, url_tender_idnya, url_tender_linknya, kodenya, nama_paketnya, tender_labelnya, 
	instansinya, tahapnya, hpsnya, kategorinya, sistem_pengadaannya, tahun_anggarannya, nilai_kontraknya, update_pengecualian) {
	return new Promise(function(resolve, reject) {
		var initializePromise = insertdttenderf(tender_id, url_tender_idnya, url_tender_linknya, kodenya, nama_paketnya, tender_labelnya, 
		instansinya, tahapnya, hpsnya, kategorinya, sistem_pengadaannya, tahun_anggarannya, nilai_kontraknya, update_pengecualian); 
		initializePromise.then(function() {
			resolve();
		}, function(err) {
			console.log(err)
			reject();
		});
	});
};

function insertdttenderf(tender_id, url_tender_idnya, url_tender_linknya, kodenya, nama_paketnya, tender_labelnya, 
	instansinya, tahapnya, hpsnya, kategorinya, sistem_pengadaannya, tahun_anggarannya, nilai_kontraknya, update_pengecualian){
	return new Promise(function(resolve, reject) {
		var db = DBMS();
		
		try {
			db.query('SELECT * FROM dt_tender WHERE status_active_id=$1 AND kode=$2', [1, kodenya]).callback(function(err, response) {
				if (err) throw err;

				var buattambahnol = '';
				var hps_terjemahan = '0';
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
				if (response.length > 0) {
					var obj = JSON.parse(JSON.stringify(response));

					if (obj[0].tahap != update_pengecualian) {
						var utkinput = [kodenya, url_tender_idnya, url_tender_linknya, nama_paketnya, tender_labelnya, instansinya, tahapnya, 
						hpsnya, kategorinya, sistem_pengadaannya, tahun_anggarannya, nilai_kontraknya, parseInt(hps_terjemahan)];
						
						db.query('UPDATE dt_tender SET url_tender_id = $2, url_tender_link = $3, nama_paket = $4, tender_label = $5, instansi = $6, tahap = $7, hps = $8, kategori = $9, sistem_pengadaan = $10, tahun_anggaran = $11, nilai_kontrak = $12, hps_terjemahan = $13, modified_date = now() WHERE kode=$1 RETURNING *;', utkinput).callback(function(err, response) {
							if (err) throw err;
			
							if (response.length > 0) {
								resolve();
							} else {
								reject();
							}
						});
					} else {
						reject();
					}
				} else {
					var utkinput = [tender_id, url_tender_idnya, url_tender_linknya, kodenya, nama_paketnya, tender_labelnya, instansinya, tahapnya, 
					hpsnya, kategorinya, sistem_pengadaannya, tahun_anggarannya, nilai_kontraknya, parseInt(hps_terjemahan)];
					
					db.query('INSERT INTO dt_tender (tender_id, url_tender_id, url_tender_link, kode, nama_paket, tender_label, instansi, tahap, hps, kategori, sistem_pengadaan, tahun_anggaran, nilai_kontrak, hps_terjemahan, created_date, modified_date, status_active_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now(), now(), 1) RETURNING *;', utkinput).callback(function(err, response) {
						if (err) throw err;
		
						if (response.length > 0) {
							if (tahapnya != undefined && tahapnya != '' && tahapnya != null) {
								var utkinput = [tahapnya, tahapnya];
								db.query('INSERT INTO num_tahap (tahap_id, tahap) SELECT CAST($1 AS VARCHAR), $2 WHERE NOT EXISTS (SELECT 1 FROM num_tahap WHERE tahap_id = $1) RETURNING *;', utkinput).callback(function(err, response) {
									if (err) throw err;
				
									if (kategorinya != undefined && kategorinya != '' && kategorinya != null) {
										var utkinput = [kategorinya, kategorinya];
										db.query('INSERT INTO num_kategori (kategori_id, kategori) SELECT CAST($1 AS VARCHAR), $2 WHERE NOT EXISTS (SELECT 1 FROM num_kategori WHERE kategori_id = $1) RETURNING *;', utkinput).callback(function(err, response) {
											if (err) throw err;
						
											resolve();
										});
									} else{
										resolve();
									}
								});
							} else{
								resolve();
							}
						} else {
							reject();
						}
					});
				}
            });
		} catch(err) {
			reject(err);
		}
	});
};

exports.updatestatusurltender = function (url_tender_idnya, statusonnya) {
	return new Promise(function(resolve, reject) {
		var initializePromise = updatestatusurltender(url_tender_idnya, statusonnya); 
		initializePromise.then(function() {
			resolve();
		}, function(err) {
			console.log(err)
			reject();
		});
	});
};

function updatestatusurltender(url_tender_idnya, statusonnya){
	return new Promise(function(resolve, reject) {
		var db = DBMS();
		
		try {
			var utkinput = [url_tender_idnya, statusonnya];
			db.query('UPDATE num_url_tender SET status_on = $2, modified_date = now() WHERE url_tender_id=$1 RETURNING *;', utkinput).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
					resolve();
				} else {
					reject();
				}
			});
		} catch(err) {
			reject(err);
		}
	});
};
