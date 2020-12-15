const puppeteer = require('puppeteer');
const DomParser = require('dom-parser');

//DATABASE
async function asyncstartGetData(req, receivetime) {
	var data = await startGetData(req, receivetime).catch(err => {
        console.log(err);
    });
	return data;
};

function startGetData(req, receivetime) {
    return new Promise((resolve, reject) => {
        var db = DBMS();
        var helpernya = require('../definitions/helper');

        try {
            db.query("SELECT dt_tender_peserta.npwp FROM dt_tender_peserta GROUP BY dt_tender_peserta.npwp ORDER BY dt_tender_peserta.npwp").callback((err, response) => {
                if (err) throw err;

                if (response.length > 0) {
                    resolve(JSON.parse(helpernya.BalikanHeaderFINALOK("true", "Berhasil buka data peserta.", "", "Perhatikan data peserta yang tampil.", JSON.stringify(req), receivetime, JSON.stringify(response), response.length)));
                } else {
                    reject(JSON.parse(helpernya.BalikanHeaderFINALOK("false", "Gagal buka data peserta.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
                }
            });
        } catch (err) {
            reject(JSON.parse(helpernya.BalikanHeaderFINALOK("false", "Gagal buka data peserta.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
        }
    });
};

async function asyncinsertlpjk(dataSBU) {
	var data = await insertlpjk(dataSBU).catch(err => {
        console.log(err);
      });
	return data;
};

function insertlpjk(dataSBU) {
    return new Promise(function(resolve, reject) {
        try {
            var modelsnya = require('../models/mdl_insert_lpjk');

            var initializePromise = modelsnya.insertlpjk(dataSBU);
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

//OKELAH
async function asynccheckNPWP(npwp) {
    var data = await checkNPWP(npwp).catch(err => {
        console.log(err);
    });
	return data;
};

function checkNPWP(npwp) {
    return new Promise((resolve, reject) => {
        var unirest = require('unirest');
        unirest('POST', 'https://search.lpjk.net/search_badan_usaha/searching_bu')
            .headers({
                'Content-Type': 'application/x-www-form-urlencoded',
            })
            .send('racord=' + npwp)
            .send('option=npwp')
            .send('status_reg=aktif')
            .end(function (res) {
                if (res.error) {
                    reject("Data not found");
                } else {
                    var data = JSON.parse(res.body);
                    resolve(data.record);
                }
            });
    });
}

const ambilDetailSBU = async () => {
    var waktumulaiINSERT = new Date();
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
    var obj = await asyncstartGetData("", receivetime); 

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    if (obj != undefined) {
        for (var jjj=0;jjj<obj.data.length;jjj++){
            try {
                var recnya = await asynccheckNPWP(obj.data[jjj].npwp);
                var html = "";
                
                if (recnya != undefined && recnya != null && recnya != '' && recnya.length > 0) {
                    await page.goto(recnya[0].link, { waitUntil: 'networkidle0' });
                    html = await page.content();
                    if (html.length > 250) {
                        parseHtml(html);
                    }
                }
            } catch (err) {
                console.log(err);
            }
        }
    }
    await browser.close();
    hitungwaktu("SCRAP LPJK", waktumulaiINSERT);
};

async function parseHtml(strHtml) {
    var parser = new DomParser();
    var dom = parser.parseFromString(strHtml, "text/html");
    var badanUsaha = dom.getElementById('badan_usaha');
    if (badanUsaha != undefined && badanUsaha != null && badanUsaha != '') {
        var dtBadanUsaha = await parseBadanUsaha(badanUsaha.innerHTML);
        var pengurus = dom.getElementById("pengurus");
        var dtPengurus = await parsePengurus(pengurus.innerHTML);
        var keuangan = dom.getElementById("keuangan");
        var dtKeuangan = await parseKeuangan(keuangan.innerHTML);
        var tenagaKerja = dom.getElementById("tenaga_kerja");
        var dtTenagaKerja = await parseTenagaKerja(tenagaKerja.innerHTML);
        var kualifikasiDanKlasifikasi = dom.getElementById("kualifikasi_dan_klasifikasi");
        var dtKualifikasiDanKlasifikasi = await parseKualifikasiDanKlasifikasi(kualifikasiDanKlasifikasi.innerHTML);
        var dataSBU = {
            sbu: dtBadanUsaha,
            pengurus: dtPengurus,
            keuangan: dtKeuangan,
            tenaga_kerja: dtTenagaKerja,
            kualifikasi_dan_klasifikasi: dtKualifikasiDanKlasifikasi
        }
        await asyncinsertlpjk(dataSBU);
        return dataSBU;
    } else {
        return "";
    }
    
};

async function parseKualifikasiDanKlasifikasi(strData) {
    var dom = new DomParser().parseFromString(strData);
    var tables = dom.getElementsByTagName('table');
    var tds = new DomParser().parseFromString(tables[1].innerHTML).getElementsByTagName('td');
    var index = 1;
    var data = [];
    var dataPool = {}
    Array.from(tds).map((t) => {
        if (index > 3) {
            if (index == 4) dataPool.sub_bidang_klasifikasi = t.innerHTML;
            if (index == 5) dataPool.no_kode = t.innerHTML;
            if (index == 6) dataPool.kualifikasi = t.innerHTML;
            if (index == 7) dataPool.tahun = t.innerHTML;
            if (index == 8) dataPool.nilai = t.innerHTML;
            if (index == 9) dataPool.asosiasi = t.innerHTML;
            if (index == 10) dataPool.tgl_permohonan = t.innerHTML;
            if (index == 11) dataPool.tgl_cetak_pertama = t.innerHTML;
            if (index == 12) dataPool.tgl_cetak_perubahan_terakhir = t.innerHTML;
            if (index == 13) dataPool.tgl_reg_thn_2r = t.innerHTML;
        } else {
            dataPool = {};
        }
        index++;
        if (index == 14) {
            data.push(dataPool);
            index = 3;
        }
    });
    //console.log(data);
    return data;
};

async function parseTenagaKerja(tenagaKerja) {
    var dom = new DomParser().parseFromString(tenagaKerja);
    var tables = dom.getElementsByTagName('table');
    var tds = new DomParser().parseFromString(tables[1].innerHTML).getElementsByTagName('center');
    var index = 1;
    var data = [];
    var dataPool = {}
    Array.from(tds).map((t) => {
        //console.log(index + ":" + t.innerHTML);
        if (index > 9) {
            if (index == 10) dataPool.nama = t.innerHTML;
            if (index == 11) dataPool.tgl_lahir = t.innerHTML;
            if (index == 12) dataPool.ktp = t.innerHTML;
            if (index == 13) dataPool.pendidikan = t.innerHTML;
            if (index == 14) dataPool.no_registrasi = t.innerHTML;
            if (index == 15) dataPool.jenis_sertifikat = t.innerHTML;
            if (index == 16) {
                var pecahdata = t.innerHTML.split(/"/g);
                if (pecahdata.length > 0) {
                    dataPool.detail = pecahdata[1];
                } else {
                    dataPool.detail = t.innerHTML;
                }
            }
        } else {
            dataPool = {};
        }
        index++;
        if (index == 17) {
            data.push(dataPool);
            index = 9;
        }
    });
    //console.log(data);
    return data;
};

async function parseKeuangan(keuangan) {
    var dom = new DomParser().parseFromString(keuangan);
    var tables = dom.getElementsByTagName('table');
    // console.log(tables[3].innerHTML);
    var tds = new DomParser().parseFromString(tables[3].innerHTML).getElementsByTagName('td');
    var index = 1;
    var data = [];
    var dataPool = {}
    Array.from(tds).map((t) => {
        //console.log(index + ":" + t.innerHTML);
        if (index > 2) {
            if (index == 3) dataPool.nama = t.innerHTML;
            if (index == 4) dataPool.ktp_npwp = t.innerHTML;
            if (index == 5) dataPool.alamat = t.innerHTML;
            if (index == 6) dataPool.jumlah_saham = t.innerHTML.replace('<div align="right">','').replace('</div>','');
            if (index == 7) dataPool.nilai_satuan_saham = t.innerHTML.replace('<div align="right">','').replace('</div>','');
            if (index == 8) dataPool.modal_dasar = t.innerHTML.replace('<div align="right">','').replace('</div>','');
            if (index == 9) dataPool.modal_setor = t.innerHTML.replace('<div align="right">','').replace('</div>','');
        } else {
            dataPool = {};
        }
        index++;
        if (index == 10) {
            data.push(dataPool);
            index = 2;
        }
    });
    //console.log(data);
    return data;
};

async function parsePengurus(pengurus) {
    var dom = new DomParser().parseFromString(pengurus);
    var tables = dom.getElementsByTagName('table');
    var tds = new DomParser().parseFromString(tables[1].innerHTML).getElementsByTagName('td');

    var index = 1;
    var data = [];
    var dataPool = {}
    Array.from(tds).map((t) => {
        //console.log(index + ":" + t.innerHTML);
        if (index > 1) {
            if (index == 2) dataPool.nama = t.innerHTML;
            if (index == 3) dataPool.tgl_lahir = t.innerHTML;
            if (index == 4) dataPool.alamat = t.innerHTML;
            if (index == 5) dataPool.no_ktp = t.innerHTML;
            if (index == 6) dataPool.jabatan = t.innerHTML;
            if (index == 7) dataPool.pendidikan = t.innerHTML;
        } else {
            dataPool = {};
        }
        index++;
        if (index == 8) {
            data.push(dataPool);
            index = 1;

        }
    });
    return data;
};

async function parseBadanUsaha(sbu) {
    var dom = new DomParser().parseFromString(sbu);
    var h6 = dom.getElementsByTagName('h6');
    var index = 1;
    var data = [];
    Array.from(h6).map((m) => {
        if (index == 3) {
            data.push(m.innerHTML);
        }
        index++;
        if (index == 4) index = 1;
    });
    return data;
};

module.exports = {
    ambilDetailSBU
};

function hitungwaktu(judulnya, waktumulai) {
    var waktuselesai = new Date();
    console.log("===" + judulnya + "===");
    var durasimsnya = Math.abs(waktuselesai.getTime() - waktumulai.getTime());
    var durasidetiknya = durasimsnya / 1000;
    console.log("Durasi: " + durasimsnya + " ms (" + durasidetiknya + " s)");
};