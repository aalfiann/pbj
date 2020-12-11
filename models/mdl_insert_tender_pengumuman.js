exports.insertdttenderpengumuman = function (tender_id, kode, nama_tender, kode_rup, sumber_dana, 
    tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
    nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender) {
	return new Promise(function(resolve, reject) {
		var initializePromise = insertdttenderpengumuman(tender_id, kode, nama_tender, kode_rup, sumber_dana, 
            tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
            nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender); 
		initializePromise.then(function() {
			resolve();
		}, function(err) {
			//console.log(err)
			reject(err);
		});
	});
};

function insertdttenderpengumuman(tender_id, kode, nama_tender, kode_rup, sumber_dana, 
    tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
    nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender){
	return new Promise(function(resolve, reject) {
		const { v4: uuidv4 } = require('uuid');
		var db = DBMS();
		
		try {
			
			if (tanggal_pembuatan != undefined && tanggal_pembuatan != '' && tanggal_pembuatan != null) {
				var pecahtanggal = tanggal_pembuatan.split(' ');
				var bulannya = "00";
				switch(pecahtanggal[1].toLowerCase()) {
					case "februari":
						bulannya = "02";
					  break;
					case "maret":
						bulannya = "03";
					  break;
					case "april":
						bulannya = "04";
					  break;
					case "mei":
						bulannya = "05";
					  break;
					case "juni":
						bulannya = "06";
					  break;
					case "juli":
						bulannya = "07";
					  break;
					case "agustus":
						bulannya = "08";
					  break;
					case "september":
						bulannya = "09";
					  break;
					case "oktober":
						bulannya = "10";
					  break;
					case "november":
						bulannya = "11";
					  break;
					case "desember":
						bulannya = "12";
					  break;
					default:
						bulannya = "01";
				  }
				tanggal_pembuatan = pecahtanggal[2] + "-" +  bulannya + "-" +  pecahtanggal[0] + " 01:02:03";
			} else {
				tanggal_pembuatan = '';
			}
			if (nilai_pagu_paket == undefined || nilai_pagu_paket.trim() == '' || nilai_pagu_paket == null) {
				nilai_pagu_paket = 0;
			}
			if (nilai_hps_paket == undefined || nilai_hps_paket.trim() == '' || nilai_hps_paket == null) {
				nilai_hps_paket = 0;
			}
			var utkupdate = [tender_id, kode, nama_tender, kode_rup, sumber_dana, 
                tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
                nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender];
			db.query('UPDATE dt_tender_pengumuman SET kode = $2, nama_tender = $3, kode_rup = $4, sumber_dana = $5, tanggal_pembuatan = $6, keterangan = $7, tahap_tender_saat_ini = $8, instansi = $9, satuan_kerja = $10, sistem_pengadaan = $11, tahun_anggaran = $12, nilai_pagu_paket = $13, nilai_hps_paket = $14, cara_pembayaran = $15, lokasi_pekerjaan = $16, kualifikasi_usaha = $17, syarat_kualifikasi = $18, peserta_tender = $19 WHERE tender_id = $1 RETURNING *;', utkupdate).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
					resolve();
				} else {
					var utkinput = [uuidv4(), tender_id, kode, nama_tender, kode_rup, sumber_dana, 
						tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
						nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender];
					
					db.query('INSERT INTO dt_tender_pengumuman (tender_pengumuman_id, tender_id, kode, nama_tender, kode_rup, sumber_dana, tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender) SELECT $1, CAST($2 AS VARCHAR), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20 WHERE NOT EXISTS (SELECT 1 FROM dt_tender_pengumuman WHERE tender_id = $2) RETURNING *;', utkinput).callback(function(err, response) {
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