# Darkside

Script to extend native DOM listeners to add the capability to call `getEventListeners` method over DOM elements.

---

### Main commands:

#### Start
```js
___darkside.init()
```

#### Stop
```js
___darkside.destroy()
```

#### Enable/disable debug logs
```js
___darkside.debug(true|false)
```

#### Call a module
```js
___darkside.module('#MODULE_NAME')
```

#### Register a module
```js
___darkside.module('#MODULE_NAME', #SOME_FUNCTION)`
```

---

## Events module:

#### Extend DOM listeners
```js
___darkside.module('events').init()
```

#### Roll back to native DOM listeners
```js
___darkside.module('events').destroy()
```

#### Get info about number of listeners from detached DOM elements
```js
___darkside.module('events').count()
```

#### Get detached DOM elements
```js
___darkside.module('events').elements()
```

#### Remove detached DOM elements and it's listeners
```js
___darkside.module('events').garbageCollector()
```
