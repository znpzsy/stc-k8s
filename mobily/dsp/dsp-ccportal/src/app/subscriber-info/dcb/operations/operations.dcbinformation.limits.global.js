(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.limits.global', []);

    var DCBOperationsDCBInformationLimitsGlobalModule = angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation.limits.global');

    DCBOperationsDCBInformationLimitsGlobalModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.dcb.operations.dcbinformation.limits.global', {
            url: "/global",
            templateUrl: 'subscriber-info/dcb/operations/operations.dcbinformation.limits.global.html',
            controller: 'DCBOperationsDCBInformationLimitsGlobalCtrl',
            resolve: {
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

    DCBOperationsDCBInformationLimitsGlobalModule.controller('DCBOperationsDCBInformationLimitsGlobalCtrl', function ($scope, $log, $controller, Restangular, CMPFService, dcbSettingsOrganization,
                                                                                                                      dcbStatistics) {
        $log.debug('DCBOperationsDCBInformationLimitsGlobalCtrl');

        $scope.dcbSettingsOrganization = dcbSettingsOrganization.organizations[0] || {};
        // DCBProfile
        var dcbProfiles = CMPFService.getProfileAttributes($scope.dcbSettingsOrganization.profiles, CMPFService.SERVICE_DCB_PROFILE);
        if (dcbProfiles.length > 0) {
            $scope.dcbSettingsOrganization.dcbProfile = angular.copy(dcbProfiles[0]);
        } else {
            $scope.dcbSettingsOrganization.dcbProfile = {
                SenderID: '',
                Currency: 'SAR',
                IsCapped: false,
                LastUpdateTime: null
            };
        }

        $scope.dcbStatistics = dcbStatistics;
        $scope.dcbStatistics.limitList = [];
        _.each($scope.dcbStatistics.limit, function (limit, serviceId) {
            if (serviceId !== 'null') {
                var limitItem = _.extend({serviceId: serviceId}, limit);
                $scope.dcbStatistics.limitList.push(limitItem);

                // Watch the all isAccordionOpen properties of the accordions.
                var isAccordionOpen = false;
                if (_.isUndefined(limitItem.isAccordionOpen)) {
                    Object.defineProperty(limitItem, 'isAccordionOpen', {
                        get: function () {
                            return isAccordionOpen;
                        },
                        set: function (newValue) {
                            if (newValue && !limitItem.service) {
                                // Call service
                                CMPFService.getService(serviceId).then(function (serviceResponse) {
                                    if (serviceResponse) {
                                        limitItem.service = Restangular.stripRestangular(serviceResponse);
                                    }

                                    limitItem.showContent = true;
                                }, function (response) {
                                    limitItem.service = {
                                        name: 'N/A'
                                    };

                                    limitItem.showContent = true;
                                });
                            } else {
                                limitItem.showContent = newValue;
                            }

                            isAccordionOpen = newValue;
                        },
                        configurable: true
                    });
                }
            }
        });
    });

})();
