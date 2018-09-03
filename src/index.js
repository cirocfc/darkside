import Debug from './module.debug';
import Events from './module.events';
import Darkside from './module.main';
import Angular from './module.angular';

(function (global) {
  // Create debugger
  const debug = new Debug();

  // Init darkside
  const darkside = new Darkside(global, debug);

  // Register events module
  const mEvents = new Events(global, debug);
  darkside.register('events', mEvents);

  // Register angular module
  const mAngular = new Angular(global, debug);
  darkside.register('angular', mAngular);

  // Register on global
  global.___darkside = darkside;
}(window));
