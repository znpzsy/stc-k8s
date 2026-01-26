(function () {

    'use strict';

    angular.module('adminportal.subsystems.contentmanagement.operations.rbt.specialconditions', []);

    var ContentManagementOperationsSpecialConditionsRBTModule = angular.module('adminportal.subsystems.contentmanagement.operations.rbt.specialconditions');

    ContentManagementOperationsSpecialConditionsRBTModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.contentmanagement.operations.rbt.specialconditions', {
            abstract: true,
            url: "/special-conditions",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'SpecialConditionsRBT',
                permissions: [
                    'RBT__OPERATIONS_SPECIALCONDITION_READ'
                ]
            }
        }).state('subsystems.contentmanagement.operations.rbt.specialconditions.list', {
            url: "",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.specialconditions.html",
            controller: 'ContentManagementOperationsSpecialConditionsRBTCtrl',
            resolve: {
                specialConditions: function (RBTContentManagementService) {
                    return RBTContentManagementService.getSpecialConditions();
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.specialconditions.new', {
            url: "/new",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.specialconditions.details.html",
            controller: 'ContentManagementOperationsSpecialConditionsRBTNewCtrl',
            resolve: {
                defaultOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.contentmanagement.operations.rbt.specialconditions.update', {
            url: "/update/:id",
            templateUrl: "subsystems/contentmanagement/operations/rbt/operations.specialconditions.details.html",
            controller: 'ContentManagementOperationsSpecialConditionsRBTUpdateCtrl',
            resolve: {
                defaultOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_ORGANIZATION_NAME);
                },
                specialCondition: function ($stateParams, RBTContentManagementService) {
                    return RBTContentManagementService.getSpecialCondition($stateParams.id);
                }
            }
        });

    });

    ContentManagementOperationsSpecialConditionsRBTModule.controller('ContentManagementOperationsSpecialConditionsRBTCommonCtrl', function ($scope, $log, $state, $filter, $uibModal, $controller, ContentManagementService,
                                                                                                                                            defaultOrganization) {
        $log.debug('ContentManagementOperationsSpecialConditionsRBTCommonCtrl');

        $controller('GenericDateTimeCtrl', {$scope: $scope});

        $scope.defaultOrganization = defaultOrganization.organizations[0];

        $scope.toneList = [];

        $scope.searchTones = _.throttle(function (text) {
            $scope.toneList = [];
            ContentManagementService.searchTones(0, 100, text, $scope.defaultOrganization.id).then(function (response) {
                $scope.toneList = (response ? response.items : []);
            });
        }, 500);

        $scope.cancel = function () {
            $state.go('subsystems.contentmanagement.operations.rbt.specialconditions.list');
        };
    });

    ContentManagementOperationsSpecialConditionsRBTModule.controller('ContentManagementOperationsSpecialConditionsRBTCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                      Restangular, RBTContentManagementService, specialConditions) {
        $log.debug('ContentManagementOperationsSpecialConditionsRBTCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.SpecialConditions.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.SpecialConditions.Name'
                },
                {
                    fieldName: 'defaultDurationInMiliseconds',
                    headerKey: 'Subsystems.ContentManagement.Operations.RBT.SpecialConditions.DefaultDuration'
                }
            ]
        };


        var specialConditionList = specialConditions ? specialConditions : [];

        // SpecialCondition list
        $scope.specialConditionList = {
            list: specialConditionList,
            tableParams: {}
        };

        $scope.specialConditionList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "id": 'asc'
            }
        }, {
            total: $scope.specialConditionList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.specialConditionList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.specialConditionList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SpecialCondition list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.specialConditionList.tableParams.settings().$scope.filterText = filterText;
            $scope.specialConditionList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.specialConditionList.tableParams.page(1);
            $scope.specialConditionList.tableParams.reload();
        }, 750);

        $scope.remove = function (specialCondition) {
            specialCondition.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                specialCondition.rowSelected = false;

                $log.debug('Removing specialCondition: ', specialCondition);

                RBTContentManagementService.deleteSpecialCondition(specialCondition).then(function (response) {
                    $log.debug('Removed specialCondition: ', specialCondition, ', response: ', response);

                    if (response && response.errorCode) {
                        RBTContentManagementService.showApiError(response);
                    } else {
                        var deletedListItem = _.findWhere($scope.specialConditionList.list, {id: specialCondition.id});
                        $scope.specialConditionList.list = _.without($scope.specialConditionList.list, deletedListItem);

                        $scope.specialConditionList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot remove specialCondition: ', specialCondition, ', response: ', response);

                    RBTContentManagementService.showApiError(response);
                });
            }, function () {
                specialCondition.rowSelected = false;
            });
        };
    });

    ContentManagementOperationsSpecialConditionsRBTModule.controller('ContentManagementOperationsSpecialConditionsRBTNewCtrl', function ($scope, $log, $controller, $q, $filter, $translate, notification, UtilService, RBTContentManagementService,
                                                                                                                                         ContentManagementService, defaultOrganization) {
        $log.debug('ContentManagementOperationsSpecialConditionsRBTNewCtrl');

        $controller('ContentManagementOperationsSpecialConditionsRBTCommonCtrl', {
            $scope: $scope,
            defaultOrganization: defaultOrganization
        });

        $scope.specialCondition = {};

        $scope.save = function (specialCondition) {
            var specialConditionItem = {
                "name": specialCondition.name,
                "icon": null,
                "toneforMan": specialCondition.toneMale,
                "toneforWoman": specialCondition.toneFemale,
                "defaultDurationInMiliseconds": specialCondition.defaultDurationInMiliseconds
            };

            var icon;
            // icon
            if (specialCondition.icon && specialCondition.icon.name) {
                specialConditionItem.icon = UtilService.generateObjectId();
                icon = specialCondition.icon;
            }

            $log.debug('Creating specialCondition: ', specialConditionItem);

            RBTContentManagementService.createSpecialCondition(specialConditionItem).then(function (response) {
                $log.debug('Created specialCondition: ', specialConditionItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    var promises = [];

                    if (icon && icon.name) {
                        promises.push(ContentManagementService.uploadFile(icon, icon.name, specialConditionItem.icon));
                    }

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $scope.cancel();
                    });
                }
            }, function (response) {
                $log.debug('Cannot create specialCondition: ', specialConditionItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };
    });

    ContentManagementOperationsSpecialConditionsRBTModule.controller('ContentManagementOperationsSpecialConditionsRBTUpdateCtrl', function ($scope, $log, $controller, $stateParams, $q, $filter, $translate, notification, Restangular, UtilService,
                                                                                                                                            RBTContentManagementService, ContentManagementService, FileDownloadService, specialCondition, defaultOrganization) {
        $log.debug('ContentManagementOperationsSpecialConditionsRBTUpdateCtrl');

        $controller('ContentManagementOperationsSpecialConditionsRBTCommonCtrl', {
            $scope: $scope,
            defaultOrganization: defaultOrganization
        });

        $scope.specialCondition = specialCondition;

        // Get the tones.
        if ($scope.specialCondition.toneforMan) {
            $scope.specialCondition.toneMale = $scope.specialCondition.toneforMan;
            ContentManagementService.getTone($scope.specialCondition.toneforMan).then(function (response) {
                $scope.toneList.push(response.tone);
            });
        }
        if ($scope.specialCondition.toneforWoman) {
            $scope.specialCondition.toneFemale = $scope.specialCondition.toneforWoman;
            ContentManagementService.getTone($scope.specialCondition.toneforWoman).then(function (response) {
                $scope.toneList.push(response.tone);
            });
        }

        // Get the icon by id value.
        $scope.specialCondition.iconId = $scope.specialCondition.icon;
        $scope.specialCondition.icon = {name: undefined};
        if ($scope.specialCondition.iconId) {
            var srcUrl = ContentManagementService.generateFilePath($scope.specialCondition.iconId);
            FileDownloadService.downloadFileAndGetBlob(srcUrl, function (blob, fileName) {
                $scope.specialCondition.icon = blob;
                if (blob) {
                    $scope.specialCondition.icon.name = fileName;
                }
                $scope.originalspecialCondition = angular.copy($scope.specialCondition);
            });
        }

        $scope.originalSpecialCondition = angular.copy($scope.specialCondition);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalSpecialCondition, $scope.specialCondition);
        };

        $scope.save = function (specialCondition) {
            var specialConditionItem = {
                "id": $scope.originalSpecialCondition.id,
                // Changed values
                "name": specialCondition.name,
                "icon": specialCondition.iconId,
                "toneforMan": specialCondition.toneMale,
                "toneforWoman": specialCondition.toneFemale,
                "defaultDurationInMiliseconds": specialCondition.defaultDurationInMiliseconds
            };

            // icon
            var icon = specialCondition.icon;
            if (!icon || (icon && !icon.name)) {
                specialConditionItem.icon = null;
            } else if (icon instanceof File && !specialConditionItem.icon) {
                specialConditionItem.icon = UtilService.generateObjectId();
            }

            $log.debug('Updating specialCondition: ', specialConditionItem);

            RBTContentManagementService.updateSpecialCondition(specialConditionItem).then(function (response) {
                $log.debug('Updated special condition: ', specialConditionItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    var promises = [];

                    if (icon && icon.name && (icon instanceof File)) {
                        promises.push(ContentManagementService.uploadFile(icon, icon.name, specialConditionItem.icon));
                    }

                    $q.all(promises).then(function () {
                        notification.flash({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });

                        $scope.cancel();
                    });
                }
            }, function (response) {
                $log.debug('Cannot update specialCondition: ', specialConditionItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };
    });

})();
