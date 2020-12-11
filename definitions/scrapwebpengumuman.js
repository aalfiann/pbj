const puppeteer = require('puppeteer');

function parseHtmlsatuan(html) {
    var result = "";
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
    var nilaipagupaket = "";
    var nilaihpspaket = "";
    var carapembayaran = "";
    var kualifikasiusaha = "";
    var syaratkualifikasi = "";
    var pesertatender = "";
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
            nilaipagupaket = mode4[0].replace('<td>','').replace('</td>','').replace('</Rp>','').replace('</RP>','').replace('</rp>','').replace('.','').replace(',','').trim();
        }
        if (mode4.length > 1) {
            nilaihpspaket = mode4[1].replace('<td>','').replace('</td>','').replace('</Rp>','').replace('</RP>','').replace('</rp>','').replace('.','').replace(',','').trim();
        }
    }
    console.log(kodetender);
    console.log(namatender);
    console.log(koderup);
    console.log(sumberdana);
    console.log(tanggalpembuatan);
    console.log(keterangan);
    console.log(tahaptendersaatini);
    console.log(instansi);
    console.log(satuankerja);
    console.log(sistempengadaan);
    console.log(tahunanggaran);
    console.log(nilaipagupaket);
    console.log(nilaihpspaket);
    console.log(carapembayaran);
    console.log(lokasipekerjaan);
    console.log(kualifikasiusaha);
    console.log(syaratkualifikasi);
    console.log(pesertatender);
    if (result == undefined || result == null) {
        result = '';
    }
    return result.trim();
};

async function parseHtml(html) {
    var waktumulaiINSERT = new Date();
    var buatjson = [];
    await parseHtmlsatuan(html);
    hitungwaktu("SCRAP WEB PENGUMUMAN", waktumulaiINSERT);
    return buatjson;
};

const getWebPengumuman = async () => {
    const browser = await puppeteer.launch({args:['--no-sandbox']});
    const page = await browser.newPage();

    await page.goto('https://lpse.jakarta.go.id/eproc4/lelang/46713127/pengumumanlelang', { waitUntil: 'networkidle0' });
    const html = await page.content();

    //console.log(html);
    const dataUrl = await parseHtml(html);

    await browser.close();
};

module.exports = {
    getWebPengumuman
};

function hitungwaktu(judulnya, waktumulai) {
    var waktuselesai = new Date();
    console.log("===" + judulnya + "===");
    var durasimsnya = Math.abs(waktuselesai.getTime() - waktumulai.getTime());
    var durasidetiknya = durasimsnya / 1000;
    console.log("Durasi: " + durasimsnya + " ms (" + durasidetiknya + " s)");
};

//DATABASE
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