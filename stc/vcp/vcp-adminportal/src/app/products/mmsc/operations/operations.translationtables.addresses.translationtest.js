(function () {

    'use strict';

    angular.module('adminportal.products.mmsc.operations.translationtables.addresses.translationtest', []);

    var MMSCTranslationTablesAddressesTranslationTestOperationsModule = angular.module('adminportal.products.mmsc.operations.translationtables.addresses.translationtest');

    MMSCTranslationTablesAddressesTranslationTestOperationsModule.controller('MMSCTranslationTablesAddressesTranslationTestOperationsCtrl', function ($scope, $log, $filter, $uibModalInstance, Restangular, MmscOperationService,
                                                                                                                                                      addressTranslationKey) {
        $log.debug('MMSCTranslationTablesAddressesTranslationTestOperationsCtrl');

        $scope.addressTranslationKey = addressTranslationKey;

        if ($scope.addressTranslationKey === 'destination') {
            $scope.pageHeaderKey = 'TranslationTest.PageHeaderDest';
        } else {
            $scope.pageHeaderKey = 'TranslationTest.PageHeaderOrig';
        }

        $scope.addressTranslationTest = {
            address: ''
        };

        $scope.testAddressTranslation = function (addressTranslationTest) {
            $log.debug('Address translation will be tested: ', addressTranslationTest);

            // Reset the result.
            $scope.testResult = undefined;

            MmscOperationService.addressTranslationTest($scope.addressTranslationKey, addressTranslationTest.address).then(
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
