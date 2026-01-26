(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.signatureboxes', []);

    var ContentManagementOperationsSignatureBoxesRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.signatureboxes');

    ContentManagementOperationsSignatureBoxesRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.signatureboxes', {
            abstract: true,
            url: "/signature-boxes",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'SignatureBoxesRBT',
                permissions: [
                    'RBT__OPERATIONS_SIGNATURE_BOX_READ'
                ]
            },
            resolve: {
                signatures: function (RBTContentManagementService) {
                    return RBTContentManagementService.getPredefinedSignatures();
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.signatureboxes.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.signatureboxes.html",
            controller: 'ContentManagementOperationsSignatureBoxesRBTCtrl',
            resolve: {
                signatureboxes: function (RBTContentManagementService) {
                    return RBTContentManagementService.getPredefinedSignatureBoxes();
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.signatureboxes.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.signatureboxes.details.html",
            controller: 'ContentManagementOperationsSignatureBoxesRBTNewCtrl'
        }).state('subsystems.contentmanagement.operations.rbt.signatureboxes.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.signatureboxes.details.html",
            controller: 'ContentManagementOperationsSignatureBoxesRBTUpdateCtrl',
            resolve: {
                signaturebox: function ($stateParams, RBTContentManagementService) {
                    return RBTContentManagementService.getPredefinedSignatureBox($stateParams.id);
                }
            }
        });

    });

    ContentManagementOperationsSignatureBoxesRBTModule.controller('ContentManagementOperationsSignatureBoxesRBTCommonCtrl', function ($scope, $log, $state, $uibModal, $controller, signatures) {
        $log.debug('ContentManagementOperationsSignatureBoxesRBTCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.signatureList = signatures ? signatures : [];

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.rbt.signatureboxes.list');
        };
    });

    ContentManagementOperationsSignatureBoxesRBTModule.controller('ContentManagementOperationsSignatureBoxesRBTCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                Restangular, RBTContentManagementService, DEFAULT_REST_QUERY_LIMIT, signatureboxes) {
        $log.debug('ContentManagementOperationsSignatureBoxesRBTCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.SignatureBoxes.Id'
                },
                {
                    fieldName: 'alias',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.SignatureBoxes.Alias'
                },
                {
                    fieldName: 'signatureNames',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.SignatureBoxes.Signatures'
                }
            ]
        };

        // Signature Box list
        $scope.signatureBoxList = {
            list: signatureboxes ? signatureboxes : [],
            tableParams: {}
        };

        _.each($scope.signatureBoxList.list, function (signatureBox) {
            signatureBox.signatureNames = _.map(signatureBox.signatureList, _.iteratee('alias')).join(', ');
        });

        $scope.signatureBoxList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.signatureBoxList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.signatureBoxList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.signatureBoxList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Signature Box list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.signatureBoxList.tableParams.settings().$scope.filterText = filterText;
            $scope.signatureBoxList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.signatureBoxList.tableParams.page(1);
            $scope.signatureBoxList.tableParams.reload();
        }, 750);

        $scope.remove = function (signaturebox) {
            signaturebox.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                signaturebox.rowSelected = false;

                $log.debug('Removing signature box: ', signaturebox);

                RBTContentManagementService.deletePredefinedSignatureBox(signaturebox).then(function (response) {
                    $log.debug('Removed signature box: ', signaturebox, ', response: ', response);

                    if (response && response.errorCode) {
                        RBTContentManagementService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.signatureBoxList.list, {id: signaturebox.id});
                        $scope.signatureBoxList.list = _.without($scope.signatureBoxList.list, deletedListItem);

                        $scope.signatureBoxList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove signature box: ', signaturebox, ', response: ', response);

                    RBTContentManagementService.showApiError(response);
                });
            }, function () {
                signaturebox.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsSignatureBoxesRBTModule.controller('ContentManagementOperationsSignatureBoxesRBTNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, UtilService,
                                                                                                                                   RBTContentManagementService, signatures) {
        $log.debug('ContentManagementOperationsSignatureBoxesRBTNewCtrl');

        $controller('ContentManagementOperationsSignatureBoxesRBTCommonCtrl', {
            $scope: $scope,
            signatures: signatures
        });

        $scope.signaturebox = {
            signatureList: []
        }

        $scope.save = function (signaturebox) {
            var signatureboxItem = {
                "alias": signaturebox.alias,
                "signatureList": signaturebox.signatureList
            };

            $log.debug('Creating signature box: ', signatureboxItem);

            RBTContentManagementService.createPredefinedSignatureBox(signatureboxItem).then(function (response) {
                $log.debug('Created signature box: ', signatureboxItem, ', response: ', response);

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
                $log.debug('Cannot create signature box: ', signatureboxItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };
    });

    ContentManagementOperationsSignatureBoxesRBTModule.controller('ContentManagementOperationsSignatureBoxesRBTUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, Restangular, UtilService,
                                                                                                                                      DateTimeConstants, RBTContentManagementService, signaturebox, signatures) {
        $log.debug('ContentManagementOperationsSignatureBoxesRBTUpdateCtrl');

        $controller('ContentManagementOperationsSignatureBoxesRBTCommonCtrl', {
            $scope: $scope,
            signatures: signatures
        });

        $scope.signaturebox = signaturebox;

        $scope.originalSignatureBox = angular.copy($scope.signaturebox);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSignatureBox, $scope.signaturebox);
        };

        $scope.save = function (signaturebox) {
            var signatureboxItem = {
                "id": $scope.originalSignatureBox.id,
                // Changed values
                "alias": signaturebox.alias,
                "signatureList": []
            };

            _.each(signaturebox.signatureList, function (signature) {
                delete signature.createType;
            });
            signatureboxItem.signatureList = signaturebox.signatureList;

            $log.debug('Updating signature box: ', signatureboxItem);

            RBTContentManagementService.updatePredefinedSignatureBox(signatureboxItem).then(function (response) {
                $log.debug('Updated signature box: ', signatureboxItem, ', response: ', response);

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
                $log.debug('Cannot update signature box: ', signatureboxItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };
    });

})();
