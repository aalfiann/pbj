exports.insertnumurltender = function (type, url_second_level_domainnya, url_tender_linknya, 
	url_tender_link_datanya, row_yang_diambil_pernya, total_page_diambil_by_partial_scrapnya, tahap_update_pengecualiannya, status_active_idnya) {
	return new Promise(function(resolve, reject) {
		var initializePromise = insertnumurltender(type, url_second_level_domainnya, url_tender_linknya, 
			url_tender_link_datanya, row_yang_diambil_pernya, total_page_diambil_by_partial_scrapnya, tahap_update_pengecualiannya, status_active_idnya); 
		initializePromise.then(function() {
			resolve();
		}, function(err) {
			reject(err);
		});
	});
};

function insertnumurltender(type, url_second_level_domainnya, url_tender_linknya, 
	url_tender_link_datanya, row_yang_diambil_pernya, total_page_diambil_by_partial_scrapnya, tahap_update_pengecualiannya, status_active_idnya){
	return new Promise(function(resolve, reject) {
		const { v4: uuidv4 } = require('uuid');
		var db = DBMS();
		
		try {
			var utkinput = [uuidv4(), type, url_second_level_domainnya, url_tender_linknya, 
			url_tender_link_datanya, row_yang_diambil_pernya, total_page_diambil_by_partial_scrapnya, tahap_update_pengecualiannya, status_active_idnya];

			db.query('INSERT INTO num_url_tender (url_tender_id, url_tender_type, url_second_level_domain, url_tender_link, url_tender_link_data, row_yang_diambil_per, total_page_diambil_by_partial_scrap, tahap_update_pengecualian, created_date, modified_date, status_active_id) SELECT $1, $2, $3, $4, $5, $6, $7, $8, now(), now(), $9 WHERE NOT EXISTS (SELECT 1 FROM num_url_tender WHERE url_tender_link = $4) RETURNING *;', utkinput).callback(function(err, response) {
				if (err) throw err;

				if (response.length > 0) {
					resolve('Sukses Input.');
				} else {
					reject('Sudah ada data.');
				}
			});
		} catch(err) {
			reject(err);
		}
	});
};