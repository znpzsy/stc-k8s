(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.operations.servicecategories.subcategories', []);

    var BusinessManagementOperationsServiceCategoriesSubCategoriesModule = angular.module('adminportal.subsystems.businessmanagement.operations.servicecategories.subcategories');

    BusinessManagementOperationsServiceCategoriesSubCategoriesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.operations.servicecategories.subcategories', {
            abstract: true,
            url: "/:categoryId/sub-categories",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'ServiceSubCategories',
                backState: 'subsystems.businessmanagement.operations.servicecategories.list'
            },
            resolve: {
                serviceCategoriesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME, true);
                }
            }
        }).state('subsystems.businessmanagement.operations.servicecategories.subcategories.list', {
            url: "",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicecategories.subcategories.html",
            controller: 'BusinessManagementOperationsServiceCategoriesSubCategoriesCtrl'
        }).state('subsystems.businessmanagement.operations.servicecategories.subcategories.new', {
            url: "/new",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicecategories.subcategories.details.html",
            controller: 'BusinessManagementOperationsServiceCategoriesSubCategoriesNewCtrl'
        }).state('subsystems.businessmanagement.operations.servicecategories.subcategories.update', {
            url: "/update/:id",
            templateUrl: "subsystems/businessmanagement/operations/operations.servicecategories.subcategories.details.html",
            controller: 'BusinessManagementOperationsServiceCategoriesSubCategoriesUpdateCtrl'
        });

    });

    BusinessManagementOperationsServiceCategoriesSubCategoriesModule.controller('BusinessManagementOperationsServiceCategoriesSubCategoriesCommonCtrl', function ($scope, $log, $q, $state, $stateParams, $filter, $uibModal, notification, $translate,
                                                                                                                                                                  CMPFService, serviceCategoriesOrganization) {
        $log.debug('BusinessManagementOperationsServiceCategoriesSubCategoriesCommonCtrl');

        $scope.categoryId = $stateParams.categoryId;

        $scope.serviceSubCategories = [];
        if (serviceCategoriesOrganization.organizations && serviceCategoriesOrganization.organizations.length > 0) {
            $scope.serviceCategoriesOrganization = serviceCategoriesOrganization.organizations[0];

            // ServiceMainCategoryProfile
            var serviceMainCategoryProfiles = CMPFService.getMainServiceCategories($scope.serviceCategoriesOrganization);

            if (serviceMainCategoryProfiles.length > 0) {
                var foundServiceMainCategory = _.findWhere(serviceMainCategoryProfiles, {"profileId": Number($scope.categoryId)});
                $scope.serviceCategory = angular.copy(foundServiceMainCategory);
            }

            // Filter out the related sub categories.
            $scope.serviceSubCategories = CMPFService.getSubServiceCategories($scope.serviceCategoriesOrganization);
            $scope.serviceSubCategories = _.filter($scope.serviceSubCategories, function (serviceSubCategory) {
                if (serviceSubCategory.MainCategoryID === Number($scope.categoryId)) {
                    serviceSubCategory.serviceCategory = $scope.serviceCategory;

                    return serviceSubCategory;
                }
            });
            $scope.serviceSubCategories = $filter('orderBy')($scope.serviceSubCategories, 'profileId');
        }

        $scope.updateServiceSubCategory = function (serviceSubCategoriesOrganizationOriginal, serviceSubCategory, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', serviceSubCategoriesOrganizationOriginal, serviceSubCategory);

            var organizationItem = {
                id: serviceSubCategoriesOrganizationOriginal.id,
                name: serviceSubCategoriesOrganizationOriginal.name,
                type: serviceSubCategoriesOrganizationOriginal.type,
                orgType: serviceSubCategoriesOrganizationOriginal.orgType,
                parentId: serviceSubCategoriesOrganizationOriginal.parentId,
                parentName: serviceSubCategoriesOrganizationOriginal.parentName,
                state: serviceSubCategoriesOrganizationOriginal.state,
                description: serviceSubCategoriesOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(serviceSubCategoriesOrganizationOriginal.profiles)
            };

            // ServiceSubCategoryProfile
            var originalServiceSubCategoryProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_SUB_SERVICE_CATEGORY_PROFILE);

            var updatedServiceSubCategoryProfile = JSON.parse(angular.toJson(serviceSubCategory));

            // Update the last update time for create first time or for update everytime.
            updatedServiceSubCategoryProfile.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');
            // Write the main category id value to the sub category again.
            updatedServiceSubCategoryProfile.MainCategoryID = $scope.categoryId;
            // Remove the service category in order not to send cmpf.
            delete updatedServiceSubCategoryProfile.serviceCategory;

            var originalServiceSubCategoryProfile = _.findWhere(originalServiceSubCategoryProfiles, {id: updatedServiceSubCategoryProfile.profileId});

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalServiceSubCategoryProfile);
            } else {
                var serviceSubCategoryProfileAttrArray = CMPFService.prepareProfile(updatedServiceSubCategoryProfile, originalServiceSubCategoryProfile);
                // ---
                if (originalServiceSubCategoryProfile) {
                    originalServiceSubCategoryProfile.attributes = serviceSubCategoryProfileAttrArray;
                } else {
                    var serviceSubCategoryProfile = {
                        name: CMPFService.ORGANIZATION_SUB_SERVICE_CATEGORY_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_SUB_SERVICE_CATEGORY_PROFILE,
                        attributes: serviceSubCategoryProfileAttrArray
                    };

                    organizationItem.profiles.push(serviceSubCategoryProfile);
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
            $state.go('subsystems.businessmanagement.operations.servicecategories.subcategories.list');
        };
    });

    BusinessManagementOperationsServiceCategoriesSubCategoriesModule.controller('BusinessManagementOperationsServiceCategoriesSubCategoriesCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                                                            DateTimeConstants, serviceCategoriesOrganization, CMPFService) {
        $log.debug('BusinessManagementOperationsServiceCategoriesSubCategoriesCtrl');

        $controller('BusinessManagementOperationsServiceCategoriesSubCategoriesCommonCtrl', {
            $scope: $scope,
            serviceCategoriesOrganization: serviceCategoriesOrganization
        });

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.BusinessManagement.Operations.ServiceCategories.SubCategoryId'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.BusinessManagement.Operations.ServiceCategories.SubCategoryName'
                },
                {
                    fieldName: 'serviceCategory.Name',
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

        // ServiceSubCategory list
        $scope.serviceSubCategoryList = {
            list: $scope.serviceSubCategories,
            tableParams: {}
        };

        $scope.serviceSubCategoryList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.serviceSubCategoryList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.serviceSubCategoryList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.serviceSubCategoryList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - ServiceSubCategory list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.serviceSubCategoryList.tableParams.settings().$scope.filterText = filterText;
            $scope.serviceSubCategoryList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.serviceSubCategoryList.tableParams.page(1);
            $scope.serviceSubCategoryList.tableParams.reload();
        }, 750);

        $scope.remove = function (serviceSubCategory) {
            serviceSubCategory.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                serviceSubCategory.rowSelected = false;

                $scope.updateServiceSubCategory($scope.serviceCategoriesOrganization, serviceSubCategory, true).then(function (response) {
                    var deletedListItem = _.findWhere($scope.serviceSubCategoryList.list, {profileId: serviceSubCategory.profileId});
                    $scope.serviceSubCategoryList.list = _.without($scope.serviceSubCategoryList.list, deletedListItem);

                    $scope.serviceSubCategoryList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    CMPFService.showApiError(response);
                });
            }, function () {
                serviceSubCategoryList.rowSelected = false;
            });
        };
    });

    BusinessManagementOperationsServiceCategoriesSubCategoriesModule.controller('BusinessManagementOperationsServiceCategoriesSubCategoriesNewCtrl', function ($scope, $log, $controller, $translate, notification, CMPFService,
                                                                                                                                                               serviceCategoriesOrganization) {
        $log.debug('BusinessManagementOperationsServiceCategoriesSubCategoriesNewCtrl');

        $controller('BusinessManagementOperationsServiceCategoriesSubCategoriesCommonCtrl', {
            $scope: $scope,
            serviceCategoriesOrganization: serviceCategoriesOrganization
        });

        if (serviceCategoriesOrganization.organizations && serviceCategoriesOrganization.organizations.length > 0) {
            $scope.serviceCategoriesOrganization = serviceCategoriesOrganization.organizations[0];
        }

        $scope.serviceSubCategory = {
            Name: '',
            Description: '',
            LastUpdateTime: null,
            MainCategoryID: $scope.categoryId
        };

        $scope.$watch('serviceSubCategory.Name', function (newVal, oldVal) {
            if (!angular.equals(newVal, oldVal)) {
                var foundProfile = _.findWhere($scope.serviceSubCategories, {Name: newVal});

                $scope.form.Name.$setValidity('availabilityCheck', _.isUndefined(foundProfile));
            }
        });

        $scope.save = function (serviceSubCategory) {
            $scope.updateServiceSubCategory($scope.serviceCategoriesOrganization, serviceSubCategory).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.servicecategories.subcategories.list', {
                    categoryId: $scope.categoryId
                });
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsServiceCategoriesSubCategoriesModule.controller('BusinessManagementOperationsServiceCategoriesSubCategoriesUpdateCtrl', function ($scope, $log, $controller, $stateParams, $translate, notification, CMPFService,
                                                                                                                                                                  serviceCategoriesOrganization) {
        $log.debug('BusinessManagementOperationsServiceCategoriesSubCategoriesUpdateCtrl');

        $controller('BusinessManagementOperationsServiceCategoriesSubCategoriesCommonCtrl', {
            $scope: $scope,
            serviceCategoriesOrganization: serviceCategoriesOrganization
        });

        var id = $stateParams.id;

        $scope.serviceSubCategory = {};
        if ($scope.serviceSubCategories.length > 0) {
            var foundServiceSubCategory = _.findWhere($scope.serviceSubCategories, {"profileId": Number(id)});
            $scope.serviceSubCategory = angular.copy(foundServiceSubCategory);
        }

        $scope.$watch('serviceSubCategory.Name', function (newVal, oldVal) {
            if (!angular.equals(newVal, oldVal)) {
                var foundProfile = _.findWhere($scope.serviceSubCategories, {Name: newVal});

                var isDifferent = foundProfile ? $scope.serviceSubCategory.profileId !== foundProfile.profileId : false;
                $scope.form.Name.$setValidity('availabilityCheck', !(isDifferent && foundProfile));
            }
        });

        $scope.originalServiceSubCategory = angular.copy($scope.serviceSubCategory);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalServiceSubCategory, $scope.serviceSubCategory);
        };

        $scope.save = function (serviceSubCategory) {
            $scope.updateServiceSubCategory($scope.serviceCategoriesOrganization, serviceSubCategory).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.businessmanagement.operations.servicecategories.subcategories.list', {
                    categoryId: $scope.categoryId
                });
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });
})();
