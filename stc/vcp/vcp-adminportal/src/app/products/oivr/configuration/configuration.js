(function () {

    'use strict';

    angular.module('adminportal.products.oivr.configuration', []);

    var OIVRConfigurationModule = angular.module('adminportal.products.oivr.configuration');

    OIVRConfigurationModule.config(function ($stateProvider) {
        $stateProvider.state('products.oivr.configuration', {
            url: "/configuration",
            templateUrl: 'products/oivr/configuration/configuration.html',
        }).state('products.oivr.configuration.calleraddresses', {
            url: "/caller-address",
            templateUrl: "products/oivr/configuration/configuration.settings.calleraddress.html",
            controller: 'OIVRCallerAddressConfigurationCtrl',
            resolve: {
                serviceCallerConfig: function (OIVRConfService) {
                    return OIVRConfService.getServiceCallerAddresses();
                }
            }
        }).state('products.oivr.configuration.smssettings', {
            url: "/sms-settings",
            templateUrl: "products/oivr/configuration/configuration.settings.smssettings.html",
            controller: 'OIVRSmsSettingsConfigurationCtrl',
            resolve: {
                smsTexts: function (OIVRConfService) {
                    return OIVRConfService.getSmsTextLists();
                },
                smsSenderAddress: function (OIVRConfService) {
                    return OIVRConfService.getSmsSenderAddress();
                }
            }
        });

    });


    OIVRConfigurationModule.controller('OIVRCallerAddressConfigurationCtrl', function ($scope, $state, $log, $q, $translate, Restangular, OIVRConfService, notification, serviceCallerConfig) {
        $log.debug('OIVRCallerAddressConfigurationCtrl');


        $scope.serviceCallerConfig = {
            broadcastCallerAddress: parseInt(serviceCallerConfig.broadcastCallerAddress),
            surveyCallerAddress: parseInt(serviceCallerConfig.surveyCallerAddress),
            offerCallerAddress: parseInt(serviceCallerConfig.offerCallerAddress),
            sadaCallerAddress: parseInt(serviceCallerConfig.sadaCallerAddress),
            sadaPPCallerAddress: parseInt(serviceCallerConfig.sadaPPCallerAddress),
        };

        $scope.originalServiceCallerConfig = angular.copy($scope.serviceCallerConfig);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceCallerConfig, $scope.serviceCallerConfig);
        };


        $scope.save = function () {
            var promises = [];

            if($scope.serviceCallerConfig.broadcastCallerAddress != $scope.originalServiceCallerConfig.broadcastCallerAddress) {
                promises.push(OIVRConfService.updateServiceCallerAddress('broadcastCallerAddress', $scope.serviceCallerConfig.broadcastCallerAddress.toString()));
            }
            if($scope.serviceCallerConfig.surveyCallerAddress != $scope.originalServiceCallerConfig.surveyCallerAddress) {
                promises.push(OIVRConfService.updateServiceCallerAddress('surveyCallerAddress', $scope.serviceCallerConfig.surveyCallerAddress.toString()));
            }
            if($scope.serviceCallerConfig.offerCallerAddress != $scope.originalServiceCallerConfig.offerCallerAddress) {
                promises.push(OIVRConfService.updateServiceCallerAddress('offerCallerAddress', $scope.serviceCallerConfig.offerCallerAddress.toString()));
            }
            if($scope.serviceCallerConfig.sadaCallerAddress != $scope.originalServiceCallerConfig.sadaCallerAddress) {
                promises.push(OIVRConfService.updateServiceCallerAddress('sadaCallerAddress', $scope.serviceCallerConfig.sadaCallerAddress.toString()));
            }
            if($scope.serviceCallerConfig.sadaPPCallerAddress != $scope.originalServiceCallerConfig.sadaPPCallerAddress) {
                promises.push(OIVRConfService.updateServiceCallerAddress('sadaPPCallerAddress', $scope.serviceCallerConfig.toString()));
            }


            $q.all(promises).then(function (totalResponses) {
                totalResponses.forEach(function (totalResponse) {
                    $log.debug('Update OIVR Caller Address config:', totalResponse);
                });

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.cancel();

            }, function (response) {
                $log.error('Cannot call configuration service, could not update configuration. Error: : ', response);

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

    OIVRConfigurationModule.controller('OIVRSmsSettingsConfigurationCtrl', function ($scope, $state, $log, $q, $translate, Restangular, OIVRConfService, notification, smsTexts, smsSenderAddress) {
        $log.debug('OIVRSmsSettingsConfigurationCtrl');

        $scope.smsTexts = smsTexts;
        $scope.smsSenderAddress = smsSenderAddress;
        $scope.originalSmsTexts = angular.copy($scope.smsTexts);
        $scope.originalSmsSenderAddress = angular.copy($scope.smsSenderAddress);

        $scope.smsTextEn = _.findWhere($scope.smsTexts, {languageCode: 'en_english'});
        $scope.originalSmsTextEn = angular.copy($scope.smsTextEn);
        $scope.smsTextAr = _.findWhere($scope.smsTexts, {languageCode: 'ar_arabic'});
        $scope.originalSmsTextAr = angular.copy($scope.smsTextAr);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSmsTextEn, $scope.smsTextEn) && angular.equals($scope.originalSmsTextAr, $scope.smsTextAr) && angular.equals($scope.originalSmsSenderAddress, $scope.smsSenderAddress);
        };

        $scope.save = function () {
            var promises = [];

            if($scope.smsTextEn.smsText != $scope.originalSmsTextEn.smsText) {
                promises.push(OIVRConfService.updateSmsText($scope.smsTextEn));
            }
            if($scope.smsTextAr.smsText != $scope.originalSmsTextAr.smsText) {
                promises.push(OIVRConfService.updateSmsText($scope.smsTextAr));
            }
            if($scope.smsSenderAddress != $scope.originalSmsSenderAddress) {
                promises.push(OIVRConfService.updateSmsSenderAddress($scope.smsSenderAddress));
            }

            $q.all(promises).then(function (totalResponses) {
                totalResponses.forEach(function (totalResponse) {
                    $log.debug('Update OIVR SMS related config:', totalResponse);
                });

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.cancel();

            }, function (response) {
                $log.error('Cannot call configuration service, could not update configuration. Error: : ', response);

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
