(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.operations.servicecategories', [
        'adminportal.subsystems.businessmanagement.operations.servicecategories.subcategories'
    ]);

    var BusinessManagementOperationsServiceCategoriesModule = angular.module('adminportal.subsystems.businessmanagement.operations.servicecategories');

    BusinessManagementOperationsServiceCategoriesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.operations.servicecategories', {
            abstract: true,
            url: "/service-categories",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ServiceCategories',
                permissions: [
                    'BIZ__OPERATIONS_SERVICECATEGORY_READ'
                ]
            },
            resolve: {
                serviceCategoriesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.businessmanagement.operations.servicecategories.list', {
            url: "",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicecategories.html",
            controller: 'BusinessManagementOperationsServiceCategoriesCtrl'
        }).state('subsystems.businessmanagement.operations.servicecategories.new', {
            url: "/new",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicecategories.details.html",
            controller: 'BusinessManagementOperationsServiceCategoriesNewCtrl'
        }).state('subsystems.businessmanagement.operations.servicecategories.update', {
            url: "/update/:id",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicecategories.details.html",
            controller: 'BusinessManagementOperationsServiceCategoriesUpdateCtrl'
        });

    });

    BusinessManagementOperationsServiceCategoriesModule.controller('BusinessManagementOperationsServiceCategoriesCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService) {
        $log.debug('BusinessManagementOperationsServiceCategoriesCommonCtrl');

        $scope.updateServiceCategory = function (serviceCategoriesOrganizationOriginal, serviceMainCategory, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', serviceCategoriesOrganizationOriginal, serviceMainCategory);

            // Update the last update time for create first time or for update everytime.
            serviceMainCategory.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var organizationItem = {
                id: serviceCategoriesOrganizationOriginal.id,
                name: serviceCategoriesOrganizationOriginal.name,
                type: serviceCategoriesOrganizationOriginal.type,
                orgType: serviceCategoriesOrganizationOriginal.orgType,
                parentId: serviceCategoriesOrganizationOriginal.parentId,
                parentName: serviceCategoriesOrganizationOriginal.parentName,
                state: serviceCategoriesOrganizationOriginal.state,
                description: serviceCategoriesOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(serviceCategoriesOrganizationOriginal.profiles)
            };

            // ServiceMainCategoryProfile
            var originalServiceMainCategoryProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_MAIN_SERVICE_CATEGORY_PROFILE);

            var updatedServiceMainCategoryProfile = JSON.parse(angular.toJson(serviceMainCategory));
            var originalServiceMainCategoryProfile = _.findWhere(originalServiceMainCategoryProfiles, {id: updatedServiceMainCategoryProfile.profileId});

            if (isDelete) {
                // Filter out the related sub categories.
                organizationItem.profiles = _.filter(organizationItem.profiles, function (serviceSubCategory) {
                    return !_.findWhere(serviceSubCategory.attributes, {
                        name: 'MainCategoryID',
                        value: serviceMainCategory.profileId.toString()
                    });
                });

                // Filter out the main categories.
                organizationItem.profiles = _.without(organizationItem.profiles, originalServiceMainCategoryProfile);
            } else {
                var serviceMainCategoryProfileAttrArray = CMPFService.prepareProfile(updatedServiceMainCategoryProfile, originalServiceMainCategoryProfile);
                // ---
                if (originalServiceMainCategoryProfile) {
                    originalServiceMainCategoryProfile.attributes = serviceMainCategoryProfileAttrArray;
                } else {
                    var serviceMainCategoryProfile = {
                        name: CMPFService.ORGANIZATION_MAIN_SERVICE_CATEGORY_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_MAIN_SERVICE_CATEGORY_PROFILE,
                        attributes: serviceMainCategoryProfileAttrArray
                    };

                    organizationItem.profiles.push(serviceMainCategoryProfile);
                }
            }

            CMPFService.updateOperator(organizationItem).then(function (response) {
                $log.debug('Update Success. Response: ', response);

                if (response && response.errorCode) {
                    deferred.resolve(response);
                } else {
                    deferred.resolve(response);
                }
            }, function (response) {
                $log.debug('Cannot save the organization. Error: ', response);

                deferred.reject(response)
            });

            return deferred.promise;
        };

        $scope.cancel = function () {
            $state.go('subsystems.businessmanagement.operations.servicecategories.list');
        };
    });

    BusinessManagementOperationsServiceCategoriesModule.controller('BusinessManagementOperationsServiceCategoriesCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                  DateTimeConstants, serviceCategoriesOrganization, CMPFService) {
        $log.debug('BusinessManagementOperationsServiceCategoriesCtrl');

        $controller('BusinessManagementOperationsServiceCategoriesCommonCtrl', {$scope: $scope});

        $scope.mainServiceCategories = [];
        $scope.subServiceCategories = [];
        if (serviceCategoriesOrganization.organizations && serviceCategoriesOrganization.organizations.length > 0) {
            $scope.serviceCategoriesOrganization = serviceCategoriesOrganization.organizations[0];

            $scope.mainServiceCategories = CMPFService.getMainServiceCategories($scope.serviceCategoriesOrganization);
            $scope.mainServiceCategories = $filter('orderBy')($scope.mainServiceCategories, 'profileId');

            $scope.subServiceCategories = CMPFService.getSubServiceCategories($scope.serviceCategoriesOrganization);
            $scope.subServiceCategories = $filter('orderBy')($scope.subServiceCategories, 'profileId');
        }

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.BusinessManagement.Operations.ServiceCategories.Id'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.BusinessManagement.Operations.ServiceCategories.Name'
                },
                {
                    fieldName: 'LastUpdateTime',
                    headerKey: 'CommonLabels.LastUpdateTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'Description',
                    headerKey: 'CommonLabels.Description'
                }
            ]
        };

        // ServiceCategory list
        $scope.serviceCategoryList = {
            list: $scope.mainServiceCategories,
            tableParams: {}
        };

        $scope.serviceCategoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.serviceCategoryList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.serviceCategoryList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.serviceCategoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - ServiceCategory list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.serviceCategoryList.tableParams.settings().$scope.filterText = filterText;
            $scope.serviceCategoryList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.serviceCategoryList.tableParams.page(1);
            $scope.serviceCategoryList.tableParams.reload();
        }, 750);

        $scope.remove = function (serviceMainCategory) {
            serviceMainCategory.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                serviceMainCategory.rowSelected = false;

                $scope.updateServiceCategory($scope.serviceCategoriesOrganization, serviceMainCategory, true).then(function (response) {
                    var deletedListItem = _.findWhere($scope.serviceCategoryList.list, {profileId: serviceMainCategory.profileId});
                    $scope.serviceCategoryList.list = _.without($scope.serviceCategoryList.list, deletedListItem);

                    $scope.serviceCategoryList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    CMPFService.showApiError(response);
                });
            }, function () {
                serviceCategoryList.rowSelected = false;
            });
        };
    });

    BusinessManagementOperationsServiceCategoriesModule.controller('BusinessManagementOperationsServiceCategoriesNewCtrl', function ($scope, $log, $controller, $translate, notification, CMPFService,
                                                                                                                                     serviceCategoriesOrganization) {
        $log.debug('BusinessManagementOperationsServiceCategoriesNewCtrl');

        $controller('BusinessManagementOperationsServiceCategoriesCommonCtrl', {$scope: $scope});

        if (serviceCategoriesOrganization.organizations && serviceCategoriesOrganization.organizations.length > 0) {
            $scope.serviceCategoriesOrganization = serviceCategoriesOrganization.organizations[0];
        }

        $scope.serviceCategory = {
            Name: '',
            Description: '',
            LastUpdateTime: null
        };

        $scope.save = function (serviceCategory) {
            $scope.updateServiceCategory($scope.serviceCategoriesOrganization, serviceCategory).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.servicecategories.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsServiceCategoriesModule.controller('BusinessManagementOperationsServiceCategoriesUpdateCtrl', function ($scope, $log, $controller, $stateParams, $translate, notification, CMPFService,
                                                                                                                                        serviceCategoriesOrganization) {
        $log.debug('BusinessManagementOperationsServiceCategoriesUpdateCtrl');

        $controller('BusinessManagementOperationsServiceCategoriesCommonCtrl', {$scope: $scope});

        var id = $stateParams.id;

        if (serviceCategoriesOrganization.organizations && serviceCategoriesOrganization.organizations.length > 0) {
            $scope.serviceCategoriesOrganization = serviceCategoriesOrganization.organizations[0];

            // ServiceMainCategoryProfile
            var serviceMainCategoryProfiles = CMPFService.getMainServiceCategories($scope.serviceCategoriesOrganization);

            if (serviceMainCategoryProfiles.length > 0) {
                var foundServiceMainCategory = _.findWhere(serviceMainCategoryProfiles, {"profileId": Number(id)});
                $scope.serviceCategory = angular.copy(foundServiceMainCategory);
            }
        }

        $scope.originalServiceCategory = angular.copy($scope.serviceCategory);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceCategory, $scope.serviceCategory);
        };

        $scope.save = function (serviceCategory) {
            $scope.updateServiceCategory($scope.serviceCategoriesOrganization, serviceCategory).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.servicecategories.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

})();
