(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.contentmodifiers.smscontent', [
        'adminportal.products.smsc.operations.contentmodifiers.smscontent.contentfiltering'
    ]);

    var SmscContentModifiersSMSContentOperationsModule = angular.module('adminportal.products.smsc.operations.contentmodifiers.smscontent');

    SmscContentModifiersSMSContentOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.contentmodifiers.smscontent', {
            abstract: true,
            url: "/sms-content",
            template: "<div ui-view></div>"
        }).state('products.smsc.operations.contentmodifiers.smscontent.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.contentmodifiers.smscontent.html",
            controller: 'SmscContentModifiersSMSContentOperationsCtrl',
            resolve: {
                contentModifiers: function (SmscConfService) {
                    return SmscConfService.getContentModifiers();
                }
            }
        }).state('products.smsc.operations.contentmodifiers.smscontent.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.contentmodifiers.smscontent.details.html",
            controller: 'SmscContentModifiersNewSMSContentOperationsCtrl'
        });

    });

    SmscContentModifiersSMSContentOperationsModule.controller('SmscContentModifiersSMSContentOperationsCtrl', function ($scope, $state, $log, $filter, $uibModal, Restangular, $translate, notification,
                                                                                                                                      NgTableParams, NgTableService, SmscConfService, contentModifiers) {
        $log.debug('SmscContentModifiersSMSContentOperationsCtrl');

        contentModifiers = Restangular.stripRestangular(contentModifiers);
        contentModifiers = $filter('orderBy')(contentModifiers, 'addressRangeStart');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'addressRangeStart',
                    headerKey: 'Products.SMSC.Operations.ContentModifiers.TableColumns.Start'
                },
                {
                    fieldName: 'addressRangeEnd',
                    headerKey: 'Products.SMSC.Operations.ContentModifiers.TableColumns.End'
                }
            ]
        };

        // SMPP content modifier list definitions
        $scope.contentModifierList = {
            list: contentModifiers,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentModifierList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentModifierList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentModifierList.tableParams.page(1);
            $scope.contentModifierList.tableParams.reload();
        }, 750);

        $scope.contentModifierList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "addressRangeStart": 'asc' // initial sorting
            }
        }, {
            total: $scope.contentModifierList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentModifierList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentModifierList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP content modifier list definitions

        // Opens the content filter management modal.
        $scope.manageContentFilters = function (contentModifier) {
            $uibModal.open({
                templateUrl: 'products/smsc/operations/operations.contentmodifiers.smscontent.contentfiltering.modal.html',
                size: 'lg',
                controller: 'SmscContentModifiersSMSContentContentFilteringOperationsCtrl',
                resolve: {
                    contentModifier: function () {
                        return contentModifier;
                    },
                    matchingContentPatterns: function (SmscConfService) {
                        return SmscConfService.getContentModifierPatternList(contentModifier.addressRangeStart, contentModifier.addressRangeEnd);
                    },
                    matchingTonNpis: function (SmscConfService) {
                        return SmscConfService.getContentModifierTonNpiList(contentModifier.addressRangeStart, contentModifier.addressRangeEnd);
                    }
                }
            });
        };

        $scope.remove = function (contentModifier) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Content Modifier: ', contentModifier);

                SmscConfService.deleteContentModifier(contentModifier.addressRangeStart, contentModifier.addressRangeEnd).then(function (response) {
                    $log.debug('Removed Content Modifier: ', response);

                    var apiResponse = Restangular.stripRestangular(response);

                    if (apiResponse.errorCode) {
                        var message = '';

                        if (apiResponse.errorMsg) {
                            if (apiResponse.errorMsg.indexOf('has subordinates') > -1) {
                                message = $translate.instant('Products.SMSC.Operations.ContentModifiers.Messages.MOHasSubordinates', {
                                    range: contentModifier.addressRangeStart + '_' + contentModifier.addressRangeEnd
                                });
                            } else {
                                message = apiResponse.errorMsg;
                            }
                        } else {
                            message = $translate.instant('CommonMessages.GenericServerError');
                        }

                        notification({
                            type: 'danger',
                            text: message
                        });
                    } else {
                        var deletedListItem = _.findWhere($scope.contentModifierList.list, {
                            addressRangeStart: contentModifier.addressRangeStart,
                            addressRangeEnd: contentModifier.addressRangeEnd
                        });
                        $scope.contentModifierList.list = _.without($scope.contentModifierList.list, deletedListItem);

                        $scope.contentModifierList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot delete Content Modifier: ', response);
                });
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });

    SmscContentModifiersSMSContentOperationsModule.controller('SmscContentModifiersNewSMSContentOperationsCtrl', function ($scope, $state, $log, $filter, $translate, notification, Restangular,
                                                                                                                                         SmscConfService) {
        $log.debug('SmscContentModifiersNewSMSContentOperationsCtrl');

        $scope.contentModifier = {};

        $scope.save = function (contentModifier) {
            var contentModifierItem = {
                "addressRangeStart": contentModifier.addressRangeStart,
                "addressRangeEnd": contentModifier.addressRangeEnd
            };

            SmscConfService.addContentModifier(contentModifierItem).then(function (response) {
                $log.debug('Added Content Modifier: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.ContentModifiers.Messages.AlreadyDefinedError', {
                                range: contentModifierItem.addressRangeStart + '_' + contentModifierItem.addressRangeEnd
                            });
                        } else if (apiResponse.errorMsg.indexOf('Overlap') > -1) {
                            var msgObj = _.object(_.compact(_.map(apiResponse.errorMsg.split(';'), function (item) {
                                if (item) return item.split(/=(.+)?/);
                            })));

                            var definedRange = msgObj['messageContentModifierAddressRange.adressRangeStart'].split(/,.+?=/);
                            var definedRangeStart = definedRange[0];
                            var definedRangeEnd = definedRange[1];

                            message = $translate.instant('Products.SMSC.Operations.ContentModifiers.Messages.RangeOverlappedError', {
                                range: definedRangeStart + '_' + definedRangeEnd
                            });
                        } else {
                            message = apiResponse.errorMsg;
                        }
                    } else {
                        message = $translate.instant('CommonMessages.GenericServerError');
                    }

                    notification({
                        type: 'danger',
                        text: message
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go('products.smsc.operations.contentmodifiers.smscontent.list');
                }
            }, function (response) {
                $log.debug('Cannot add Content Modifier: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo('products.smsc.operations.contentmodifiers.smscontent.list', {}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

})();
