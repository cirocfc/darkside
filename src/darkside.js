(function (global) {
  var emptyFn = function () { };
  var debug = {
    info: emptyFn,
    warn: emptyFn,
    table: emptyFn
  };

  // Bootstrap Darkside
  (function () {
    var darkside = {};
    var modules = {};

    darkside.debug = function (active) {
      if (active === true) {
        Object.keys(debug).forEach(function (key) {
          debug[key] = function () {
            console[key].apply(console, arguments);
          };
        });
      } else {
        Object.keys(debug).forEach(function (key) {
          debug[key] = emptyFn;
        });
      }
    };

    darkside.init = function () {
      Object.keys(modules).forEach(function (moduleName) {
        modules[moduleName].init && modules[moduleName].init();
      });

      debug.info('Darkside - Main - All modules initialized!');
    };

    darkside.destroy = function () {
      Object.keys(modules).forEach(function (moduleName) {
        modules[moduleName].destroy && modules[moduleName].destroy();
      });
      debug.info('Darkside - Main - All modules destroyed!');
    };

    darkside.module = function (name, dModule) {
      if (dModule === undefined) {
        return modules[name];
      };
      modules[name] = dModule;

      debug.info('Darkside - Main - Registered module ' + name + '!');
    };

    global.___darkside = darkside;
  }());

  // Darkside AngularJs
  (function (darkside) {
    var module = {},
      rootScope,
      rootScopeNew,
      compile,
      $$addScopeInfo,
      destroyers = [];

    module.init = function ($rootScope, $compile, jQuery) {
      if (!jQuery || !$rootScope || !$compile || !global.angular || global.angular.version.full !== '1.3.0-rc.0') {
        return;
      }

      debug.warn('Darkside - AngularJS - This module will override AngularJS\'s new scopes');

      compile = $compile;
      rootScope = $rootScope;
      rootScopeNew = $rootScope.$new;

      $rootScope.$new = function () {
        var $createdScope = rootScopeNew.apply(this, arguments);

        var destroyer = $createdScope.$on('$destroy', function () {
          setTimeout(function () {
            $createdScope.$$destroyed = false;
            $createdScope.$destroy();
          }, 0);

          var cache = jQuery.cache || {};
          var keys = Object.keys(cache);
          keys.forEach(function (key) {
            var value = cache[key];
            if (value && value.data && Object.keys(value.data).length === 0) {
              delete cache[key];
              debug.info('Darkside - AngularJS - Removed cached scope!');
            };
          });

          destroyer();
          destroyers.splice(destroyers.indexOf(destroyer), 1);
        });

        destroyers.push(
          destroyer
        );

        return $createdScope;
      };

      $$addScopeInfo = compile.$$addScopeInfo;
      if (!$$addScopeInfo) {
        return;
      }

      compile.$$addScopeInfo = function ($element, scope) {
        scope && $element && (scope.___darkside = {
          $element: $element
        });
        $$addScopeInfo.apply(compile, arguments);
      };

      debug.info('Darkside - AngularJS - Initialized!');
    };

    module.destroy = function () {
      rootScope && (rootScope.$new = rootScopeNew);
      destroyers.forEach(function (destroyFn) {
        destroyFn();
      });

      compile && (compile.$$addScopeInfo = $$addScopeInfo);

      destroyers = null;
    }

    module.garbageCollector = function () {
      var ngCache = [];
      Object.keys(jQuery.cache).forEach(function (key) {
        var cached = jQuery.cache[key];
        cached.___key = key;
        if (cached && cached.data && cached.data.$scope && cached.data.$scope.___darkside) {
          ngCache.push(cached);
        }
      });
      ngCache.filter(function (cached) {
        return !cached.data
          || !cached.data.$scope
          || !cached.data.$scope.___darkside
          || !cached.data.$scope.___darkside.$element
          || !cached.data.$scope.___darkside.$element.length
          || (function () {
            var $element = cached.data.$scope.___darkside.$element;
            return !!Object.keys($element)
              .filter(function (attr) {
                return !global.isNaN(attr) && $element[attr] instanceof Element;
              })
              .map(function (attr) {
                return $element[attr];
              })
              .filter(function (element) {
                return !document.contains(element);
              }).length;
          }());
      }).forEach(function (cached) {
        var key = cached.___key;
        if (cached.data) {
          if (cached.data.$scope) {
            if (cached.data.$scope.___darkside) {
              var $element = cached.data.$scope.___darkside.$element;
              Object.keys($element)
                .filter(function (attr) {
                  return !global.isNaN(attr) && $element[attr] instanceof Element;
                })
                .map(function (attr) {
                  return $element[attr];
                })
                .forEach(function (element) {
                  element.getEventListeners && element.getEventListeners().forEach(function (options) {
                    element.removeEventListener(options.type, options.listener, options.useCapture);
                  });
                });
              // $element && $element.remove && $element.remove();


              delete cached.data.$scope.___darkside.$element;
              delete cached.data.$scope.___darkside;
            }

            debug.info('Darkside - AngularJS - Removed cached elements');
            // cached.data.$scope.$destroy && cached.data.$scope.$destroy();
            delete cached.data.$scope;
          }
          delete cached.data;
        }
        Object.keys(cached).forEach(function (attr) {
          delete cached[attr];
        });
        delete jQuery.cache[key];
      });
    };

    darkside.module('angular', module);
  }(global.___darkside));

  // Darkside Listeners
  (function (document, darkside) {
    var module = {},
      _elements_,
      _listeners_,
      _super_,
      active = false;

    var ListenerTracker = new function () {
      var is_active = false;

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
      }
      // register individual element an returns its corresponding listeners
      var register_element = function (element) {
        if (_elements_.indexOf(element) == -1) {
          // NB : split by useCapture to make listener easier to find when removing
          var elt_listeners = [{/*useCapture=false*/ }, {/*useCapture=true*/ }];
          _elements_.push(element);
          _listeners_.push(elt_listeners);
        }
        return _listeners_[_elements_.indexOf(element)];
      };

      var intercep_events_listeners = function () {
        // backup overrided methods
        _super_ = {
          addEventListener: Element.prototype.addEventListener,
          removeEventListener: Element.prototype.removeEventListener
        };

        Element.prototype.addEventListener = function (type, listener, useCapture) {
          var element = this;
          var listeners = register_element(element);
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
          var element = this;
          var listeners = register_element(element);
          // add event before to avoid registering if an error is thrown
          _super_.removeEventListener.apply(element, arguments);
          // adapt to 'elt_listeners' index
          useCapture = useCapture ? 1 : 0;
          if (!listeners[useCapture][type]) {
            return;
          }
          var lid = listeners[useCapture][type].indexOf(listener);
          if (lid > -1) listeners[useCapture][type].splice(lid, 1);

          var elementListeners = element.getEventListeners();
          !elementListeners.length && _elements_.splice(_elements_.indexOf(element), 1);
        };

        Element.prototype.getEventListeners = function (type) {
          var element = this;
          var listeners = register_element(element);
          var result = [];

          for (var useCapture = 0, list; list = listeners[useCapture]; useCapture++) {
            if (typeof (type) == 'string') {
              if (list[type]) {
                for (var id in list[type]) {
                  result.push({ 'type': type, 'listener': list[type][id], 'useCapture': !!useCapture });
                }
              }
            } else {
              for (var _type in list) {
                for (var id in list[_type]) {
                  result.push({ 'type': _type, 'listener': list[_type][id], 'useCapture': !!useCapture });
                }
              }
            }
          }
          return result;
        };
      };
    }();

    module.init = function () {
      if (active) {
        return;
      }

      _elements_ = [];
      _listeners_ = [];
      ListenerTracker.init();
      active = true;

      debug.info('Darkside - Events - Initialized!');
    };

    module.destroy = function () {
      if (!active) {
        return;
      }

      active = false;
      ListenerTracker.destroy();
      _elements_ = null;
      _listeners_ = null;

      debug.info('Darkside - Events - Destroyed!');
    };

    module.count = (function () {
      var _counter_ = {
        elements: function () {
          if (!active) {
            debug.info('Darkside - Events - Call ___darkside.init();');
            return;
          }
          return _elements_.length;
        },
        listeners: function () {
          if (!active) {
            debug.info('Darkside - Events - Call ___darkside.init();');
            return;
          }
          var count = 0;
          _elements_.forEach(function (element) {
            count += element.getEventListeners().length;
          });
          return count;
        },
        detached: function () {
          var elements = _elements_.filter(function (element) {
            return !document.contains(element);
          });

          var count = 0;
          elements.forEach(function (element) {
            count += element.getEventListeners().length;
          });

          return {
            elements: elements.length,
            listeners: count
          }
        }
      };

      return function count() {
        return {
          elements: _counter_.elements(),
          listeners: _counter_.listeners(),
          detached: _counter_.detached()
        };
      };
    }());

    module.elements = function () {
      return {
        detached: (function () {
          return _elements_.filter(function (element) {
            return !document.contains(element);
          });
        }())
      };
    };

    module.garbageCollector = function () {
      if (!active) {
        debug.info('Darkside - Events - Call ___darkside.init();');
        return;
      }

      var elementsToRemove = module.elements().detached;
      var count = 0;
      elementsToRemove.forEach(function (element) {
        var listeners = element.getEventListeners();
        var listenersLength = listeners.length;
        count += listenersLength;
        listeners.forEach(function (options) {
          element.removeEventListener(options.type, options.listener, options.useCapture);
        });

        debug.info('Darkside - Events - garbageCollector: Detached element info:');
        debug.table({
          element: {
            node: element,
            listeners: listenersLength
          }
        });

        _elements_.splice(_elements_.indexOf(element), 1);
      });

      debug.info('Darkside - Events - garbageCollector:', elementsToRemove.length, 'elements and', count, 'listeners removed!');
    };

    darkside.module('events', module);

  }(global.document, global.___darkside));

}(window));
