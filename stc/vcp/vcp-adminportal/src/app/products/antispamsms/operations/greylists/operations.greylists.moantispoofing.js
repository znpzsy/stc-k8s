(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.greylists.moantispoofing', []);

    var AntiSpamSMSOperationsGreyListsMOAntiSpoofingModule = angular.module('adminportal.products.antispamsms.operations.greylists.moantispoofing');

    AntiSpamSMSOperationsGreyListsMOAntiSpoofingModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.greylists.moantispoofing', {
            url: "/moantispoofing",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.greylists.moantispoofing.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/greylists/operations.greylists.html",
            controller: 'AntiSpamSMSOperationsGreyListsMOAntiSpoofingCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_GREYLISTS_OPERATIONS'
                ]
            },
            resolve: {
                moAntiSpoofingGreyList: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGreyList(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_AS);
                }
            }
        }).state('products.antispamsms.operations.greylists.moantispoofing.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/greylists/operations.greylists.detail.html",
            controller: 'AntiSpamSMSOperationsGreyListsNewMOAntiSpoofingCtrl',
            data: {
                permissions: [
                    'CREATE_ANTISPAM_GREYLISTS_OPERATIONS'
                ]
            }
        }).state('products.antispamsms.operations.greylists.moantispoofing.update', {
            url: "/update/:prefix",
            templateUrl: "products/antispamsms/operations/greylists/operations.greylists.detail.html",
            controller: 'AntiSpamSMSOperationsGreyListsUpdateMOAntiSpoofingCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_GREYLISTS_OPERATIONS' // Let read-only mode
                ]
            },
            resolve: {
                moAntiSpoofingGreyListEntry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getGreyListEntry(SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_AS, $stateParams.prefix);
                }
            }
        });

    });

    AntiSpamSMSOperationsGreyListsMOAntiSpoofingModule.controller('AntiSpamSMSOperationsGreyListsMOAntiSpoofingCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsGreyListsMOAntiSpoofingCommonCtrl');

        $scope.listState = "products.antispamsms.operations.greylists.moantispoofing.list";
        $scope.newState = "products.antispamsms.operations.greylists.moantispoofing.new";
        $scope.updateState = "products.antispamsms.operations.greylists.moantispoofing.update";
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.GreyLists.MOAntiSpoofing.PageHeader";

        $scope.sensitivityAvailable = true;
    });

    AntiSpamSMSOperationsGreyListsMOAntiSpoofingModule.controller('AntiSpamSMSOperationsGreyListsMOAntiSpoofingCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                    SMSAntiSpamConfigService, moAntiSpoofingGreyList) {
        $log.debug('AntiSpamSMSOperationsGreyListsMOAntiSpoofingCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMOAntiSpoofingCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_AS,
            entryList: moAntiSpoofingGreyList.entryList
        });
    });

    AntiSpamSMSOperationsGreyListsMOAntiSpoofingModule.controller('AntiSpamSMSOperationsGreyListsNewMOAntiSpoofingCtrl', function ($scope, $log, $controller, SMSAntiSpamConfigService) {
        $log.debug('AntiSpamSMSOperationsGreyListsNewMOAntiSpoofingCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMOAntiSpoofingCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsNewEntryCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_AS
        });
    });

    AntiSpamSMSOperationsGreyListsMOAntiSpoofingModule.controller('AntiSpamSMSOperationsGreyListsUpdateMOAntiSpoofingCtrl', function ($scope, $log, $controller, SMSAntiSpamConfigService, moAntiSpoofingGreyListEntry) {
        $log.debug('AntiSpamSMSOperationsGreyListsUpdateMOAntiSpoofingCtrl');

        $controller('AntiSpamSMSOperationsGreyListsMOAntiSpoofingCommonCtrl', {$scope: $scope});

        $controller('AntiSpamSMSOperationsGreyListsUpdateEntryCtrl', {
            $scope: $scope,
            key: SMSAntiSpamConfigService.FRAUD_DETECTION_KEYS.MO_AS,
            entry: moAntiSpoofingGreyListEntry
        });
    });

})();
