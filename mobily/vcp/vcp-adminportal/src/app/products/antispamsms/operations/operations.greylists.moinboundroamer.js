(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.greylists.moinboundroamer', []);

    var AntiSpamSMSOperationsGreyListsMOInboundRoamerModule = angular.module('adminportal.products.antispamsms.operations.greylists.moinboundroamer');

    AntiSpamSMSOperationsGreyListsMOInboundRoamerModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.greylists.moinboundroamer', {
            url: "/moinboundroamer",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.greylists.moinboundroamer.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/operations.greylists.html",
            controller: 'AntiSpamSMSOperationsGreyListsMOInboundRoamerCtrl',
            resolve: {
                moInboundRoamerGreyList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGreyList(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_IB);
                }
            }
        }).state('products.antispamsms.operations.greylists.moinboundroamer.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/operations.greylists.detail.html",
            controller: 'AntiSpamSMSOperationsGreyListsNewMOInboundRoamerCtrl'
        }).state('products.antispamsms.operations.greylists.moinboundroamer.update', {
            url: "/update/:prefix",
            templateUrl: "products/antispamsms/operations/operations.greylists.detail.html",
            controller: 'AntiSpamSMSOperationsGreyListsUpdateMOInboundRoamerCtrl',
            resolve: {
                moInboundRoamerGreyListEntry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGreyListEntry(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_IB, $stateParams.prefix);
                }
            }
        });

    });

    AntiSpamSMSOperationsGreyListsMOInboundRoamerModule.controller('AntiSpamSMSOperationsGreyListsMOInboundRoamerCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsGreyListsMOInboundRoamerCommonCtrl');

        $scope.listState = "products.antispamsms.operations.greylists.moinboundroamer.list";
        $scope.newState = "products.antispamsms.operations.greylists.moinboundroamer.new";
        $scope.updateState = "products.antispamsms.operations.greylists.moinboundroamer.update";
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.GreyLists.MOInboundRoamer.PageHeader";
    });

    AntiSpamSMSOperationsGreyListsMOInboundRoamerModule.controller('AntiSpamSMSOperationsGreyListsMOInboundRoamerCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                  SMSAntiSpamConfigService, moInboundRoamerGreyList) {
        $log.debug('AntiSpamSMSOperationsGreyListsMOInboundRoamerCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMOInboundRoamerCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_IB,
            entryList: moInboundRoamerGreyList.entryList
        });
    });

    AntiSpamSMSOperationsGreyListsMOInboundRoamerModule.controller('AntiSpamSMSOperationsGreyListsNewMOInboundRoamerCtrl', function ($scope, $log, $controller, SMSAntiSpamConfigService) {
        $log.debug('AntiSpamSMSOperationsGreyListsNewMOInboundRoamerCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMOInboundRoamerCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsNewEntryCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_IB
        });
    });

    AntiSpamSMSOperationsGreyListsMOInboundRoamerModule.controller('AntiSpamSMSOperationsGreyListsUpdateMOInboundRoamerCtrl', function ($scope, $log, $controller, SMSAntiSpamConfigService, moInboundRoamerGreyListEntry) {
        $log.debug('AntiSpamSMSOperationsGreyListsUpdateMOInboundRoamerCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMOInboundRoamerCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsUpdateEntryCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_IB,
            entry: moInboundRoamerGreyListEntry
        });
    });

})();
