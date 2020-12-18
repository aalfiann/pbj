// var sedangjalanTender = 0;
// var sedangjalanLPJK = 0;
// var sedangjalanRepairHPS = 0;

// async function scrapwebtender() {
//     var scrapwebnya = require('../definitions/scrapwebtender');
//     await scrapwebnya.runScrapper();
//     sedangjalanTender = 0;
// };

// var AutoRunTender = setInterval(function() {
//     var tzoffset = (new Date()).getTimezoneOffset() * 60000;
// 	var tanggalambil = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
    
//     if (tanggalambil.substr(11,8) >= "00:10:01" && tanggalambil.substr(11,8) <= "05:10:01") {
//         if (sedangjalanTender == 0) {
//             sedangjalanTender = 1;
//             scrapwebtender();
//         }
//     }
// },120001);

// async function scraplpjk() {
//     var scraplpjknya = require('../definitions/scraplpjk');
//     await scraplpjknya.ambilDetailSBU();
//     sedangjalanLPJK = 0;
// };

// var AutoRunLPJK = setInterval(function() {
//     var tzoffset = (new Date()).getTimezoneOffset() * 60000;
// 	var tanggalambil = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
    
//     if (tanggalambil.substr(11,8) >= "06:10:02" && tanggalambil.substr(11,8) <= "08:10:02") {
//         if (sedangjalanLPJK == 0) {
//             sedangjalanLPJK = 1;
//             scraplpjk();
//         }
//     }
// },120002);

// async function repairhpsterjemahan() {
//     var repairhpsterjemahannya = require('../definitions/repairhpsterjemahan');
//     await repairhpsterjemahannya.repairhpsterjemahan();
//     sedangjalanRepairHPS = 0;
// };

// var AutoRunRepairHPS = setInterval(function() {
//     var tzoffset = (new Date()).getTimezoneOffset() * 60000;
// 	var tanggalambil = (new Date(Date.now() - tzoffset)).toISOString().replace("T", " ").replace("Z", "");
    
//     if (tanggalambil.substr(11,8) >= "19:10:03" && tanggalambil.substr(11,8) <= "00:00:01") {
//         if (sedangjalanRepairHPS == 0) {
//             sedangjalanRepairHPS = 1;
//             repairhpsterjemahan();
//         }
//     }
// },120003);