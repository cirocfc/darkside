export default class Darkside {
  constructor(global, debug) {
    if (!global) {
      throw 'Darkside - Main - No global was provided!';
    }

    this._debug = debug;
    this.global = global;
    this.active = false;
    this.modules = {};
  }

  init() {
    if (this.active) {
      this._debug.info('Darkside - Main - Already initialized!');
      return;
    }

    Object.keys(this.modules).forEach(moduleName => this.modules[moduleName].init && this.modules[moduleName].init());
    this.active = true;
    this._debug.info('Darkside - Main - All modules initialized!');
  }

  destroy() {
    Object.keys(this.modules).forEach(moduleName => this.modules[moduleName].destroy && this.modules[moduleName].destroy());
    delete this.modules;
    this._debug.info('Darkside - Main - All modules destroyed!');
  }

  register(name, module) {
    if (!name || !module) {
      this._debug.warn('Darkside - Main - Could not register module!');
      return;
    }

    this.modules[name] = module;
    this._debug.info('Darkside - Main - Registered module ' + name + '!');
  }

  debug(active) {
    Object.keys(this._debug).forEach(key => {
      this._debug[key] = active === true ?
        function () {
          this.global.console[key].apply(this.global.console, arguments);
        }.bind(this) : function () { };
    });
  }
}
