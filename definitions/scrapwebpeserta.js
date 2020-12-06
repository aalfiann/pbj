const puppeteer = require('puppeteer');

async function parseHtml(html, tenderid, linknya, nilaipage) {
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

const getWebPeserta = async () => {
    var waktumulaiINSERT = new Date();
    var tzoffset = (new Date()).getTimezoneOffset() * 60000;
	var receivetime = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
	
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    var obj = await dataTender("", receivetime); 

    if (obj != undefined){
        for (var jjj=0;jjj<obj.data.length;jjj++){
            var linknya = obj.data[jjj].url_tender_link + "/" + obj.data[jjj].kode + '/peserta';
            await page.goto(linknya, { waitUntil: 'networkidle0' });
            const html = await page.content();
            if (html.length > 256) {
                var nilai = jjj + 1;
                var nilaipage = nilai + "/" + obj.data.length;
                const dataUrl = await parseHtml(html, obj.data[jjj].tender_id, linknya, nilaipage);
            } else {
                console.log('404 - Not Found');
            }
        }
    }
    await browser.close();
    hitungwaktu("SCRAP WEB PESERTA", waktumulaiINSERT);
};

module.exports = {
    getWebPeserta
};

function hitungwaktu(judulnya, waktumulai) {
    var waktuselesai = new Date();
    console.log("===" + judulnya + "===");
    var durasimsnya = Math.abs(waktuselesai.getTime() - waktumulai.getTime());
    var durasidetiknya = durasimsnya / 1000;
    console.log("Durasi: " + durasimsnya + " ms (" + durasidetiknya + " s)");
};

//DATABASE
async function asyncinserttenderpeserta(tender_id, no, nama_peserta, 
    npwp, harga_penawaran, harga_terkoreksi) {
	var data = await inserttenderpeserta(tender_id, no, nama_peserta, 
        npwp, harga_penawaran, harga_terkoreksi).catch(err => {
        //console.log(err);
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

async function dataTender(req, receivetime) {
	var data = await getdataTender(req, receivetime).catch(err => {
        console.log(err);
    });
	return data;
};

function getdataTender(req, receivetime){
	return new Promise(function(resolve, reject) {
        var db = DBMS();
        var helpernya = require('../definitions/helper');

		try {
			db.query('SELECT * FROM dt_tender WHERE status_active_id = 1 order by kode ASC').callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
					resolve(JSON.parse(helpernya.BalikanHeaderFINALOK("true", "Berhasil buka Tender.", "", "Perhatikan URL yang tampil.", JSON.stringify(req), receivetime, JSON.stringify(response), response.length)));
				} else {
					reject(JSON.parse(helpernya.BalikanHeaderFINALOK("false", "Gagal buka Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
				}
            });
		} catch(err) {
			reject(JSON.parse(helpernya.BalikanHeaderFINALOK("false", "Gagal buka Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
		}
	});
};