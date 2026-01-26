(function () {

    'use strict';

    angular.module('partnerportal.partner-info.services.sla', [
        'partnerportal.partner-info.services.sla.dcbslasettings',
        'partnerportal.partner-info.services.sla.smsslaprofile',
        'partnerportal.partner-info.services.sla.mmsslaprofile',
        'partnerportal.partner-info.services.sla.webwapslaprofile'
    ]);

    var PartnerInfoServicesSlaModule = angular.module('partnerportal.partner-info.services.sla');

    PartnerInfoServicesSlaModule.config(function ($stateProvider) {

        $stateProvider.state('partner-info.services.sla', {
            abstract: true,
            url: "/sla-settings",
            template: '<div ui-view></div>'
        });

    });

})();