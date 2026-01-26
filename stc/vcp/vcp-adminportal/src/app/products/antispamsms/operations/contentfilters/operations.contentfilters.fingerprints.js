(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.contentfilters.fingerprints', []);

    var AntiSpamSMSOperationsContentFiltersFingerprintsModule = angular.module('adminportal.products.antispamsms.operations.contentfilters.fingerprints');

    AntiSpamSMSOperationsContentFiltersFingerprintsModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.contentfilters.fingerprints', {
            url: "/fingerprint",
            template: '<div ui-view></div>'
        }).state('products.antispamsms.operations.contentfilters.fingerprints.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/contentfilters/operations.contentfilters.fingerprints.html",
            controller: 'AntiSpamSMSOperationsContentFiltersFingerprintsCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_CONTENTFILTERS_OPERATIONS'
                ]
            },
            resolve: {
                fingerprintsList: function (SMSAntiSpamConfigService) {
                    var pattern = 'spam';
                    return SMSAntiSpamConfigService.getFingerprintsList(pattern);
                }
            }
        }).state('products.antispamsms.operations.contentfilters.fingerprints.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/contentfilters/operations.contentfilters.fingerprints.detail.html",
            controller: 'AntiSpamSMSOperationsContentFiltersFingerprintsNewCtrl',
            data: {
                permissions: [
                    'CREATE_ANTISPAM_CONTENTFILTERS_OPERATIONS'
                ]
            },
        });

    });

    AntiSpamSMSOperationsContentFiltersFingerprintsModule.controller('AntiSpamSMSOperationsContentFiltersFingerprintsCommonCtrl', function ($scope, $log) {
        $log.debug('AntiSpamSMSOperationsContentFiltersFingerprintsCommonCtrl');

        $scope.listState = "products.antispamsms.operations.contentfilters.fingerprints.list";
        $scope.newState = "products.antispamsms.operations.contentfilters.fingerprints.new";
        $scope.pageHeaderKey = "Products.AntiSpamSMS.Operations.Fingerprints.Title";

        $scope.populatedResults = false;
    });

    AntiSpamSMSOperationsContentFiltersFingerprintsModule.controller('AntiSpamSMSOperationsContentFiltersFingerprintsCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                        Restangular, SMSAntiSpamConfigService, fingerprintsList) {
        $log.debug('AntiSpamSMSOperationsContentFiltersFingerprintsCtrl');

        $controller('AntiSpamSMSOperationsContentFiltersFingerprintsCommonCtrl', {$scope: $scope});

        $scope.entry = {
            content: '',
        };

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'content',
                    headerKey: 'Products.AntiSpamSMS.Operations.Fingerprints.TableColumns.Name'
                }
            ]
        };

        // MCA Modifiers list
        $scope.fingerprintsList = {
            list: fingerprintsList ? Restangular.stripRestangular(fingerprintsList) : [],
            tableParams: {}
        };

        $scope.fingerprintsList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "content": 'asc'
            }
        }, {
            total: 0,
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.fingerprintsList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.fingerprintsList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - MCA Modifiers list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.fingerprintsList.tableParams.settings().$scope.filterText = filterText;
            $scope.fingerprintsList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.fingerprintsList.tableParams.page(1);
            $scope.fingerprintsList.tableParams.reload();
        }, 500);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Fingerprint entry: ', entry);

                SMSAntiSpamConfigService.deleteFingerprintEntry(entry.content).then(function (response) {
                    $log.debug('Removed Fingerprint entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.fingerprintsList.list, {content: entry.content});
                    $scope.fingerprintsList.list = _.without($scope.fingerprintsList.list, deletedListItem);

                    $scope.fingerprintsList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Fingerprint entry: ', entry, ', response: ', response);
                });
            });
        };



        $scope.search = function(pattern){
            if (pattern) {
                SMSAntiSpamConfigService.getFingerprintsList(pattern).then(function (response) {
                    $log.debug('Success. Response: ', response);
                    if(response && response.message && response.value){
                        var message = $translate.instant('CommonMessages.GenericServerError') + '\n' + response.value + ' - ' + response.message;
                        notification({
                            type: 'warning',
                            text: message
                        });
                    }

                    var apiResponse = Restangular.stripRestangular(response);

                    $scope.fingerprintsList.list = apiResponse;
                    $scope.populatedResults = true;

                    $scope.fingerprintsList.tableParams.page(1);
                    $scope.fingerprintsList.tableParams.reload();

                }, function (response) {
                    $log.debug('Cannot read fingerprints. Error: ', response);
                    $scope.populatedResults = false;
                });
            }
        }
    });

    AntiSpamSMSOperationsContentFiltersFingerprintsModule.controller('AntiSpamSMSOperationsContentFiltersFingerprintsNewCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMSAntiSpamConfigService) {
        $controller('AntiSpamSMSOperationsContentFiltersFingerprintsCommonCtrl', {$scope: $scope});

        $scope.entry = {
            content: ''
        };

        $scope.isNotChanged = function () {
            return false;
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createFingerprintEntry(entryItem).then(function (response) {
                if (response && response.value === "ALREADY_SUBSCRIBED") {
                    $log.debug('Cannot add Fingerprint entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.SCAModifiers.Messages.EntryAlreadyDefinedError', {prefix: entryItem.prefix})
                    });
                } else {
                    $log.debug('Added Fingerprint entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }
            }, function (response) {
                $log.debug('Cannot add Fingerprint entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });


    
})();
