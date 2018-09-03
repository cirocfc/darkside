export default class Angular {
  constructor(global, debug) {
    this.debug = debug;
    this.global = global;
    this.destroyers = [];
    this.rootScope = null;
    this.rootScopeNew = null;
  }

  init($rootScope) {
    if (!this.global || !this.global.jQuery || !$rootScope || !this.global.angular) {
      this.debug.error('Darkside - Angular - Missing dependencies!');
      return;
    }

    this.rootScope = $rootScope;
    this.rootScopeNew = $rootScope.$new;

    $rootScope.$new = function () {
      const $createdScope = this.rootScopeNew.apply(this, arguments);

      this.destroyers.push(
        $createdScope.$on('$destroy', function () {
          setTimeout(() => {
            $createdScope.$$destroyed = false;
            $createdScope.$destroy();
          }, 0);

          let cache = this.global.jQuery.cache || {};
          let keys = Object.keys(cache);
          keys.forEach(key => {
            const value = cache[key];
            if (value && value.data && Object.keys(value.data).length === 0) {
              delete cache[key];
              this.debug('Darkside - AngularJS - Removed cached scope!');
            }
          });
        })
      ).bind(this);

      return $createdScope;
    };

    this.debug.warn('Darkside - AngularJS - This will proxy new $scope\'s registration!');
    this.debug.info('Darkside - AngularJS - Initialized!');
  }

  destroy() {
    this.rootScope && (this.rootScope.$new = this.rootScopeNew);
    this.destroyers.forEach(destroyFn => destroyFn());
    this.destroyers = null;
  }
}
