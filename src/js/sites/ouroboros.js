Booru = Booru || {sites: {}};
Booru.sites.ouroboros = {
	"name": "Ouroboros",
  "domains": ["e621.net", "e926.net"],

	init() {
    document.addEventListener("click", e => {
      if(e.ctrlKey || e.shiftKey || e.button != 0) return true;
      if(e.target.matches(".thumb:not(.blacklisted) > a > img")) {
        let el = e.target.parentNode.parentNode;
        Booru.showLightbox(el.getAttribute("id").replace(/\D/, ""));
        e.preventDefault();
        return false;
      }
      return true;
    }, true);
	},
	fetchImageURL(id, callback) {
		Booru.common.ajaxJSON("/post/show.json?id=" + id, (err, data) => {
			callback(data["file_url"]);
		});
	},
	getNextId(id, callback) {
    let target = document.querySelector(`.thumb[id$='${id}']`);
		let nodes = Array.from(document.querySelectorAll(`.thumb:not(.blacklisted)`));
	  let next = nodes.indexOf(target);

    if(next < 0 || next >= nodes.length - 1)
      return null;
		callback(nodes[next + 1].id.replace(/\D/g, ""));
	},
	getPreviousId(id, callback) {
    let target = document.querySelector(`.thumb[id$='${id}']`);
		let nodes = Array.from(document.querySelectorAll(`.thumb:not(.blacklisted)`));
	  let previous = nodes.indexOf(target);

    if(previous < 1 || previous >= nodes.length)
      return null;
		callback(nodes[previous - 1].id.replace(/\D/g, ""));
	}
};
