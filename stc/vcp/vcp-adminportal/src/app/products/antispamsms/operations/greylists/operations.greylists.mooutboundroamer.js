(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.greylists.mooutboundroamer', []);

    var AntiSpamSMSOperationsGreyListsMOOutboundRoamerModule = angular.module('adminportal.products.antispamsms.operations.greylists.mooutboundroamer');

    AntiSpamSMSOperationsGreyListsMOOutboundRoamerModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.greylists.mooutboundroamer', {
            url: "/mooutboundroamer",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.greylists.mooutboundroamer.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/greylists/operations.greylists.html",
            controller: 'AntiSpamSMSOperationsGreyListsMOOutboundRoamerCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_GREYLISTS_OPERATIONS'
                ]
            },
            resolve: {
                moOutboundRoamerGreyList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGreyList(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_OB);
                }
            }
        }).state('products.antispamsms.operations.greylists.mooutboundroamer.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/greylists/operations.greylists.detail.html",
            controller: 'AntiSpamSMSOperationsGreyListsNewMOOutboundRoamerCtrl',
            data: {
                permissions: [
                    'CREATE_ANTISPAM_GREYLISTS_OPERATIONS'
                ]
            }
        }).state('products.antispamsms.operations.greylists.mooutboundroamer.update', {
            url: "/update/:prefix",
            templateUrl: "products/antispamsms/operations/greylists/operations.greylists.detail.html",
            controller: 'AntiSpamSMSOperationsGreyListsUpdateMOOutboundRoamerCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_GREYLISTS_OPERATIONS'
                ]
            },
            resolve: {
                moOutboundRoamerGreyListEntry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGreyListEntry(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_OB, $stateParams.prefix);
                }
            }
        });

    });

    AntiSpamSMSOperationsGreyListsMOOutboundRoamerModule.controller('AntiSpamSMSOperationsGreyListsMOOutboundRoamerCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsGreyListsMOOutboundRoamerCommonCtrl');

        $scope.listState = "products.antispamsms.operations.greylists.mooutboundroamer.list";
        $scope.newState = "products.antispamsms.operations.greylists.mooutboundroamer.new";
        $scope.updateState = "products.antispamsms.operations.greylists.mooutboundroamer.update";
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.GreyLists.MOOutboundRoamer.PageHeader";

        $scope.sensitivityAvailable = true;
    });

    AntiSpamSMSOperationsGreyListsMOOutboundRoamerModule.controller('AntiSpamSMSOperationsGreyListsMOOutboundRoamerCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                    SMSAntiSpamConfigService, moOutboundRoamerGreyList) {
        $log.debug('AntiSpamSMSOperationsGreyListsMOOutboundRoamerCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMOOutboundRoamerCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_OB,
            entryList: moOutboundRoamerGreyList.entryList
        });
    });

    AntiSpamSMSOperationsGreyListsMOOutboundRoamerModule.controller('AntiSpamSMSOperationsGreyListsNewMOOutboundRoamerCtrl', function ($scope, $log, $controller, SMSAntiSpamConfigService) {
        $log.debug('AntiSpamSMSOperationsGreyListsNewMOOutboundRoamerCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMOOutboundRoamerCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsNewEntryCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_OB
        });
    });

    AntiSpamSMSOperationsGreyListsMOOutboundRoamerModule.controller('AntiSpamSMSOperationsGreyListsUpdateMOOutboundRoamerCtrl', function ($scope, $log, $controller, SMSAntiSpamConfigService, moOutboundRoamerGreyListEntry) {
        $log.debug('AntiSpamSMSOperationsGreyListsUpdateMOOutboundRoamerCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMOOutboundRoamerCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsUpdateEntryCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_OB,
            entry: moOutboundRoamerGreyListEntry
        });
    });

})();
