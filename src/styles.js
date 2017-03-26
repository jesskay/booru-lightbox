Loader.define('styles', function() {
  let styles = "{styles}";

  var el = document.getElementById("boorulightbox");
  if(!el) {
    el = document.createElement("style");
    el.type = "text/css";
    el.id = "boorulightbox";
    (document.head || document.body).appendChild(el);
  }
  el.textContent += style;
});
