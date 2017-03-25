#!/usr/bin/env node

var fs = require("fs"),
  path = require("path"),
  vm = require("vm"),
  queue = require("queue-async"),
  sass = require("node-sass");

function addFile(source, prefix, suffix) {
	return "\n\n// " + source + "\n" + (prefix || "") + fs.readFileSync("./" + source, "utf8") + (suffix || "");
}

function addDirectory(directory, filter) {
  var script = "";
  var files = fs.readdirSync(directory);
  for(var i = 0; i < files.length; i++) {
    if(filter == undefined || (typeof filter == "function" && filter(files[i]))) {
      script += addFile(directory + files[i]);
    }
  }
  return script;
}

function deleteDirectory(folder) {
	if(!fs.existsSync(folder))
		return true;

	var contents = fs.readdirSync(folder);
	for(var i = 0; i < contents.length; i++) {
		file = path.join(folder, contents[i]);
		var stat = fs.statSync(file);
		if(stat.isDirectory()) {
			deleteDirectory(file);
		} else {
			fs.unlinkSync(file);
		}
	};

	fs.rmdirSync(folder);
	return true;
}

// This is a HUGE hack.
function generateInfo(source) {
	var sandbox = vm.createContext();
	vm.runInContext(source, sandbox, 'booru-lightbox-temp')

	return sandbox.Booru;
}

function compileSass(file, callback) {
	if(!/\.scss$/.test(file))
		return fs.readFileSync(file);

  sass.render({
    'file': file
  }, (err, result) => callback(null, result.css.toString()));
}

function handleStyle(file, callback) {
	fs.stat(file, function(err, stats) {
		if(stats.isDirectory())
			return callback(null);

		var module = path.basename(file, path.extname(file));
		compileSass(file, function(err, result) {
			if(err) return callback(err);

			result = result.replace(/([\"\'\\])/gm, "\\$1");
			result = result.replace(/\n/gm, "\\n");
			result = result.replace(/\r/gm, "\\r");
			result = result.replace(/\t/gm, "\\t");
			return callback(null, "\n// " +  file + "\nBooru.styles." + module + " = \"" + result + "\";");
		});
	});
}

function build() {
	try { fs.mkdirSync("build"); } catch(e) {}

	// Figure out which sites to include
	var mode = "blacklist";
	var modules = [];
	for(var i = 2; i < process.argv.length; i++) {
		if(process.argvargv[i].charAt(0) == '-') {
			modules.push(process.argvargv[i].substr(1));
			mode = "blacklist";
		} else {
			modules.push(process.argvargv[i]);
			mode = "whitelist";
		}
	}

	var script = "";
	script += addFile("src/index.js");
	script += addFile("src/settings.json", "Booru.settings = ", ";");
	script += addFile("src/common.js");

	var q = queue();

	var styles = fs.readdirSync("./src/style/")
	styles.forEach(function(style) {
		q.defer(handleStyle, "src/style/" + style);
	});

	q.awaitAll(function(err, results) {
		script += results.join("\n");

		script += addFile("src/lightbox.js");
    script += addDirectory('src/lightbox/');

    script += addDirectory("src/sites/", path => {
      var file = path.slice(0, -3);
			if((mode == "blacklist" && modules.indexOf(file) > -1) || (mode == "whitelist" && modules.indexOf(file) == -1)) {
				console.log(`Excluding ${file} because it's ${mode == "whitelist" ? "not on the whitelist." : "on the blacklist"}`);
				return false;
			}
			return true;
    });

		var info = generateInfo(script);
		script += "\n\nBooru.run();";

		var header = "// ==UserScript==\n";
		header += "// @name          Booru Lightbox\n";
		header += "// @namespace     http://tylian.net/\n";
		header += "// @version       " + info.version + "\n";
		header += "// @description   Previews images in a lightbox by clicking upon them.\n";
		header += "// @updateURL     http://tylian.net/lightbox/booru-lightbox.meta.js\n";
		header += "// @downloadURL   http://tylian.net/lightbox/booru-lightbox.user.js\n"

		for(var site in info.sites) {
			for(var i = 0; i < info.sites[site].domains.length; i++) {
				header += "// @match         http://" + info.sites[site].domains[i] + "/*\n";
				if(info.sites[site].https) {
					header += "// @match         https://" + info.sites[site].domains[i] + "/*\n";
				}
			}
		}

		header += "// @copyright     2013+, Tylian\n";
		header += "// ==/UserScript==";


		var out = fs.createWriteStream("./build/booru-lightbox.user.js");
		out.write(header);
		out.end(script);

		var out = fs.createWriteStream("./build/booru-lightbox.meta.js");
		out.end(header);

		console.log("\nDone! Wrote the following files:\n\t - ./build/booru-lightbox.user.js\n\t - ./build/booru-lightbox.meta.js");
	});
}

build();
