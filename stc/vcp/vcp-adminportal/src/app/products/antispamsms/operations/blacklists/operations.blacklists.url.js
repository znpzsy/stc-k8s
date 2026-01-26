(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.blacklists.url', []);

    var AntiSpamSMSOperationsBlacklistsUrlModule = angular.module('adminportal.products.antispamsms.operations.blacklists.url');

    AntiSpamSMSOperationsBlacklistsUrlModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.blacklists.url', {
            url: "/url",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.blacklists.url.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/blacklists/operations.blacklists.url.html",
            controller: 'AntiSpamSMSOperationsBlacklistsUrlCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_BLACKLISTS_OPERATIONS'
                ]
            },
            resolve: {
                blacklists: function (SMSAntiSpamConfigService) {
                    var key = '*.com'
                    return SMSAntiSpamConfigService.getBlackLists("url-black", key);
                }
            }
        }).state('products.antispamsms.operations.blacklists.url.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/blacklists/operations.blacklists.url.detail.html",
            controller: 'AntiSpamSMSOperationsBlacklistsUrlNewCtrl',
            data: {
                permissions: [
                    'CREATE_ANTISPAM_BLACKLISTS_OPERATIONS'
                ]
            }
        }).state('products.antispamsms.operations.blacklists.url.update', {
            url: "/update/:url",
            templateUrl: "products/antispamsms/operations/blacklists/operations.blacklists.url.detail.html",
            controller: 'AntiSpamSMSOperationsBlacklistsUrlUpdateCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_BLACKLISTS_OPERATIONS' // Let read-only mode
                ]
            },
            resolve: {
                entry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getBlackListEntry('url-black', $stateParams.url);
                }
            }
        });

    });

    AntiSpamSMSOperationsBlacklistsUrlModule.controller('AntiSpamSMSOperationsBlacklistsUrlCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsBlacklistsUrlCommonCtrl');

        $scope.listState = "products.antispamsms.operations.blacklists.url.list";
        $scope.newState = "products.antispamsms.operations.blacklists.url.new";
        $scope.updateState = "products.antispamsms.operations.blacklists.url.update";
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.Blacklists.Title";

        $scope.populatedResults = false;
    });

    AntiSpamSMSOperationsBlacklistsUrlModule.controller('AntiSpamSMSOperationsBlacklistsUrlCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                          SMSAntiSpamConfigService, Restangular, blacklists, SMS_ANTISPAM_URL_EXTENSIONS) {
        $log.debug('AntiSpamSMSOperationsBlacklistsUrlCtrl');

        $controller('AntiSpamSMSOperationsBlacklistsUrlCommonCtrl', {$scope: $scope});

        blacklists = _.isArray(blacklists) ? blacklists : [];

        $scope.SMS_ANTISPAM_URL_EXTENSIONS = SMS_ANTISPAM_URL_EXTENSIONS;

        $scope.entry = {
            extension: $scope.SMS_ANTISPAM_URL_EXTENSIONS[266]
        };

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'url',
                    headerKey: 'Products.AntiSpamSMS.Operations.BlackLists.URLBlackLists.TableColumns.Url'
                }
            ]
        };

        // Blacklist
        $scope.blacklists = {
            list: blacklists,
            tableParams: {}
        };
        

        $scope.blacklists.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "created": 'asc'
            }
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {

                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.blacklists.list);

                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.blacklists.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);

                }
                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Blacklist  list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.blacklists.tableParams.settings().$scope.filterText = filterText;
            $scope.blacklists.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.blacklists.tableParams.page(1);
            $scope.blacklists.tableParams.reload();
        }, 500);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Blacklist  entry: ', entry);

                SMSAntiSpamConfigService.deleteBlackListEntry('url-black', entry.url).then(function (response) {
                    $log.debug('Removed Blacklist  entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.blacklists.list, {url: entry.url});
                    $scope.blacklists.list = _.without($scope.blacklists.list, deletedListItem);

                    $scope.blacklists.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Blacklist  entry: ', entry, ', response: ', response);
                });
            });
        };

        $scope.search = function(ext){
            if (ext) {
                SMSAntiSpamConfigService.getBlackLists("url-black", ext).then(function (response) {
                    $log.debug('Success. Response: ', response);
                    if(response && response.message && response.value){
                        var message = $translate.instant('CommonMessages.GenericServerError') + '\n' + response.value + ' - ' + response.message;
                        notification({
                            type: 'warning',
                            text: message
                        });
                    }

                    var apiResponse = Restangular.stripRestangular(response);

                    $scope.blacklists.list = apiResponse;
                    $scope.populatedResults = true;

                    $scope.blacklists.tableParams.page(1);
                    $scope.blacklists.tableParams.reload();

                }, function (response) {
                    $log.debug('Cannot read screenings. Error: ', response);
                    $scope.populatedResults = false;
                });
            }
        }


    });

    AntiSpamSMSOperationsBlacklistsUrlModule.controller('AntiSpamSMSOperationsBlacklistsUrlNewCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMS_ANTISPAM_URL_EXTENSIONS, SMSAntiSpamConfigService) {
        $controller('AntiSpamSMSOperationsBlacklistsUrlCommonCtrl', {$scope: $scope});

        $scope.SMS_ANTISPAM_URL_EXTENSIONS = SMS_ANTISPAM_URL_EXTENSIONS;
        $scope.isUpdate = false;
        $scope.entry = {
            counter: 0,
            description: '',
            replacementUrl: '',
            url: ''
        };


        $scope.isNotChanged = function () {
            return false;
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createBlackListEntry('url-black', entryItem).then(function (response) {
                $log.debug('Response for create entry: ', entryItem, ', response: ', response);
                if (response && response.status !== 200) {
                    $log.debug('Cannot add Blacklist entry: ', entryItem, ', response: ', response);
                    if (response.message && response.value){
                        var message = $translate.instant('CommonMessages.GenericServerError') + '\n' + response.value + ' - ' + response.message;
                        notification({
                            type: 'warning',
                            text: message
                        });
                    }
                    else {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.GenericServerError')
                        });
                    }
                } else {
                    $log.debug('Added Blacklist entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add Blacklist entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    AntiSpamSMSOperationsBlacklistsUrlModule.controller('AntiSpamSMSOperationsBlacklistsUrlUpdateCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMS_ANTISPAM_URL_EXTENSIONS, SMSAntiSpamConfigService, entry) {
        $controller('AntiSpamSMSOperationsBlacklistsUrlCommonCtrl', {$scope: $scope});

        $scope.SMS_ANTISPAM_URL_EXTENSIONS = SMS_ANTISPAM_URL_EXTENSIONS;

        $scope.entry = entry;
        $scope.isUpdate = true;

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        $scope.save = function (entry) {
            
            SMSAntiSpamConfigService.updateBlackListEntry('url-black', entry).then(function (response) {
                $log.debug('Updated Blacklist entry: ', entry);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go($scope.listState);
            }, function (response) {
                $log.debug('Cannot update Blacklist entry: ', entry, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });


})();
