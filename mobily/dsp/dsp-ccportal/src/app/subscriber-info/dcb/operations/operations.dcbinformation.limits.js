(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.limits', [
        'ccportal.subscriber-info.dcb.operations.dcbinformation.limits.global',
        'ccportal.subscriber-info.dcb.operations.dcbinformation.limits.subscriberspecific'
    ]);

    var DCBOperationsDCBInformationLimitsModule = angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.limits');

    DCBOperationsDCBInformationLimitsModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.dcb.operations.dcbinformation.limits', {
            abstract: true,
            url: "/limits",
            template: '<div ui-view></div>',
            controller: function ($scope, Restangular, genericDCBSettings) {
                $scope.genericDCBSettings = Restangular.stripRestangular(genericDCBSettings);
                if ($scope.genericDCBSettings && $scope.genericDCBSettings.allowanceResponse) {
                    $scope.genericDCBSettings.enabled = $scope.genericDCBSettings.allowanceResponse.allowed;
                } else {
                    $scope.genericDCBSettings.enabled = false;
                }
            },
            resolve: {
                genericDCBSettings: function (UtilService, ScreeningManagerV2Service, DCBService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    return ScreeningManagerV2Service.getAllowance(ScreeningManagerV2Service.serviceNames.SUBSCRIBER, msisdn, ScreeningManagerV2Service.scopes.SERVICE_SCOPE_KEY, DCBService.GENERIC_DCB_SERVICE_ID)
                }
            }
        });

    });

})();
