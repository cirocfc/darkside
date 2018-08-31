import Debug from './debug';
import Events from './events';
import Darkside from './main';

// import events from './module.events';

(function (global) {
  // Create debugger
  const debug = new Debug();

  // Init darkside
  const darkside = new Darkside(global, debug);

  // Register events module
  const events = new Events(global, debug);
  darkside.module('events', events);

  // Register on global
  global.___darkside = darkside;
}(window));
