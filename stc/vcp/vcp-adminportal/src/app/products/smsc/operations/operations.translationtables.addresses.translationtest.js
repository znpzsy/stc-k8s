(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.translationtables.addresses.translationtest', []);

    var SmscTranslationTablesAddressesTranslationTestOperationsModule = angular.module('adminportal.products.smsc.operations.translationtables.addresses.translationtest');

    SmscTranslationTablesAddressesTranslationTestOperationsModule.controller('SmscTranslationTablesAddressesTranslationTestOperationsCtrl', function ($scope, $log, $filter, $uibModalInstance, Restangular, SMPP_APPS_NPI, SMPP_APPS_TON,
                                                                                                                                                                    SmscConfService, addressTranslationKey, selectedSMPPApplication) {
        $log.debug('SmscTranslationTablesAddressesTranslationTestOperationsCtrl');

        $scope.SMPP_APPS_NPI = SMPP_APPS_NPI;
        $scope.SMPP_APPS_TON = SMPP_APPS_TON;

        $scope.addressTranslationKey = addressTranslationKey;
        $scope.selectedSMPPApplication = selectedSMPPApplication;

        if ($scope.addressTranslationKey === 'destination') {
            $scope.pageHeaderKey = 'TranslationTest.PageHeaderDest';
        } else {
            $scope.pageHeaderKey = 'TranslationTest.PageHeaderOrig';
        }

        if ($scope.selectedSMPPApplication && $scope.selectedSMPPApplication.id) {
            $scope.appId = $scope.selectedSMPPApplication.id;
            $scope.appName = $scope.selectedSMPPApplication.organization.name + ' - ' + $scope.selectedSMPPApplication.name;
        } else {
            $scope.appId = 0;
        }

        $scope.addressTranslationTest = {
            address: '',
            ton: 0,
            npi: 0
        };

        $scope.testAddressTranslation = function (addressTranslationTest) {
            $log.debug('Address translation will be tested: ', addressTranslationTest);

            // Reset the result.
            $scope.testResult = undefined;

            SmscConfService.addressTranslationTest($scope.addressTranslationKey, addressTranslationTest.address, addressTranslationTest.ton,
                addressTranslationTest.npi, addressTranslationTest.content, addressTranslationTest.otherAddress, $scope.appId).then(
                function (response) {
                    $log.debug('Address translation tested: ', response);

                    $scope.testResult = Restangular.stripRestangular(response);
                }, function (response) {
                    $log.debug('Cannot tested address translation: ', response);
                }
            );
        };

        $scope.close = function () {
            $uibModalInstance.close();
        };

    });

})();
