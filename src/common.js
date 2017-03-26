Booru = Booru || {};
Booru.common = {
	ajaxText(url, callback) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", "//" + unsafeWindow.location.host + url, true);
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				callback(null, xmlhttp.responseText);
			}
		};
		xmlhttp.send("");
	},
	ajaxXML(url, callback) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", "//" + unsafeWindow.location.host + url, true);
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				callback(null, xmlhttp.responseXML);
			}
		};
		xmlhttp.send("");
	},
	ajaxJSON(url, callback) {
    Booru.common.ajaxText(url, (err, result) => {
      callback(null, JSON.parse(result));
    });
	},
	regexExtract(regex, index, input) {
    var result = regex.exec(input);
    return (result === null || index >= result.length) ? false : result[index];
	}
};
