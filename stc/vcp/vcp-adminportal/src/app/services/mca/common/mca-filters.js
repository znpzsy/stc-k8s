(function () {
    'use strict';

    /* Filters */
    angular.module('adminportal.services.mca.filters', []);

    var MCAFilters = angular.module('adminportal.services.mca.filters');

    MCAFilters.filter('mcaServiceType', function ($translate) {
        return function (key) {
            return key === 'MCN' ? $translate.instant('Services.MCA.Operations.MessageFormats.MCAShort') : $translate.instant('Services.MCA.Operations.MessageFormats.MCAPlusShort');
        };
    });

})();
