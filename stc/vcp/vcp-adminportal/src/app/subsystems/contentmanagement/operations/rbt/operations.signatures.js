(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.signatures', []);

    var ContentManagementOperationsSignaturesRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.signatures');

    ContentManagementOperationsSignaturesRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.signatures', {
            abstract: true,
            url: "/signatures",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'SignaturesRBT',
                permissions: [
                    'RBT__OPERATIONS_SIGNATURE_READ'
                ]
            }
        }).state('subsystems.contentmanagement.operations.rbt.signatures.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.signatures.html",
            controller: 'ContentManagementOperationsSignaturesRBTCtrl',
            resolve: {
                signatures: function (RBTContentManagementService) {
                    return RBTContentManagementService.getPredefinedSignatures();
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.signatures.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.signatures.details.html",
            controller: 'ContentManagementOperationsSignaturesRBTNewCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.signatures.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.signatures.details.html",
            controller: 'ContentManagementOperationsSignaturesRBTUpdateCtrl',
            resolve: {
                signatureEn: function ($stateParams, RBTContentManagementService) {
                    return RBTContentManagementService.getPredefinedSignature($stateParams.id, 'EN');
                },
                signatureAr: function ($stateParams, RBTContentManagementService) {
                    return RBTContentManagementService.getPredefinedSignature($stateParams.id, 'AR');
                }
            }
        });

    });

    ContentManagementOperationsSignaturesRBTModule.controller('ContentManagementOperationsSignaturesRBTCommonCtrl', function ($scope, $log, $state, $uibModal, $controller, CMS_LANGUAGES, CMS_SIGNATURE_TYPES) {
        $log.debug('ContentManagementOperationsSignaturesRBTCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.CMS_LANGUAGES = CMS_LANGUAGES;
        $scope.CMS_SIGNATURE_TYPES = CMS_SIGNATURE_TYPES;

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.rbt.signatures.list');
        };


        $scope.editPrayerSignature = function () {
            $state.go('subsystems.contentmanagement.configuration.settings.prayertimessignatures');

        };
    });

    ContentManagementOperationsSignaturesRBTModule.controller('ContentManagementOperationsSignaturesRBTCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                        Restangular, RBTContentManagementService, DEFAULT_REST_QUERY_LIMIT, signatures) {
        $log.debug('ContentManagementOperationsSignaturesRBTCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.Signatures.Id'
                },
                {
                    fieldName: 'alias',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.Signatures.Alias'
                },
                {
                    fieldName: 'type',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.Signatures.Type'
                },
                {
                    fieldName: 'key',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.Signatures.Key'
                }
            ]
        };

        // Signature list
        $scope.signatureList = {
            list: signatures.predefinedSignatureDTOList ? signatures.predefinedSignatureDTOList : [],
            tableParams: {}
        };

        $scope.originalSignatureList = angular.copy($scope.signatureList.list);

        $scope.signatureList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.signatureList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.signatureList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.signatureList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Signature list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.signatureList.tableParams.settings().$scope.filterText = filterText;
            $scope.signatureList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.signatureList.tableParams.page(1);
            $scope.signatureList.tableParams.reload();
        }, 750);


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

        $scope.stateFilter = 'ALL';
        $scope.stateFilterChange = function (type) {
            if(type !== 'ALL') {
                $scope.signatureList.list = _.where($scope.originalSignatureList, {type: type});
            }
            else {
                $scope.signatureList.list = angular.copy($scope.originalSignatureList);

            }
            $scope.signatureList.tableParams.page(1);
            $scope.reloadTable($scope.signatureList.tableParams);
        };

        $scope.remove = function (signature) {
            signature.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                signature.rowSelected = false;

                $log.debug('Removing signature: ', signature);

                RBTContentManagementService.deletePredefinedSignature(signature).then(function (response) {
                    $log.debug('Removed signature: ', signature, ', response: ', response);

                    if (response && response.errorCode) {
                        RBTContentManagementService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.signatureList.list, {id: signature.id});
                        $scope.signatureList.list = _.without($scope.signatureList.list, deletedListItem);

                        $scope.signatureList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove signature: ', signature, ', response: ', response);

                    RBTContentManagementService.showApiError(response);
                });
            }, function () {
                signature.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsSignaturesRBTModule.controller('ContentManagementOperationsSignaturesRBTNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, UtilService,
                                                                                                                           RBTContentManagementService) {
        $log.debug('ContentManagementOperationsSignaturesRBTNewCtrl');

        $controller('ContentManagementOperationsSignaturesRBTCommonCtrl', {
            $scope: $scope
        });

        $scope.CMS_SIGNATURE_TYPES = $scope.CMS_SIGNATURE_TYPES.filter(function(item) {
            return item.key !== 'prayer';
        });

        $scope.signature = {
            alias: '',
            language: '',
            key: '',
            description: '',
            descriptionDTOList: []
        };

        $scope.save = function (signature) {
            var signatureItem = {
                "alias": signature.alias,
                "type": signature.type,
                "key": signature.key,
                "descriptions": [
                    {
                        "description": signature.descriptionEn,
                        "lang": "EN"
                    },
                    {
                        "description": signature.descriptionAr,
                        "lang": "AR"
                    }
                ]
            };

            $log.debug('Creating signature: ', signatureItem);

            RBTContentManagementService.createPredefinedSignature(signatureItem).then(function (response) {
                $log.debug('Created signature: ', signatureItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot create signature: ', signatureItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };
    });

    ContentManagementOperationsSignaturesRBTModule.controller('ContentManagementOperationsSignaturesRBTUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, Restangular, UtilService,
                                                                                                                              RBTContentManagementService, signatureEn, signatureAr) {
        $log.debug('ContentManagementOperationsSignaturesRBTUpdateCtrl');

        $controller('ContentManagementOperationsSignaturesRBTCommonCtrl', {
            $scope: $scope
        });

        $scope.signature = {
            id: signatureEn.predefinedSignatureDTO.id,
            alias: signatureEn.predefinedSignatureDTO.alias,
            type: signatureEn.predefinedSignatureDTO.type,
            key: signatureEn.predefinedSignatureDTO.key,
            descriptionEn: signatureEn.predefinedSignatureDTO.description,
            descriptionAr: signatureAr.predefinedSignatureDTO.description
        }


        if($scope.signature.type !== 'prayer') {
            $scope.CMS_SIGNATURE_TYPES = $scope.CMS_SIGNATURE_TYPES.filter(function (item) {
                return item.key !== 'prayer';
            });
        }

        $scope.originalSignature = angular.copy($scope.signature);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSignature, $scope.signature);
        };

        $scope.save = function (signature) {
            var signatureItem = {
                "id": $scope.originalSignature.id,
                // Changed values
                "alias": signature.alias,
                "type": signature.type,
                "key": signature.key,
                "descriptions": [
                    {
                        "description": signature.descriptionEn,
                        "lang": "EN"
                    },
                    {
                        "description": signature.descriptionAr,
                        "lang": "AR"
                    }
                ]
            };

            $log.debug('Updating signature: ', signatureItem);

            RBTContentManagementService.updatePredefinedSignature(signatureItem).then(function (response) {
                $log.debug('Updated signature: ', signatureItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot update signature: ', signatureItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };
    });

})();
