(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.blacklists.phone', []);

    var AntiSpamSMSOperationsBlacklistsPhoneModule = angular.module('adminportal.products.antispamsms.operations.blacklists.phone');

    AntiSpamSMSOperationsBlacklistsPhoneModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.blacklists.phone', {
            url: "/phone",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.blacklists.phone.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/blacklists/operations.blacklists.phone.html",
            controller: 'AntiSpamSMSOperationsBlacklistsPhoneCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_BLACKLISTS_OPERATIONS'
                ]
            },
            resolve: {
                blacklists: function (SMSAntiSpamConfigService) {
                    var key = '966*'
                    return SMSAntiSpamConfigService.getBlackLists("phonenumber-black", key);
                }
            }
        }).state('products.antispamsms.operations.blacklists.phone.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/blacklists/operations.blacklists.phone.detail.html",
            controller: 'AntiSpamSMSOperationsBlacklistsPhoneNewCtrl',
            data: {
                permissions: [
                    'CREATE_ANTISPAM_BLACKLISTS_OPERATIONS'
                ]
            }
        }).state('products.antispamsms.operations.blacklists.phone.update', {
            url: "/update/:phone",
            templateUrl: "products/antispamsms/operations/blacklists/operations.blacklists.phone.detail.html",
            controller: 'AntiSpamSMSOperationsBlacklistsPhoneUpdateCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_BLACKLISTS_OPERATIONS' // Let read-only mode
                ]
            },
            resolve: {
                entry: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getBlackListEntry('phonenumber-black', $stateParams.phone);
                }
            }
        });

    });

    AntiSpamSMSOperationsBlacklistsPhoneModule.controller('AntiSpamSMSOperationsBlacklistsPhoneCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsBlacklistsPhoneCommonCtrl');

        $scope.listState = "products.antispamsms.operations.blacklists.phone.list";
        $scope.newState = "products.antispamsms.operations.blacklists.phone.new";
        $scope.updateState = "products.antispamsms.operations.blacklists.phone.update";
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.Blacklists.PhoneNumberBlackLists.Title";

        $scope.populatedResults = false;

        $scope.normalizeArabicDigits = function (s, prop) {
            // drop everything not ٠-٩ 0-9 * # +
            s = s.replace(/[^0-9\u0660-\u0669*#+]/g, '');
            $scope.entry[prop] = s;
        };

    });

    AntiSpamSMSOperationsBlacklistsPhoneModule.controller('AntiSpamSMSOperationsBlacklistsPhoneCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                          SMSAntiSpamConfigService, Restangular, blacklists) {
        $log.debug('AntiSpamSMSOperationsBlacklistsPhoneCtrl');

        $controller('AntiSpamSMSOperationsBlacklistsPhoneCommonCtrl', {$scope: $scope});
        blacklists = _.isArray(blacklists) ? blacklists : [];

        $scope.entry = {
            extension: "966*"
        };

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'number',
                    headerKey: 'Products.AntiSpamSMS.Operations.BlackLists.PhoneNumberBlackLists.TableColumns.PhoneNumber'
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

                SMSAntiSpamConfigService.deleteBlackListEntry('phonenumber-black', entry.number).then(function (response) {
                    $log.debug('Removed Blacklist  entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.blacklists.list, {number: entry.number});
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
                SMSAntiSpamConfigService.getBlackLists("phonenumber-black", ext).then(function (response) {
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

    AntiSpamSMSOperationsBlacklistsPhoneModule.controller('AntiSpamSMSOperationsBlacklistsPhoneNewCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMSAntiSpamConfigService) {
        $controller('AntiSpamSMSOperationsBlacklistsPhoneCommonCtrl', {$scope: $scope});


        $scope.isUpdate = false;
        $scope.entry = {
            counter: 0,
            description: '',
            number: '',
            created: '',
            replacementNumber: ''
        };


        $scope.isNotChanged = function () {
            return false;
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createBlackListEntry('phonenumber-black', entryItem).then(function (response) {
                if (response && response.status !== 200) {
                    $log.debug('Cannot add Blacklist entry: ', entryItem, ', response: ', response);
                    if (response.message && response.value){
                        var message = $translate.instant('CommonMessages.GenericServerError') + '\n' + response.value + ' - ' + response.message;
                        notification({
                            type: 'warning',
                            text: message
                        });
                    }
                } else {
                    $log.debug('Added Blacklist entry: ', entryItem, ', response: ', response);

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

    AntiSpamSMSOperationsBlacklistsPhoneModule.controller('AntiSpamSMSOperationsBlacklistsPhoneUpdateCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMSAntiSpamConfigService, entry) {
        $controller('AntiSpamSMSOperationsBlacklistsPhoneCommonCtrl', {$scope: $scope});


        $scope.entry = entry;
        $scope.isUpdate = true;

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalEntry, $scope.entry);
        };

        $scope.save = function (entry) {
            
            SMSAntiSpamConfigService.updateBlackListEntry('phonenumber-black', entry).then(function (response) {
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
