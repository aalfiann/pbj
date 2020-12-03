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
           reject(JSON.parse(BalikanHeaderFINAL("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, ""), 0));
       }
   });
};

function geturltender(type, req, receivetime){
	return new Promise(function(resolve, reject) {
		var nosql = NOSQL('num_url_tender');

		try {
			nosql.find().make(function(builder) {
				builder.where('status_active_id', 1);
				builder.where('url_tender_type', type);
				builder.callback(function(err, response, count) {
					if (err) throw err;

					if (count > 0) {
						resolve(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka URL.", "", "Perhatikan URL yang tampil.", JSON.stringify(req), receivetime, JSON.stringify(response), count)));
					} else {
						reject(JSON.parse(BalikanHeaderFINAL("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, ""), 0));
					}
				});
			});
		} catch(err) {
			reject(JSON.parse(BalikanHeaderFINAL("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, ""), 0));
		}
	});
};

exports.insertdttender = function (url_tender_idnya, url_tender_linknya, kodenya, nama_paketnya, tender_labelnya, 
	instansinya, tahapnya, hpsnya, kategorinya, sistem_pengadaannya, tahun_anggarannya, nilai_kontraknya, update_pengecualian) {
	return new Promise(function(resolve, reject) {
		var initializePromise = insertdttender(url_tender_idnya, url_tender_linknya, kodenya, nama_paketnya, tender_labelnya, 
		instansinya, tahapnya, hpsnya, kategorinya, sistem_pengadaannya, tahun_anggarannya, nilai_kontraknya, update_pengecualian); 
		initializePromise.then(function() {
			resolve();
		}, function(err) {
			console.log(err)
			reject();
		});
	});
};

function insertdttender(url_tender_idnya, url_tender_linknya, kodenya, nama_paketnya, tender_labelnya, 
	instansinya, tahapnya, hpsnya, kategorinya, sistem_pengadaannya, tahun_anggarannya, nilai_kontraknya, update_pengecualian){
	return new Promise(function(resolve, reject) {
		const { v4: uuidv4 } = require('uuid');
		var nosql = NOSQL('dt_tender');
		var nosql1 = NOSQL('num_tahap');
		var tzoffset = (new Date()).getTimezoneOffset() * 60000;
		var serverdateutama = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "").substr(0,19); //2019-06-01 00:00:00

		try {
			nosql.find().make(function(builder) {
				builder.where('status_active_id', 1);
				builder.where('kode', kodenya);
				builder.callback(function(err, response, count) {
					if (err) throw err;

					if (count > 0) {
						var obj = JSON.parse(JSON.stringify(response));

						if (obj[0].tahap != update_pengecualian) {
							let modifyData = {
								tender_id: uuidv4(),
								url_tender_id: url_tender_idnya,
								url_tender_link: url_tender_linknya,
								kode: kodenya,
								nama_paket: nama_paketnya,
								tender_label: tender_labelnya,
								instansi: instansinya,
								tahap: tahapnya,
								hps: hpsnya,
								kategori: kategorinya,
								sistem_pengadaan: sistem_pengadaannya,
								tahun_anggaran: tahun_anggarannya,
								nilai_kontrak: nilai_kontraknya,
								created_date: serverdateutama,
								modified_date: serverdateutama,
								status_active_id: 1
							};
							nosql.modify(modifyData).make(function(builder) {
								builder.where('kode', kodenya);
								builder.take(1);
								builder.callback(function(err, count) {
									if (err) throw err;
				
									if (count > 0) {
										// nosql1.find().make(function(builder) {
										// 	builder.where('tahap_id', tahapnya);
										// 	builder.callback(function(err, response, count) {
										// 		if (count > 0) {
										// 			resolve();
										// 		} else {
										// 			let saveDatatahapmodify = {
										// 				tahap_id: tahapnya,
										// 				tahap: tahapnya
										// 			};
										// 			nosql1.insert(saveDatatahapmodify).callback(function(err, count) {
														resolve();
										// 			});
										// 		}
										// 	});
										// });
									} else {
										reject();
									}
								});
							});
						} else {
							reject();
						}
					} else {
						let saveData = {
							tender_id: uuidv4(),
							url_tender_id: url_tender_idnya,
							url_tender_link: url_tender_linknya,
							kode: kodenya,
							nama_paket: nama_paketnya,
							tender_label: tender_labelnya,
							instansi: instansinya,
							tahap: tahapnya,
							hps: hpsnya,
							kategori: kategorinya,
							sistem_pengadaan: sistem_pengadaannya,
							tahun_anggaran: tahun_anggarannya,
							nilai_kontrak: nilai_kontraknya,
							created_date: serverdateutama,
							modified_date: serverdateutama,
							status_active_id: 1
						};
						nosql.insert(saveData).callback(function(err, count) {
							if (err) throw err;
			
							if (count > 0) {
								nosql1.find().make(function(builder) {
									builder.where('tahap_id', tahapnya);
									builder.callback(function(err, response, count) {
										if (count > 0) {
											resolve();
										} else {
											let saveDatatahap = {
												tahap_id: tahapnya,
												tahap: tahapnya
											};
											nosql1.insert(saveDatatahap).callback(function(err, count) {
												resolve();
											});
										}
									});
								});
							} else {
								reject();
							}
						});
					}
				});
			});
		} catch(err) {
			reject(err);
		}
	});
};

// exports.insertnumtahap = function (tahap) {
// 	var initializePromise = insertnumtahap(tahap); 
// 	initializePromise.then(function() {
// 	}, function(err) {
// 		console.log(err)
// 	});
// };

// function insertnumtahap(tahap){
// 	return new Promise(function(resolve, reject) {
// 		var nosql = NOSQL('num_tahap');

// 		try {
// 			nosql.find().make(function(builder) {
// 				builder.where('tahap_id', tahap);
// 				builder.callback(function(err, response, count) {
// 					if (err) throw err;

// 					if (count > 0) {
// 					} else {
// 						let saveData = {
// 							tahap_id: tahap,
// 							tahap: tahap
// 						};
// 						nosql.insert(saveData).callback(function(err, count) {
// 							if (err) throw err;
			
// 							if (count > 0) {
// 								resolve();
// 							} else {
// 								reject();
// 							}
// 						});
// 					}
// 				});
// 			});
// 		} catch(err) {
// 			reject(err);
// 		}
// 	});
// };