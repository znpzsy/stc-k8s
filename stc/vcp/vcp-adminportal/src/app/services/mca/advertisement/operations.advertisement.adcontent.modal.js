(function () {

    'use strict';

    angular.module('adminportal.services.mca.advertisement.advertisement.adcontents', []);

    var MCAAdvertisementAdContentsOperationsModule = angular.module('adminportal.services.mca.advertisement.advertisement.adcontents');

    MCAAdvertisementAdContentsOperationsModule.controller('MCAAdvertisementAdContentsOperationsCtrl', function ($scope, $uibModalInstance, $log, $filter, $uibModal, $translate, notification, Restangular, NgTableParams, NgTableService,
                                                                                                                PROVISIONING_LANGUAGES, AdvertisementConfigurationService, advertisement) {
        $log.debug("MCAAdvertisementAdContentsOperationsCtrl");

        $scope.advertisement = advertisement;
        $scope.adName = advertisement.name;
        $scope.languageList = PROVISIONING_LANGUAGES;

        $scope.adContent = {};
        $scope.originalAdContent = {};

        _.each($scope.languageList, function (language) {
            var adContent = _.find(advertisement.adContentList, function (adContent) {
                return (adContent.lang.toUpperCase() === language.value)
            });

            $scope.adContent[language.value] = '';
            $scope.originalAdContent[language.value] = '';
            if (adContent) {
                $scope.adContent[language.value] = adContent.text;
                $scope.originalAdContent[language.value] = adContent.text;
            }
        });

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalAdContent, $scope.adContent);
        };

        // Add address range
        $scope.save = function (adContent) {
            var entryItem = angular.copy($scope.advertisement);
            entryItem.adContentList = [];

            _.each(adContent, function (text, lang) {
                entryItem.adContentList.push({
                    lang: lang,
                    text: text
                });
            });

            AdvertisementConfigurationService.updateAdvertisement(entryItem).then(function (response) {
                $log.debug('Added ad content: ', adContent);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $uibModalInstance.close();
            }, function (response) {
                $log.debug('Cannot add ad content: ', adContent, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.close();
        };
    });

})();
