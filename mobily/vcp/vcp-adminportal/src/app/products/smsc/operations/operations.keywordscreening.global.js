(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.keywordscreening.global', []);

    var SmscOperationsKeywordScreeningGlobalModule = angular.module('adminportal.products.smsc.operations.keywordscreening.global');

    SmscOperationsKeywordScreeningGlobalModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.keywordscreening.global', {
            abstract: true,
            url: "/global",
            template: "<div ui-view></div>",
            resolve: {
                keywordScreeningList: function (SmscConfService) {
                    return SmscConfService.getGlobalKeywordScreeningList();
                }
            }
        }).state('products.smsc.operations.keywordscreening.global.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.keywordscreening.global.html",
            controller: 'SmscOperationsKeywordScreeningGlobalCtrl'
        }).state('products.smsc.operations.keywordscreening.global.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.keywordscreening.global.details.html",
            controller: 'SmscOperationsKeywordScreeningGlobalNewCtrl'
        });

    });

    SmscOperationsKeywordScreeningGlobalModule.controller('SmscOperationsKeywordScreeningGlobalCtrl', function ($scope, $state, $log, $filter, $translate, notification, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                              SmscConfService, keywordScreeningList) {
        $log.debug('SmscOperationsKeywordScreeningGlobalCtrl');

        var keywordScreeningListList = Restangular.stripRestangular(keywordScreeningList);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'keyword',
                    headerKey: 'Products.SMSC.Operations.KeywordScreening.TableColumns.Keyword'
                }
            ]
        };

        // Keyword Screening Lists
        $scope.keywordScreeningList = {
            list: keywordScreeningListList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.keywordScreeningList.tableParams.settings().$scope.filterText = filterText;
            $scope.keywordScreeningList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.keywordScreeningList.tableParams.page(1);
            $scope.keywordScreeningList.tableParams.reload();
        }, 500);

        $scope.keywordScreeningList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "keyword": 'asc'
            }
        }, {
            total: $scope.keywordScreeningList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.keywordScreeningList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.keywordScreeningList.list;
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
                    message = message + ' [' + keywordScreeningList.keyword + ']';
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

                $log.debug('Removing Keyword Screening: ', keywordScreeningList);

                SmscConfService.deleteGlobalKeywordScreening(keywordScreeningList.keyword).then(function (response) {
                    $log.debug('Removed Keyword Screening: ', response);

                    var deletedListItem = _.findWhere($scope.keywordScreeningList.list, {
                        keyword: keywordScreeningList.keyword
                    });
                    $scope.keywordScreeningList.list = _.without($scope.keywordScreeningList.list, deletedListItem);

                    $scope.keywordScreeningList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Keyword Screening: ', response);
                });
            }, function () {
                keywordScreeningList.rowSelected = false;
            });
        };
    });

    SmscOperationsKeywordScreeningGlobalModule.controller('SmscOperationsKeywordScreeningGlobalNewCtrl', function ($scope, $state, $log, $filter, $translate, notification, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                                 SmscConfService, keywordScreeningList) {
        $log.debug('SmscOperationsKeywordScreeningGlobalNewCtrl');

        $scope.keywordScreeningList = Restangular.stripRestangular(keywordScreeningList);

        $scope.keywordScreening = {
            keyword: ''
        };

        $scope.save = function (keywordScreening) {
            var keywordScreeningItem = {
                keyword: keywordScreening.keyword
            };

            $log.debug('Creating Keyword Screening: ', keywordScreeningItem);

            SmscConfService.createGlobalKeywordScreening(keywordScreeningItem).then(function (response) {
                $log.debug('Added Keyword Screening: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        message = $translate.instant('Products.SMSC.Operations.KeywordScreening.Messages.AlreadyDefinedError', {
                            keyword: keywordScreeningItem.keyword
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

                    $scope.go('products.smsc.operations.keywordscreening.global.list');
                }
            }, function (response) {
                $log.debug('Cannot add Keyword Screening: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('products.smsc.operations.keywordscreening.global.list');
        };
    });

})();
