(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation', [
        'ccportal.subscriber-info.dcb.operations.dcbinformation.associations',
        'ccportal.subscriber-info.dcb.operations.dcbinformation.usage',
        'ccportal.subscriber-info.dcb.operations.dcbinformation.limits',
        'ccportal.subscriber-info.dcb.operations.dcbinformation.screening'
    ]);

    var DCBOperationsDCBinformationModule = angular.module('ccportal.subscriber-info.dcb.operations.dcbinformation');

    DCBOperationsDCBinformationModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.dcb.operations.dcbinformation', {
            url: "/dcb-information",
            template: '<div ui-view></div>',
            resolve: {
                dcbSettingsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_DCB_SETTINGS_ORGANIZATION_NAME);
                }
            }
        });

    });

    DCBOperationsDCBinformationModule.controller('DCBOperationsDCBInformationCommonCtrl', function ($scope, $log, $filter, UtilService, CMPFService, dcbSettingsOrganization,
                                                                                                    services, dcbStatistics) {
        $log.debug('DCBOperationsDCBInformationCommonCtrl');

        $scope.msisdn = UtilService.getSubscriberMsisdn();

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
        $scope.dcbSettingsOrganization = $scope.dcbSettingsOrganization;

        $scope.serviceList = $filter('orderBy')(services.services, ['name']);
        $scope.serviceMap = {};
        _.each($scope.serviceList, function (service) {
            $scope.serviceMap[service.id] = {
                name: service.name + " (" + service.id + ")",
                state: service.state
            };
        });

        $scope.dcbStatistics = dcbStatistics;
        $scope.dcbStatistics.dailySpent = (parseFloat($scope.dcbStatistics.dailyCharge) - parseFloat($scope.dcbStatistics.dailyRefund)).toFixed(2);
        $scope.dcbStatistics.monthlySpent = (parseFloat($scope.dcbStatistics.monthlyCharge) - parseFloat($scope.dcbStatistics.monthlyRefund)).toFixed(2);

        $scope.dcbStatistics.serviceUsageList = [];
        _.each($scope.dcbStatistics.serviceUsage, function (serviceUsage, serviceId) {
            var serviceUsageItem = _.extend({
                serviceId: serviceId,
                dailySpent: parseFloat(serviceUsage.dailyCharge) - parseFloat(serviceUsage.dailyRefund),
                monthlySpent: parseFloat(serviceUsage.monthlyCharge) - parseFloat(serviceUsage.monthlyRefund)
            }, serviceUsage);

            $scope.dcbStatistics.serviceUsageList.push(serviceUsageItem);
        });

        $scope.dcbStatistics.limitList = [];
        _.each($scope.dcbStatistics.limit, function (limit, serviceId) {
            if (serviceId !== 'null') {
                var limitItem = _.extend({serviceId: serviceId}, limit);
                $scope.dcbStatistics.limitList.push(limitItem);
            }
        });

    });

})();


