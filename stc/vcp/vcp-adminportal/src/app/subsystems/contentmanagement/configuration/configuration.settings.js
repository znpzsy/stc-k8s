(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.configuration.settings', [
        'adminportal.subsystems.contentmanagement.configuration.settings.prayertimestones',
        'adminportal.subsystems.contentmanagement.configuration.settings.sysdefault',
        'adminportal.subsystems.contentmanagement.configuration.settings.whitebranded'
    ]);

    var ContentManagementConfigurationSettingsModule = angular.module('adminportal.subsystems.contentmanagement.configuration.settings');

    ContentManagementConfigurationSettingsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.configuration.settings', {
            abstract: true,
            url: "/settings",
            template: "<div ui-view></div>"
        })
            .state('subsystems.contentmanagement.configuration.settings.prayertimessignatures', {
            url: "/prayer-times-signatures",
            templateUrl: "subsystems/contentmanagement/configuration/configuration.settings.prayertimes.signatures.details.html",
            controller: 'ContentManagementConfigurationSettingsPrayerTimesSignaturesCtrl',
            resolve: {
                defaultOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME, true);
                },
                prayerTimesSignaturesEN: function (RBTContentManagementService) {
                    return RBTContentManagementService.getPrayerTimesSignatures('EN');
                },
                prayerTimesSignaturesAR: function (RBTContentManagementService) {
                    return RBTContentManagementService.getPrayerTimesSignatures('AR');
                }
            }
        });

    });

    ContentManagementConfigurationSettingsModule.controller('ContentManagementConfigurationSettingsPrayerTimesSignaturesCtrl', function ($scope, $log, $q, $state, $filter, $translate, notification, UtilService, RBTContentManagementService,
                                                                                                                                    ContentManagementService, defaultOrganization, prayerTimesSignaturesEN, prayerTimesSignaturesAR) {
        $log.debug('ContentManagementConfigurationSettingsPrayerTimesSignaturesCtrl');

        $scope.defaultOrganization = defaultOrganization.organizations[0];

        $scope.prayerTimesSignaturesEN = prayerTimesSignaturesEN.predefinedSignatureDTOList;
        $scope.prayerTimesSignaturesAR = prayerTimesSignaturesAR.predefinedSignatureDTOList;

        $scope.findPrayerTimeSignature = function (list, prayerTime) {
            var empty = {
                id: null,
                alias: '',
                type: '',
                key: '',
                description: ''
            }

            var prayerTime = _.findWhere(list, {key: prayerTime});
            return prayerTime ? prayerTime : empty;
        };


        $scope.morningFajrEn = $scope.findPrayerTimeSignature($scope.prayerTimesSignaturesEN, 'fajr');
        $scope.originalMorningFajrEn = angular.copy($scope.morningFajrEn);

        $scope.noonZuhrEn = $scope.findPrayerTimeSignature($scope.prayerTimesSignaturesEN, 'zuhr');
        $scope.originalNoonZuhrEn = angular.copy($scope.noonZuhrEn);

        $scope.afternoonAsrEn = $scope.findPrayerTimeSignature($scope.prayerTimesSignaturesEN, 'asr');
        $scope.originalAfternoonAsrEn = angular.copy($scope.afternoonAsrEn);

        $scope.eveningMaghribEn = $scope.findPrayerTimeSignature($scope.prayerTimesSignaturesEN, 'maghrib');
        $scope.originalEveningMaghribEn = angular.copy($scope.eveningMaghribEn);

        $scope.nightIshaEn = $scope.findPrayerTimeSignature($scope.prayerTimesSignaturesEN, 'isha');
        $scope.originalNightIshaEn = angular.copy($scope.nightIshaEn);

        $scope.morningFajrAr = $scope.findPrayerTimeSignature($scope.prayerTimesSignaturesAR, 'fajr');
        $scope.originalMorningFajrAr = angular.copy($scope.morningFajrAr);

        $scope.noonZuhrAr = $scope.findPrayerTimeSignature($scope.prayerTimesSignaturesAR, 'zuhr');
        $scope.originalNoonZuhrAr = angular.copy($scope.noonZuhrAr);

        $scope.afternoonAsrAr = $scope.findPrayerTimeSignature($scope.prayerTimesSignaturesAR, 'asr');
        $scope.originalAfternoonAsrAr = angular.copy($scope.afternoonAsrAr);

        $scope.eveningMaghribAr = $scope.findPrayerTimeSignature($scope.prayerTimesSignaturesAR, 'maghrib');
        $scope.originalEveningMaghribAr = angular.copy($scope.eveningMaghribAr);

        $scope.nightIshaAr = $scope.findPrayerTimeSignature($scope.prayerTimesSignaturesAR, 'isha');
        $scope.originalNightIshaAr = angular.copy($scope.nightIshaAr);

        $scope.isNotChanged = function () {
            return angular.equals($scope.morningFajrEn, $scope.originalMorningFajrEn) &&
                angular.equals($scope.noonZuhrEn, $scope.originalNoonZuhrEn) &&
                angular.equals($scope.afternoonAsrEn, $scope.originalAfternoonAsrEn) &&
                angular.equals($scope.eveningMaghribEn, $scope.originalEveningMaghribEn) &&
                angular.equals($scope.nightIshaEn, $scope.originalNightIshaEn) &&
                angular.equals($scope.morningFajrAr, $scope.originalMorningFajrAr) &&
                angular.equals($scope.noonZuhrAr, $scope.originalNoonZuhrAr) &&
                angular.equals($scope.afternoonAsrAr, $scope.originalAfternoonAsrAr) &&
                angular.equals($scope.eveningMaghribAr, $scope.originalEveningMaghribAr) &&
                angular.equals($scope.nightIshaAr, $scope.originalNightIshaAr);
        };

        var updateSignature = function (signatureEn, signatureAr) {

            var signature = {
                id: signatureEn.id,
                alias: signatureEn.alias,
                key: signatureEn.key,
                type: signatureEn.type,
                descriptions: [
                    {
                        lang: 'EN',
                        description: signatureEn.description
                    },
                    {
                        lang: 'AR',
                        description: signatureAr.description
                    }
                ]
            };
            return RBTContentManagementService.updatePrayerTimeSignatures(signature.id , signature);
        };

        $scope.save = function (prayerTimes) {
            var promiseList = [];
            if(!angular.equals($scope.morningFajrEn, $scope.originalMorningFajrEn) || !angular.equals($scope.morningFajrAr, $scope.originalMorningFajrAr)) { promiseList.push(updateSignature($scope.morningFajrEn, $scope.morningFajrAr)); }
            if (!angular.equals($scope.noonZuhrEn, $scope.originalNoonZuhrEn) || !angular.equals($scope.noonZuhrAr, $scope.originalNoonZuhrAr)) { promiseList.push(updateSignature($scope.noonZuhrEn, $scope.noonZuhrAr)); }
            if (!angular.equals($scope.afternoonAsrEn, $scope.originalAfternoonAsrEn) || !angular.equals($scope.afternoonAsrAr, $scope.originalAfternoonAsrAr)) { promiseList.push(updateSignature($scope.afternoonAsrEn, $scope.afternoonAsrAr)); }
            if (!angular.equals($scope.eveningMaghribEn, $scope.originalEveningMaghribEn) || !angular.equals($scope.eveningMaghribAr, $scope.originalEveningMaghribAr)) { promiseList.push(updateSignature($scope.eveningMaghribEn, $scope.eveningMaghribAr)); }
            if (!angular.equals($scope.nightIshaEn, $scope.originalNightIshaEn) || !angular.equals($scope.nightIshaAr, $scope.originalNightIshaAr)) { promiseList.push(updateSignature($scope.nightIshaEn, $scope.nightIshaAr)); }

            $q.all(promiseList).then(function (results) {
                $log.debug('Updated prayer time signatures with results: ', results);
                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });
                $state.go($state.$current, null, {reload: true});

            }, function (error) {
                $log.debug('An error occured: ', error);

                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.GenericServerError')
                });
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
