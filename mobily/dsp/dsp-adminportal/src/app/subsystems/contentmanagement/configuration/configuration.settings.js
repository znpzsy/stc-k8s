(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.configuration.settings', []);

    var ContentManagementConfigurationSettingsModule = angular.module('adminportal.subsystems.contentmanagement.configuration.settings');

    ContentManagementConfigurationSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.configuration.settings', {
            abstract: true,
            url: "/settings",
            template: "<div ui-view></div>"
        }).state('subsystems.contentmanagement.configuration.settings.prayertimes', {
            url: "/prayer-times",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.prayertimes.details.html",
            controller: 'ContentManagementConfigurationSettingsPrayerTimesCtrl',
            resolve: {
                defaultOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME);
                },
                prayerTimes: function (RBTContentManagementService) {
                    return RBTContentManagementService.getPrayerTimes();
                }
            }
        });

    });

    ContentManagementConfigurationSettingsModule.controller('ContentManagementConfigurationSettingsPrayerTimesCtrl', function ($scope, $log, $q, $state, $filter, $translate, notification, UtilService, RBTContentManagementService,
                                                                                                                               ContentManagementService, defaultOrganization, prayerTimes) {
        $log.debug('ContentManagementConfigurationSettingsPrayerTimesCtrl');

        $scope.defaultOrganization = defaultOrganization.organizations[0];

        $scope.prayerTimes = prayerTimes;

        $scope.searchTones = _.throttle(function (text) {
            $scope.toneList = [];
            ContentManagementService.searchTones(0, 100, text, $scope.defaultOrganization.id).then(function (response) {
                $scope.toneList = (response ? response.items : []);
            });
        }, 500);

        if ($scope.prayerTimes) {
            // Get the morning toneFile by id value.
            if ($scope.prayerTimes.morningToneId) {
                ContentManagementService.getTone($scope.prayerTimes.morningToneId).then(function (response) {
                    $scope.toneList.push(response.tone);
                });
            }

            // Get the noon toneFile by id value.
            if ($scope.prayerTimes.noonToneId) {
                ContentManagementService.getTone($scope.prayerTimes.noonToneId).then(function (response) {
                    $scope.toneList.push(response.tone);
                });
            }

            // Get the afternoon toneFile by id value.
            if ($scope.prayerTimes.afternoonToneId) {
                ContentManagementService.getTone($scope.prayerTimes.afternoonToneId).then(function (response) {
                    $scope.toneList.push(response.tone);
                });
            }

            // Get the evening toneFile by id value.
            if ($scope.prayerTimes.eveningToneId) {
                ContentManagementService.getTone($scope.prayerTimes.eveningToneId).then(function (response) {
                    $scope.toneList.push(response.tone);
                });
            }

            // Get the night toneFile by id value.
            if ($scope.prayerTimes.nightToneId) {
                ContentManagementService.getTone($scope.prayerTimes.nightToneId).then(function (response) {
                    $scope.toneList.push(response.tone);
                });
            }
        }

        $scope.prayerTimesOriginal = angular.copy($scope.prayerTimes);
        $scope.isNotChanged = function () {
            return angular.equals($scope.prayerTimes, $scope.prayerTimesOriginal);
        };

        var updateTone = function (toneId, prayerTimeType) {
            var toneItem = {
                "toneId": toneId
            };

            return RBTContentManagementService.updatePrayerTime(toneItem, prayerTimeType);
        };

        $scope.save = function (prayerTimes) {
            var promiseList = [];

            updateTone(prayerTimes.morningToneId, 'morning').then(function () {
                updateTone(prayerTimes.noonToneId, 'noon').then(function () {
                    updateTone(prayerTimes.afternoonToneId, 'afternoon').then(function () {
                        updateTone(prayerTimes.eveningToneId, 'evening').then(function () {
                            updateTone(prayerTimes.nightToneId, 'night').then(function () {
                                notification({
                                    type: 'success',
                                    text: $translate.instant('CommonLabels.OperationSuccessful')
                                });

                                $scope.prayerTimesOriginal = angular.copy($scope.prayerTimes);
                            });
                        });
                    });
                });
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
