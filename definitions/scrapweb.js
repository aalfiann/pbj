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
	
    var waktumulaiINSERT = new Date();
    const browser = await puppeteer.launch({args:['--no-sandbox']});
    //const browser = await puppeteer.launch({args:['--no-sandbox']});
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
                            
                            startPage = ((i-1)*itemPerPage)
                            await page.goto(siteUrl(obj.data[jjj].url_tender_link_data, token, i, startPage, itemPerPage), {waitUntil: 'networkidle0'});
                            var buatjson = await transformJson(page);
                            if (buatjson.data.length > 0) {
                                for (var jj=0;jj<buatjson.data.length;jj++) {
                                    var buatinsert = await asyncinsertdatatender(obj.data[jjj].url_tender_id, obj.data[jjj].url_tender_link, buatjson.data[jj][0], buatjson.data[jj][1], buatjson.data[jj][2], buatjson.data[jj][3],
                                    buatjson.data[jj][4], buatjson.data[jj][8], buatjson.data[jj][6] + " - " + buatjson.data[jj][5]+ " - " + buatjson.data[jj][7], buatjson.data[jj][10], obj.data[jjj].tahap_update_pengecualian);
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

async function asyncinsertdatatender(urllinkid, siteUrl, kode, nama_paket, tender_label, instansi, tahapnya,
    hps, kategori, sistem_pengadaan, tahun_anggaran, nilai_kontrak, update_pengecualian) {
	var data = await insertdatatender(urllinkid, siteUrl, kode, nama_paket, tender_label, instansi, tahapnya,
        hps, kategori, sistem_pengadaan, tahun_anggaran, nilai_kontrak, update_pengecualian).catch(err => {
            console.log(err);
      });
	return data;
};

function insertdatatender(urllinkid, siteUrl, kode, data_paket, instansi, tahap,
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
            var initializePromise = modelsnya.insertdttender(urllinkid, siteUrl, kode, nama_paket, tender_label, instansi, tahapnya,
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