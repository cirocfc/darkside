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
___darkside.modules.#MODULE_NAME
```

#### Register a module
```js
___darkside.register('#MODULE_NAME', #SOME_FUNCTION)`
```

---

## Events module:

#### Extend DOM listeners
```js
___darkside.modules.events.init()
```

#### Roll back to native DOM listeners
```js
___darkside.modules.events.destroy()
```

#### Get info about number of listeners from detached DOM elements
```js
___darkside.modules.events.count()
```

#### Get detached DOM elements
```js
___darkside.modules.events.elements()
```

#### Remove detached DOM elements and it's listeners
```js
___darkside.modules.events.garbageCollector()
```
