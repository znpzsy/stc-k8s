(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.operations.servicelabels', []);

    var BusinessManagementOperationsServiceLabelsModule = angular.module('adminportal.subsystems.businessmanagement.operations.servicelabels');

    BusinessManagementOperationsServiceLabelsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.operations.servicelabels', {
            abstract: true,
            url: "/service-labels",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ServiceLabels',
                permissions: [
                    'BIZ__OPERATIONS_SERVICELABEL_READ'
                ]
            },
            resolve: {
                serviceLabelsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_LABELS_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.businessmanagement.operations.servicelabels.list', {
            url: "",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicelabels.html",
            controller: 'BusinessManagementOperationsServiceLabelsCtrl'
        }).state('subsystems.businessmanagement.operations.servicelabels.new', {
            url: "/new",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicelabels.details.html",
            controller: 'BusinessManagementOperationsServiceLabelsNewCtrl'
        }).state('subsystems.businessmanagement.operations.servicelabels.update', {
            url: "/update/:id",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicelabels.details.html",
            controller: 'BusinessManagementOperationsServiceLabelsUpdateCtrl'
        });

    });

    BusinessManagementOperationsServiceLabelsModule.controller('BusinessManagementOperationsServiceLabelsCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService,
                                                                                                                                BUSINESS_MANAGEMENT_STATUS_TYPES_2) {
        $log.debug('BusinessManagementOperationsServiceLabelsCommonCtrl');

        $scope.BUSINESS_MANAGEMENT_STATUS_TYPES_2 = BUSINESS_MANAGEMENT_STATUS_TYPES_2;

        $scope.updateServiceLabel = function (serviceLabelsOrganizationOriginal, serviceLabel, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', serviceLabelsOrganizationOriginal, serviceLabel);

            // Update the last update time for create first time or for update everytime.
            serviceLabel.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var organizationItem = {
                id: serviceLabelsOrganizationOriginal.id,
                name: serviceLabelsOrganizationOriginal.name,
                type: serviceLabelsOrganizationOriginal.type,
                orgType: serviceLabelsOrganizationOriginal.orgType,
                parentId: serviceLabelsOrganizationOriginal.parentId,
                parentName: serviceLabelsOrganizationOriginal.parentName,
                state: serviceLabelsOrganizationOriginal.state,
                description: serviceLabelsOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(serviceLabelsOrganizationOriginal.profiles)
            };

            var originalServiceLabelProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_SERVICE_LABEL_PROFILE);

            var updatedServiceLabelProfile = JSON.parse(angular.toJson(serviceLabel));
            var originalServiceLabelProfile = _.findWhere(originalServiceLabelProfiles, {id: updatedServiceLabelProfile.profileId});

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalServiceLabelProfile);
            } else {
                var serviceLabelProfileAttrArray = CMPFService.prepareProfile(updatedServiceLabelProfile, originalServiceLabelProfile);
                // ---
                if (originalServiceLabelProfile) {
                    originalServiceLabelProfile.attributes = serviceLabelProfileAttrArray;
                } else {
                    var serviceLabelProfile = {
                        name: CMPFService.ORGANIZATION_SERVICE_LABEL_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_SERVICE_LABEL_PROFILE,
                        attributes: serviceLabelProfileAttrArray
                    };

                    organizationItem.profiles.push(serviceLabelProfile);
                }
            }

            CMPFService.updateOperator(organizationItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    deferred.reject(response)
                } else {
                    deferred.resolve(response)
                }
            }, function (response) {
                $log.debug('Cannot save the organization. Error: ', response);

                deferred.reject(response)
            });

            return deferred.promise;
        };

        $scope.cancel = function () {
            $state.go('subsystems.businessmanagement.operations.servicelabels.list');
        };
    });

    BusinessManagementOperationsServiceLabelsModule.controller('BusinessManagementOperationsServiceLabelsCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                          DateTimeConstants, serviceLabelsOrganization, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('BusinessManagementOperationsServiceLabelsCtrl');

        $controller('BusinessManagementOperationsServiceLabelsCommonCtrl', {$scope: $scope});

        $scope.serviceLabels = [];
        if (serviceLabelsOrganization.organizations && serviceLabelsOrganization.organizations.length > 0) {
            $scope.serviceLabelsOrganization = serviceLabelsOrganization.organizations[0];

            $scope.serviceLabels = CMPFService.getServiceLabels($scope.serviceLabelsOrganization);
            $scope.serviceLabels = $filter('orderBy')($scope.serviceLabels, 'profileId');
        }

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.BusinessManagement.Operations.ServiceLabels.Id'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.BusinessManagement.Operations.ServiceLabels.Name'
                },
                {
                    fieldName: 'LastUpdateTime',
                    headerKey: 'CommonLabels.LastUpdateTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'Status',
                    headerKey: 'CommonLabels.State'
                }
            ]
        };

        // ServiceLabel list
        $scope.serviceLabelList = {
            list: $scope.serviceLabels,
            tableParams: {}
        };

        $scope.serviceLabelList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.serviceLabelList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.serviceLabelList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.serviceLabelList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - ServiceLabel list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.serviceLabelList.tableParams.settings().$scope.filterText = filterText;
            $scope.serviceLabelList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.serviceLabelList.tableParams.page(1);
            $scope.serviceLabelList.tableParams.reload();
        }, 750);

        $scope.remove = function (serviceLabel) {
            serviceLabel.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                serviceLabel.rowSelected = false;

                $scope.updateServiceLabel($scope.serviceLabelsOrganization, serviceLabel, true).then(function (response) {
                    var deletedListItem = _.findWhere($scope.serviceLabelList.list, {profileId: serviceLabel.profileId});
                    $scope.serviceLabelList.list = _.without($scope.serviceLabelList.list, deletedListItem);

                    $scope.serviceLabelList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    CMPFService.showApiError(response);
                });
            }, function () {
                serviceLabel.rowSelected = false;
            });
        };
    });

    BusinessManagementOperationsServiceLabelsModule.controller('BusinessManagementOperationsServiceLabelsNewCtrl', function ($scope, $log, $controller, $translate, notification, CMPFService,
                                                                                                                             serviceLabelsOrganization) {
        $log.debug('BusinessManagementOperationsServiceLabelsNewCtrl');

        $controller('BusinessManagementOperationsServiceLabelsCommonCtrl', {$scope: $scope});

        if (serviceLabelsOrganization.organizations && serviceLabelsOrganization.organizations.length > 0) {
            $scope.serviceLabelsOrganization = serviceLabelsOrganization.organizations[0];
        }

        $scope.serviceLabel = {
            Name: '',
            Status: null,
            LastUpdateTime: null
        };

        $scope.save = function (serviceLabel) {
            $scope.updateServiceLabel($scope.serviceLabelsOrganization, serviceLabel).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.servicelabels.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsServiceLabelsModule.controller('BusinessManagementOperationsServiceLabelsUpdateCtrl', function ($scope, $log, $controller, $stateParams, $translate, notification, CMPFService,
                                                                                                                                serviceLabelsOrganization) {
        $log.debug('BusinessManagementOperationsServiceLabelsUpdateCtrl');

        $controller('BusinessManagementOperationsServiceLabelsCommonCtrl', {$scope: $scope});

        var id = $stateParams.id;

        if (serviceLabelsOrganization.organizations && serviceLabelsOrganization.organizations.length > 0) {
            $scope.serviceLabelsOrganization = serviceLabelsOrganization.organizations[0];

            // ServiceLabelProfile
            var serviceLabelProfiles = CMPFService.getServiceLabels($scope.serviceLabelsOrganization);
            if (serviceLabelProfiles.length > 0) {
                var foundServiceLabel = _.findWhere(serviceLabelProfiles, {"profileId": Number(id)});
                $scope.serviceLabel = angular.copy(foundServiceLabel);
            }
        }

        $scope.originalServiceLabel = angular.copy($scope.serviceLabel);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceLabel, $scope.serviceLabel);
        };

        $scope.save = function (serviceLabel) {
            $scope.updateServiceLabel($scope.serviceLabelsOrganization, serviceLabel).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.servicelabels.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

})();
