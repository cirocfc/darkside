import Debug from './module.debug';
import Events from './module.events';
import Darkside from './module.main';

(function (global) {
  // Create debugger
  const debug = new Debug();

  // Init darkside
  const darkside = new Darkside(global, debug);

  // Register events module
  const events = new Events(global, debug);
  darkside.register('events', events);

  // Register on global
  global.___darkside = darkside;
}(window));
