// const puppeteer = require('puppeteer');

// function parseHtmlsatuan1(html, namaheader) {
//     var result = "";
//     var split001 = html.split(namaheader + '</th>');
//     if (split001.length > 0) {
//         var split002 = split001[1].trim().replace(/\r?\n|\r/g, "").split('</td>');
//         if (split002.length > 0) {
//             var split003 = split002[0].trim().replace(/\r?\n|\r/g, "").replace("</strong>", "").replace("<strong>", "").replace("</a", "").split('<td colspan=');
//             if (split003.length > 0 && split003[1] != undefined && split003[1] != '') {
//                 var split004 = split003[1].split('>');
//                 if (split004.length > 0) {
//                     result = split004[2];
//                 }
//             }
//         }
//     }
//     if (result == undefined || result == null) {
//         result = '';
//     }
//     console.log(result.trim());
//     return result.trim();
// };

// function parseHtmlsatuan(html, namaheader) {
//     var result = "";
//     var mode1 = Array.from(html.match(/<td colspan=.*/mig));
//     var mode2 = Array.from(html.match(/<strong>.*/mig));
//     var mode3 = Array.from(html.match(/<li>.*/mig));
    
//     console.log(mode1);
//     console.log(mode2);
//     console.log(mode3);
//     // var split001 = html.split(namaheader + '</th>');
//     // if (split001.length > 0) {
//     //     var split002 = split001[1].trim().replace(/\r?\n|\r/g, "").split('</td>');
//     //     if (split002.length > 0) {
//     //         var split003 = split002[0].trim().replace(/\r?\n|\r/g, "").replace("</strong>", "").replace("<strong>", "").replace("</a", "").split('<td colspan=');
//     //         if (split003.length > 0 && split003[1] != undefined && split003[1] != '') {
//     //             var split004 = split003[1].split('>');
//     //             if (split004.length > 0) {
//     //                 result = split004[2];
//     //             }
//     //         }
//     //     }
//     // }
//     if (result == undefined || result == null) {
//         result = '';
//     }
//     //console.log(result.trim());
//     return result.trim();
// };

// async function parseHtml(html) {
//     var waktumulaiINSERT = new Date();
//     var buatjson = [];
//     var kodetender = parseHtmlsatuan(html, 'Kode Tender');
//     // var namatender = parseHtmlsatuan(html, 'Nama Tender');
//     // var rencanaumumpengadaan = parseHtmlsatuan(html, 'Rencana Umum Pengadaan');
//     // var tanggalpembuatan = parseHtmlsatuan(html, 'Tanggal Pembuatan');
//     // var keterangan = parseHtmlsatuan(html, 'Keterangan');
//     // var tahaptendersaatini = parseHtmlsatuan(html, 'Tahap Tender Saat ini');
//     // var instansi = parseHtmlsatuan(html, 'Instansi');
//     // var satuankerja = parseHtmlsatuan(html, 'Satuan Kerja');
//     // var kategori = parseHtmlsatuan(html, 'Kategori');
//     // var sistempengadaan = parseHtmlsatuan(html, 'Sistem Pengadaan');
//     // var tahunanggaran = parseHtmlsatuan(html, 'Tahun Anggaran');
//     // var nilaipagupaket = parseHtmlsatuan(html, 'Nilai Pagu Paket');
//     // var nilaihpspaket = parseHtmlsatuan(html, 'Nilai HPS Paket');
//     // var carapembayaran = parseHtmlsatuan(html, 'Cara Pembayaran');
//     // var lokasipekerjaan = parseHtmlsatuan(html, 'Lokasi Pekerjaan');
//     // var kualifikasiusaha = parseHtmlsatuan(html, 'Kualifikasi Usaha');
//     // var syaratkualifikasi = parseHtmlsatuan(html, 'Syarat Kualifikasi');
//     // var pesertatender = parseHtmlsatuan(html, 'Peserta Tender');

//     // var buatjsonarr = {
//     //     kodetender: kodetender,
//     //     namatender: namatender,
//     //     rencanaumumpengadaan: rencanaumumpengadaan,
//     //     tanggalpembuatan: tanggalpembuatan,
//     //     keterangan: keterangan,
//     //     tahaptendersaatini: tahaptendersaatini,
//     //     instansi: instansi,
//     //     satuankerja: satuankerja,
//     //     kategori: kategori,
//     //     sistempengadaan: sistempengadaan,
//     //     tahunanggaran: tahunanggaran,
//     //     nilaipagupaket: nilaipagupaket,
//     //     nilaihpspaket: nilaihpspaket,
//     //     carapembayaran: carapembayaran,
//     //     lokasipekerjaan: lokasipekerjaan,
//     //     kualifikasiusaha: kualifikasiusaha,
//     //     syaratkualifikasi: syaratkualifikasi,
//     //     pesertatender: pesertatender
//     // }
//     // buatjson.push(buatjsonarr);
//     // // var x = Array.from(html.match(/(\'<p>Website : <a href=\").*/mig));
//     // // var result = Array();
//     // // x.forEach((url) => {
//     // //     var u = url.split("=\"")[1].replace("\">' +", "").trim();
//     // //     if (result.indexOf(u) < 1) {
//     // //         result.push(u);
//     // //     }
//     // // });
//     // console.log(buatjson);
//     hitungwaktu("SCRAP WEB PENGUMUMAN", waktumulaiINSERT);
//     return buatjson;
// };

// const getWebPengumuman = async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();

//     await page.goto('https://lpse.jakarta.go.id/eproc4/lelang/46713127/pengumumanlelang', { waitUntil: 'networkidle0' });
//     const html = await page.content();

//     //console.log(html);
//     const dataUrl = await parseHtml(html);

//     await browser.close();
// };

// module.exports = {
//     getWebPengumuman
// };

// function hitungwaktu(judulnya, waktumulai) {
//     var waktuselesai = new Date();
//     console.log("===" + judulnya + "===");
//     var durasimsnya = Math.abs(waktuselesai.getTime() - waktumulai.getTime());
//     var durasidetiknya = durasimsnya / 1000;
//     console.log("Durasi: " + durasimsnya + " ms (" + durasidetiknya + " s)");
// };