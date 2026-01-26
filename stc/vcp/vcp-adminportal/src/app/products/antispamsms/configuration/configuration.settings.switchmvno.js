(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.configuration.settings.switchmvno', []);

    var AntiSpamSMSConfigurationsSwitchMVNOModule = angular.module('adminportal.products.antispamsms.configuration.settings.switchmvno');

    AntiSpamSMSConfigurationsSwitchMVNOModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.configuration.settings.switchmvno', {
            url: "/switch-mvno",
            templateUrl: "products/antispamsms/configuration/configuration.settings.switchmvno.html",
            controller: 'AntiSpamSMSConfigurationsSwitchMVNOCtrl',
            resolve: {
                mvnoList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getMVNOList();
                },
                mvno: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getMVNO();
                }
            }
        });

    });

    AntiSpamSMSConfigurationsSwitchMVNOModule.controller('AntiSpamSMSConfigurationsSwitchMVNOCtrl', function ($scope, $log, $state, $q, $translate, notification, SMSAntiSpamConfigService, mvnoList, mvno) {
        $log.debug('AntiSpamSMSConfigurationsSwitchMVNOCtrl');

        $scope.currentMvnoList = mvnoList;
        $scope.currentMvno = mvno.name;
        // $scope.currentMvno = _.find(mvnoList, function (item) {
        //     return (item.name === mvno);
        // });
        $scope.originalMvno = angular.copy($scope.currentMvno);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalMvno, $scope.currentMvno);
        };

        $scope.save = function (switchmvno) {
            $log.debug('Updating current MVNO as: ', switchmvno);
            SMSAntiSpamConfigService.updateCurrentMVNO(switchmvno).then(function (response) {
                $log.debug('Updated switchmvno configuration: ', switchmvno, ', response: ', response);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.currentMvno = switchmvno;
                $scope.originalMvno = angular.copy($scope.currentMvno);

            }, function (response) {
                $log.debug('Cannot update switchmvno configuration: ', switchmvno, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

})();
