(function () {

    'use strict';

    angular.module('adminportal.products.messaginggw.operations.keywordscreening', []);

    var MessagingGwOperationsKeywordScreeningModule = angular.module('adminportal.products.messaginggw.operations.keywordscreening');

    MessagingGwOperationsKeywordScreeningModule.config(function ($stateProvider) {

        $stateProvider.state('products.messaginggw.operations.keywordscreening', {
            abstract: true,
            url: "/keyword-screening",
            template: "<div ui-view></div>",
            data: {
                permissions: [
                    'MSGW__OPERATIONS_SCREENINGKEYWORD_READ'
                ]
            }
        }).state('products.messaginggw.operations.keywordscreening.list', {
            url: "",
            templateUrl: "products/messaginggw/operations/operations.keywordscreening.html",
            controller: 'MessagingGwOperationsKeywordScreeningCtrl',
            resolve: {
                keywordScreeningLists: function (MessagingGwConfService) {
                    return MessagingGwConfService.getKeywordScreeningLists();
                }
            }
        }).state('products.messaginggw.operations.keywordscreening.new', {
            url: "/new",
            templateUrl: "products/messaginggw/operations/operations.keywordscreening.details.html",
            controller: 'MessagingGwOperationsKeywordScreeningNewCtrl'
        });

    });

    MessagingGwOperationsKeywordScreeningModule.controller('MessagingGwOperationsKeywordScreeningCtrl', function ($scope, $state, $log, $filter, $translate, notification, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                  UtilService, MessagingGwConfService, keywordScreeningLists) {
        $log.debug('MessagingGwOperationsKeywordScreeningCtrl');

        keywordScreeningLists = Restangular.stripRestangular(keywordScreeningLists);
        _.each(keywordScreeningLists, function (keywordScreeningList) {
            if (keywordScreeningList.action === 'REJECT') {
                keywordScreeningList.replaceText = $translate.instant('CommonLabels.N/A');
            } else {
                keywordScreeningList.replaceText = keywordScreeningList.replace;
            }
        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'action',
                    headerKey: 'Products.MessagingGw.Operations.KeywordScreening.TableColumns.Action'
                },
                {
                    fieldName: 'pattern',
                    headerKey: 'Products.MessagingGw.Operations.KeywordScreening.TableColumns.Pattern'
                },
                {
                    fieldName: 'replaceText',
                    headerKey: 'Products.MessagingGw.Operations.KeywordScreening.TableColumns.Replace'
                }
            ]
        };

        // Keyword Screening Lists
        $scope.keywordScreeningLists = {
            list: keywordScreeningLists,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.keywordScreeningLists.tableParams.settings().$scope.filterText = filterText;
            $scope.keywordScreeningLists.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.keywordScreeningLists.tableParams.page(1);
            $scope.keywordScreeningLists.tableParams.reload();
        }, 500);

        $scope.keywordScreeningLists.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "action": 'asc'
            }
        }, {
            total: $scope.keywordScreeningLists.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.keywordScreeningLists.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.keywordScreeningLists.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Keyword Screening Lists

        $scope.remove = function (keywordScreeningList) {
            keywordScreeningList.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = $translate.instant('CommonLabels.ConfirmationRemoveMessage');
                    message = message + ' [' + keywordScreeningList.action + ', ' + keywordScreeningList.pattern + ', ' + keywordScreeningList.replaceText + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                keywordScreeningList.rowSelected = false;

                var keywordScreeningListItem = {
                    action: keywordScreeningList.action,
                    pattern: keywordScreeningList.pattern,
                    replace: keywordScreeningList.replace
                };

                $log.debug('Removing Keyword Screening List: ', keywordScreeningListItem);

                MessagingGwConfService.deleteKeywordScreeningList(keywordScreeningListItem).then(function (response) {
                    $log.debug('Removed Keyword Screening List: ', response);

                    var deletedListItem = _.findWhere($scope.keywordScreeningLists.list, {
                        action: keywordScreeningList.action,
                        pattern: keywordScreeningList.pattern,
                        replace: keywordScreeningList.replace
                    });
                    $scope.keywordScreeningLists.list = _.without($scope.keywordScreeningLists.list, deletedListItem);

                    $scope.keywordScreeningLists.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Keyword Screening List: ', response);
                });
            }, function () {
                keywordScreeningList.rowSelected = false;
            });
        };

    });

    MessagingGwOperationsKeywordScreeningModule.controller('MessagingGwOperationsKeywordScreeningNewCtrl', function ($scope, $state, $log, $filter, $translate, notification, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                     UtilService, MessagingGwConfService, MSGGW_KEYWORD_SCREENING_LISTS_OPERATIONS) {
        $log.debug('MessagingGwOperationsKeywordScreeningNewCtrl');

        $scope.MSGGW_KEYWORD_SCREENING_LISTS_OPERATIONS = MSGGW_KEYWORD_SCREENING_LISTS_OPERATIONS;

        $scope.keywordScreeningList = {
            action: $scope.MSGGW_KEYWORD_SCREENING_LISTS_OPERATIONS[0],
            pattern: '',
            replace: ''
        };

        $scope.save = function (keywordScreeningList) {
            var keywordScreeningListItem = {
                action: keywordScreeningList.action,
                pattern: keywordScreeningList.pattern,
                replace: keywordScreeningList.action === 'REPLACE' ? keywordScreeningList.replace : ''
            };

            $log.debug('Creating Keyword Screening List: ', keywordScreeningListItem);

            MessagingGwConfService.createKeywordScreeningList(keywordScreeningListItem).then(function (response) {
                $log.debug('Added Keyword Screening List: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        message = $translate.instant('Products.MessagingGw.Operations.KeywordScreening.Messages.AlreadyDefinedError', {
                            pattern: keywordScreeningListItem.pattern
                        });
                    } else {
                        message = apiResponse.errorMsg;
                    }

                    notification({
                        type: 'warning',
                        text: message
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.go('products.messaginggw.operations.keywordscreening.list');
                }
            }, function (response) {
                $log.debug('Cannot add Keyword Screening List: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('products.messaginggw.operations.keywordscreening.list');
        };
    });

})();
