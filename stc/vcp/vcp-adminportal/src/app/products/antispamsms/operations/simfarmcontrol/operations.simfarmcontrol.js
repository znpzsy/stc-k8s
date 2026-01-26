(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.simfarmcontrol', [
        "adminportal.products.antispamsms.operations.simfarmcontrol.contentcounters.contentranges"
    ]);

    var AntiSpamSMSOperationsSimFarmControlModule = angular.module('adminportal.products.antispamsms.operations.simfarmcontrol');

    AntiSpamSMSOperationsSimFarmControlModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.simfarmcontrol', {
            abstract: true,
            url: "/simfarmcontrol",
            template: '<div ui-view></div>',
            resolve: {
                allContentCounters: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getContentCountersList();
                },
                allContentContainers: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getContentCounterContainersList();
                }
            }
        })
            // Containers
            .state('products.antispamsms.operations.simfarmcontrol.containerlist', {
                url: "/containers/list",
                templateUrl: "products/antispamsms/operations/simfarmcontrol/operations.simfarmcontrol.contentcontainers.html",
                controller: 'AntiSpamSMSOperationsCountersContentCounterContainersCtrl',
                data: {
                    permissions: [
                        'READ_ANTISPAM_CONTENTCOUNTER_OPERATIONS'
                    ]
                }
            })
            // New Container
            .state('products.antispamsms.operations.simfarmcontrol.newcontainer', {
                url: "/containers/new",
                templateUrl: "products/antispamsms/operations/simfarmcontrol/operations.simfarmcontrol.contentcontainers.detail.html",
                controller: 'AntiSpamSMSOperationsCountersContentCounterContainersNewCtrl',
                data: {
                    permissions: [
                        'CREATE_ANTISPAM_CONTENTCOUNTER_OPERATIONS'
                    ]
                }
            })
            // Update Container
            .state('products.antispamsms.operations.simfarmcontrol.updatecontainer', {
                url: "/containers/update/:parentName",
                templateUrl: "products/antispamsms/operations/simfarmcontrol/operations.simfarmcontrol.contentcontainers.detail.html",
                controller: 'AntiSpamSMSOperationsCountersContentCounterContainersUpdateCtrl',
                data: {
                    permissions: [
                        'READ_ANTISPAM_CONTENTCOUNTER_OPERATIONS' // Read-only access to view the details
                    ]
                },
                resolve: {
                    containerEntry: function ($stateParams, SMSAntiSpamConfigService) {
                        return SMSAntiSpamConfigService.getContentCounterContainerEntry($stateParams.parentName);
                    }
                }
            })
            // Counters
            .state('products.antispamsms.operations.simfarmcontrol.counterlist', {
                url: "/counters/list/:parentName",
                templateUrl: "products/antispamsms/operations/simfarmcontrol/operations.simfarmcontrol.contentcounters.html",
                controller: 'AntiSpamSMSOperationsSimFarmContentCountersCtrl',
                data: {
                    permissions: [
                        'READ_ANTISPAM_CONTENTCOUNTER_OPERATIONS'
                    ]
                }
            })
            // New Counter
            .state('products.antispamsms.operations.simfarmcontrol.newcounter', {
                url: "/counters/new/:parentName",
                templateUrl: "products/antispamsms/operations/simfarmcontrol/operations.simfarmcontrol.contentcounters.detail.html",
                controller: 'AntiSpamSMSOperationsSimFarmContentCountersNewCtrl',
                data: {
                    permissions: [
                        'CREATE_ANTISPAM_CONTENTCOUNTER_OPERATIONS'
                    ]
                }
            })
            // Update Counter
            .state('products.antispamsms.operations.simfarmcontrol.updatecounter', {
                url: "/counters/update/:parentName/:name",
                templateUrl: "products/antispamsms/operations/simfarmcontrol/operations.simfarmcontrol.contentcounters.detail.html",
                controller: 'AntiSpamSMSOperationsSimFarmContentCountersUpdateCtrl',
                data: {
                    permissions: [
                        'READ_ANTISPAM_CONTENTCOUNTER_OPERATIONS' // Read-only access to view the details
                    ]
                },
                resolve: {
                    contentCountersEntry: function ($stateParams, SMSAntiSpamConfigService) {
                        return SMSAntiSpamConfigService.getContentCountersEntry($stateParams.parentName, $stateParams.name);
                    }
                }
            });

    });

    AntiSpamSMSOperationsSimFarmControlModule.controller('AntiSpamSMSOperationsSimFarmCommonCtrl', function ($scope, $log, $state, $controller, $translate, $uibModal, notification, STATES, SMS_ANTISPAM_REJECT_METHODS_3,
                                                                                                                             SMS_ANTISPAM_CONTENT_COUNTER_REJECT_CODES, SMS_ANTISPAM_CASE_SENSITIVITY, SMS_ANTISPAM_CONTENT_COUNTER_EVALUATION_TYPES,
                                                                                                                             SMS_ANTISPAM_RANGE_POLICIES, SMS_ANTISPAM_CONTENT_COUNTER_FLOWS, SMS_ANTISPAM_CONTENT_COUNTER_SIMILARITY_ALGORITHMS,
                                                                                                                             SMSAntiSpamConfigService, allContentCounters, allContentContainers) {
        $scope.STATES = STATES;
        $scope.SMS_ANTISPAM_RANGE_POLICIES = SMS_ANTISPAM_RANGE_POLICIES;
        $scope.SMS_ANTISPAM_REJECT_METHODS_3 = SMS_ANTISPAM_REJECT_METHODS_3;
        // Content counters 'contentFilterType' field accepts different values than content filters 'contentFilterType' field.
        $scope.SMS_ANTISPAM_CONTENT_COUNTER_EVALUATION_TYPES = SMS_ANTISPAM_CONTENT_COUNTER_EVALUATION_TYPES;
        $scope.SMS_ANTISPAM_CONTENT_COUNTER_SIMILARITY_ALGORITHMS = SMS_ANTISPAM_CONTENT_COUNTER_SIMILARITY_ALGORITHMS;
        $scope.SMS_ANTISPAM_CASE_SENSITIVITY = SMS_ANTISPAM_CASE_SENSITIVITY;
        $scope.SMS_ANTISPAM_CONTENT_COUNTER_REJECT_CODES = SMS_ANTISPAM_CONTENT_COUNTER_REJECT_CODES;
        $scope.SMS_ANTISPAM_CONTENT_COUNTER_FLOWS = SMS_ANTISPAM_CONTENT_COUNTER_FLOWS;

        //$scope.parentNames =  _.uniq(_.map($scope.countersList ? $scope.countersList : [], _.iteratee('name')));
        var parents = allContentContainers ? allContentContainers.allContainers : [];
        $scope.parentNames =  _.uniq(_.map(parents, _.iteratee('name')));

        $scope.setAddressRange = function (entry) {
            $uibModal.open({
                templateUrl: 'products/antispamsms/operations/simfarmcontrol/operations.simfarmcontrol.contentcounters.contentranges.modal.html',
                controller: 'AntiSpamSMSOperationsSimFarmControlContentRangesCtrl',
                size: 'lg',
                resolve: {
                    contentFiltersEntry: function () {
                        return entry;
                    },
                    msisdnRanges: function (SMSAntiSpamConfigService) {
                        return SMSAntiSpamConfigService.getMsisdnRangeList();
                    },
                    addressRanges: function () {
                        return SMSAntiSpamConfigService.getContentCounterRangeList(entry.name);
                    }
                }
            });
        };

        $scope.prepareContainers = function (containers, counters) {
            return containers.map(function (container) {
                container.counters = counters.filter(function (counter) {
                    return counter.parentName === container.name;
                });
                return container;
            });
        };

        $scope.filterCounters = function (counters, parentName) {

            if(parentName){
                return counters.filter(function (counter) {
                    return counter.parentName === parentName;
                });
            }
            else {
                return counters ? counters : [];
            }
        };

    });



    // Containers
    AntiSpamSMSOperationsSimFarmControlModule.controller('AntiSpamSMSOperationsCountersContentCounterContainersCtrl', function ($scope, $uibModal, $log, $controller, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                SMSAntiSpamConfigService, allContentCounters, allContentContainers) {
        $log.debug("AntiSpamSMSOperationsCountersContentCounterContainersCtrl");

        $controller('AntiSpamSMSOperationsSimFarmCommonCtrl', {$scope: $scope, allContentCounters: allContentCounters, allContentContainers: allContentContainers});

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounterContainers.TableColumns.Name'
                },
                {
                    fieldName: 'flow',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounterContainers.TableColumns.Flow',
                    filter: {name: 'AntiSpamSMSContentCounterFlowFilter'}
                },
                {
                    fieldName: 'checkGeo',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounterContainers.TableColumns.CheckGeo',
                    filter: {name: 'YesNoFilter'}
                },
                {
                    fieldName: 'msisdnAdjacency',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounterContainers.TableColumns.MsisdnAdjacency'
                }
            ]
        };

        var containers = allContentContainers ? allContentContainers : {allContainers: []} ;
        var counters = allContentCounters ? allContentCounters : {counters: []} ;

       containers.allContainers = $scope.prepareContainers(containers.allContainers, counters.counters);
       $log.debug("Containers with counters", containers);

        // Content Counters list
        $scope.contentCounterContainersList = {
            list: containers.allContainers,
            tableParams: {}
        };

        $scope.contentCounterContainersList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.contentCounterContainersList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentCounterContainersList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentCounterContainersList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentCounterContainersList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentCounterContainersList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentCounterContainersList.tableParams.page(1);
            $scope.contentCounterContainersList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing content counters list entry: ', entry);

                SMSAntiSpamConfigService.deleteContentCounterContainerEntry(entry.name).then(function (response) {
                    $log.debug('Removed content counters list entry: ', entry, ', response: ', response);

                    if(response && (response.value == "GENERAL_ERROR" || response.value == "REFERENCE_FOUND")) {
                        $log.debug('Cannot remove content counters list entry: ', response.value);
                        notification({
                            type: 'danger',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.value,
                                errorText: response.message
                            })
                        });
                    } else {

                        var deletedListItem = _.findWhere($scope.contentCounterContainersList.list, {name: entry.name});
                        $scope.contentCounterContainersList.list = _.without($scope.contentCounterContainersList.list, deletedListItem);

                        $scope.contentCounterContainersList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }

                }, function (response) {
                    $log.debug('Cannot delete content counters list entry: ', entry, ', response: ', response);
                });
            });
        };
    });

    AntiSpamSMSOperationsSimFarmControlModule.controller('AntiSpamSMSOperationsCountersContentCounterContainersNewCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMSAntiSpamConfigService, allContentCounters, allContentContainers) {

        $log.debug("AntiSpamSMSOperationsCountersContentCounterContainersNewCtrl");

        $scope.countersList = allContentCounters ? allContentCounters.counters : [];
        $controller('AntiSpamSMSOperationsSimFarmCommonCtrl', {$scope: $scope, allContentCounters: allContentCounters, allContentContainers: allContentContainers});

        $scope.newRecord = true;

        $scope.entry = {
            //parentName: $scope.parentNames[0],
            name: '',
            checkGeo: false,
            msisdnAdjacency: 80,
            flow: $scope.SMS_ANTISPAM_CONTENT_COUNTER_FLOWS[0].value,
            tolerance: 1
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createContentCounterContainersEntry(entryItem).then(function (response) {
                if (response && response.value === "GENERAL_ERROR") {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.value,
                            errorText: response.message
                        })
                    });
                } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('must be unique') > 1) {
                    $log.debug('Cannot add mo sms content filters entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryAlreadyDefinedError', {name: entryItem.name})
                    });
                } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('cannot use') > 1) {
                    $log.debug('Cannot add mo sms content filters entry so the name temporary reserved: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryTemporaryReservedError', {name: entryItem.name})
                    });
                } else {
                    $log.debug('Added mo sms content filters entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go('products.antispamsms.operations.simfarmcontrol.containerlist');
                }
            }, function (response) {
                $log.debug('Cannot add mo sms content filters entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function(){
            $state.go('products.antispamsms.operations.simfarmcontrol.containerlist');
        };
    });


    AntiSpamSMSOperationsSimFarmControlModule.controller('AntiSpamSMSOperationsCountersContentCounterContainersUpdateCtrl', function ($scope, $log, $state, $controller, $translate, notification, STATES, SMS_ANTISPAM_CONTENT_COUNTER_FLOWS, SMSAntiSpamConfigService, allContentCounters, allContentContainers, containerEntry) {

        $log.debug("AntiSpamSMSOperationsCountersContentCounterContainersUpdateCtrl");

        $scope.entry = containerEntry;
        $scope.countersList = allContentCounters ? allContentCounters.counters : [];

        $controller('AntiSpamSMSOperationsSimFarmCommonCtrl', {$scope: $scope, allContentCounters: allContentCounters, allContentContainers: allContentContainers});

        $scope.newRecord = false;

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.updateContentCounterContainerEntry(entry.name, entry).then(function (response) {
                $log.debug('Updating container entry: ', entryItem, ', Response: ', response);

                if(response && response.value == "GENERAL_ERROR") {
                    $log.debug('Cannot Update Container entry: ', response.value);
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.GenericServerError')
                    });

                } else {
                    $log.debug('Updated Container entry: ', entry);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go('products.antispamsms.operations.simfarmcontrol.containerlist');
                }


            }, function (response) {
                $log.debug('Cannot update content counters entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function(){
            $state.go('products.antispamsms.operations.simfarmcontrol.containerlist');
        };
    });



    // Counters
    AntiSpamSMSOperationsSimFarmControlModule.controller('AntiSpamSMSOperationsSimFarmContentCountersCtrl', function ($scope, $stateParams, $uibModal, $log, $controller, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                       SMSAntiSpamConfigService, allContentCounters, allContentContainers) {
        $log.debug("AntiSpamSMSOperationsSimFarmContentCountersCtrl");

        $controller('AntiSpamSMSOperationsSimFarmCommonCtrl', {$scope: $scope, allContentCounters: allContentCounters, allContentContainers: allContentContainers});

        var counters = $scope.filterCounters(allContentCounters.counters, $stateParams.parentName);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'name',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.Name'
                },
                {
                    fieldName: 'parentName',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.ParentName'
                },
                {
                    fieldName: 'monitoringDuration',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.MonitoringDuration'
                },
                {
                    fieldName: 'blockingDuration',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.BlockingDuration'
                },
                {
                    fieldName: 'caseSensitivity',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.CaseSensitivity'
                },
                {
                    fieldName: 'state',
                    headerKey: 'CommonLabels.State'
                },
                {
                    fieldName: 'contentFilter',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.ContentFilter'
                },
                {
                    fieldName: 'contentFilterType',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.ContentFilterType'
                },
                {
                    fieldName: 'maxMessage',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.MaxMessages'
                },
                {
                    fieldName: 'rejectCode',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.RejectCode'
                },
                {
                    fieldName: 'rejectMethod',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.RejectMethod'
                },
                {
                    fieldName: 'rejectCode',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.RejectCode'
                },
                {
                    fieldName: 'similarityRatio',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.SimilarityRatio'
                },
                {
                    fieldName: 'msisdnRangePolicy',
                    headerKey: 'Products.AntiSpamSMS.Operations.Counters.ContentCounters.TableColumns.MsisdnRangePolicy'
                }
            ]
        };

        // Content Counters list
        $scope.contentCountersList = {
            list: counters, //allContentCounters.counters,
            tableParams: {}
        };

        $scope.contentCountersList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.contentCountersList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.contentCountersList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.contentCountersList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.contentCountersList.tableParams.settings().$scope.filterText = filterText;
            $scope.contentCountersList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.contentCountersList.tableParams.page(1);
            $scope.contentCountersList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing content counters list entry: ', entry);

                SMSAntiSpamConfigService.deleteContentCountersEntry(entry.parentName, entry.name).then(function (response) {
                    $log.debug('Tried to remove content counters list entry: ', entry, ', response: ', response);

                    if(response && (response.value == "GENERAL_ERROR" || response.value == "REFERENCE_FOUND")) {
                        $log.debug('Cannot remove content counters list entry: ', response.value);
                        notification({
                            type: 'danger',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.value,
                                errorText: response.message
                            })
                        });
                    } else {

                        var deletedListItem = _.findWhere($scope.contentCountersList.list, {name: entry.name});
                        $scope.contentCountersList.list = _.without($scope.contentCountersList.list, deletedListItem);

                        $scope.contentCountersList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot delete content counters list entry: ', entry, ', response: ', response);
                });
            });
        };
    });

    AntiSpamSMSOperationsSimFarmControlModule.controller('AntiSpamSMSOperationsSimFarmContentCountersNewCtrl', function ($scope, $stateParams, $log, $state, $controller, $translate, notification, SMSAntiSpamConfigService, allContentCounters, allContentContainers) {

        $log.debug("AntiSpamSMSOperationsSimFarmContentCountersNewCtrl");

        $scope.countersList = allContentCounters ? allContentCounters.counters : [];
        $controller('AntiSpamSMSOperationsSimFarmCommonCtrl', {$scope: $scope, allContentCounters: allContentCounters, allContentContainers: allContentContainers});

        $scope.newRecord = true;

        $scope.entry = {
            parentName: $stateParams.parentName ? $stateParams.parentName : null,
            name: '',
            contentFilter: '',
            contentFilterType: $scope.SMS_ANTISPAM_CONTENT_COUNTER_EVALUATION_TYPES[0].numericValue,
            rejectCode: 12,
            rejectMethod: $scope.SMS_ANTISPAM_REJECT_METHODS_3[2].value,
            state: $scope.STATES[0],
            msisdnRangePolicy: $scope.SMS_ANTISPAM_RANGE_POLICIES[0].numericValue,
            caseSensitivity: $scope.SMS_ANTISPAM_CASE_SENSITIVITY[1].numericValue,
            maxMessage: 0,
            blockingDuration: 0,
            maxMessages: 6,
            monitoringDuration: 500,
            tolerance: 1,
            similarityAlgorithm: $scope.SMS_ANTISPAM_CONTENT_COUNTER_SIMILARITY_ALGORITHMS[0].value,
            similarityRatio: 80
        };

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.createContentCountersEntry(entry.parentName, entryItem).then(function (response) {
                if (response && response.value === "GENERAL_ERROR") {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.value,
                            errorText: response.message
                        })
                    });
                } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('must be unique') > 1) {
                    $log.debug('Cannot add mo sms content filters entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryAlreadyDefinedError', {name: entryItem.name})
                    });
                } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('cannot use') > 1) {
                    $log.debug('Cannot add mo sms content filters entry so the name temporary reserved: ', entryItem, ', response: ', response);

                    notification({
                        type: 'warning',
                        text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryTemporaryReservedError', {name: entryItem.name})
                    });
                } else {
                    $log.debug('Added mo sms content filters entry: ', entryItem);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go('products.antispamsms.operations.simfarmcontrol.counterlist', { parentName:$stateParams.parentName });
                }
            }, function (response) {
                $log.debug('Cannot add mo sms content filters entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function(){
            $state.go('products.antispamsms.operations.simfarmcontrol.counterlist', {parentName: $stateParams.parentName});
        };
    });

    AntiSpamSMSOperationsSimFarmControlModule.controller('AntiSpamSMSOperationsSimFarmContentCountersUpdateCtrl', function ($scope, $log, $state, $stateParams, $controller, $translate, notification, STATES, SMS_ANTISPAM_CONTENT_COUNTER_EVALUATION_TYPES, SMS_ANTISPAM_RANGE_POLICIES, SMSAntiSpamConfigService, allContentCounters, allContentContainers, contentCountersEntry) {

        $log.debug("AntiSpamSMSOperationsSimFarmContentCountersUpdateCtrl");

        $scope.entry = contentCountersEntry;
        $scope.countersList = allContentCounters ? allContentCounters.counters : [];

        $controller('AntiSpamSMSOperationsSimFarmCommonCtrl', {$scope: $scope, allContentCounters: allContentCounters, allContentContainers: allContentContainers});

        $scope.newRecord = false;

        $scope.save = function (entry) {
            var entryItem = angular.copy(entry);

            SMSAntiSpamConfigService.updateContentCountersEntry(entry.parentName, entry).then(function (response) {
                $log.debug('Updated content counters entry: ', entryItem, ', response: ', response);

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go('products.antispamsms.operations.simfarmcontrol.counterlist', {parentName: $stateParams.parentName});
            }, function (response) {
                $log.debug('Cannot update content counters entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function(){
            $state.go('products.antispamsms.operations.simfarmcontrol.counterlist', {parentName: $stateParams.parentName});
        };
    });



})();
