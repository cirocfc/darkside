// Based on https://stackoverflow.com/a/35235801

const ListenerTracker = function (_elements_, _listeners_) {
  const _super_ = {};
  let is_active = false;

  this.init = function () {
    if (!is_active) {
      intercep_events_listeners();
    }
    is_active = true;
  };

  this.destroy = function () {
    if (is_active) {
      Element.prototype.addEventListener = _super_.addEventListener;
      Element.prototype.removeEventListener = _super_.removeEventListener;
      delete Element.prototype.getEventListeners;

      _elements_.forEach(function (element) {
        element.addEventListener = element.__proto__.addEventListener = Element.prototype.addEventListener;
        element.removeEventListener = element.__proto__.removeEventListener = Element.prototype.removeEventListener;
        delete element.__proto__.getEventListeners;
        delete element.getEventListeners;
      });
    }
  };
  // register individual element an returns its corresponding listeners
  const register_element = function (element) {
    if (_elements_.indexOf(element) == -1) {
      // NB : split by useCapture to make listener easier to find when removing
      const elt_listeners = [{/*useCapture=false*/ }, {/*useCapture=true*/ }];
      _elements_.push(element);
      _listeners_.push(elt_listeners);
    }
    return _listeners_[_elements_.indexOf(element)];
  };

  const intercep_events_listeners = function () {
    // backup overrided methods
    _super_.addEventListener = Element.prototype.addEventListener;
    _super_.removeEventListener = Element.prototype.removeEventListener;

    Element.prototype.addEventListener = function (type, listener, useCapture) {
      const element = this;
      let listeners = register_element(element);
      // add event before to avoid registering if an error is thrown
      _super_.addEventListener.apply(element, arguments);
      // adapt to 'elt_listeners' index
      useCapture = useCapture ? 1 : 0;

      if (!listeners[useCapture][type]) {
        listeners[useCapture][type] = [];
      }

      listeners[useCapture][type].push(listener);
    };

    Element.prototype.removeEventListener = function (type, listener, useCapture) {
      const element = this;
      let listeners = register_element(element);
      // add event before to avoid registering if an error is thrown
      _super_.removeEventListener.apply(element, arguments);
      // adapt to 'elt_listeners' index
      useCapture = useCapture ? 1 : 0;
      if (!listeners[useCapture][type]) {
        return;
      }
      const lid = listeners[useCapture][type].indexOf(listener);
      if (lid > -1) listeners[useCapture][type].splice(lid, 1);

      const elementListeners = element.getEventListeners();
      !elementListeners.length && _elements_.splice(_elements_.indexOf(element), 1);
    };

    Element.prototype.getEventListeners = function (type) {
      const element = this;
      let listeners = register_element(element);
      let result = [];

      for (let useCapture = 0, list; list = listeners[useCapture]; useCapture++) {
        if (typeof (type) == 'string') {
          if (list[type]) {
            for (let id in list[type]) {
              result.push({ 'type': type, 'listener': list[type][id], 'useCapture': !!useCapture });
            }
          }
        } else {
          for (let _type in list) {
            for (let id in list[_type]) {
              result.push({ 'type': _type, 'listener': list[_type][id], 'useCapture': !!useCapture });
            }
          }
        }
      }
      return result;
    };
  };
};

export default ListenerTracker;
