(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.operations.shortcodes', [
        'adminportal.subsystems.subscriptionmanagement.operations.shortcodes.test'
    ]);

    var SubscriptionManagementOperationsShortCodesModule = angular.module('adminportal.subsystems.subscriptionmanagement.operations.shortcodes');

    SubscriptionManagementOperationsShortCodesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.operations.shortcodes', {
            abstract: true,
            url: "",
            template: '<div ui-view></div>',
            data: {
                permissions: [
                    'SSM__OPERATIONS_SHORTCODE_READ'
                ]
            }
        }).state('subsystems.subscriptionmanagement.operations.shortcodes.list', {
            url: "/short-codes",
            templateUrl: 'subsystems/subscriptionmanagement/operations/shortcodes/operations.shortcodes.html',
            controller: 'SubscriptionManagementOperationsShortCodesCtrl',
            params: {
                'withoutCache': false
            },
            resolve: {
                shortCodes: function ($stateParams, SMSPortalProvisioningService) {
                    var withoutCache = $stateParams.withoutCache;

                    return SMSPortalProvisioningService.getShortCodes(withoutCache);
                }
            }
        }).state('subsystems.subscriptionmanagement.operations.shortcodes.new', {
            url: "/short-codes/new",
            templateUrl: 'subsystems/subscriptionmanagement/operations/shortcodes/operations.shortcodes.detail.html',
            controller: 'SubscriptionManagementOperationsShortCodesNewCtrl',
            resolve: {
                offers: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOffers();
                }
            }
        }).state('subsystems.subscriptionmanagement.operations.shortcodes.update', {
            url: "/short-codes/update/:name",
            templateUrl: 'subsystems/subscriptionmanagement/operations/shortcodes/operations.shortcodes.detail.html',
            controller: 'SubscriptionManagementOperationsShortCodesUpdateCtrl',
            resolve: {
                shortCodes: function (SMSPortalProvisioningService) {
                    return SMSPortalProvisioningService.getShortCodes(false);
                }
            }
        });

    });

    SubscriptionManagementOperationsShortCodesModule.controller('SubscriptionManagementOperationsShortCodesCommonCtrl', function ($scope, $log, $state, OFFER_SHORT_CODE_AND_KEYWORD_SCENARIOS,
                                                                                                                                  OFFER_XSM_SMS_PROFILE_LANGUAGES) {
        $log.debug('SubscriptionManagementOperationsShortCodesCommonCtrl');

        $scope.OFFER_SHORT_CODE_AND_KEYWORD_SCENARIOS = OFFER_SHORT_CODE_AND_KEYWORD_SCENARIOS;
        $scope.OFFER_XSM_SMS_PROFILE_LANGUAGES = OFFER_XSM_SMS_PROFILE_LANGUAGES;

        $scope.cancel = function (withoutCache) {
            $state.transitionTo('subsystems.subscriptionmanagement.operations.shortcodes.list', {
                'withoutCache': withoutCache ? withoutCache : false
            }, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

    SubscriptionManagementOperationsShortCodesModule.controller('SubscriptionManagementOperationsShortCodesCtrl', function ($scope, $log, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService, Restangular,
                                                                                                                            SMSPortalProvisioningService, shortCodes) {
        $log.debug('SubscriptionManagementOperationsShortCodesCtrl');

        var shortCodeList = Restangular.stripRestangular(shortCodes);
        shortCodeList = $filter('orderBy')(shortCodeList, ['shortCode']);

        var originalShortCodeList = angular.copy(shortCodeList);

        $scope.commandFilter = 'ALL';
        $scope.commandFilterChange = function (command) {
            if (command !== 'ALL') {
                $scope.shortCodeList.list = _.where(originalShortCodeList, {action: command});
            } else {
                $scope.shortCodeList.list = angular.copy(originalShortCodeList);
            }

            $scope.shortCodeList.tableParams.page(1);
            $scope.shortCodeList.tableParams.reload();
        };

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'scenarioName',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.ShortCodes.Fields.Offer'
                },
                {
                    fieldName: 'action',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.ShortCodes.Fields.Action'
                },
                {
                    fieldName: 'shortCode',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.ShortCodes.Fields.ShortCode'
                },
                {
                    fieldName: 'keyword',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.ShortCodes.Fields.Keyword'
                },
                {
                    fieldName: 'language',
                    headerKey: 'Subsystems.SubscriptionManagement.Operations.ShortCodes.Fields.Language',
                    filter: [{name: 'LanguageAbbrFilter'}, {name: 'translate'}]
                }
            ]
        };

        $scope.shortCodeList = {
            list: shortCodeList,
            tableParams: {}
        };

        $scope.shortCodeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "scenarioName": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.shortCodeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.shortCodeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.shortCodeList.tableParams.settings().$scope.filterText = filterText;
            $scope.shortCodeList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.shortCodeList.tableParams.page(1);
            $scope.shortCodeList.tableParams.reload();
        }, 500);

        $scope.remove = function (shortCode) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Remove Short Code.', shortCode);

                SMSPortalProvisioningService.deleteShortCode(shortCode.offerId, shortCode.name).then(function (response) {
                    $log.debug('Removed Short Code. Response: ', response);

                    var apiResponse = Restangular.stripRestangular(response);

                    if (apiResponse.errorCode) {
                        var message = (apiResponse.errorMsg ? apiResponse.errorMsg : $translate.instant('CommonMessages.GenericServerError'));

                        notification({
                            type: 'warning',
                            text: message
                        });
                    } else {
                        var deletedListItem = _.findWhere($scope.shortCodeList.list, {name: shortCode.name});
                        $scope.shortCodeList.list = _.without($scope.shortCodeList.list, deletedListItem);

                        $scope.shortCodeList.tableParams.reload();

                        originalShortCodeList = angular.copy($scope.shortCodeList.list);

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove Short Code. Error: ', response);
                });
            });
        };

        // Opens the short code test form.
        $scope.showShortCodeTestForm = function () {
            $uibModal.open({
                templateUrl: 'subsystems/subscriptionmanagement/operations/shortcodes/operations.shortcodes.test.modal.html',
                size: 'lg',
                controller: 'SubscriptionManagementOperationsShortCodesTestCtrl'
            });
        };
    });

    SubscriptionManagementOperationsShortCodesModule.controller('SubscriptionManagementOperationsShortCodesNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, Restangular, SMSPortalProvisioningService,
                                                                                                                               offers) {
        $log.debug('SubscriptionManagementOperationsShortCodesNewCtrl');

        // Call the common controller
        $controller('SubscriptionManagementOperationsShortCodesCommonCtrl', {$scope: $scope});

        var offers = Restangular.stripRestangular(offers).offers;
        $scope.offerList = $filter('orderBy')(offers, ['name']);

        $scope.shortCode = {};

        $scope.save = function (shortCode) {
            $log.debug('Creating Short Code: ', shortCode);

            var shortCodeItem = {
                action: shortCode.action,
                keyword: shortCode.keyword,
                shortCode: shortCode.shortCode,
                language: shortCode.language
            };

            SMSPortalProvisioningService.createShortCode(shortCode.offerId, shortCodeItem).then(function (response) {
                $log.debug('Created Short Code: ', shortCodeItem, ', response: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = (apiResponse.errorMsg ? apiResponse.errorMsg : $translate.instant('CommonMessages.GenericServerError'));

                    notification({
                        type: 'warning',
                        text: message
                    });
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel(true);
                }
            }, function (response) {
                $log.debug('Cannot create Short Code: ', shortCodeItem, ', response: ', response);
            });
        };
    });

    SubscriptionManagementOperationsShortCodesModule.controller('SubscriptionManagementOperationsShortCodesUpdateCtrl', function ($scope, $log, $stateParams, $controller, $translate, notification, Restangular, SMSPortalProvisioningService,
                                                                                                                                  shortCodes) {
        $log.debug('SubscriptionManagementOperationsShortCodesUpdateCtrl');

        // Call the common controller
        $controller('SubscriptionManagementOperationsShortCodesCommonCtrl', {$scope: $scope});

        var shortCodeName = $stateParams.name;
        $scope.shortCode = _.findWhere(shortCodes, {name: shortCodeName});

        $scope.originalShortCode = angular.copy($scope.shortCode);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalShortCode, $scope.shortCode);
        };

        $scope.save = function (shortCode) {
            $log.debug('Updating Short Code: ', shortCode);

            var shortCodeItem = {
                name: $scope.originalShortCode.name,
                action: shortCode.action,
                keyword: shortCode.keyword,
                shortCode: shortCode.shortCode,
                language: shortCode.language
            };

            SMSPortalProvisioningService.updateShortCode($scope.originalShortCode.offerId, shortCodeItem).then(function (response) {
                $log.debug('Updated Short Code: ', shortCodeItem, ', response: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = (apiResponse.errorMsg ? apiResponse.errorMsg : $translate.instant('CommonMessages.GenericServerError'));

                    notification({
                        type: 'warning',
                        text: message
                    });
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel(true);
                }
            }, function (response) {
                $log.debug('Cannot update Short Code: ', shortCodeItem, ', response: ', response);
            });
        };
    });

})();