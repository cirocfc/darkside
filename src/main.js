export default class Darkside {
  constructor(global, debug) {
    if (!global) {
      throw 'Darkside - Main - No global was provided!';
    }

    this.debug = debug;
    this.global = global;
    this.active = false;
    this.modules = {};
  }

  init() {
    if (this.active) {
      this.debug.info('Darkside - Main - Already initialized!');
      return;
    }

    Object.keys(this.modules).forEach(moduleName => this.modules[moduleName].init && this.modules[moduleName].init());
    this.active = true;
    this.debug.info('Darkside - Main - All modules initialized!');
  }

  destroy() {
    Object.keys(this.modules).forEach(moduleName => this.modules[moduleName].destroy && this.modules[moduleName].destroy());
    delete this.modules;
    this.debug.info('Darkside - Main - All modules destroyed!');
  }

  module(name, dModule) {
    if (dModule === undefined) {
      return this.modules[name];
    }

    this.modules[name] = dModule;
    this.debug.info('Darkside - Main - Registered module ' + name + '!');
  }

  toggleDebugger(active) {
    Object.keys(this.debug).forEach(key => {
      this.debug[key] = active === true ?
        function () {
          this.global.console[key].apply(this.global.console, arguments);
        }.bind(this) : function () { };
    });
  }
}
