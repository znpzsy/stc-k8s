(function () {
    'use strict';

    /* Filters */
    angular.module('ccportal.products.usc.filters', []);

    var UscFilters = angular.module('ccportal.products.usc.filters');

    UscFilters.filter('UscServiceInitiatedFilter', function () {
        return function (serviceinitiated) {
            return serviceinitiated ? 'MT' : 'MO'
        };
    });

})();
