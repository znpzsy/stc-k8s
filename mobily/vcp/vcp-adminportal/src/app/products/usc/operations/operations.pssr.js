(function () {

    'use strict';

    angular.module('adminportal.products.usc.operations.pssr', []);

    var USCOperationsPSSRModule = angular.module('adminportal.products.usc.operations.pssr');

    USCOperationsPSSRModule.config(function ($stateProvider) {

        $stateProvider.state('products.usc.operations.stringreplacements', {
            url: "/stringreplacements",
            abstract: true,
            templateUrl: "products/usc/operations/operations.abstract.html"
        }).state('products.usc.operations.stringreplacements.pssr', {
            url: "/pssr",
            templateUrl: "products/usc/operations/operations.pssr.html",
            controller: 'USCPssrOperationsCtrl',
            resolve: {
                textReplacements: function (UssdBrowserService) {
                    return UssdBrowserService.getTextReplacements();
                }
            }
        }).state('products.usc.operations.stringreplacements.pssrnew', {
            url: "/pssr",
            templateUrl: "products/usc/operations/operations.pssr.detail.html",
            controller: 'USCNewPssrOperationsCtrl'
        }).state('products.usc.operations.stringreplacements.pssrupdate', {
            url: "/pssr/:name",
            templateUrl: "products/usc/operations/operations.pssr.detail.html",
            controller: 'USCUpdatePssrOperationsCtrl',
            resolve: {
                text: function($stateParams, UssdBrowserService) {
                    return UssdBrowserService.getTextReplacement($stateParams.name);
                }
            }
        });
    });

    USCOperationsPSSRModule.controller('USCPssrOperationsCtrl', function ($scope, $log, $uibModal, NgTableParams, NgTableService, $filter, UssdBrowserService,
                                                                          Restangular, notification, $translate, textReplacements) {
        $log.debug("USCPssrOperationsCtrl");

        $scope.textReplacements = Restangular.stripRestangular(textReplacements);
        $scope.textReplacements = $filter('orderBy')($scope.textReplacements, 'name');

        $log.debug('PSSR text replacements: ', $scope.textReplacements);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.USC.Operations.StringReplacements.Identifier'
                },
                {
                    fieldName: 'precedence',
                    headerKey: 'Products.USC.Operations.StringReplacements.Precedence'
                },
                {
                    fieldName: 'regex',
                    headerKey: 'Products.USC.Operations.StringReplacements.MatchingPattern'
                },
                {
                    fieldName: 'replaceWith',
                    headerKey: 'Products.USC.Operations.StringReplacements.ReplaceWith'
                }
            ]
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: 10,
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.textReplacements);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.textReplacements;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);

        $scope.remove = function (text) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                UssdBrowserService.deleteTextReplacement(text).then(function (response) {
                    $log.debug('Removed text. Response: ', response);

                    var deletedListItem = _.findWhere($scope.textReplacements, {
                        name: text.name
                    });
                    $scope.textReplacements = _.without($scope.textReplacements, deletedListItem);

                    $scope.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot removed text. Error: ', response);
                });
            });
        };
    });

    USCOperationsPSSRModule.controller('USCNewPssrOperationsCtrl', function ($scope, $log, UssdBrowserService, notification, $translate, Restangular) {
        $log.debug("USCNewPssrOperationsCtrl");

        $scope.text = {};

        $scope.save = function () {
            UssdBrowserService.addTextReplacement($scope.text).then(function (response) {
                $log.debug('Added text: ', response);
                var apiResponse = Restangular.stripRestangular(response);
                if (apiResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode,
                            errorText: apiResponse.errorText
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $scope.go('products.usc.operations.stringreplacements.pssr');
                }
            }, function (response) {
                $log.debug('Cannot add pssr. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go('products.usc.operations.stringreplacements.pssr');
        };
    });

    USCOperationsPSSRModule.controller('USCUpdatePssrOperationsCtrl', function ($scope, $log, $stateParams, notification, $translate, Restangular, UssdBrowserService, text) {
        $log.debug("USCUpdatePssrOperationsCtrl");

        $scope.text = Restangular.stripRestangular(text);
        $scope.text.id = _.uniqueId();
        $scope.originalText = angular.copy($scope.text);
        $scope.isConfigurationNotChanged = function () {
            return angular.equals($scope.originalText, $scope.text);
        };

        $scope.save = function () {
            UssdBrowserService.updateTextReplacement($scope.text).then(function (response) {
                $log.debug('Added text: ', response);
                var apiResponse = Restangular.stripRestangular(response);
                if (apiResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode,
                            errorText: apiResponse.errorText
                        })
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                    $scope.go('products.usc.operations.stringreplacements.pssr');
                }
            }, function (response) {
                $log.debug('Cannot add ussd application. Error: ', response);
            });
        };

        $scope.cancel = function () {
            $log.debug('Cancel');
            $scope.go('products.usc.operations.stringreplacements.pssr');
        };
    });

})();
