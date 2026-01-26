(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.charginggw', [
        "ccportal.subscriber-info.charginggw.constants",
        "ccportal.subscriber-info.charginggw.filters",
        "ccportal.subscriber-info.charginggw.directives"
    ]);

    var ChargingGwModule = angular.module('ccportal.subscriber-info.charginggw');

    ChargingGwModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.charginggw', {
            abstract: true,
            template: '<div ui-view></div>'
        });

    });

})();
