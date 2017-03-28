Booru.lightbox = {
  "locked": false,
  "visible": false,
  "pollId": 0,
  "scale": 1,
  "offset": { x: 0, y: 0 },
  "position": { x: 0, y: 0 },
  "start": { x: 0, y: 0 },
  "dragging": false,
  "fullsize": false,

  "supported": ["jpg", "png", "gif", "jpeg"],

  init() {
    Booru.initCSS("lightbox");

    var container = document.createElement("div");
    container.innerHTML = Booru.lightbox.template;

    // body.innerHTML += "stuff" explodes e621
    this.shade = document.createElement("div");
    this.shade.id = "lightbox_shade";

    this.shade.addEventListener("click", () => {
      this.hide();
    }, false);
    this.shade.addEventListener("mousemove", e => {
      if(this.dragging) {
        this.offset.x = e.clientX - this.start.x;
        this.offset.y = e.clientY - this.start.y;
        this.update();
      }
    });

    document.body.appendChild(this.shade);
    unsafeWindow.addEventListener("resize", () => {
        this.reset();
    }, false);
  },
  initImage() {
    if(this.image !== undefined) return;
    this.image = document.createElement("img");
    this.image.id = "lightbox_content";
    this.image.setAttribute('draggable', false);

    this.image.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation(); // XXX
      return false;
    }, true);

    this.image.addEventListener("load", () => {
      unsafeWindow.clearTimeout(this.pollId);
      this.reset();
      this.image.classList.add("show");
    }, false);

    this.image.addEventListener("mousewheel", e => {
      e = window.event || e;
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
      if(delta > 0) {
        this.scale /= 1.12;
      } else if(delta < 0) {
        this.scale *= 1.12;
      }
      this.update();

      e.preventDefault();
      return false;
    });

    this.image.addEventListener("mousedown", e => {
      this.start = { x: e.clientX, y: e.clientY };
      this.dragging = true;
    });

    this.image.addEventListener("mouseup", e => {
      this.position.x += this.offset.x;
      this.position.y += this.offset.y;
      this.offset = { x: 0, y: 0 };
      this.dragging = false;
    });

    this.image.addEventListener("dblclick", e => {
      this.fullsize = !this.fullsize;
      if(this.fullsize) {
        this.scale = 1;
      } else {
        this.scale = this.defaultScale();
      }
      this.update();
    });

    this.shade.appendChild(this.image);
  },
  destroyImage() {
    if(this.image === undefined) return;
    this.shade.removeChild(this.image);
    unsafeWindow.clearTimeout(this.pollId);
    delete this.image;
  },
  pollFunction() {
    if(this.image.naturalWidth && this.image.naturalHeight) {
      this.reset();
      this.image.classList.add("show");
    } else {
      this.pollId = unsafeWindow.setTimeout(this.pollFunction.bind(this), Booru.settings.pollInterval);
    }
  },
  show() {
    if(this.locked) return false;
    this.locked = true;
    this.visible = true;

    this.shade.classList.add("front", "show");

    setTimeout(() => { Booru.lightbox.locked = false; }, 300);
  },
  hide() {
    if(this.locked) return;
    this.locked = true;
    this.visible = false;

    this.shade.classList.remove("show");
    setTimeout(() => {
      this.image.classList.remove("show");
      this.shade.classList.remove("front");

      this.locked = false;
    }, 300);
  },
  loadUrl(url) {
    if(!this.visible) return;
    this.pollId = window.setTimeout(this.pollFunction.bind(this), Booru.settings.pollInterval);
    this.destroyImage();
    this.initImage();
    this.image.src = url;
  },
  reset() {
    this.position = { x: 0, y: 0 };
    this.offset = { x: 0, y: 0 };
    this.dragging = false;

    this.scale = this.defaultScale();
    this.fullsize = false;
    this.update();
  },
  update() {
    var width = this.image.naturalWidth * this.scale;
    var height = this.image.naturalHeight * this.scale;

    this.image.style.marginLeft = this.position.x + this.offset.x + "px";
    this.image.style.marginTop = this.position.y + this.offset.y + "px";

    this.image.style.width = width + "px";
    this.image.style.height = height + "px";
  },
  defaultScale() {
    var width = this.image.naturalWidth;
    var height = this.image.naturalHeight;

    scale = 1;

    if(width > unsafeWindow.innerWidth || height > unsafeWindow.innerHeight) {
      scale = Math.min(unsafeWindow.innerWidth / width, unsafeWindow.innerHeight / height);
    }

    return scale;
  },
  supports(type) {
    return this.supported.includes(type);
  }
};
