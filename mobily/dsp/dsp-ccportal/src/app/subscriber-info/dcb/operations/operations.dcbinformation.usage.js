(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.usage', []);

    var DCBOperationsDCBInformationUsageModule = angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.usage');

    DCBOperationsDCBInformationUsageModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.dcb.operations.dcbinformation.usage', {
            url: "/usage",
            templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.usage.html',
            controller: 'DCBOperationsDCBInformationUsageCtrl',
            resolve: {
                services: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllServices();
                },
                dcbStatistics: function ($q, UtilService, SSMSubscribersService, DCBService) {
                    var deferred = $q.defer();

                    var subscriberResponse = UtilService.getFromSessionStore(UtilService.SUBSCRIBER_PROFILE_KEY);

                    DCBService.getSubscriberStatistics(subscriberResponse.msisdn, subscriberResponse.subscriberAccountNumber).then(function (response) {
                        deferred.resolve(response);
                    }, function (response) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('SubscriberInfo.DCB.DcbStatistics.Messages.NotFound')
                        });

                        deferred.reject(response);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    DCBOperationsDCBInformationUsageModule.controller('DCBOperationsDCBInformationUsageCtrl', function ($scope, $log, $controller, dcbSettingsOrganization, dcbStatistics, services) {
        $log.debug('DCBOperationsDCBInformationUsageCtrl');

        $controller('DCBOperationsDCBInformationCommonCtrl', {
            $scope: $scope,
            dcbSettingsOrganization: dcbSettingsOrganization,
            services: services,
            dcbStatistics: dcbStatistics
        });
    });

})();
