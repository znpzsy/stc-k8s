(function () {

    'use strict';

    angular.module('ccportal.services.vm.preferences.details', []);

    var VMPreferencesDetailsModule = angular.module('ccportal.services.vm.preferences.details');

    VMPreferencesDetailsModule.config(function ($stateProvider) {

        $stateProvider.state('services.vm.preferences.details', {
            url: "/details",
            templateUrl: 'services/vm/preferences/vm-preferences.details.html',
            controller: 'VMPreferencesCtrl',
            resolve: {
                preferences: function ($rootScope, VMProvisioningService, searchPreferences) {
                    return searchPreferences();

                },
                classOfServiceProfiles: function ($rootScope, VMConfigurationService) {
                    return VMConfigurationService.getCoSProfiles();

                },
                updateMethod: function ($rootScope, VMProvisioningService) {
                    return VMProvisioningService.updateServiceSubscriberPreferences;
                }
            }
        });

    });

})();
