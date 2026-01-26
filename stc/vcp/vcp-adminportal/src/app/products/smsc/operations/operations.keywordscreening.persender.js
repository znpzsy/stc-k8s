(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.keywordscreening.persender', []);

    var SmscOperationsKeywordScreeningPerSenderModule = angular.module('adminportal.products.smsc.operations.keywordscreening.persender');

    SmscOperationsKeywordScreeningPerSenderModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.keywordscreening.persender', {
            url: "/per-sender",
            templateUrl: "products/smsc/operations/operations.keywordscreening.persender.html"
        });

        // Black List
        $stateProvider.state('products.smsc.operations.keywordscreening.persender.blacklist', {
            url: "/black-list",
            templateUrl: "products/smsc/operations/operations.keywordscreening.persender.list.html",
            controller: 'SmscOperationsKeywordScreeningPerSenderCtrl',
            data: {
                listState: 'products.smsc.operations.keywordscreening.persender.blacklist',
                newState: 'products.smsc.operations.keywordscreening.persender-blacklist-new',
                keywordScreeningListName: 'KeywordScreeningBlackList'
            },
            resolve: {
                keywordScreeningList: function (SmscConfService) {
                    return SmscConfService.getPerSenderKeywordScreeningBlackList();
                },
                removeMethod: function (SmscConfService) {
                    return SmscConfService.deletePerSenderKeywordScreeningBlackList;
                }
            }
        }).state('products.smsc.operations.keywordscreening.persender-blacklist-new', {
            url: "/per-sender/black-list/new",
            templateUrl: "products/smsc/operations/operations.keywordscreening.persender.details.html",
            controller: 'SmscOperationsKeywordScreeningPerSenderNewCtrl',
            data: {
                listState: 'products.smsc.operations.keywordscreening.persender.blacklist',
                subPageHeaderKey: 'Products.SMSC.Operations.KeywordScreening.PerSender.BlackListTitle'
            },
            resolve: {
                keywordScreeningList: function (SmscConfService) {
                    return SmscConfService.getPerSenderKeywordScreeningBlackList();
                },
                createMethod: function (SmscConfService) {
                    return SmscConfService.createPerSenderKeywordScreeningBlackList;
                }
            }
        });

        // White List
        $stateProvider.state('products.smsc.operations.keywordscreening.persender.whitelist', {
            url: "/whitelist-list",
            templateUrl: "products/smsc/operations/operations.keywordscreening.persender.list.html",
            controller: 'SmscOperationsKeywordScreeningPerSenderCtrl',
            data: {
                listState: 'products.smsc.operations.keywordscreening.persender.whitelist',
                newState: 'products.smsc.operations.keywordscreening.persender-whitelist-new',
                keywordScreeningListName: 'KeywordScreeningWhiteList'
            },
            resolve: {
                keywordScreeningList: function (SmscConfService) {
                    return SmscConfService.getPerSenderKeywordScreeningWhiteList();
                },
                removeMethod: function (SmscConfService) {
                    return SmscConfService.deletePerSenderKeywordScreeningWhiteList;
                }
            }
        }).state('products.smsc.operations.keywordscreening.persender-whitelist-new', {
            url: "/per-sender/whitelist-list/new",
            templateUrl: "products/smsc/operations/operations.keywordscreening.persender.details.html",
            controller: 'SmscOperationsKeywordScreeningPerSenderNewCtrl',
            data: {
                listState: 'products.smsc.operations.keywordscreening.persender.whitelist',
                subPageHeaderKey: 'Products.SMSC.Operations.KeywordScreening.PerSender.WhiteListTitle'
            },
            resolve: {
                keywordScreeningList: function (SmscConfService) {
                    return SmscConfService.getPerSenderKeywordScreeningWhiteList();
                },
                createMethod: function (SmscConfService) {
                    return SmscConfService.createPerSenderKeywordScreeningWhiteList;
                }
            }
        });

    });

    SmscOperationsKeywordScreeningPerSenderModule.controller('SmscOperationsKeywordScreeningPerSenderCtrl', function ($scope, $state, $log, $filter, $translate, notification, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                                    SmscConfService, keywordScreeningList, removeMethod) {
        $log.debug('SmscOperationsKeywordScreeningPerSenderCtrl');

        var keywordScreeningListList = [];
        _.each(keywordScreeningList, function (keywordScreening) {
            _.each(keywordScreening.keywords, function (keyword) {
                var keywordScreeningItem = {
                    sender: keywordScreening.sender,
                    keyword: keyword.keyword,
                };

                keywordScreeningListList.push(keywordScreeningItem);
            });
        });
        keywordScreeningListList = $filter('orderBy')(keywordScreeningListList, ['sender']);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'sender',
                    headerKey: 'Products.SMSC.Operations.KeywordScreening.TableColumns.Sender'
                },
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
                "sender": 'asc'
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

        $scope.remove = function (keywordScreening) {
            keywordScreening.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: function ($scope, $uibModalInstance, $translate, $controller, $sce) {
                    var message = $translate.instant('CommonLabels.ConfirmationRemoveMessage');
                    message = message + ' [' + keywordScreening.sender + ', ' + keywordScreening.keyword + ']';
                    $scope.confirmationMessage = $sce.trustAsHtml(message);

                    $controller('ConfirmationModalInstanceCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance
                    });
                },
                size: 'sm'
            });

            modalInstance.result.then(function () {
                keywordScreening.rowSelected = false;

                $log.debug('Removing Keyword Screening: ', keywordScreening);

                removeMethod(keywordScreening.sender, keywordScreening.keyword).then(function (response) {
                    $log.debug('Removed Keyword Screening: ', response);

                    var deletedListItem = _.findWhere($scope.keywordScreeningList.list, {
                        sender: keywordScreening.sender,
                        keyword: keywordScreening.keyword
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
                keywordScreening.rowSelected = false;
            });
        };
    });

    SmscOperationsKeywordScreeningPerSenderModule.controller('SmscOperationsKeywordScreeningPerSenderNewCtrl', function ($scope, $state, $log, $filter, $translate, notification, $uibModal, NgTableParams, NgTableService, Restangular,
                                                                                                                                       SmscConfService, keywordScreeningList, createMethod) {
        $log.debug('SmscOperationsKeywordScreeningPerSenderNewCtrl');

        var keywordScreeningListList = [];
        _.each(keywordScreeningList, function (keywordScreening) {
            _.each(keywordScreening.keywords, function (keyword) {
                var keywordScreeningItem = {
                    sender: keywordScreening.sender,
                    keyword: keyword.keyword,
                };

                keywordScreeningListList.push(keywordScreeningItem);
            });
        });
        $scope.keywordScreeningList = $filter('orderBy')(keywordScreeningListList, ['sender']);

        $scope.keywordScreening = {
            sender: '',
            keyword: ''
        };

        $scope.$watch('keywordScreening.sender', function (newVal, oldVal) {
            $scope.form.sender.$setValidity('availabilityCheck', true);
            $scope.form.keyword.$setValidity('availabilityCheck', true);

            if (!angular.equals(newVal, oldVal)) {
                var keywordScreeningSender = newVal;

                // Check availability.
                var foundKeywordScreening = _.findWhere($scope.keywordScreeningList, {
                    sender: keywordScreeningSender,
                    keyword: $scope.keywordScreening.keyword
                });
                $scope.form.sender.$setValidity('availabilityCheck', !foundKeywordScreening);
            }
        }, true);

        $scope.$watch('keywordScreening.keyword', function (newVal, oldVal) {
            $scope.form.sender.$setValidity('availabilityCheck', true);
            $scope.form.keyword.$setValidity('availabilityCheck', true);

            if (!angular.equals(newVal, oldVal)) {
                var keywordScreeningKeyword = newVal;

                // Check availability.
                var foundKeywordScreening = _.findWhere($scope.keywordScreeningList, {
                    sender: $scope.keywordScreening.sender,
                    keyword: keywordScreeningKeyword
                });
                $scope.form.keyword.$setValidity('availabilityCheck', !foundKeywordScreening);
            }
        }, true);

        $scope.save = function (keywordScreening) {
            var keywordScreeningItem = {
                keyword: keywordScreening.keyword
            };

            $log.debug('Creating Keyword Screening: ', keywordScreeningItem);

            createMethod(keywordScreening.sender, keywordScreeningItem).then(function (response) {
                $log.debug('Added Keyword Screening: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg.indexOf('already') > -1) {
                        message = $translate.instant('Products.SMSC.Operations.KeywordScreening.Messages.PerSenderAlreadyDefinedError', {
                            sender: keywordScreeningItem.sender,
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

                    $scope.go($state.current.data.listState);
                }
            }, function (response) {
                $log.debug('Cannot add Keyword Screening: ', response);
            });
        };

        $scope.cancel = function () {
            $scope.go($state.current.data.listState);
        };
    });

})();
