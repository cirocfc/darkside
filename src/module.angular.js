export default function Angular(g, d) {
  let global = g;
  let debug = d;
  let rootScope = null;
  let rootScopeNew = null;
  let destroyers = [];
  let active = false;

  this.init = ($rootScope) => {
    if (active) {
      debug.info('Darkside - Angular - Already initialized!');
      return;
    }

    if (!global || !global.jQuery || !$rootScope || !global.angular) {
      debug.error('Darkside - Angular - Missing dependencies!');
      return;
    }

    active = true;
    rootScope = $rootScope;
    rootScopeNew = $rootScope.$new;

    $rootScope.$new = function () {
      const $createdScope = rootScopeNew.apply(this, arguments);

      destroyers.push(
        $createdScope.$on('$destroy', function () {
          setTimeout(() => {
            $createdScope.$$destroyed = false;
            $createdScope.$destroy();
          }, 0);

          let cache = global.jQuery.cache || {};
          let keys = Object.keys(cache);
          keys.forEach(key => {
            const value = cache[key];
            if (value && value.data && Object.keys(value.data).length === 0) {
              delete cache[key];
              debug.info('Darkside - AngularJS - Removed cached scope!');
            }
          });
        })
      );

      return $createdScope;
    };

    debug.warn('Darkside - AngularJS - This will proxy new $scope\'s registration!');
    debug.info('Darkside - AngularJS - Initialized!');
  };

  this.destroy = () => {
    rootScope && (rootScope.$new = rootScopeNew);
    destroyers.forEach(destroyFn => destroyFn());
    this.destroyers = null;
  };
}
