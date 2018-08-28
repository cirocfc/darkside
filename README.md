# Darkside

Script to extend native DOM listeners to add the capability to call `getEventListeners` method for DOM elements \o/

---

### Main commands:

#### Start
`___darkside.init()`

#### Stop
`___darkside.destroy()`

#### Enable/disable debug logs
`___darkside.debug(true|false)`

#### Call a module
`___darkside.module('#MODULE_NAME')`

#### Register a module
`___darkside.module('#MODULE_NAME', #SOME_FUNCTION)`

---

### Events module:

#### Extend DOM listeners
`___darkside.module('events').init()`

#### Roll back to native DOM listeners
`___darkside.module('events').destroy()`

#### Get info about number of listeners from detached DOM elements
`___darkside.module('events').count()`

#### Get detached DOM elements
`___darkside.module('events').elements`

#### Remove detached DOM elements and it's listeners
`___darkside.module('events').garbageCollector()`
