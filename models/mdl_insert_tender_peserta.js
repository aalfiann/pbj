exports.insertdttenderpeserta = function (tender_id, no, nama_peserta, npwp, harga_penawaran, 
	harga_terkoreksi) {
	return new Promise(function(resolve, reject) {
		var initializePromise = insertdttenderpeserta(tender_id, no, nama_peserta, npwp, harga_penawaran, 
            harga_terkoreksi); 
		initializePromise.then(function() {
			resolve();
		}, function(err) {
			//console.log(err)
			reject(err);
		});
	});
};

function insertdttenderpeserta(tender_id, no, nama_peserta, 
    npwp, harga_penawaran, harga_terkoreksi){
	return new Promise(function(resolve, reject) {
		const { v4: uuidv4 } = require('uuid');
		var db = DBMS();
		
		try {
			var harga_penawarannya = 0;
			var harga_terkoreksinya = 0;
			var nonya = no;
			if (nonya == undefined) {
				nonya = 1;
			} else {
				nonya = no.trim();
			}
			var nama_pesertanya = nama_peserta;
			if (nama_pesertanya == undefined) {
				nama_pesertanya = "";
			} else {
				nama_pesertanya = nama_peserta.trim();
			}
			var npwpnya = npwp;
			if (npwpnya == undefined) {
				npwpnya = "";
			} else {
				npwpnya = npwp.trim();
			}
			if (harga_penawaran != undefined && harga_penawaran != null && harga_penawaran.trim() != '') {
				harga_penawarannya = harga_penawaran.replace(/Rp/g,'').replace(/RP/g,'').replace(/rp/g,'').replace(/\./g,'').replace(/,/g,'.').trim();
			}
			if (harga_terkoreksi != undefined && harga_terkoreksi != null && harga_terkoreksi.trim() != '') {
				harga_terkoreksinya = harga_terkoreksi.replace(/Rp/g,'').replace(/RP/g,'').replace(/rp/g,'').replace(/\./g,'').replace(/,/g,'.').trim();
			}
			var utkinput = [uuidv4(), tender_id, nonya, nama_pesertanya, npwpnya, harga_penawarannya, harga_terkoreksinya];
	
			db.query('INSERT INTO dt_tender_peserta (tender_peserta_id, tender_id, no, nama_peserta, npwp, harga_penawaran, harga_terkoreksi) SELECT $1, CAST($2 AS VARCHAR), $3, CAST($4 AS VARCHAR), $5, $6, $7 WHERE NOT EXISTS (SELECT 1 FROM dt_tender_peserta WHERE tender_id = $2 AND nama_peserta = $4) RETURNING *;', utkinput).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
					resolve('Sukses Input.');
				} else {
					reject('Sudah ada data.');
				}
			});
		} catch(err) {
			reject(err);
		}
	});
};