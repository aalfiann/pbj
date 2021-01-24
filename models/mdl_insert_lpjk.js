exports.insertlpjk = function (dataSBU, statusRegi) {
	return new Promise(function(resolve, reject) {
        var db = DBMS();
        var async = require('async');
        const { v4: uuidv4 } = require('uuid');
        if (dataSBU != undefined) {
            if (dataSBU.sbu != undefined) {
                if (dataSBU.sbu.length > 0) {
                    var bu_id = uuidv4();
                    var statusReg = statusRegi.toString().replace(/\./g,'');
                    var initializePromise = insertbadanusaha(bu_id, dataSBU.sbu[0].trim(), dataSBU.sbu[1].trim(), dataSBU.sbu[2].trim(), 
                    dataSBU.sbu[3].trim(), dataSBU.sbu[4].trim(), dataSBU.sbu[5].trim(), dataSBU.sbu[6].trim(), dataSBU.sbu[7].trim(), dataSBU.sbu[8].trim(), dataSBU.sbu[9].trim(), dataSBU.sbu[10].trim(), statusReg); 
                    initializePromise.then(function() {
                        var initializePromisehapus = hapusdatabu(dataSBU.sbu[8].trim()); 
                        initializePromisehapus.then(function() {
                            async.each(dataSBU.kualifikasi_dan_klasifikasi, function(isinya, callback) {
                                var initializePromise1 = insertbadanusahaklasifikasi(bu_id, dataSBU.sbu[8].trim(), isinya.sub_bidang_klasifikasi.trim(), isinya.no_kode.trim(), isinya.kualifikasi.trim(), 
                                isinya.tahun.trim(), isinya.nilai.trim(), isinya.asosiasi.trim(), isinya.tgl_permohonan.trim(), isinya.tgl_cetak_pertama.trim(), isinya.tgl_cetak_perubahan_terakhir.trim(), isinya.tgl_reg_thn_2r.trim()); 
                                initializePromise1.then(function() {
                                }, function(err) {
                                    console.log(err);
                                });
                            }, function(err) {
                                console.log("insertbadanusahaklasifikasi: " + err);
                            });
                            async.each(dataSBU.pengurus, function(isinya, callback) {
                                var initializePromise2 = insertbadanusahapengurus(bu_id, dataSBU.sbu[8].trim(), isinya.nama.trim(), isinya.tgl_lahir.trim(), isinya.alamat.trim(), 
                                isinya.no_ktp.trim(), isinya.jabatan.trim(), isinya.pendidikan.trim()); 
                                initializePromise2.then(function() {
                                }, function(err) {
                                    console.log(err);
                                });
                            }, function(err) {
                                console.log("insertbadanusahapengurus: " + err);
                            });
                            async.each(dataSBU.tenaga_kerja, function(isinya, callback) {
                                var initializePromise3 = insertbadanusahatenagakerja(bu_id, dataSBU.sbu[8].trim(), isinya.nama.trim(), isinya.tgl_lahir.trim(), isinya.ktp.trim(), 
                                isinya.pendidikan.trim(), isinya.no_registrasi.trim(), isinya.jenis_sertifikat.trim(), isinya.detail.trim()); 
                                initializePromise3.then(function() {
                                }, function(err) {
                                    console.log(err);
                                });
                            }, function(err) {
                                console.log("insertbadanusahatenagakerja: " + err);
                            });
                            async.each(dataSBU.keuangan, function(isinya, callback) {
                                var initializePromise4 = insertbadanusahakeuangan(bu_id, dataSBU.sbu[8].trim(), isinya.nama.trim(), isinya.ktp_npwp.trim(), isinya.alamat.trim(), 
                                isinya.jumlah_saham.trim(), isinya.nilai_satuan_saham.trim(), isinya.modal_dasar.trim(), isinya.modal_setor.trim()); 
                                initializePromise4.then(function() {
                                }, function(err) {
                                    console.log(err);
                                });
                            }, function(err) {
                                console.log("insertbadanusahakeuangan: " + err);
                            });
                            console.log("SUKSES: " + dataSBU.sbu[0].trim() + " --- " + dataSBU.sbu[8].trim() + " --- " + statusReg);
                            resolve(); 
                        }, function(err) {
                            reject(err);
                        });
                    }, function(err) {
                        reject(err);
                    });
                }
            }
        }
	});
};

function insertbadanusaha(bu_id, bu_nama, bu_alamat, bu_kabupaten, bu_kodepos, 
    bu_telepon, bu_fax, bu_email, bu_website, bu_npwp, bu_bentuk_badan_usaha, bu_jenis_badan_usaha, statusReg){
	return new Promise(function(resolve, reject) {
		var db = DBMS();
        
		try {
			var utkupdate = [bu_npwp, bu_nama, bu_alamat, bu_kabupaten, bu_kodepos, 
                bu_telepon, bu_fax, bu_email, bu_website, bu_bentuk_badan_usaha, bu_jenis_badan_usaha, bu_id, statusReg];
			db.query('UPDATE dt_badan_usaha SET bu_nama = $2, bu_alamat = $3, bu_kabupaten = $4, bu_kodepos = $5, bu_telepon = $6, bu_fax = $7, bu_email = $8, bu_website = $9, bu_bentuk_badan_usaha = $10, bu_jenis_badan_usaha = $11, bu_id = $12, bu_status_registrasi = $13, modified_date = now() WHERE bu_npwp = $1 RETURNING *;', utkupdate).callback(function(err, response) {
				if (err) throw err;
               
				if (response.length > 0) {
					resolve();
				} else {
					var utkinput = [bu_id, bu_nama, bu_alamat, bu_kabupaten, bu_kodepos, 
                        bu_telepon, bu_fax, bu_email, bu_website, bu_npwp, bu_bentuk_badan_usaha, bu_jenis_badan_usaha, statusReg];
					
					db.query('INSERT INTO dt_badan_usaha (bu_id, bu_nama, bu_alamat, bu_kabupaten, bu_kodepos, bu_telepon, bu_fax, bu_email, bu_website, bu_npwp, bu_bentuk_badan_usaha, bu_jenis_badan_usaha, bu_status_registrasi, created_date, modified_date) SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), now() WHERE NOT EXISTS (SELECT 1 FROM dt_badan_usaha WHERE bu_npwp = $9) RETURNING *;', utkinput).callback(function(err, response) {
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

function insertbadanusahaklasifikasi(bu_id, bu_npwp, bu_klasifikasi_sub_bidang_klasifikasi, bu_klasifikasi_kode, bu_klasifikasi_kualifikasi, 
    bu_klasifikasi_tahun, bu_klasifikasi_nilai, bu_klasifikasi_asosiasi, bu_klasifikasi_tanggal_permohonan, bu_klasifikasi_tanggal_cetak_pertama, bu_klasifikasi_tanggal_cetak_perubahan_terakhir, bu_klasifikasi_tanggal_registrasi_tahun_2){
	return new Promise(function(resolve, reject) {
        const { v4: uuidv4 } = require('uuid');
		var db = DBMS();
		
		try {
			//var utkdelete = [bu_npwp];
			//db.query("DELETE FROM dt_badan_usaha_klasifikasi WHERE bu_npwp = $1", utkdelete).callback(function(err, response) {
			//	if (err) throw err;
               
                if (bu_klasifikasi_nilai == undefined || bu_klasifikasi_nilai == '' || bu_klasifikasi_nilai == null) {
                    bu_klasifikasi_nilai = 0;
                }
                var utkinput = [uuidv4(), bu_id, bu_npwp, bu_klasifikasi_sub_bidang_klasifikasi, bu_klasifikasi_kode, bu_klasifikasi_kualifikasi, 
                    bu_klasifikasi_tahun, bu_klasifikasi_nilai, bu_klasifikasi_asosiasi, bu_klasifikasi_tanggal_permohonan, bu_klasifikasi_tanggal_cetak_pertama, bu_klasifikasi_tanggal_cetak_perubahan_terakhir, bu_klasifikasi_tanggal_registrasi_tahun_2];
                
                db.query('INSERT INTO dt_badan_usaha_klasifikasi (bu_klasifikasi_id, bu_id, bu_npwp, bu_klasifikasi_sub_bidang_klasifikasi, bu_klasifikasi_kode, bu_klasifikasi_kualifikasi, bu_klasifikasi_tahun, bu_klasifikasi_nilai, bu_klasifikasi_asosiasi, bu_klasifikasi_tanggal_permohonan, bu_klasifikasi_tanggal_cetak_pertama, bu_klasifikasi_tanggal_cetak_perubahan_terakhir, bu_klasifikasi_tanggal_registrasi_tahun_2, created_date, modified_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), now()) RETURNING *;', utkinput).callback(function(err, response) {
                    if (err) throw err;
    
                    if (response.length > 0) {
                        resolve('Sukses Input.');
                    } else {
                        reject('Sudah ada data.');
                    }
                });
				//}
			//});
		} catch(err) {
			reject(err);
		}
	});
};

function insertbadanusahapengurus(bu_id, bu_npwp, bu_pengurus_nama, bu_pengurus_tanggal_lahir, bu_pengurus_alamat, 
    bu_pengurus_ktp, bu_pengurus_jabatan, bu_pengurus_pendidikan){
	return new Promise(function(resolve, reject) {
        const { v4: uuidv4 } = require('uuid');
		var db = DBMS();
		
		try {
			//var utkdelete = [bu_npwp];
			//db.query("DELETE FROM dt_badan_usaha_pengurus WHERE bu_npwp = $1", utkdelete).callback(function(err, response) {
			//	if (err) throw err;
               
                var utkinput = [uuidv4(), bu_id, bu_npwp, bu_pengurus_nama, bu_pengurus_tanggal_lahir, bu_pengurus_alamat, 
                    bu_pengurus_ktp, bu_pengurus_jabatan, bu_pengurus_pendidikan];
                
                db.query('INSERT INTO dt_badan_usaha_pengurus (bu_pengurus_id, bu_id, bu_npwp, bu_pengurus_nama, bu_pengurus_tanggal_lahir, bu_pengurus_alamat, bu_pengurus_ktp, bu_pengurus_jabatan, bu_pengurus_pendidikan, created_date, modified_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now(), now()) RETURNING *;', utkinput).callback(function(err, response) {
                    if (err) throw err;
    
                    if (response.length > 0) {
                        resolve('Sukses Input.');
                    } else {
                        reject('Sudah ada data.');
                    }
                });
				//}
			//});
		} catch(err) {
			reject(err);
		}
	});
};

function insertbadanusahatenagakerja(bu_id, bu_npwp, bu_tenaga_kerja_nama, bu_tenaga_kerja_tanggal_lahir, bu_tenaga_kerja_ktp, 
    bu_tenaga_kerja_pendidikan, bu_tenaga_kerja_no_registrasi, bu_tenaga_kerja_jenis_sertifikat, bu_tenaga_kerja_detail_link){
	return new Promise(function(resolve, reject) {
        const { v4: uuidv4 } = require('uuid');
		var db = DBMS();
		
		try {
            var utkinput = [uuidv4(), bu_id, bu_npwp, bu_tenaga_kerja_nama, bu_tenaga_kerja_tanggal_lahir, bu_tenaga_kerja_ktp, 
                bu_tenaga_kerja_pendidikan, bu_tenaga_kerja_no_registrasi, bu_tenaga_kerja_jenis_sertifikat, bu_tenaga_kerja_detail_link];
            
            db.query('INSERT INTO dt_badan_usaha_tenaga_kerja (bu_tenaga_kerja_id, bu_id, bu_npwp, bu_tenaga_kerja_nama, bu_tenaga_kerja_tanggal_lahir, bu_tenaga_kerja_ktp, bu_tenaga_kerja_pendidikan, bu_tenaga_kerja_no_registrasi, bu_tenaga_kerja_jenis_sertifikat, bu_tenaga_kerja_detail_link, created_date, modified_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now()) RETURNING *;', utkinput).callback(function(err, response) {
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

function insertbadanusahakeuangan(bu_id, bu_npwp, bu_keuangan_nama, bu_keuangan_ktp, bu_keuangan_alamat, 
    bu_keuangan_jumlah_saham, bu_keuangan_satuan_saham, bu_keuangan_modal_dasar, bu_keuangan_modal_setor){
	return new Promise(function(resolve, reject) {
        const { v4: uuidv4 } = require('uuid');
		var db = DBMS();
		
		try {
			//var utkdelete = [bu_npwp, bu_keuangan_ktp];
			//db.query("DELETE FROM dt_badan_usaha_keuangan WHERE bu_npwp = $1 AND bu_keuangan_ktp = $2", utkdelete).callback(function(err, response) {
			//	if (err) throw err;
               
                if (bu_keuangan_jumlah_saham == undefined || bu_keuangan_jumlah_saham == '' || bu_keuangan_jumlah_saham == null) {
                    bu_keuangan_jumlah_saham = 0;
                }
                if (bu_keuangan_satuan_saham == undefined || bu_keuangan_satuan_saham == '' || bu_keuangan_satuan_saham == null) {
                    bu_keuangan_satuan_saham = 0;
                }
                if (bu_keuangan_modal_dasar == undefined || bu_keuangan_modal_dasar == '' || bu_keuangan_modal_dasar == null) {
                    bu_keuangan_modal_dasar = 0;
                }
                if (bu_keuangan_modal_setor == undefined || bu_keuangan_modal_setor == '' || bu_keuangan_modal_setor == null) {
                    bu_keuangan_modal_setor = 0;
                }
                var utkinput = [uuidv4(), bu_id, bu_npwp, bu_keuangan_nama, bu_keuangan_ktp, bu_keuangan_alamat, 
                    bu_keuangan_jumlah_saham, bu_keuangan_satuan_saham, bu_keuangan_modal_dasar, bu_keuangan_modal_setor];
                
                db.query('INSERT INTO dt_badan_usaha_keuangan (bu_keuangan_id, bu_id, bu_npwp, bu_keuangan_nama, bu_keuangan_ktp, bu_keuangan_alamat, bu_keuangan_jumlah_saham, bu_keuangan_satuan_saham, bu_keuangan_modal_dasar, bu_keuangan_modal_setor, created_date, modified_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, now(), now()) RETURNING *;', utkinput).callback(function(err, response) {
                    if (err) throw err;
    
                    if (response.length > 0) {
                        resolve('Sukses Input.');
                    } else {
                        reject('Sudah ada data.');
                    }
                });
				//}
			//});
		} catch(err) {
			reject(err);
		}
	});
};

function hapusdatabu(bu_npwp){
	return new Promise(function(resolve, reject) {
        var db = DBMS();
		
		try {
            var utkdelete = [bu_npwp];
            db.query("DELETE FROM dt_badan_usaha_klasifikasi WHERE (bu_npwp = $1) RETURNING *;", utkdelete).callback(function(err, response) {
                if (err) throw err;
                db.query("DELETE FROM dt_badan_usaha_keuangan WHERE (bu_npwp = $1) RETURNING *;", utkdelete).callback(function(err, response) {
                    if (err) throw err;
                    db.query("DELETE FROM dt_badan_usaha_pengurus WHERE (bu_npwp = $1) RETURNING *;", utkdelete).callback(function(err, response) {
                        if (err) throw err;
                        db.query("DELETE FROM dt_badan_usaha_tenaga_kerja WHERE (bu_npwp = $1) RETURNING *;", utkdelete).callback(function(err, response) {
                            if (err) throw err;
                            resolve();
                        });
                    });
                });
            });
        } catch(err) {
			reject(err);
		}
    });
};