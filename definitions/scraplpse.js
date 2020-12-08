const puppeteer = require('puppeteer');

var itemPerPage = CONF.row_ambil;
var pagepartial = CONF.page_partial;

const preparePageForTests = async (page) => {
    const userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    await page.setUserAgent(userAgent);
}

async function parseHtml(html) {
    var waktumulaiINSERT = new Date();
    var x = Array.from(html.match(/(\'<p>Website : <a href=\").*/mig));
    var result = Array();
    x.forEach((url) => {
        var u = url.split("=\"")[1].replace("\">' +", "").trim();
        if (result.indexOf(u) < 1) {
            result.push(u);
        }
    });
    if (result.length > 0) {
        for (var jj=0;jj<result.length;jj++) {
            var buatinsert = await asyncinserturltender('lpse', result[jj], itemPerPage, pagepartial, 'Tahap Sudah Selesai');
        }
    }
    hitungwaktu("SCRAP LPSE", waktumulaiINSERT);
    return result;
};

const getLpseURL = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('http://inaproc.id/lpse', { waitUntil: 'networkidle0' });
    const html = await page.content();
    const dataUrl = await parseHtml(html);

    await browser.close();
};

module.exports = {
    getLpseURL
};

//DATABASE
async function asyncinserturltender(type, url_tender_linknya, 
	row_yang_diambil_pernya, total_page_diambil_by_partial_scrapnya, tahap_update_pengecualiannya) {
	var data = await inserturltender(type, url_tender_linknya, 
        row_yang_diambil_pernya, total_page_diambil_by_partial_scrapnya, tahap_update_pengecualiannya).catch(err => {
        console.log(err);
      });
	return data;
};

function inserturltender(type, url_tender_linknya, 
	row_yang_diambil_pernya, total_page_diambil_by_partial_scrapnya, tahap_update_pengecualiannya) {
    
    return new Promise(function(resolve, reject) {
        try {
            var modelsnya = require('../models/mdl_insert_url_tender');

            url_tender_linknya = url_tender_linknya.replace('eproc4','').replace('eproc','');

            if (url_tender_linknya.substring(url_tender_linknya.length-1, url_tender_linknya.length) == "/") {
                url_tender_linknya = url_tender_linknya + 'eproc4';
            } else {
                url_tender_linknya = url_tender_linknya + '/eproc4';
            }
            
            var url_tender_link = url_tender_linknya + '/lelang';

            var url_second_level_domain = getHostName(url_tender_linknya);
            url_second_level_domain = url_second_level_domain.split('.');
            
            var statusactiveidnya = 1;
            if (url_second_level_domain.length > 0) {
                var url_second_level_domainnya = url_second_level_domain[1];
                if (isNaN(url_second_level_domainnya)) {
                } else {
                    statusactiveidnya = 1;
                    url_second_level_domainnya = getHostName(url_tender_linknya);
                }
            }
            var url_tender_link_data = url_tender_linknya + '/dt/lelang';
            var initializePromise = modelsnya.insertnumurltender(type, url_second_level_domainnya, url_tender_link, 
                url_tender_link_data, row_yang_diambil_pernya, total_page_diambil_by_partial_scrapnya, tahap_update_pengecualiannya, statusactiveidnya);
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

function getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2];
    }
    else {
        return null;
    }
};

function hitungwaktu(judulnya, waktumulai) {
    var waktuselesai = new Date();
    console.log("===" + judulnya + "===");
    var durasimsnya = Math.abs(waktuselesai.getTime() - waktumulai.getTime());
    var durasidetiknya = durasimsnya / 1000;
    console.log("Durasi: " + durasimsnya + " ms (" + durasidetiknya + " s)");
};