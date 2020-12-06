require('dbms').init(CONF.database, ERROR('DBMS'));

exports.bukapostgresql = function (req, receivetime) {
	return new Promise(function(resolve, reject) {
		var initializePromise = bukapostgresql(req, receivetime); 
		initializePromise.then(function(result) {
			resolve(result);
		}, function(err) {
			console.log(err)
			reject();
		});
	});
};

exports.insertpostgresql = function (req, receivetime) {
	return new Promise(function(resolve, reject) {
		var initializePromise = insertpostgresql(req, receivetime); 
		initializePromise.then(function(result) {
			resolve(result);
		}, function(err) {
			console.log(err)
			reject();
		});
	});
};

//CONTOH POSTGRESQL
function bukapostgresql(req, receivetime){
	return new Promise(function(resolve, reject) {
        var db = DBMS();

		try {
            db.query('SELECT * FROM num_sort_by WHERE sort_by_id=$1 OR sort_by_name=$2', [1,'Label']).callback(function(err, response) {
                if (err) throw err;

                console.log("length: " + response.length);
                resolve(response);
            });
		} catch(err) {
            reject(JSON.parse(helpernya.BalikanHeaderFINALOK("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
		}
	});
};

function insertpostgresql(req, receivetime){
	return new Promise(function(resolve, reject) {
        var db = DBMS();

		try {
            var label = '\'Label';
            var labelreplace = label.replace("'","''") 
            var utkinput = [7, label];
            db.query('INSERT INTO num_sort_by_type (sort_by_type_id, sort_by_type_name) VALUES ($1, $2) RETURNING *;', utkinput).callback(function(err, response) {
                if (err) throw err;

                console.log("length: " + response.length);
                resolve(response);
            });
		} catch(err) {
            reject(JSON.parse(helpernya.BalikanHeaderFINALOK("false", "Gagal buka URL Tender.", "gagalbuka", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
		}
	});
};