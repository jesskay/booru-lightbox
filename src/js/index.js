const hostDomain = unsafeWindow.location.host;

Loader.define('booru', ['styles', 'lightbox', 'utils'], function(styles, lightbox, utils, settings) {
  let site = null;
  let currentSite = null;
  let styles = {};
  let urlCache = {};
  let preloadCache = [];
  let currentId = "";

  return {
  	"site": null,
    "currentSite": null,
  	"styles": {},
  	"urlCache": {},
  	"preloadCache": [],
  	"currentId": "",

  	init(site) {
  		this.log("Starting up version:", settings.version);
  		lightbox.init();
  		this.initEvents();

      site = Loader.require(site);
      currentSite = site;

  		this.log("Detected:", site.name);
  		}
  	},
    checkInit(domains, module) {
      if(domains.indexOf(hostDomain) > -1) {
        this.init(module);
      }
    },
  	initEvents() {
  		unsafeWindow.addEventListener("keydown", e => {
  			if(!lightbox.visible) return true;
  			if(e.keyCode != 39 && e.keyCode != 37) return true;
  			e.preventDefault();

  			var getNext = site[e.keyCode == 39 ? "getNextId" : "getPreviousId"];
  			getNext(currentId, id => {
  				if(id === null) {
  					lightbox.hide();
  				} else {
  					this.showLightbox(id);
  				}
  			});

  			return false;
  		});
  	},
  	fetchImageURL(id, callback) {
  		if(urlCache.hasOwnProperty(id)) {
  			callback(urlCache[id]);
  			return true;
  		} else {
  			Booru.site.fetchImageURL(id, url => {
          let extension = url.slice(url.lastIndexOf(".") + 1);
          if(!lightbox.supports(extension)) {
            url = settings.unsupportedUrl;
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
});
