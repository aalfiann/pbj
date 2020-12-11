exports.insertdttenderpemenang = function (tender_id, nama_tender, kategori, instansi, 
    satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran) {
	return new Promise(function(resolve, reject) {
		var initializePromise = insertdttenderpemenang(tender_id, nama_tender, kategori, instansi, 
            satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran); 
		initializePromise.then(function() {
			resolve();
		}, function(err) {
			//console.log(err)
			reject(err);
		});
	});
};

function insertdttenderpemenang(tender_id, nama_tender, kategori, instansi, 
    satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran){
	return new Promise(function(resolve, reject) {
		const { v4: uuidv4 } = require('uuid');
		var db = DBMS();
		
		try {
			if (pagu == undefined || pagu.trim() == '' || pagu == null) {
				pagu = 0;
			}
			if (hps == undefined || hps.trim() == '' || hps == null) {
				hps = 0;
            }
            if (harga_penawaran == undefined || harga_penawaran.trim() == '' || harga_penawaran == null) {
				harga_penawaran = 0;
			}
			var utkupdate = [tender_id, nama_tender, kategori, instansi, 
                satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran];
			db.query('UPDATE dt_tender_pemenang SET nama_tender = $2, kategori = $3, instansi = $4, satker = $5, pagu = $6, hps = $7, nama_pemenang = $8, alamat = $9, npwp = $10, harga_penawaran = $11 WHERE tender_id = $1 RETURNING *;', utkupdate).callback(function(err, response) {
				if (err) throw err;
               
				if (response.length > 0) {
					resolve();
				} else {
					var utkinput = [uuidv4(), tender_id, nama_tender, kategori, instansi, 
                        satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran];
					
					db.query('INSERT INTO dt_tender_pemenang (tender_pemenang_id, tender_id, nama_tender, kategori, instansi, satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran) SELECT $1, CAST($2 AS VARCHAR), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12 WHERE NOT EXISTS (SELECT 1 FROM dt_tender_pemenang WHERE tender_id = $2) RETURNING *;', utkinput).callback(function(err, response) {
						if (err) throw err;
		
						if (response.length > 0) {
							resolve('Sukses Input.');
						} else {
							reject('Sudah ada data.');
						}
					});
				}
			});
		} catch(err) {
			reject(err);
		}
	});
};