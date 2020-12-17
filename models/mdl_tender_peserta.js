function BalikanHeaderFINAL (stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord) {
	var helpernya = require('../definitions/helper');

	var teksnya = helpernya.BalikanHeaderFINALOK(stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord);
	return teksnya;
};

exports.APIOpenPerusahaan = function(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime){
    var initializePromise = OpenPerusahaan(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime);
    initializePromise.then(function() {
        
    }, function(err) {
        console.log(err);
        self.json(JSON.parse(BalikanHeaderFINAL("false", err, "error", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
    });
};

function OpenPerusahaan(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime) {
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
            var utkinput = [''];
            var sambungwhere = "WHERE (dt_tender_peserta.tender_peserta_id != $1) ";
            if (katakunci != undefined && katakunci != null && katakunci != '') {
                katakunci =  "%" + katakunci.toLowerCase() + "%";
                utkinput =  ['', katakunci];
                sambungwhere = sambungwhere + "AND ((dt_tender_peserta.nama_peserta like $2) OR (LOWER(REPLACE(REPLACE(dt_tender_peserta.npwp,'.',''),'-','')) like $2) OR (dt_badan_usaha.bu_alamat like $2) OR (dt_badan_usaha.bu_kabupaten like $2) OR (dt_badan_usaha.bu_telepon like $2) OR (dt_badan_usaha.bu_email like $2) OR (dt_badan_usaha.bu_website like $2) OR (dt_badan_usaha.bu_bentuk_badan_usaha like $2) OR (dt_badan_usaha.bu_jenis_badan_usaha like $2) OR (dt_badan_usaha.bu_status_registrasi like $2)) ";
            } else {
                katakunci =  "%" + katakunci.toLowerCase() + "%";
                utkinput =  ['', katakunci];
                sambungwhere = sambungwhere + "AND (dt_tender_peserta.nama_peserta like $2) ";
            }
            var sambungorderby = "";
            var sambunglimitoffset = "";

            var nilaiasc = "DESC "; //descending
            if (sortbyasc == 1) {
                nilaiasc = "ASC ";  //ascending
            }
            if (sortby == 6) {
                sambungorderby = "ORDER BY dt_tender_peserta.nama_peserta " + nilaiasc;
            } else if (sortby == 7) {
                sambungorderby = "ORDER BY dt_tender_peserta.npwp " + nilaiasc;
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
                        if (filterby[i] == 7) {
                            sambungwhere = sambungwhere + "AND (LOWER(dt_tender_peserta.nama_peserta) like $" + nilaiparam + ") ";
                            utkinput.push('%'+ filter[i].toLowerCase() + '%');
                        } else if (filterby[i] == 8) {
                            sambungwhere = sambungwhere + "AND (LOWER(REPLACE(REPLACE(dt_tender_peserta.npwp,'.',''),'-','')) like $" + nilaiparam + ") ";
                            utkinput.push('%'+ filter[i].toLowerCase().replace(/\./g,'').replace(/-/g,'') + '%');
                        } else if (filterby[i] == 9) {
                            sambungwhere = sambungwhere + "AND (LOWER(dt_badan_usaha.bu_status_registrasi) = 'aktif') ";
                        } else if (filterby[i] == 10) {
                            sambungwhere = sambungwhere + "AND (LOWER(dt_badan_usaha.bu_status_registrasi) = 'proses') ";
                        } else if (filterby[i] == 11) {
                            sambungwhere = sambungwhere + "AND (dt_badan_usaha.bu_status_registrasi is NULL)";
                        }
                    }
                } else {
                    reject("Filter by tidak bisa lebih besar dari Filter.");
                }
            }
            
            db.query("SELECT dt_tender_peserta.nama_peserta, dt_tender_peserta.npwp, (SELECT count(*) as jumlahnya FROM (SELECT dt_tender_peserta.nama_peserta, dt_tender_peserta.npwp FROM dt_tender_peserta FULL JOIN dt_badan_usaha ON dt_tender_peserta.npwp = dt_badan_usaha.bu_npwp " + sambungwhere + " GROUP BY dt_tender_peserta.nama_peserta, dt_tender_peserta.npwp) as Jumlahnya) as jumlahsemua, COALESCE(dt_badan_usaha.bu_nama, '') as bu_nama, COALESCE(dt_badan_usaha.bu_alamat, '') as bu_alamat, COALESCE(dt_badan_usaha.bu_kabupaten, '') as bu_kabupaten, COALESCE(dt_badan_usaha.bu_kodepos, '') as bu_kodepos, COALESCE(dt_badan_usaha.bu_telepon, '') as bu_telepon, COALESCE(dt_badan_usaha.bu_fax, '') as bu_fax, COALESCE(dt_badan_usaha.bu_email, '') as bu_email, COALESCE(dt_badan_usaha.bu_website, '') as bu_website, COALESCE(dt_badan_usaha.bu_bentuk_badan_usaha, '') as bu_bentuk_badan_usaha, COALESCE(dt_badan_usaha.bu_jenis_badan_usaha, '') as bu_jenis_badan_usaha, COALESCE(dt_badan_usaha.bu_status_registrasi, 'Tidak Diketemukan') as bu_status_registrasi FROM dt_tender_peserta FULL JOIN dt_badan_usaha ON dt_tender_peserta.npwp = dt_badan_usaha.bu_npwp " + sambungwhere + " GROUP BY dt_tender_peserta.nama_peserta, dt_tender_peserta.npwp, dt_badan_usaha.bu_nama, dt_badan_usaha.bu_alamat, dt_badan_usaha.bu_kabupaten, dt_badan_usaha.bu_kodepos, dt_badan_usaha.bu_telepon, dt_badan_usaha.bu_fax, dt_badan_usaha.bu_email, dt_badan_usaha.bu_website, dt_badan_usaha.bu_bentuk_badan_usaha, dt_badan_usaha.bu_jenis_badan_usaha, dt_badan_usaha.bu_status_registrasi " + sambungorderby + sambunglimitoffset, utkinput).callback(function(err, response) {
                if (err) throw err;

                if (response.length > 0) {
                    var jumlahdata = response[0].jumlahsemua;
                    async.each(response, function(isinya, callback) {
                        var statusregistrasinya = 'Tidak Diketemukan';
                        if (isinya.bu_status_registrasi != undefined && isinya.bu_status_registrasi != '' && isinya.bu_status_registrasi  != null) {
                            statusregistrasinya = isinya.bu_status_registrasi;
                        }
                        var buatjsonarr = {
                            nama_peserta: isinya.nama_peserta,
                            npwp: isinya.npwp,
                            bu_nama: isinya.bu_nama,
                            bu_alamat: isinya.bu_alamat,
                            bu_kabupaten: isinya.bu_kabupaten,
                            bu_kodepos: isinya.bu_kodepos,
                            bu_telepon: isinya.bu_telepon,
                            bu_fax: isinya.bu_fax,
                            bu_email: isinya.bu_email,
                            bu_website: isinya.bu_website,
                            bu_bentuk_badan_usaha: isinya.bu_bentuk_badan_usaha,
                            bu_jenis_badan_usaha: isinya.bu_jenis_badan_usaha,
                            bu_status_registrasi: statusregistrasinya
                            }
                        buatjson.push(buatjsonarr);
                    }, function(err) {
                        console.log(err);
                    });
                    if (buatjson.length > 0) {
                        self.json(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka data perusahaan.", "", "Total semua data: " + jumlahdata, JSON.stringify(req), receivetime, JSON.stringify(buatjson), jumlahdata)));					
                        resolve("Berhasil buka data perusahaan.");
                    } else {
                        reject("Tidak ada data perusahaan.");
                    }
                } else {
                    reject("Tidak ada data perusahaan.");
                }
        });
		} catch(err) {
			reject(err);
		}
	});
};

exports.APIOpenPerusahaanDetail = function(npwp, self, req, receivetime){
    var initializePromise = OpenPerusahaanDetail(npwp, self, req, receivetime);
    initializePromise.then(function() {
        
    }, function(err) {
        console.log(err);
        self.json(JSON.parse(BalikanHeaderFINAL("false", err, "error", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
    });
};

function OpenPerusahaanDetail(npwp, self, req, receivetime) {
	return new Promise(function(resolve, reject) {
		var db = DBMS();
        var async = require('async');
        var buatjsonutama = [];
        var buatjsonklasifikasi = [];
        var buatjsonkeuangan = [];
        var buatjsonpengurus = [];
        var buatjsontenagakerja = [];
		try {
            var utkselect = [npwp];
			db.query('SELECT bu_klasifikasi_sub_bidang_klasifikasi, bu_klasifikasi_kode, bu_klasifikasi_kualifikasi, bu_klasifikasi_tahun, bu_klasifikasi_nilai, bu_klasifikasi_asosiasi, bu_klasifikasi_tanggal_permohonan, bu_klasifikasi_tanggal_cetak_pertama, bu_klasifikasi_tanggal_cetak_perubahan_terakhir, bu_klasifikasi_tanggal_registrasi_tahun_2 FROM dt_badan_usaha_klasifikasi WHERE (bu_npwp = $1)', utkselect).callback(function(err, response) {
				if (err) throw err;
				if (response.length > 0) {
                    async.each(response, function(isinya, callback) {
                        var buatjsonklasifikasiarr1 = {
                            bu_klasifikasi_sub_bidang_klasifikasi: isinya.bu_klasifikasi_sub_bidang_klasifikasi,
                            bu_klasifikasi_kode: isinya.bu_klasifikasi_kode,
                            bu_klasifikasi_kualifikasi: isinya.bu_klasifikasi_kualifikasi,
                            bu_klasifikasi_tahun: isinya.bu_klasifikasi_tahun,
                            bu_klasifikasi_nilai: isinya.bu_klasifikasi_nilai,
                            bu_klasifikasi_asosiasi: isinya.bu_klasifikasi_asosiasi,
                            bu_klasifikasi_tanggal_permohonan: isinya.bu_klasifikasi_tanggal_permohonan,
                            bu_klasifikasi_tanggal_cetak_pertama: isinya.bu_klasifikasi_tanggal_cetak_pertama,
                            bu_klasifikasi_tanggal_cetak_perubahan_terakhir: isinya.bu_klasifikasi_tanggal_cetak_perubahan_terakhir,
                            bu_klasifikasi_tanggal_registrasi_tahun_2: isinya.bu_klasifikasi_tanggal_registrasi_tahun_2
                        }
                        buatjsonklasifikasi.push(buatjsonklasifikasiarr1);
                    }, function(err) {
                        console.log(err);
                    });
                }
                buatjsonutama.push(buatjsonklasifikasi);
            });
            utkselect = [npwp];
            db.query('SELECT bu_keuangan_nama, bu_keuangan_ktp, bu_keuangan_alamat, bu_keuangan_jumlah_saham, bu_keuangan_satuan_saham, bu_keuangan_modal_dasar, bu_keuangan_modal_setor FROM dt_badan_usaha_keuangan WHERE (bu_npwp = $1)', utkselect).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
                    async.each(response, function(isinya, callback) {
                        var buatjsonkeuanganarr1 = {
                            bu_keuangan_nama: isinya.bu_keuangan_nama,
                            bu_keuangan_ktp: isinya.bu_keuangan_ktp,
                            bu_keuangan_alamat: isinya.bu_keuangan_alamat,
                            bu_keuangan_jumlah_saham: isinya.bu_keuangan_jumlah_saham,
                            bu_keuangan_satuan_saham: isinya.bu_keuangan_satuan_saham,
                            bu_keuangan_modal_dasar: isinya.bu_keuangan_modal_dasar,
                            bu_keuangan_modal_setor: isinya.bu_keuangan_modal_setor
                        }
                        buatjsonkeuangan.push(buatjsonkeuanganarr1);
                    }, function(err) {
                        console.log(err);
                    });
                }
                buatjsonutama.push(buatjsonkeuangan);
            });
            utkselect = [npwp];
            db.query('SELECT bu_pengurus_nama, bu_pengurus_tanggal_lahir, bu_pengurus_alamat, bu_pengurus_ktp, bu_pengurus_jabatan, bu_pengurus_pendidikan FROM dt_badan_usaha_pengurus WHERE (bu_npwp = $1)', utkselect).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
                    async.each(response, function(isinya, callback) {
                        var buatjsonpengurus1 = {
                            bu_pengurus_nama: isinya.bu_pengurus_nama,
                            bu_pengurus_tanggal_lahir: isinya.bu_pengurus_tanggal_lahir,
                            bu_pengurus_alamat: isinya.bu_pengurus_alamat,
                            bu_pengurus_ktp: isinya.bu_pengurus_ktp,
                            bu_pengurus_jabatan: isinya.bu_pengurus_jabatan,
                            bu_pengurus_pendidikan: isinya.bu_pengurus_pendidikan
                        }
                        buatjsonpengurus.push(buatjsonpengurus1);
                    }, function(err) {
                        console.log(err);
                    });
                }
                buatjsonutama.push(buatjsonpengurus);
            });
            utkselect = [npwp];
            db.query('SELECT bu_tenaga_kerja_nama, bu_tenaga_kerja_tanggal_lahir, bu_tenaga_kerja_ktp, bu_tenaga_kerja_pendidikan, bu_tenaga_kerja_no_registrasi, bu_tenaga_kerja_jenis_sertifikat, bu_tenaga_kerja_detail_link FROM dt_badan_usaha_tenaga_kerja WHERE (bu_npwp = $1)', utkselect).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
                    async.each(response, function(isinya, callback) {
                        var buatjsontenagakerja1 = {
                            bu_tenaga_kerja_nama: isinya.bu_tenaga_kerja_nama,
                            bu_tenaga_kerja_tanggal_lahir: isinya.bu_tenaga_kerja_tanggal_lahir,
                            bu_tenaga_kerja_ktp: isinya.bu_tenaga_kerja_ktp,
                            bu_tenaga_kerja_pendidikan: isinya.bu_tenaga_kerja_pendidikan,
                            bu_tenaga_kerja_no_registrasi: isinya.bu_tenaga_kerja_no_registrasi,
                            bu_tenaga_kerja_jenis_sertifikat: isinya.bu_tenaga_kerja_jenis_sertifikat,
                            bu_tenaga_kerja_detail_link: isinya.bu_tenaga_kerja_detail_link
                        }
                        buatjsontenagakerja.push(buatjsontenagakerja1);
                    }, function(err) {
                        console.log(err);
                    });
                }
                buatjsonutama.push(buatjsontenagakerja);
                if (buatjsonutama.length > 0) {
                    self.json(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka data detail perusahaan.", "", "Total semua data: " + 4, JSON.stringify(req), receivetime, JSON.stringify(buatjsonutama), 4)));					
                    
                    resolve("Berhasil buka detail perusahaan.");
				} else {
					reject("Tidak ada data detail perusahaan.");
				}
			});
		} catch(err) {
			reject(err);
		}
	});
};