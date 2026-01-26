(function () {

    'use strict';

    angular.module('adminportal.products.antispamsms.operations.smsbodymodification', []);

    var AntispamSMSOperationsBodyModificationModule = angular.module('adminportal.products.antispamsms.operations.smsbodymodification');

    AntispamSMSOperationsBodyModificationModule.config(function ($stateProvider) {

        $stateProvider.state('products.antispamsms.operations.smsbodymodification', {
            url: "/smsbodymodification",
            template: '<div ui-view></div>',
            resolve: {
                smfields: function (SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSMFieldList();
                }
            }
        }).state('products.antispamsms.operations.smsbodymodification.list', {
            url: "/list",
            templateUrl: "products/antispamsms/operations/smsbodymodification/operations.smfields.html",
            controller: 'AntispamSMSOperationsBodyModificationCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_SMSMODIFICATION_OPERATIONS'
                ]
            }
        }).state('products.antispamsms.operations.smsbodymodification.new', {
            url: "/new",
            templateUrl: "products/antispamsms/operations/smsbodymodification/operations.smfields.detail.html",
            controller: 'AntispamSMSOperationsBodyModificationNewCtrl',
            data: {
                permissions: [
                    'CREATE_ANTISPAM_SMSMODIFICATION_OPERATIONS'
                ]
            }
        }).state('products.antispamsms.operations.smsbodymodification.update', {
            url: "/update/:parentName/:smField/:updateFn",
            templateUrl: "products/antispamsms/operations/smsbodymodification/operations.smfields.detail.html",
            controller: 'AntispamSMSOperationsBodyModificationUpdateCtrl',
            data: {
                permissions: [
                    'READ_ANTISPAM_SMSMODIFICATION_OPERATIONS'
                ]
            },
            resolve: {
                parentName: function($stateParams){
                    return $stateParams.parentName;
                },
                smField: function($stateParams){
                    return $stateParams.smField;
                },
                updateFn: function($stateParams){
                    return $stateParams.updateFn;
                },
                smFieldContainer: function ($stateParams, SMSAntiSpamConfigService) {
                    return SMSAntiSpamConfigService.getSMFieldEntry($stateParams.parentName);
                }
            }
        });

    });

    AntispamSMSOperationsBodyModificationModule.controller('AntispamSMSOperationsBodyModificationCommonCtrl', function ($scope, $log, $state, $controller, $translate, $uibModal, notification, STATES, SMS_ANTISPAM_SMFIELD_NAMES,
                                                                                                                        SMS_ANTISPAM_SMFIELD_STATUS) {
        $scope.SMS_ANTISPAM_SMFIELD_NAMES = SMS_ANTISPAM_SMFIELD_NAMES;
        $scope.SMS_ANTISPAM_SMFIELD_STATUS = SMS_ANTISPAM_SMFIELD_STATUS;
        $scope.userInput = '';
        $scope.inputChanged = function() {
            // Update the model manually
            $scope.entry.parentName = $scope.userInput;
        };

        // TODO: Containers with an empty 'updateSmFieldList' hidden from user's view for the time being.
        //$scope.parentNames =  _.uniq(_.map($scope.updateSMBeanList ? $scope.updateSMBeanList : [], _.iteratee('name')));
        $scope.parentNames = [];
        _.forEach($scope.updateSMBeanList, function (item) {
            if(item.updateSmFieldList.length > 0){
                $scope.parentNames.push(item.name)
            }
        });

        $scope.updateFunctionTypes = ['MASK-URL', 'MASK-NUMBER'];

        $scope.cancel = function () {
            $state.go('products.antispamsms.operations.smsbodymodification.list');
        }

        $scope.mapSMData = function(smFieldsList){
            var flattenedList = [];
            _.forEach(smFieldsList.updateSMBeanList, function (item) {
                _.forEach(item.updateSmFieldList, function (updateItem) {
                    flattenedList.push({
                        parentName: item.name,
                        smField: updateItem.smField,
                        status: updateItem.status,
                        updateFunction: updateItem.updateFunction
                    });
                });
            });
            return flattenedList;
        }

        // The watchers to check updateFunction .
        $scope.$watch('entry.updateFunction', function (newVal) {
            var keyword = SMS_ANTISPAM_SMFIELD_NAMES[1]
            $log.debug("entry.updateFunction - $scope.entry", $scope.entry);
            if (!_.isUndefined(newVal) && $scope.entry && $scope.entry.smField == keyword) {
                var updateFnValue = $scope.entry.updateFunction;
                var isAllowed = updateFnValue.includes(keyword);
                $scope.form.updateFunction.$setValidity('valueNotAllowed', isAllowed);
                if (isAllowed)
                    $scope.form.updateFunction.$setValidity('valueNotAllowed', isAllowed);
            }
        });
    });


    AntispamSMSOperationsBodyModificationModule.controller('AntispamSMSOperationsBodyModificationCtrl', function ($scope, $uibModal, $log, $controller, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                  SMSAntiSpamConfigService, smfields) {
        $log.debug("AntispamSMSOperationsBodyModificationCtrl");

        $controller('AntispamSMSOperationsBodyModificationCommonCtrl', {$scope: $scope});

        $scope.smFieldsList = $scope.mapSMData(smfields);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'smField',
                    headerKey: 'Products.AntiSpamSMS.Operations.SMSBodyModification.TableColumns.Name'
                },
                {
                    fieldName: 'parentName',
                    headerKey: 'Products.AntiSpamSMS.Operations.SMSBodyModification.TableColumns.ParentName'
                },
                {
                    fieldName: 'status',
                    headerKey: 'Products.AntiSpamSMS.Operations.SMSBodyModification.TableColumns.Status',
                    filter: {name: 'AntiSpamSMSStatusFilter'}
                },
                {
                    fieldName: 'updateFunction',
                    headerKey: 'Products.AntiSpamSMS.Operations.SMSBodyModification.TableColumns.UpdateFunction'
                }
            ]
        };

        // SMS Fields list
        $scope.smsBodyFieldsList = {
            list: $scope.smFieldsList,
            tableParams: {}
        };

        $scope.smsBodyFieldsList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.smsBodyFieldsList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.smsBodyFieldsList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.smsBodyFieldsList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.smsBodyFieldsList.tableParams.settings().$scope.filterText = filterText;
            $scope.smsBodyFieldsList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.smsBodyFieldsList.tableParams.page(1);
            $scope.smsBodyFieldsList.tableParams.reload();
        }, 750);

        $scope.remove = function (entry) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing sm fields list entry: ', entry);

                SMSAntiSpamConfigService.deleteSMFieldEntry(entry.parentName, entry.smField, entry.updateFunction).then(function (response) {
                    $log.debug('Removed smfield list entry: ', entry, ', response: ', response);

                    var deletedListItem = _.findWhere($scope.smsBodyFieldsList.list, {smField: entry.smField, parentName: entry.parentName, updateFunction: entry.updateFunction});
                    $scope.smsBodyFieldsList.list = _.without($scope.smsBodyFieldsList.list, deletedListItem);

                    $scope.smsBodyFieldsList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete smfield list entry: ', entry, ', response: ', response);
                });
            });
        };
    });

    AntispamSMSOperationsBodyModificationModule.controller('AntispamSMSOperationsBodyModificationNewCtrl', function ($scope, $log, $state, $controller, $translate, notification, SMSAntiSpamConfigService, smfields) {

        $log.debug("AntispamSMSOperationsBodyModificationNewCtrl");

        $scope.updateSMBeanList = smfields ? smfields.updateSMBeanList : [];
        $controller('AntispamSMSOperationsBodyModificationCommonCtrl', {$scope: $scope});

        $scope.newRecord = true;

        $scope.entry = {
            smField: 'BODY'
        };

        $scope.save = function (entry) {
            var entryItem =  {
                smField: entry.smField,
                status: entry.status,
                updateFunction: entry.updateFunction
            };

            if($scope.parentNames.includes(entry.parentName)){
                SMSAntiSpamConfigService.createSMFieldEntry(entry.parentName, entryItem).then(function (response) {
                    if (response && response.value === "GENERAL_ERROR") {
                        notification({
                            type: 'danger',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.value,
                                errorText: response.message
                            })
                        });
                    } else if (response && response.value === "ALREADY_SUBSCRIBED") {
                        $log.debug('Cannot add entry: ', entryItem, ', response: ', response);

                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryAlreadyDefinedError', {name: entryItem.smField})
                        });
                    } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('must be unique') > 1) {
                        $log.debug('Cannot add mo sms content filters entry: ', entryItem, ', response: ', response);

                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryAlreadyDefinedError', {name: entryItem.smField})
                        });
                    } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('cannot use') > 1) {
                        $log.debug('Cannot add mo sms content filters entry so the name temporary reserved: ', entryItem, ', response: ', response);

                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryTemporaryReservedError', {name: entryItem.smField})
                        });
                    } else {
                        $log.debug('Added mo sms content filters entry: ', entryItem);

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $state.go('products.antispamsms.operations.smsbodymodification.list');
                    }
                }, function (response) {
                    $log.debug('Cannot add mo sms content filters entry: ', entryItem, ', response: ', response);
                });

            } else {
                SMSAntiSpamConfigService.createSMFieldEntryWithContainer(entry.parentName, entryItem).then(function (response) {
                    if (response && response.value === "GENERAL_ERROR") {
                        notification({
                            type: 'danger',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: response.value,
                                errorText: response.message
                            })
                        });
                    } else if (response && response.value === "ALREADY_SUBSCRIBED") {
                        $log.debug('Cannot add entry: ', entryItem, ', response: ', response);

                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryAlreadyDefinedError', {name: entryItem.smField})
                        });
                    } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('must be unique') > 1) {
                        $log.debug('Cannot add mo sms content filters entry: ', entryItem, ', response: ', response);

                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryAlreadyDefinedError', {name: entryItem.smField})
                        });
                    } else if (response && response.value === "TEMPORARY_RESERVED_KEYWORD" && response.message.indexOf('cannot use') > 1) {
                        $log.debug('Cannot add mo sms content filters entry so the name temporary reserved: ', entryItem, ', response: ', response);

                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.AntiSpamSMS.Operations.ContentFilters.Messages.EntryTemporaryReservedError', {name: entryItem.smField})
                        });
                    } else {
                        $log.debug('Added mo sms content filters entry: ', entryItem);

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $state.go('products.antispamsms.operations.smsbodymodification.list');
                    }
                }, function (response) {
                    $log.debug('Cannot add mo sms content filters entry: ', entryItem, ', response: ', response);
                });
            }
        };
    });

    AntispamSMSOperationsBodyModificationModule.controller('AntispamSMSOperationsBodyModificationUpdateCtrl', function ($scope, $log, $state, $controller, $translate, notification, STATES,
                                                                                                                        SMSAntiSpamConfigService, smfields, smFieldContainer, parentName, smField, updateFn) {

        $log.debug("AntispamSMSOperationsBodyModificationUpdateCtrl");
        $scope.updateSMBeanList = smfields ? smfields.updateSMBeanList : [];


        $controller('AntispamSMSOperationsBodyModificationCommonCtrl', {$scope: $scope});
        $scope.smFieldsList = $scope.mapSMData(smfields);

        $scope.entry = _.findWhere($scope.smFieldsList, {smField: smField, parentName: parentName, updateFunction: updateFn});

        $scope.newRecord = false;

        $scope.save = function (entry) {
            var entryItem = {
                smField: entry.smField,
                status: entry.status,
                updateFunction: entry.updateFunction
            };

            SMSAntiSpamConfigService.updateSMFieldEntry(entry.parentName, smField, updateFn, entry).then(function (response) {
                if (response && response.value === "GENERAL_ERROR") {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.value,
                            errorText: response.message
                        })
                    });
                } else {
                    $log.debug('Updated smfield entry: ', entryItem, ', response: ', response);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go('products.antispamsms.operations.smsbodymodification.list');
                }
            }, function (response) {
                $log.debug('Cannot update smfield entry: ', entryItem, ', response: ', response);
            });

        };
    });

})();
