const puppeteer = require('puppeteer');

async function parseHtmlPemenang(html) {
    var waktumulaiINSERT = new Date();
    var buatjson = [];

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
                    harga_penawaran = buatdata4[3].replace('<td>','').replace('<strong>','').replace('</strong>','').trim();
                }
            }
        }
        
    }
    console.log(namatender);
    console.log(kategori);
    console.log(instansi);
    console.log(satker);
    console.log(pagu);
    console.log(hps);
    console.log(nama_pemenang);
    console.log(alamat);
    console.log(npwp);
    console.log(harga_penawaran);
    hitungwaktu("SCRAP WEB PEMENANG", waktumulaiINSERT);
    return buatjson;
};

const getWebPemenang = async () => {
    const browser = await puppeteer.launch({args:['--no-sandbox']});
    const page = await browser.newPage();

    await page.goto('https://lpse.jakarta.go.id/eproc4/evaluasi/46713127/pemenang', { waitUntil: 'networkidle0' });
    const html = await page.content();

    const dataUrl = await parseHtmlPemenang(html);

    await browser.close();
};

module.exports = {
    getWebPemenang
};

function hitungwaktu(judulnya, waktumulai) {
    var waktuselesai = new Date();
    console.log("===" + judulnya + "===");
    var durasimsnya = Math.abs(waktuselesai.getTime() - waktumulai.getTime());
    var durasidetiknya = durasimsnya / 1000;
    console.log("Durasi: " + durasimsnya + " ms (" + durasidetiknya + " s)");
};

// //DATABASE
// async function asyncinsertdttenderpengumuman(tender_id, kode, nama_tender, kode_rup, sumber_dana, 
//     tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
//     nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender) {
// 	var data = await insertdttenderpengumuman(tender_id, kode, nama_tender, kode_rup, sumber_dana, 
//         tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
//         nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender).catch(err => {
//         console.log(err);
//       });
// 	return data;
// };

// function insertdttenderpengumuman(tender_id, kode, nama_tender, kode_rup, sumber_dana, 
//     tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
//     nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender) {
    
//     return new Promise(function(resolve, reject) {
//         try {
//             var modelsnya = require('../models/mdl_insert_tender_pengumuman');

//             var initializePromise = modelsnya.insertdttenderpengumuman(tender_id, kode, nama_tender, kode_rup, sumber_dana, 
//                 tanggal_pembuatan, keterangan, tahap_tender_saat_ini, instansi, satuan_kerja, sistem_pengadaan, tahun_anggaran, 
//                 nilai_pagu_paket, nilai_hps_paket, cara_pembayaran, lokasi_pekerjaan, kualifikasi_usaha, syarat_kualifikasi, peserta_tender);
//             initializePromise.then(function() {
//                 resolve();
//             }, function(err) {
//                 reject(err);
//             });
//         } catch(err) {
//             reject(err);
//         }
//     });
// };