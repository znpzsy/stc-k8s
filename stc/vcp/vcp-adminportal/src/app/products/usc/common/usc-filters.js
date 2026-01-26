(function () {
    'use strict';

    /* Filters */
    angular.module('adminportal.products.usc.filters', []);

    var UscFilters = angular.module('adminportal.products.usc.filters');

    UscFilters.filter('UscServiceInitiatedFilter', function () {
        return function (serviceinitiated) {
            return serviceinitiated ? 'MT' : 'MO'
        };
    });

})();
