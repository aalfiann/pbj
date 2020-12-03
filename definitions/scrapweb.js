const puppeteer = require('puppeteer');
const moment = require('moment');

var itemPerPage = CONF.row_ambil;

function siteUrl(linkdata, token, page = 1, start = 0, itemPerPage = 25) {
    return linkdata+'?draw='+page+'&columns[0][data]=0&columns[0][name]=&columns[0][searchable]=true&columns[0][orderable]=true&columns[0][search][value]=&columns[0][search][regex]=false&columns[1][data]=1&columns[1][name]=&columns[1][searchable]=true&columns[1][orderable]=true&columns[1][search][value]=&columns[1][search][regex]=false&columns[2][data]=2&columns[2][name]=&columns[2][searchable]=true&columns[2][orderable]=true&columns[2][search][value]=&columns[2][search][regex]=false&columns[3][data]=3&columns[3][name]=&columns[3][searchable]=false&columns[3][orderable]=false&columns[3][search][value]=&columns[3][search][regex]=false&columns[4][data]=4&columns[4][name]=&columns[4][searchable]=true&columns[4][orderable]=true&columns[4][search][value]=&columns[4][search][regex]=false&order[0][column]=0&order[0][dir]=desc&start='+start+'&length='+itemPerPage+'&search[value]=&search[regex]=false&authenticityToken='+token+'&_='+moment().unix();
};

function getTotalRecords(html) {
    const ptemp1 = html.split('Tampilan 1 sampai 25 dari ');
    const ptemp2 = ptemp1[1].split(' data');
    return Number(ptemp2[0].replace(',',''));
};

function getToken(html) {
    const temp1 = html.split('d.authenticityToken = \'');
    const temp2 = temp1[1].split('\';');
    return temp2[0];
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
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    var obj = await dataTender("lpse", "", receivetime); 

    for (var jjj=0;jjj<obj.data.length;jjj++){
        await page.goto(obj.data[jjj].url_tender_link, {waitUntil: 'networkidle0'});
        const html = await page.content();
        const token = getToken(html);
        const totalRecords = getTotalRecords(html);
        if (obj.data[jjj].row_yang_diambil_per > 0 && obj.data[jjj].row_yang_diambil_per != undefined && obj.data[jjj].row_yang_diambil_per != '') {
            itemPerPage = obj.data[jjj].row_yang_diambil_per;
        }
        const totalPage = Math.ceil(totalRecords/itemPerPage);
        let startPage = 0;
        for (let i = 1; i <= totalPage; i++) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write("halaman: " + i);
            startPage = ((i-1)*itemPerPage)
            await page.goto(siteUrl(obj.data[jjj].url_tender_link_data, token, i, startPage, itemPerPage));
            var buatjson = await transformJson(page);
            if (buatjson.data.length > 0) {
                for (var jj=0;jj<buatjson.data.length;jj++) {
                    insertdatatender(obj.data[jjj].url_tender_id, obj.data[jjj].url_tender_link, buatjson.data[jj][0], buatjson.data[jj][1], buatjson.data[jj][2], buatjson.data[jj][3],
                    buatjson.data[jj][4], buatjson.data[jj][8], buatjson.data[jj][6] + " - " + buatjson.data[jj][5]+ " - " + buatjson.data[jj][7], buatjson.data[jj][10], obj.data[jjj].tahap_update_pengecualian);
                }
            }
        }
    }
    await browser.close();
    hitungwaktu("SCRAP", waktumulaiINSERT);
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
async function dataTender(type,req,receivetime) {
	var data = await geturltender(type,req,receivetime).catch(err => {
	  console.log(err);
    });
	return data;
};

function geturltender(type, req, receivetime){
	return new Promise(function(resolve, reject) {
        var helpernya = require('../definitions/helper');
		var nosql = NOSQL('num_url_tender');

		try {
			nosql.find().make(function(builder) {
				builder.where('status_active_id', 1);
				builder.where('url_tender_type', type);
				builder.callback(function(err, response, count) {
					if (err) throw err;

					if (count > 0) {
						resolve(JSON.parse(helpernya.BalikanHeaderFINALOK("true", "Berhasil buka URL.", "", "Perhatikan URL yang tampil.", JSON.stringify(req), receivetime, JSON.stringify(response))));
					} else {
						reject(JSON.parse(helpernya.BalikanHeaderFINALOK("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "")));
					}
				});
			});
		} catch(err) {
            reject(JSON.parse(helpernya.BalikanHeaderFINALOK("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "")));
		}
	});
};

function insertdatatender(urllinkid, siteUrl, kode, data_paket, instansi, tahap,
    hps, data_tahun_anggaran, sistem_pengadaan, nilai_kontrak, update_pengecualian) {
    var helpernya = require('../definitions/helper');

    var nama_paket = "";
    var tender_label = "";
    var kategori = "";
    var tahun_anggaran = "";
    
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
    helpernya.insertdttender(urllinkid, siteUrl, kode, nama_paket, tender_label, instansi, tahap,
        hps, kategori, sistem_pengadaan, tahun_anggaran, nilai_kontrak, update_pengecualian);
};