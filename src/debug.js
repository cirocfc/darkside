const emptyFn = function () { };
const methods = {
  info: emptyFn,
  warn: emptyFn,
  error: emptyFn,
  table: emptyFn,
};

export default class Debug {
  constructor() {
    Object.keys(methods).forEach(key => this[key] = methods[key]);
  }
}
