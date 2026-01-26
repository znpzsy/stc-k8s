(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.greylists.mt', []);

    var AntiSpamSMSOperationsGreyListsMTModule = angular.module('adminportal.products.antispamsms.operations.greylists.mt');

    AntiSpamSMSOperationsGreyListsMTModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.greylists.mt', {
            url: "/mt",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.greylists.mt.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/operations.greylists.html",
            controller: 'AntiSpamSMSOperationsGreyListsMTCtrl',
            resolve: {
                mtGreyList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGreyList(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MT_FRAUD);
                }
            }
        }).state('products.antispamsms.operations.greylists.mt.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/operations.greylists.detail.html",
            controller: 'AntiSpamSMSOperationsGreyListsNewMTCtrl'
        }).state('products.antispamsms.operations.greylists.mt.update', {
            url: "/update/:prefix",
            templateUrl: "products/antispamsms/operations/operations.greylists.detail.html",
            controller: 'AntiSpamSMSOperationsGreyListsUpdateMTCtrl',
            resolve: {
                mtGreyListEntry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGreyListEntry(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MT_FRAUD, $stateParams.prefix);
                }
            }
        });

    });

    AntiSpamSMSOperationsGreyListsMTModule.controller('AntiSpamSMSOperationsGreyListsMTCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsGreyListsMTCommonCtrl');

        $scope.listState = "products.antispamsms.operations.greylists.mt.list";
        $scope.newState = "products.antispamsms.operations.greylists.mt.new";
        $scope.updateState = "products.antispamsms.operations.greylists.mt.update";
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.GreyLists.MT.PageHeader";

        $scope.sensitivityAvailable = true;
    });

    AntiSpamSMSOperationsGreyListsMTModule.controller('AntiSpamSMSOperationsGreyListsMTCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                        SMSAntiSpamConfigService, mtGreyList) {
        $log.debug('AntiSpamSMSOperationsGreyListsMTCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMTCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MT_FRAUD,
            entryList: mtGreyList.entryList
        });
    });

    AntiSpamSMSOperationsGreyListsMTModule.controller('AntiSpamSMSOperationsGreyListsNewMTCtrl', function ($scope, $log, $controller, SMSAntiSpamConfigService) {
        $log.debug('AntiSpamSMSOperationsGreyListsNewMTCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMTCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsNewEntryCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MT_FRAUD
        });
    });

    AntiSpamSMSOperationsGreyListsMTModule.controller('AntiSpamSMSOperationsGreyListsUpdateMTCtrl', function ($scope, $log, $controller, SMSAntiSpamConfigService, mtGreyListEntry) {
        $log.debug('AntiSpamSMSOperationsGreyListsUpdateMTCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMTCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsUpdateEntryCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MT_FRAUD,
            entry: mtGreyListEntry
        });
    });


})();
