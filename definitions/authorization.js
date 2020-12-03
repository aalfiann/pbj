F.onAuthorize = function(req, res, flags, callback) {
	if (jsonParserxapikey(req.headers) == 'ngupas@2020' && (jsonParserxapicontent(req.headers) == 'application/json; charset=utf-8' || jsonParserxapicontent(req.headers) == 'application/json')) {
		callback(true);
	} else {
		callback(false);
	}
};

function jsonParserxapikey(stringValue) {
	var string = JSON.stringify(stringValue);
	var objectValue = JSON.parse(string);
	return objectValue['pbj-api-key'];
}

function jsonParserxapicontent(stringValue) {
	var string = JSON.stringify(stringValue);
	var objectValue = JSON.parse(string);
	return objectValue['content-type'];
}