Booru.sites.gelbooru = {
  "name": "Gelbooru",
  "domains": ["gelbooru.com", "rule34.xxx"],
  "useAPI": false,

  init() {
    document.addEventListener("click", e => {
      if(e.ctrlKey || e.shiftKey || e.button != 0) return true;
      if(e.target.matches(".thumb:not(.blacklisted-image) > a > img")) {
        let el = e.target.parentNode;
        Booru.showLightbox(el.getAttribute("id").replace(/\D/, ""));
        e.preventDefault();
        return false;
      }
      return true;
    }, true);
  },
  fetchImageURL(id, callback) {
    //return ;
    return this.useAPI
      ? this.apiFetchImageUrl(id, callback)
      : this.scrapeImageUrl(id, callback);
  },
  scrapeImageUrl(id, callback) {
    Booru.common.ajaxText(`/index.php?page=post&s=view&id=${id}`, (err, text) => {
      var source = Booru.common.regexExtract(/image = {(.*?)};/, 1, text);
      var image = JSON.parse(`{${source.replace(/'/g, "\"")}}`);
      var url = `${image.domain}/${image.base_dir}/${image.dir}/${image.img}`;
      callback(url);
    });
  },
  apiFetchImageUrl(id, callback) {
    Booru.common.ajaxXML(`/index.php?page=dapi&s=post&q=index&id=${id}`, (err, xmldoc) => {
      var post = xmldoc.getElementsByTagName('post')[0];
      callback(post.getAttribute('file_url'));
    });
  },
  getNextId(id, callback) {
    let target = document.querySelector(`.thumb[id$='${id}']`);
    let nodes = Array.from(document.querySelectorAll(`.thumb:not(.blacklisted-image)`));
    let next = nodes.indexOf(target);

    if(next < 0 || next >= nodes.length - 1)
      return null;
    callback(nodes[next + 1].id.replace(/\D/g, ""));
  },
  getPreviousId(id, callback) {
    let target = document.querySelector(`.thumb[id$='${id}']`);
    let nodes = Array.from(document.querySelectorAll(`.thumb:not(.blacklisted-image)`));
    let previous = nodes.indexOf(target);

    if(previous < 1 || previous >= nodes.length)
      return null;
    callback(nodes[previous - 1].id.replace(/\D/g, ""));
  }
};
