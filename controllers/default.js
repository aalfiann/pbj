exports.install = function () {
	// CORS('/search/*', ['get', 'post', 'put', 'delete'], true);
	ROUTE('/', view_index);
	ROUTE('/perusahaan', view_perusahaan);
	ROUTE('/about', view_about);
	// ROUTE('/search', cari_lpjk);
	// ROUTE('POST /search/viewdata/', databu, ['json']);

	// or
	// ROUTE('/');
};

function view_index() {
	var self = this;
	self.view('index');
}
function view_perusahaan() {
	var self = this;
	self.view('perusahaan');
}
function view_about() {
	var self = this;
	self.view('about');
}
// function cari_lpjk() {
// 	var self = this;
// 	self.view('search');
// }
// function databu() {
// 	var self = this;

// 	var data = self.body.data;
// 	if (data.racord == "" || data.racord == undefined) {
// 		self.json({ "status": false, "data": [] });
// 	} else {
// 		var unirest = require('unirest');
// 		var req = unirest('POST', 'https://search.lpjk.net/search_badan_usaha/searching_bu')
// 			.headers({
// 				'Content-Type': 'application/x-www-form-urlencoded',
// 			})
// 			.send('racord=' + data.racord)
// 			.send('option=' + data.option)
// 			.send('status_reg=' + data.isactive)

// 			.end(function (res) {
// 				if (res.error) {
// 					self.json({ "status": false, "data": [] });
// 				} else {
// 					var data = JSON.parse(res.body);
// 					console.log(data.record);
// 					self.json({ "status": true, "data": data.record });
// 				}
// 			});
// 	}



// }