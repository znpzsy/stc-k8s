(function () {

    'use strict';

    angular.module('adminportal.products.smsc.configuration.settings.messagestore', []);

    var SmscMessageStoreOperationsModule = angular.module('adminportal.products.smsc.configuration.settings.messagestore');

    SmscMessageStoreOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.configuration.settings.messagestore', {
            url: "/messagestore",
            templateUrl: "products/smsc/configuration/configuration.settings.messagestore.html",
            controller: 'SmscMessageStoreOperationsCtrl',
            resolve: {
                sfestorage: function (SmscConfService) {
                    return SmscConfService.getSFEStorage();
                }
            }
        });

    });

    SmscMessageStoreOperationsModule.controller('SmscMessageStoreOperationsCtrl', function ($scope, $state, $log, notification, $translate, Restangular,
                                                                                                  SmscConfService, sfestorage) {
        $log.debug('SmscMessageStoreOperationsCtrl');

        var prepareMessageStoreOptionsForm = function (_sfestorage) {
            $scope.messageStoreOptions = {
                hardLimit: _sfestorage.dbSizeHardLimit,
                hardLimitMinorThreshold: _sfestorage.dbSizeHardLimitMinorThreshold,
                hardLimitMajorThreshold: _sfestorage.dbSizeHardLimitMajorThreshold,
                softLimit: _sfestorage.dbSizeSoftLimit,
                softLimitMinorThreshold: _sfestorage.dbSizeSoftLimitMinorThreshold,
                softLimitMajorThreshold: _sfestorage.dbSizeSoftLimitMajorThreshold
            };

            $scope.originalMessageStoreOptions = angular.copy($scope.messageStoreOptions);
        };
        prepareMessageStoreOptionsForm(sfestorage);

        $scope.isUnchanged = function () {
            return angular.equals($scope.messageStoreOptions, $scope.originalMessageStoreOptions);
        };

        $scope.save = function (messageStoreOptions) {
            $log.debug('Save Message Store limits and thresholds: ', messageStoreOptions);

            var sfestorage = {
                dbSizeHardLimit: messageStoreOptions.hardLimit,
                dbSizeHardLimitMinorThreshold: messageStoreOptions.hardLimitMinorThreshold,
                dbSizeHardLimitMajorThreshold: messageStoreOptions.hardLimitMajorThreshold,
                dbSizeSoftLimit: messageStoreOptions.softLimit,
                dbSizeSoftLimitMinorThreshold: messageStoreOptions.softLimitMinorThreshold,
                dbSizeSoftLimitMajorThreshold: messageStoreOptions.softLimitMajorThreshold
            };

            SmscConfService.updateSFEStorage(sfestorage).then(function (response) {
                $log.debug('Updated SMSC config api sfe storage thresholds and limits:', response);

                var sfeStorageRsponse = Restangular.stripRestangular(response);

                if (sfeStorageRsponse.errorCode) {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: sfeStorageRsponse.errorCode,
                            errorText: sfeStorageRsponse.errorMsg
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    prepareMessageStoreOptionsForm(sfeStorageRsponse);
                }
            }, function (response) {
                $log.debug('Error: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };

    });

})();
