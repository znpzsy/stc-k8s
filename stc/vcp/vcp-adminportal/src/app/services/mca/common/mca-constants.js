(function () {
    'use strict';

    /* Constants */
    angular.module('adminportal.services.mca.constants', []);

    var MCAConstants = angular.module('adminportal.services.mca.constants');

    MCAConstants.constant('MCA_AD_LISTING_MASK', {
        'NONE': 'NONE',
        'BOTH': 'BOTH',
        'DAYS_OF_WEEK': 'DAYS_OF_WEEK',
        'HOUR_OF_DAY': 'HOUR_OF_DAY'
    });

})();
