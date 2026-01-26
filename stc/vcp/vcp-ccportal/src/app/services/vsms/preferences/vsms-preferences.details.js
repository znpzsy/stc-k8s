(function () {

    'use strict';

    angular.module('ccportal.services.vsms.preferences.details', []);

    var VSMSPreferencesDetailsModule = angular.module('ccportal.services.vsms.preferences.details');

    VSMSPreferencesDetailsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vsms.preferences.details', {
            url: "/details",
            templateUrl: 'services/vsms/preferences/vsms-preferences.details.html',
            controller: 'VSMSPreferencesCtrl',
            resolve: {
                preferences: function ($rootScope, $log,  UtilService, VSMSProvisioningService, searchPreferences) {
                    var msisdn = UtilService.getSubscriberMsisdn();
                    return searchPreferences(msisdn);
                },
                updateMethod: function ($rootScope, VSMSProvisioningService) {
                    return VSMSProvisioningService.updateServiceSubscriberPreferences;

                }
            }
        });

    });

})();
