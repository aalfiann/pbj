const puppeteer = require('puppeteer');

var itemPerPage = CONF.row_ambil;

function siteUrl(linkdata, token, page = 1, start = 0, itemPerPage = 25) {
    var linkdatanya = linkdata + '?draw='+page+'&columns[0][data]=0&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=true&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=1&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=true&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=2&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=true&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=3&columns[3][name]=&columns[3][searchable]=false&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=4&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=true&columns[4][search][value]=&columns[4][search][regex]=false&order[0][column]=0&order[0][dir]=desc&start='+start+'&length='+itemPerPage+'&search[value]=&search[regex]=false&authenticityToken='+token+'&_='+Date.now();

    return linkdatanya;
};

function getTotalRecords(html) {
    const ptemp1 = html.split('Tampilan 1 sampai 25 dari ');
    const ptemp2 = ptemp1[1].split(' data');
    return Number(ptemp2[0].replace(',',''));
};

function getToken(html) {
    const temp1 = html.split('d.authenticityToken = \'');
    if (temp1 != undefined && temp1.length > 1) {
        const temp2 = temp1[1].split('\';');
        return temp2[0];
    } else{  
        return;
    }
};

async function transformJson(page) {
    const nhtml = await page.content();
    const ntemp1 = nhtml.split('">');
    const ntemp2 = ntemp1[1].split('</pre>');
    return JSON.parse(ntemp2[0]);
};

const getAuthenticityToken = async () => {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
    const { v4: uuidv4 } = require('uuid');
    
    var waktumulaiINSERT = new Date();
    const browser = await puppeteer.launch({args:['--no-sandbox']});
    //const browser = await puppeteer.launch();
    const page = await browser.newPage();

    var obj = await dataurlTender("lpse", "", receivetime); 

    if (obj != undefined) {
        for (var jjj=0;jjj<obj.data.length;jjj++){
            try {
                var html = "";
                //await page.goto(obj.data[jjj].url_tender_link, {timeout: 0, waitUntil: 'networkidle0'}).catch(e => console.error(e));
                await page.goto(obj.data[jjj].url_tender_link, {waitUntil: 'networkidle0'});
                html = await page.content();
                
                if (html.length > 500) {
                    const token = getToken(html);
                    if (token != undefined && token != null && token != "") {
                        asyncupdatestatusurltender(obj.data[jjj].url_tender_id, 1);
                        const totalRecords = getTotalRecords(html);
                        if (obj.data[jjj].row_yang_diambil_per > 0 && obj.data[jjj].row_yang_diambil_per != undefined && obj.data[jjj].row_yang_diambil_per != '') {
                            itemPerPage = obj.data[jjj].row_yang_diambil_per;
                        }
                        const totalPage = Math.ceil(totalRecords/itemPerPage);
                        let startPage = 0;
                        for (let i = 1; i <= totalPage; i++) {
                            //process.stdout.clearLine();
                            //process.stdout.cursorTo(0);
                            //process.stdout.write("link: "+ obj.data[jjj].url_tender_link + " --- halaman: " + i + " ");
                            console.log("");
                            console.log("link: "+ obj.data[jjj].url_tender_link + " --- halaman: " + i + " ");
                            startPage = ((i-1)*itemPerPage)
                            await page.goto(siteUrl(obj.data[jjj].url_tender_link_data, token, i, startPage, itemPerPage), {waitUntil: 'networkidle0'});
                            var buatjson = await transformJson(page);
                            if (buatjson.data.length > 0) {
                                for (var jj=0;jj<buatjson.data.length;jj++) {
                                    var tender_id = uuidv4();
                                    var buatinsert = await asyncinsertdatatender(tender_id, obj.data[jjj].url_tender_id, obj.data[jjj].url_tender_link, buatjson.data[jj][0], buatjson.data[jj][1], buatjson.data[jj][2], buatjson.data[jj][3],
                                    buatjson.data[jj][4], buatjson.data[jj][8], buatjson.data[jj][6] + " - " + buatjson.data[jj][5]+ " - " + buatjson.data[jj][7], buatjson.data[jj][10], obj.data[jjj].tahap_update_pengecualian);

                                    //dt tender peserta
                                    const browserpeserta = await puppeteer.launch({args:['--no-sandbox']});
                                    const pagepeserta = await browserpeserta.newPage();

                                    var linknya = obj.data[jjj].url_tender_link + "/" + buatjson.data[jj][0] + '/peserta';
                                    await pagepeserta.goto(linknya, { waitUntil: 'networkidle0' });
                                    const htmlpeserta = await pagepeserta.content();
                                    if (htmlpeserta.length > 250) {
                                        var nilaipeserta = jjj + 1;
                                        var nilaipagepeserta = nilaipeserta + "/" + obj.data.length;
                                        await parseHtmlpeserta(htmlpeserta, tender_id, linknya, nilaipagepeserta);
                                    } else {
                                        console.log('404 - Not Found');
                                    }
                                    await browserpeserta.close();

                                    //dt tender pengumuman
                                    const browserpengumuman = await puppeteer.launch({args:['--no-sandbox']});
                                    const pagepengumuman = await browserpengumuman.newPage();

                                    linknya = obj.data[jjj].url_tender_link + "/" + buatjson.data[jj][0] + '/pengumumanlelang';
                                    await pagepengumuman.goto(linknya, { waitUntil: 'networkidle0' });
                                    const htmlpengumuman = await pagepengumuman.content();
                                    if (htmlpengumuman.length > 250) {
                                        var nilaipengumuman = jjj + 1;
                                        var nilaipagepengumuman = nilaipengumuman + "/" + obj.data.length;
                                        await parseHtmlpengumuman(htmlpengumuman, tender_id, linknya, nilaipagepengumuman);
                                    } else {
                                        console.log('404 - Not Found');
                                    }
                                    await browserpengumuman.close();

                                    //dt tender pemenang
                                    const browserpemenang = await puppeteer.launch({args:['--no-sandbox']});
                                    const pagepemenang = await browserpemenang.newPage();

                                    linknya = obj.data[jjj].url_tender_link.replace('lelang','evaluasi') + "/" + buatjson.data[jj][0] + '/pemenang';
                                    await pagepemenang.goto(linknya, { waitUntil: 'networkidle0' });
                                    const htmlpemenang = await pagepemenang.content();
                                    if (htmlpemenang.length > 250) {
                                        var nilaipemenang = jjj + 1;
                                        var nilaipagepemenang = nilaipemenang + "/" + obj.data.length;
                                        await parseHtmlPemenang(htmlpemenang, tender_id, linknya, nilaipagepemenang);
                                    } else {
                                        console.log('404 - Not Found');
                                    }
                                    await browserpemenang.close();
                                }
                            }
                        }
                    }
                } else {
                    asyncupdatestatusurltender(obj.data[jjj].url_tender_id, 0)
                    console.log('404 - Not Found');
                }
            } catch (err) {
                asyncupdatestatusurltender(obj.data[jjj].url_tender_id, 0);
                console.log(err);
            }
        }
    }
    await browser.close();
    hitungwaktu("SCRAP WEB", waktumulaiINSERT);
};

async function parseHtmlPemenang(html, tender_id, linknya, nilaipagepemenang) {
    var buatdata = html.split('<table class="table table-condensed">');
    
    var namatender = "";
    var kategori = "";
    var instansi = "";
    var satker = "";
    var pagu = "";
    var hps = "";
    var nama_pemenang = "";
    var alamat = "";
    var npwp = "";
    var harga_penawaran = "";

    if (buatdata.length > 1) {
        var buatdata2 = buatdata[1].split('</td>');
        for (var i=0;i<buatdata2.length;i++) {
            var buatdata3 = buatdata2[i].split('<td>');
            if (i==0) {
                if (buatdata3[1] != undefined) {
                    namatender = buatdata3[1].trim();
                }
            } else if (i==1) {
                if (buatdata3[1] != undefined) {
                    kategori = buatdata3[1].trim();
                }
            } else if (i==2) {
                if (buatdata3[1] != undefined) {
                    instansi = buatdata3[1].trim();
                }
            } else if (i==3) {
                if (buatdata3[1] != undefined) {
                    satker = buatdata3[1].trim();
                }
            } else if (i==4) {
                if (buatdata3[1] != undefined) {
                    pagu = buatdata3[1].replace('<td>','').replace('</td>','').replace(/Rp/g,'').replace(/RP/g,'').replace(/rp/g,'').replace(/\./g,'').replace(/,/g,'.').trim();
                }
            } else if (i==5) {
                if (buatdata3[1] != undefined) {
                    hps = buatdata3[1].replace('<td>','').replace('</td>','').replace(/Rp/g,'').replace(/RP/g,'').replace(/rp/g,'').replace(/\./g,'').replace(/,/g,'.').trim();
                }
            }
        }
    } 
    if (buatdata.length > 2) {
        var buatdata2 = buatdata[2].split('<tr>');
        if (buatdata2.length >2) {
            var buatdata3 = buatdata2[2].split('</tr>');
            if (buatdata3.length > 0) {
                var buatdata4 = buatdata3[0].split('</td>');
                if (buatdata4.length > 0) {
                    nama_pemenang = buatdata4[0].replace('<td>','').replace('<strong>','').replace('</strong>','').trim();
                }
                if (buatdata4.length > 1) {
                    alamat = buatdata4[1].replace('<td>','').replace('<strong>','').replace('</strong>','').trim();
                }
                if (buatdata4.length > 2) {
                    npwp = buatdata4[2].replace('<td>','').replace('<strong>','').replace('</strong>','').trim();
                }
                if (buatdata4.length > 3) {
                    harga_penawaran = buatdata4[3].replace('<td>','').replace('<strong>','').replace('</strong>','').replace(/Rp/g,'').replace(/RP/g,'').replace(/rp/g,'').replace(/\./g,'').replace(/,/g,'.').trim();
                }
            }
        }
        
    }
    var buatinsert = await asyncinsertdttenderpemenang(tender_id, namatender, kategori, instansi, 
        satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran);

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Tender: " + nilaipagepemenang + " --- Pemenang: 1 --- " + linknya);
};

async function parseHtmlpengumuman(html, tenderid, linknya, nilaipage) {
    var mode1 = Array.from(html.match(/<strong>.*/mig));
    var mode2 = Array.from(html.match(/<td colspan=.*/mig));
    var mode3 = Array.from(html.match(/<li>.*/mig));
    var mode4 = Array.from(html.match(/<td>Rp .*/mig));

    var olahdata = "";
    var kodetender = "";
    var namatender = "";
    var koderup = "";
    var sumberdana = "";
    var tanggalpembuatan = "";
    var keterangan = "";
    var tahaptendersaatini = "";
    var instansi = "";
    var satuankerja = "";
    var sistempengadaan = "";
    var tahunanggaran = "";
    var nilaipagupaket = "0";
    var nilaihpspaket = "0";
    var carapembayaran = "";
    var kualifikasiusaha = "";
    var syaratkualifikasi = "";
    var pesertatender = "0";
    var lokasipekerjaan = "";
    if (mode1 != undefined && mode1 != '' && mode1 != null) {
        if (mode1.length > 0) {
            olahdata = mode1[0].split('</strong>');
            if (olahdata.length > 0) {
                kodetender = olahdata[0].replace('<strong>','').trim();
            }
        }
        if (mode1.length > 1) {
            olahdata = mode1[1].split('</strong>');
            if (olahdata.length > 0) {
                namatender = olahdata[0].replace('<strong>','').trim();
            }
        }
    }
    if (mode2 != undefined && mode2 != '' && mode2 != null) {
        if (mode2.length > 2) {
            olahdata = mode2[2].split('<td>');
            if (olahdata.length > 1) {
                koderup = olahdata[1].replace('</td>','').trim();
            }
            if (olahdata.length > 3) {
                sumberdana = olahdata[3].replace('</td>','').trim();
            }
        }
        if (mode2.length > 3) {
            olahdata = mode2[3].split('>');
            if (olahdata.length > 1) {
                tanggalpembuatan = olahdata[1].replace('</td>','').replace('</td','').trim();
            }
        }
        if (mode2.length > 4) {
            olahdata = mode2[4].split('>');
            if (olahdata.length > 1) {
                keterangan = olahdata[1].replace('</td>','').replace('</td','').trim();
            }
        }
        if (mode2.length > 5) {
            olahdata = mode2[5].split('>');
            if (olahdata.length > 2) {
                tahaptendersaatini = olahdata[2].replace('</a>','').replace('</a','').replace('</td>','').replace('</td','').trim();
            }
        }
        if (mode2.length > 6) {
            olahdata = mode2[6].split('>');
            if (olahdata.length > 1) {
                instansi = olahdata[1].replace('</td>','').replace('</td','').trim();
            }
        }
        if (mode2.length > 7) {
            olahdata = mode2[7].split('>');
            if (olahdata.length > 1) {
                satuankerja = olahdata[1].replace('</td>','').replace('</td','').trim();
            }
        }
        if (mode2.length > 9) {
            olahdata = mode2[9].split('>');
            if (olahdata.length > 1) {
                sistempengadaan = olahdata[1].replace('</td>','').replace('</td','').trim();
            }
        }
        if (mode2.length > 10) {
            olahdata = mode2[10].split('>');
            if (olahdata.length > 1) {
                tahunanggaran = olahdata[1].replace(/&nbsp/g,'').replace(/;/g,'').replace('</td>','').replace('</td','').trim();
            }
        }
        if (mode2.length > 11) {
            olahdata = mode2[11].split('>');
            if (olahdata.length > 1) {
                carapembayaran = olahdata[1].replace('</td>','').replace('</td','').trim();
            }
        }
        if (mode2.length > 13) {
            olahdata = mode2[13].split('>');
            if (olahdata.length > 1) {
                kualifikasiusaha = olahdata[1].replace('</td>','').replace('</td','').trim();
            }
        }
        if (mode2.length > 14) {
            olahdata = mode2[14].split('<td colspan="3">');
            if (olahdata.length > 1) {
                syaratkualifikasi = olahdata[1].trim();
            }
        }
        if (mode2.length > 15) {
            olahdata = mode2[15].split('>');
            if (olahdata.length > 1) {
                pesertatender = olahdata[1].replace('</td>','').replace('</td','').trim();
            }
        }
    }
    if (mode3 != undefined && mode3 != '' && mode3 != null && mode3.length > 1) {
        var olahdata = mode3[1].split('</li>');
        if (olahdata.length > 0) {
            lokasipekerjaan = olahdata[0].replace('<li>','').trim();
        }
    }

    if (mode4 != undefined && mode4 != '' && mode4 != null) {
        if (mode4.length > 0) {
            nilaipagupaket = mode4[0].replace('<td>','').replace('</td>','').replace(/Rp/g,'').replace(/RP/g,'').replace(/rp/g,'').replace(/\./g,'').replace(/,/g,'.').trim();
        }
        if (mode4.length > 1) {
            nilaihpspaket = mode4[1].replace('<td>','').replace('</td>','').replace(/Rp/g,'').replace(/RP/g,'').replace(/rp/g,'').replace(/\./g,'').replace(/,/g,'.').trim();
        }
    }

    var buatinsert = await asyncinsertdttenderpengumuman(tenderid, kodetender, namatender, koderup, sumberdana, 
        tanggalpembuatan, keterangan, tahaptendersaatini, instansi, satuankerja, sistempengadaan, tahunanggaran, 
        nilaipagupaket, nilaihpspaket, carapembayaran, lokasipekerjaan, kualifikasiusaha, syaratkualifikasi, pesertatender);

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Tender: " + nilaipage + " --- Pengumuman: 1 --- " + linknya);
};

async function parseHtmlpeserta(html, tenderid, linknya, nilaipage) {
    var buatjson = [];
    var buatjsonarr = [];
    var datanya1 = html.trim().split('<tr>');
    if (datanya1.length > 0) {
        for (var i=1;i<datanya1.length;i++) {
            var datanya2 = datanya1[i].replace(/&nbsp;/g,'').replace(/No<\/th/g,'').split('</td>');
            if (datanya2.length > 0) {
                for (var j=0;j<datanya2.length-1;j++) {
                    var datanya3 = datanya2[j].split('>');
                    if (datanya3.length > 0) {
                        buatjsonarr.push(datanya3[1]);
                    }
                }
                buatjson.push(buatjsonarr);
                buatjsonarr = [];
            }
        }
    }
    
    if (buatjson.length > 0) {
        for (var jj=0;jj<buatjson.length;jj++) {
            if (buatjson[jj].length > 0) {
                if (buatjson[jj][2] != undefined && buatjson[jj][2] != '' && buatjson[jj][2] != null) {
                    var buatinsert = await asyncinserttenderpeserta(tenderid, buatjson[jj][0], buatjson[jj][1], buatjson[jj][2], buatjson[jj][3], buatjson[jj][4]);
                }
            }
        }
    }
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write("Tender: " + nilaipage + " --- Peserta: " + buatjson.length + " --- " + linknya);
    return buatjson;
};

function hitungwaktu(judulnya, waktumulai) {
    var waktuselesai = new Date();
    console.log("===" + judulnya + "===");
    var durasimsnya = Math.abs(waktuselesai.getTime() - waktumulai.getTime());
    var durasidetiknya = durasimsnya / 1000;
    console.log("Durasi: " + durasimsnya + " ms (" + durasidetiknya + " s)");
};

const runScrapper = async () => {
    await getAuthenticityToken();
};

module.exports = {
    runScrapper
};

//DATABASE
async function dataurlTender(type, req, receivetime) {
	var data = await geturltender(type, req, receivetime).catch(err => {
        console.log(err);
    });
	return data;
};

function geturltender(type, req, receivetime){
	return new Promise(function(resolve, reject) {
        var db = DBMS();
        var helpernya = require('../definitions/helper');

		try {
			db.query('SELECT * FROM num_url_tender WHERE status_active_id=1 AND url_tender_type=$1 ORDER BY url_second_level_domain ASC', [type]).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
					resolve(JSON.parse(helpernya.BalikanHeaderFINALOK("true", "Berhasil buka URL.", "", "Perhatikan URL yang tampil.", JSON.stringify(req), receivetime, JSON.stringify(response), response.length)));
				} else {
					reject(JSON.parse(helpernya.BalikanHeaderFINALOK("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
				}
            });
		} catch(err) {
			reject(JSON.parse(helpernya.BalikanHeaderFINALOK("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
		}
	});
};

async function asyncinsertdatatender(tender_id, urllinkid, siteUrl, kode, nama_paket, tender_label, instansi, tahapnya,
    hps, kategori, sistem_pengadaan, tahun_anggaran, nilai_kontrak, update_pengecualian) {
	var data = await insertdatatender(tender_id, urllinkid, siteUrl, kode, nama_paket, tender_label, instansi, tahapnya,
        hps, kategori, sistem_pengadaan, tahun_anggaran, nilai_kontrak, update_pengecualian).catch(err => {
            //console.log(err);
      });
	return data;
};

function insertdatatender(tender_id, urllinkid, siteUrl, kode, data_paket, instansi, tahap,
    hps, data_tahun_anggaran, sistem_pengadaan, nilai_kontrak, update_pengecualian) {
    return new Promise(function(resolve, reject) {
        try {
            var modelsnya = require('../models/mdl_insert_tender');
            
            var nama_paket = "";
            var tender_label = "";
            var kategori = "";
            var tahun_anggaran = "";
            var tahapnya = tahap.replace("[...]","").trim();

            var utksplitlabel = data_paket.split('<span class=\'label label-warning\'>');
            nama_paket = utksplitlabel[0].trim();
            if (utksplitlabel.length > 1) {
                tender_label = utksplitlabel[1].replace("</span>", "");
            } else {
                tender_label = "";
            }
            var utksplittahunanggaran = data_tahun_anggaran.split('-');
            kategori = utksplittahunanggaran[0].trim();
            if (utksplittahunanggaran.length > 1) {
                tahun_anggaran = utksplittahunanggaran[1].replace("-", "");
                tahun_anggaran = tahun_anggaran.replace("TA", "");
                tahun_anggaran = tahun_anggaran.replace(" ", "");
                tahun_anggaran = tahun_anggaran.trim();
            } else {
                tahun_anggaran = "";
            }
            var initializePromise = modelsnya.insertdttender(tender_id, urllinkid, siteUrl, kode, nama_paket, tender_label, instansi, tahapnya,
                hps, kategori, sistem_pengadaan, tahun_anggaran, nilai_kontrak, update_pengecualian);
            initializePromise.then(function() {
                resolve();
            }, function(err) {
                reject(err);
            });
        } catch(err) {
            reject(err);
        }
    });
};

function updatestatusurltender(url_tender_idnya, statusonnya) {
    return new Promise(function(resolve, reject) {
        try {
            var modelsnya = require('../models/mdl_insert_tender');

            var initializePromise = modelsnya.updatestatusurltender(url_tender_idnya, statusonnya);
            initializePromise.then(function() {
                resolve();
            }, function(err) {
                reject(err);
            });
        } catch(err) {
            reject(err);
        }
    });
};

async function asyncupdatestatusurltender(url_tender_idnya, statusonnya) {
	var data = await updatestatusurltender(url_tender_idnya, statusonnya).catch(err => {
            console.log(err);
      });
	return data;
};

async function asyncinserttenderpeserta(tender_id, no, nama_peserta, 
    npwp, harga_penawaran, harga_terkoreksi) {
	var data = await inserttenderpeserta(tender_id, no, nama_peserta, 
        npwp, harga_penawaran, harga_terkoreksi).catch(err => {
        console.log(err);
      });
	return data;
};

function inserttenderpeserta(tender_id, no, nama_peserta, 
    npwp, harga_penawaran, harga_terkoreksi) {
    
    return new Promise(function(resolve, reject) {
        try {
            var modelsnya = require('../models/mdl_insert_tender_peserta');

            var initializePromise = modelsnya.insertdttenderpeserta(tender_id, no, nama_peserta, 
                npwp, harga_penawaran, harga_terkoreksi);
            initializePromise.then(function() {
                resolve();
            }, function(err) {
                reject(err);
            });
        } catch(err) {
            reject(err);
        }
    });
};

async function asyncinsertdttenderpengumuman(tender_id, kode, nama_tender, kode_rup, sumber_dana, 
    tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
    nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender) {
	var data = await insertdttenderpengumuman(tender_id, kode, nama_tender, kode_rup, sumber_dana, 
        tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
        nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender).catch(err => {
        console.log(err);
      });
	return data;
};

function insertdttenderpengumuman(tender_id, kode, nama_tender, kode_rup, sumber_dana, 
    tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
    nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender) {
    
    return new Promise(function(resolve, reject) {
        try {
            var modelsnya = require('../models/mdl_insert_tender_pengumuman');

            var initializePromise = modelsnya.insertdttenderpengumuman(tender_id, kode, nama_tender, kode_rup, sumber_dana, 
                tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
                nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender);
            initializePromise.then(function() {
                resolve();
            }, function(err) {
                reject(err);
            });
        } catch(err) {
            reject(err);
        }
    });
};

async function asyncinsertdttenderpemenang(tender_id, nama_tender, kategori, instansi, 
    satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran) {
	var data = await insertdttenderpemenang(tender_id, nama_tender, kategori, instansi, 
        satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran).catch(err => {
        console.log(err);
      });
	return data;
};

function insertdttenderpemenang(tender_id, nama_tender, kategori, instansi, 
    satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran) {
    
    return new Promise(function(resolve, reject) {
        try {
            var modelsnya = require('../models/mdl_insert_tender_pemenang');

            var initializePromise = modelsnya.insertdttenderpemenang(tender_id, nama_tender, kategori, instansi, 
                satker, pagu, hps, nama_pemenang, alamat, npwp, harga_penawaran);
            initializePromise.then(function() {
                resolve();
            }, function(err) {
                reject(err);
            });
        } catch(err) {
            reject(err);
        }
    });
};