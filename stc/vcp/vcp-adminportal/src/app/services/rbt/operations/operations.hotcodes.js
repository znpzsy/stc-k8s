(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations.hotcodes', []);

    var RBTOperationsHotCodesModule = angular.module('adminportal.services.rbt.operations.hotcodes');

    RBTOperationsHotCodesModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations.hotcodes', {
            // abstract: true,
            url: "/hotcodes",
            template: "<div ui-view></div>"
        }).state('services.rbt.operations.hotcodes.list', {
            url: "/list",
            templateUrl: "services/rbt/operations/operations.hotcodes.html",
            controller: 'RBTOperationsHotCodesCtrl',
            resolve: {
                hotCodes: function (RBTHotCodeService) {
                    return RBTHotCodeService.getHotCodes();
                }
            }
        }).state('services.rbt.operations.hotcodes.new', {
            url: "/new",
            templateUrl: "services/rbt/operations/operations.hotcodes.detail.html",
            controller: 'RBTOperationsHotCodeNewCtrl'

        }).state('services.rbt.operations.hotcodes.update', {
            url: "/update/:hotCodeId",
            templateUrl: "services/rbt/operations/operations.hotcodes.detail.html",
            controller: 'RBTOperationsHotCodeUpdateCtrl',
            resolve: {
                hotCode: function ($stateParams, RBTHotCodeService) {
                    var hotCodeId = $stateParams.hotCodeId;

                    return RBTHotCodeService.getHotCode(hotCodeId);
                }
            }
        });

    });

    RBTOperationsHotCodesModule.controller('RBTOperationsHotCodesCommonCtrl', function ($scope, $log,$filter, $controller,$uibModal, UtilService) {
        $log.debug('RBTOperationsHotCodesCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.listState = "services.rbt.operations.hotcodes.list";
        $scope.newState = "services.rbt.operations.hotcodes.new";
        $scope.updateState = "services.rbt.operations.hotcodes.update";

        $scope.startDateOptions = _.clone($scope.dateOptions);
        $scope.startDateOptions.minDate = new Date();
        $scope.startDateOptions.maxDate = null;

        $scope.endDateOptions = _.clone($scope.dateOptions);
        $scope.endDateOptions.minDate = new Date();
        $scope.endDateOptions.maxDate = null;

        $scope.$watch('dateHolder.startDate', function (newValue, oldValue) {
            if (newValue && (newValue !== oldValue)) {
                UtilService.setError($scope.form, 'startDate', 'maxDateExceeded', true);
                UtilService.setError($scope.form, 'startDate', 'minDateExceeded', true);

                if(newValue < UtilService.getTodayBegin()){
                    UtilService.setError($scope.form, 'startDate', 'minDateExceeded', false);
                }else{
                    $scope.endDateOptions.minDate = newValue;
                }
            }
        });

        $scope.$watch('dateHolder.endDate', function (newValue, oldValue) {

            if (newValue && (newValue !== oldValue)) {
                UtilService.setError($scope.form, 'endDate', 'minDateExceeded', true);
                $scope.startDateOptions.maxDate = newValue;
            }
        });

        $scope.showContents = function (entity) {
            entity.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'services/rbt/operations/operations.modal.contents.html',
                controller: 'RBTOperationsHotCodesContentsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    modalTitleKey: function () {
                        return 'Services.RBT.Operations.HotCodes.ToneModalTitle';
                    },
                    entityParameter: function () {
                        return entity.subscriptionCode?entity.subscriptionCode:$scope.selectedContent.subscriptionCode;
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selectedContent = selectedItem;
            }, function () {
            });

        };

        $scope.isUpdateDate = function(currDate){

            if(!currDate){
                return true;
            }

            currDate = new Date($filter('date')(currDate, 'yyyy-MM-dd') );
            var today = new Date($filter('date')(new Date(), 'yyyy-MM-dd') );
            return  currDate > today;
        };

    });

    RBTOperationsHotCodesModule.controller('RBTOperationsHotCodesContentsModalInstanceCtrl', function ($scope, $uibModalInstance, $translate, $log, $timeout, $filter, NgTableParams, NgTableService, Restangular,
                                                                             CMPFService, ContentManagementService, modalTitleKey, entityParameter) {
        $log.debug('RBTOperationsHotCodesContentsModalInstanceCtrl');

        $scope.modalTitleKey = modalTitleKey;

        $scope.selectedContent = {
                subscriptionCode: entityParameter
        }

        $scope.contentFilter = 'TONE';
        $scope.contentChange = function (contentType) {
            $scope.selectedContent = {}
            $scope.contentFilter = contentType;
            $scope.tableParams.page(1);
            $scope.reloadTable($scope.tableParams);
            $scope.modalTitleKey = $translate.instant(  angular.equals(contentType, "TONE") ? 'Services.RBT.Operations.HotCodes.ToneModalTitle':'Services.RBT.Operations.HotCodes.PlaylistModalTitle');
        };

        $scope.reloadTable = function (tableParams, _pageNumber) {
            var pageNumber = _pageNumber ? _pageNumber : 1;
            if (tableParams.page() === pageNumber) {
                tableParams.reload();
            } else {
                $timeout(function () {
                    tableParams.page(pageNumber);
                }, 0);
            }
        };

        $scope.prepareFilter = function (tableParams) {
            var result = {};

            result.filter = {};

            if (tableParams) {
                result.filter.sortFieldName = s.words(tableParams.orderBy()[0], /\-|\+/)[0];
                result.filter.sortOrder = s.include(tableParams.orderBy()[0], '+') ? 'ASC' : 'DESC';
                result.filter.limit = tableParams.count();
                result.filter.page = tableParams.page() - 1;

                result.filter.filterTextName = tableParams.settings().$scope.filterTextName;
                result.filter.filterTextAlias = tableParams.settings().$scope.filterTextAlias;

                if(_.contains(tableParams.settings().$scope.filterColumns,"alias") ){
                    result.filter.filterText = (result.filter.filterTextAlias && result.filter.filterTextAlias.length>0 ? "&alias=" + result.filter.filterTextAlias:'');
                    tableParams.settings().$scope.filterTextName="";
                }else{
                    result.filter.filterText = result.filter.filterTextName;
                    tableParams.settings().$scope.filterTextAlias ="";
                }

               if(result.filter.filterText){
                    result.filter.filterText += "&subscriptionEnabled=true";
                }else{
                    result.filter.filterText = "&subscriptionEnabled=true";
                }

                result.filter.filterColumns = tableParams.settings().$scope.filterColumns;
                $log.debug("result.filter.filterColumns:" , result.filter.filterColumns);

            }

            return result;
        };

        $scope.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            $scope: $scope,
            total: 0,
            getData: function ($defer, params) {
                var preparedFilter = $scope.prepareFilter(params);
                var filter = preparedFilter.filter;

                if($scope.contentFilter === "TONE"){
                    ContentManagementService.getTones(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, "ACTIVE", filter.filterText).then(function (response) {
                        $log.debug("Tone Found records: ", response);

                        $scope.contentList = (response ? response.items : []);

                        params.total(response ? response.totalCount : 0);
                        $defer.resolve($scope.contentList);
                    }, function (error) {
                        $log.debug('Error: ', error);
                        params.total(0);
                        $defer.resolve([]);
                    });

                }else{
                    ContentManagementService.getPlaylists(filter.page, filter.limit, filter.sortFieldName, filter.sortOrder, "ACTIVE", filter.filterText).then(function (response) {
                        $log.debug("Playlist Found records: ", response);

                        $scope.contentList = (response ? response.items : []);

                        params.total(response ? response.totalCount : 0);
                        $defer.resolve($scope.contentList);
                    }, function (error) {
                        $log.debug('Error: ', error);
                        params.total(0);
                        $defer.resolve([]);
                    });
                }
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.tableParams.settings().$scope.filterText = filterText;
            $scope.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.tableParams.page(1);
            $scope.tableParams.reload();
        }, 500);


        $scope.setSelection = function (content) {
            $scope.selectedContent.alias=content.alias;
            $scope.selectedContent.subscriptionCode = content.offers[0].subscriptionCode;
        };

        $scope.removeSelection = function () {
            $scope.selectedContent = {};
        };

        $scope.ok = function () {
            $uibModalInstance.close($scope.selectedContent);
            //$scope.selectedContent=$scope.selectedContent
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };


    });

    RBTOperationsHotCodesModule.controller('RBTOperationsHotCodesCtrl', function ($scope, $log, $controller, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService, DateTimeConstants, ContentManagementService, RBTHotCodeService,
                                                                                   hotCodes) {
        $log.debug('RBTOperationsHotCodesCtrl');

        $controller('RBTOperationsHotCodesCommonCtrl', {$scope: $scope});

        $scope.hotCodeList = {
            list: [],
            tableParams: {}
        };


         _.each(hotCodes, function (code) {

             var hotCodeItem = {
                 hotCode: code.hotCode,
                 contentAlias : (code.reserved?'N/A': (code.contentAlias<=0?'N/A':code.contentAlias)),
                 subscriptionCode : (code.reserved?'N/A':(code.subscriptionCode<=0?'N/A':code.subscriptionCode)),
                 status: (code.reserved?'N/A':code.status),
                 reserved: code.reserved,
                 usageStartDateTime: (code.reserved?'N/A': (code.usageStartDateTime ? $filter('date')(code.usageStartDateTime, 'yyyy-MM-dd'):"N/A")),
                 usageEndDateTime: (code.reserved?'N/A':(code.usageEndDateTime ?  $filter('date')(code.usageEndDateTime, 'yyyy-MM-dd'):'NEVER')),
                 content : {
                 }
             };

             if(!code.reserved && code.subscriptionCode>0){
                 ContentManagementService.getContentOffersBySubscriptionCode(code.subscriptionCode).then(function (response) {

                     if(response && response.items){
                         hotCodeItem.content =  angular.copy(response.items[0].content);
                     }
                 });
            }
             $scope.hotCodeList.list.push(hotCodeItem);
         });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'hotCode',
                    headerKey: 'Services.RBT.Operations.HotCodes.TableColumns.HotCode'
                },
                {
                    fieldName: 'contentAlias',
                    headerKey: 'Services.RBT.Operations.HotCodes.TableColumns.ContentAlias'
                },
                {
                    fieldName: 'content.name',
                    headerKey: 'Services.RBT.Operations.HotCodes.TableColumns.ContentName'
                },
                {
                    fieldName: 'usageStartDateTime',
                    headerKey: 'GenericFormFields.StartDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'usageEndDateTime',
                    headerKey: 'GenericFormFields.EndDate.Label',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'status',
                    headerKey: 'Services.RBT.Operations.HotCodes.TableColumns.Status'
                },
                {
                    fieldName: 'reserved',
                    headerKey: 'Services.RBT.Operations.HotCodes.TableColumns.Reserved',
                    filter: {name: 'YesNoFilter'}
                }
            ]
        };

        $scope.hotCodeList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "reserved": 'asc',
                "hotCode": 'asc'
            }
        }, {
            total: $scope.hotCodeList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.hotCodeList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.hotCodeList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.hotCodeList.tableParams.settings().$scope.filterText = filterText;
            $scope.hotCodeList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.hotCodeList.tableParams.page(1);
            $scope.hotCodeList.tableParams.reload();
         }, 500);

        // Content Details modal window.
        $scope.showContentDetails = function (entry) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'services/rbt/operations/operations.modal.content.details.html',
                controller: function ($scope, $uibModalInstance, $sce, entry) {
                    $scope.contentDetails = entry.content;
                    $scope.contentDetails.subscriptionCode = entry.subscriptionCode;
                    $scope.close = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {
                    entry: function () {
                        return entry;
                    }
                }
            });
        };

        $scope.remove = function (hotCode) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                RBTHotCodeService.deleteHotCode(hotCode).then(function (response) {
                    $log.debug('Removed. Response: ', response);

                    if (response && response.errorCode) {
                        CMPFService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.hotCodeList.list, {hotCode: hotCode});
                        $scope.hotCodeList.list = _.without($scope.hotCodeList.list, deletedListItem);

                        $scope.hotCodeList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove hotcode list. Error: ', response);

                    if (response.data && response.data.errorDescription) {
                        var message = response.data.errorDescription;

                        notification({
                            type: 'warning',
                            text: message
                        });
                    } else {
                        CMPFService.showApiError(response);
                    }
                });
            });
        };

    });

    RBTOperationsHotCodesModule.controller('RBTOperationsHotCodeNewCtrl', function ($scope, $log, $state, $stateParams,$filter,  $controller, $translate, notification, DateTimeConstants, SessionService, UtilService, RBTHotCodeService,STATUS_TYPES) {

        $log.debug('RBTOperationsHotCodeNewCtrl');

        $controller('RBTOperationsHotCodesCommonCtrl', {$scope: $scope});
        $scope.STATUS_TYPES=STATUS_TYPES;

        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;
        $scope.dateHolder.minDate= UtilService.getTodayBegin();

        $scope.selectedContent ={};

        $scope.entry = {
            "hotCode": "",
            "reserved": false,
            "status": "ACTIVE",
            "contentAlias": $scope.selectedContent.alias,
            "subscriptionCode": $scope.selectedContent.subscriptionCode
        };

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);

        $scope.save = function (entry) {
            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var entryItem = {
                "hotCode": entry.hotCode,
                "reserved": entry.reserved,
                "status":entry.status,
                "subscriptionCode": $scope.selectedContent.subscriptionCode,
                "contentAlias": $scope.selectedContent.alias,
                "lastUpdatedUser": SessionService.getUsername(),
                "lastUpdatedTime":  currentTimestamp,
                "usageStartDateTime": entry.reserved?'':($scope.dateHolder.startDate? $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00': currentTimestamp),
                "usageEndDateTime":($scope.dateHolder.endDate? $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00':''),
            }

            RBTHotCodeService.createHotCode(entryItem).then(function (response) {
                if(response && response.errorCode){

                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode,
                            errorText: response.errorMsg
                        })
                    });
                }else{
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.go($scope.listState);
                }

            }, function (response) {
                $log.debug('Cannot create HotCode entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    });

    RBTOperationsHotCodesModule.controller('RBTOperationsHotCodeUpdateCtrl', function ($scope, $log, $state, $filter, $stateParams, $controller, $translate, notification, DateTimeConstants, SessionService, UtilService, RBTHotCodeService,STATUS_TYPES, hotCode) {
        $log.debug('RBTOperationsHotCodeUpdateCtrl');

        $controller('RBTOperationsHotCodesCommonCtrl', {$scope: $scope});
        $scope.STATUS_TYPES=STATUS_TYPES;

        var hotCodeId = $stateParams.hotCodeId;
        $scope.dateHolder.startDate = null;
        $scope.dateHolder.endDate = null;
        $scope.dateHolder.minDate= UtilService.getTodayBegin(),

         $scope.selectedContent = {
             subscriptionCode: hotCode.subscriptionCode,
             alias:hotCode.contentAlias
         }

        $scope.entry = {
            "id": hotCode.hotCode,
            "hotCode": hotCode.hotCode,
            "contentAlias": hotCode.contentAlias,
            "reserved": hotCode.reserved,
            "status": hotCode.status,
            "subscriptionCode": hotCode.subscriptionCode,
            "lastUpdatedUser": hotCode.lastUpdatedUser,
            "lastUpdatedTime": hotCode.lastUpdatedTime
        };

        if (hotCode.usageStartDateTime) {
            $scope.dateHolder.startDate = new Date($filter('date')(hotCode.usageStartDateTime, 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON));
        }
        if (hotCode.usageEndDateTime) {
            $scope.dateHolder.endDate= new Date($filter('date')(hotCode.usageEndDateTime , 'yyyy-MM-dd\'T\'HH:mm:ss' + DateTimeConstants.OFFSET_WITH_COLON));
        }

        $scope.originalEntry = angular.copy($scope.entry);
        $scope.dateHolderOriginal = angular.copy($scope.dateHolder);

        $scope.isNotChanged = function () {
              return angular.equals($scope.dateHolder, $scope.dateHolderOriginal) && angular.equals($scope.originalEntry, $scope.entry);
        };



        $scope.save = function (entry) {
            var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var entryItem = {

                "hotCode": entry.hotCode,
                "reserved": entry.reserved,
                "status": entry.status,
                "subscriptionCode": $scope.selectedContent.subscriptionCode,
                "contentAlias": $scope.selectedContent.alias,
                "lastUpdatedUser": SessionService.getUsername(),
                "lastUpdatedTime":  currentTimestamp
            }

            // Start/End Dates
            if ($scope.dateHolder.startDate) {
                entryItem.usageStartDateTime = $filter('date')($scope.dateHolder.startDate, 'yyyy-MM-dd') + 'T00:00:00';
            } else {
                entryItem.usageStartDateTime = '';
            }
            if ($scope.dateHolder.endDate) {
                entryItem.usageEndDateTime = $filter('date')($scope.dateHolder.endDate, 'yyyy-MM-dd') + 'T00:00:00';
            } else {
                entryItem.usageEndDateTime = '';
            }

            RBTHotCodeService.updateHotCode(hotCodeId, entryItem).then(function (response) {

                notification({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                 $state.go($scope.listState);
            }, function (response) {
                $log.debug('Cannot update HotCode entry: ', entryItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($scope.listState);
        };
    })


})();
