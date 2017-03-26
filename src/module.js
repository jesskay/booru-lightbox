class Loader {
  constructor() {
    this.modules = {};
  }
  define(id, deps, fn) {
    if(!Array.isArray(deps)) {
      fn = deps;
      deps = [];
    }
    if(typeof fn !== "function") fn = function() { return fn; };
    this.modules[id] = { fn, deps };
  }
  require(id) {
    if(typeof this.modules[id] === "undefined") throw new Error(`Unknown module: ${id}`);
    let module = this.modules[id];
    return module.cache = (!!module.cache
      ? module.cache
      : module.fn(...module.deps.map(dep => this.require(dep)))
    );
  }
}

root["Loader"] = new Loader();
