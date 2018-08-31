import ListenerTracker from './listeners';

export default class Events {
  constructor(global, debug) {
    if (!global) {
      throw 'Darkside - Main - No global was provided!';
    }

    this.debug = debug;
    this.global = global;
    this.active = false;
    this.modules = {};
    this._elements_ = [];
    this._listeners_ = [];
    this.listenerTracker = new ListenerTracker(this._elements_, this._listeners_);
  }

  init() {
    if (this.active) {
      this.debug.info('Darkside - Events - Already initialized!');
      return;
    }

    this.active = true;
    this.listenerTracker.init();
    this.debug.info('Darkside - Events - Initialized!');
  }

  destroy() {
    if (!this.active) {
      this.debug.info('Darkside - Events - Not initialized!');
      return;
    }

    this.active = false;
    this.listenerTracker.destroy();
    this._elements_ = null;
    this._listeners_ = null;

    this.debug.info('Darkside - Events - Destroyed!');
  }

  count() {
    const elements = () => this._elements_.length;

    const listeners = () => {
      let count = 0;
      this._elements_.forEach(element => count += element.getEventListeners().length);
      return count;
    };

    const detached = () => {
      let elements = this._elements_.filter(element => !this.global.document.contains(element));
      let count = 0;
      elements.forEach(element => count += element.getEventListeners().length);

      return {
        elements: elements.length,
        listeners: count
      };
    };

    return () => ({
      elements: elements(),
      listeners: listeners(),
      detached: detached()
    })();
  }

  elements() {
    return {
      detached: (() => this._elements_.filter(element => !this.global.document.contains(element)))()
    };
  }

  garbageCollector() {
    if (!this.active) {
      this.debug.info('Darkside - Events - Not initialized!');
      return;
    }

    let count = 0;
    const elementsToRemove = this.elements().detached;

    elementsToRemove.forEach(element => {
      const listeners = element.getEventListeners();
      const listenersLength = listeners.length;
      count += listenersLength;

      listeners.forEach(options => {
        element.removeEventListener(options.type, options.listener, options.useCapture);
      });

      this.debug.info('Darkside - Events - garbageCollector: Detached element info:');
      this.debug.table({
        element: {
          node: element,
          listeners: listenersLength
        }
      });

      this._elements_.splice(this._elements_.indexOf(element), 1);
    });

    this.debug.info('Darkside - Events - garbageCollector:', elementsToRemove.length, 'elements and', count, 'listeners removed!');
  }
}
