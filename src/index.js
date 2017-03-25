var Booru = {
	"version": "3.2.4",
	"sites": {},
	"site": null,
	"styles": {},
	"urlCache": {},
	"preloadCache": [],
	"currentId": "",

  "unsupportedUrl": "http://tylian.net/lightbox/unsupported.png",

	run() {
		Booru.log("Starting up version:", Booru.version);
		Booru.lightbox.init();
		Booru.initEvents();
		for(var site in Booru.sites) {
			if(Booru.sites[site].domains.indexOf(unsafeWindow.location.host) > -1) {
				Booru.log("Detected:", Booru.sites[site].name);
				Booru.site = Booru.sites[site];
				Booru.currentSite = site;
				Booru.site.init();
				return true;
			}
		}
	},
	initEvents() {
		unsafeWindow.addEventListener("keydown", e => {
			if(!Booru.lightbox.visible) return true;
			if(e.keyCode != 39 && e.keyCode != 37) return true;
			e.preventDefault();

			var getNext = Booru.site[e.keyCode == 39 ? "getNextId" : "getPreviousId"];
			getNext(Booru.currentId, id => {
				if(id === null) {
					Booru.lightbox.hide();
				} else {
					Booru.showLightbox(id);
				}
			});

			return false;
		});
	},
	fetchImageURL(id, callback) {
		if(Booru.urlCache.hasOwnProperty(id)) {
			callback(Booru.urlCache[id]);
			return true;
		} else {
			Booru.site.fetchImageURL(id, url => {
        let extension = url.slice(url.lastIndexOf(".") + 1);
        if(!Booru.lightbox.supports(extension)) {
          url = Booru.unsupportedUrl;
        }

				Booru.urlCache[id] = url;
				callback(url);
				return true;
			});
		}
	},
	showLightbox(id) {
		Booru.lightbox.show();
		Booru.fetchImageURL(id, function(url) {
			Booru.currentId = id;
			Booru.lightbox.loadUrl(url);

			Booru.site.getNextId(id, Booru.preloadId);
			Booru.site.getPreviousId(id, Booru.preloadId);
		});
	},
	preloadId(id) {
		if(id === null) return;
		if(Booru.preloadCache.includes(id)) return;
		Booru.fetchImageURL(id, url => {
			Booru.preloadCache.push(id);
			(new Image()).src = url;
		});
	},
	initCSS(id) {
		if(!Booru.styles[id]) return;
		Booru.addCSS(id, Booru.styles[id]);
	},
	addCSS(id, style) {
		var el = document.getElementById("boorulightbox_" + id);
		if(!el) {
			el = document.createElement("style");
			el.type = "text/css";
			el.id = "boorulightbox_" + id;
			(document.head || document.body).appendChild(el);
		}
		el.textContent += style;
	},
	deleteCSS(id) {
		var el = document.getElementById("boorulightbox_" + id);
		el && document.removeChild(el);
	},
	debug() {
		if(!Booru.settings.debug) return;
		Booru.log(...arguments);
	},
	log() {
		var args = ["[Booru Lightbox]", ...arguments];
		if("console" in unsafeWindow && typeof console != "undefined" && typeof console.log != "undefined") {
			console.log(...args);
		} else if(GM_log !== undefined) {
			GM_log(args.join(" "));
		}
	}
};
