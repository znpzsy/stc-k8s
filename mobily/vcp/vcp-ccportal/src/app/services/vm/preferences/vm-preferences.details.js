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
                    if ($rootScope.isSubscriberActive()) {
                        return searchPreferences();
                    } else {
                        return {};
                    }
                },
                classOfServiceProfiles: function ($rootScope, VMConfigurationService) {
                    if ($rootScope.isSubscriberActive()) {
                        return VMConfigurationService.getCoSProfiles();
                    } else {
                        return {};
                    }
                },
                updateMethod: function ($rootScope, VMProvisioningService) {
                    if ($rootScope.isSubscriberActive()) {
                        return VMProvisioningService.updateServiceSubscriberPreferences;
                    } else {
                        return {};
                    }
                }
            }
        });

    });

})();
