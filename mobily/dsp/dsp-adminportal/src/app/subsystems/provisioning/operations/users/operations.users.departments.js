(function () {

    'use strict';

    angular.module('adminportal.subsystems.provisioning.operations.users.departments', []);

    var ProvisioningUsersDepartmentsOperationsModule = angular.module('adminportal.subsystems.provisioning.operations.users.departments');

    ProvisioningUsersDepartmentsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.provisioning.operations.users.departments', {
            abstract: true,
            url: "/departments",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'Departments',
                permissions: [
                    'CMPF__OPERATIONS_DEPARTMENT_READ'
                ]
            },
            resolve: {
                departmentsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_DEPARTMENTS_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.provisioning.operations.users.departments.list', {
            url: "",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.departments.html",
            controller: 'ProvisioningOperationsUsersDepartmentsCtrl'
        }).state('subsystems.provisioning.operations.users.departments.new', {
            url: "/new",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.departments.details.html",
            controller: 'ProvisioningOperationsUsersDepartmentsNewCtrl'
        }).state('subsystems.provisioning.operations.users.departments.update', {
            url: "/update/:id",
            templateUrl: "subsystems/provisioning/operations/users/operations.users.departments.details.html",
            controller: 'ProvisioningOperationsUsersDepartmentsUpdateCtrl'
        });

    });

    ProvisioningUsersDepartmentsOperationsModule.controller('ProvisioningOperationsUsersDepartmentsCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService,
                                                                                                                          departmentsOrganization, STATUS_TYPES) {
        $log.debug('ProvisioningOperationsUsersDepartmentsCommonCtrl');

        $scope.departmentsOrganization = departmentsOrganization.organizations[0];

        $scope.STATUS_TYPES = STATUS_TYPES;

        $scope.updateDepartment = function (departmentsOrganizationOriginal, department, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', departmentsOrganizationOriginal, department);

            // Update the last update time for create first time or for update everytime.
            department.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var organizationItem = {
                id: departmentsOrganizationOriginal.id,
                name: departmentsOrganizationOriginal.name,
                type: departmentsOrganizationOriginal.type,
                orgType: departmentsOrganizationOriginal.orgType,
                parentId: departmentsOrganizationOriginal.parentId,
                parentName: departmentsOrganizationOriginal.parentName,
                state: departmentsOrganizationOriginal.state,
                description: departmentsOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(departmentsOrganizationOriginal.profiles)
            };

            var originalDepartmentProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_DEPARTMENT_PROFILE);

            var updatedDepartmentProfile = JSON.parse(angular.toJson(department));
            var originalDepartmentProfile = _.findWhere(originalDepartmentProfiles, {id: updatedDepartmentProfile.profileId});

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalDepartmentProfile);
            } else {
                var departmentProfileAttrArray = CMPFService.prepareProfile(updatedDepartmentProfile, originalDepartmentProfile);
                // ---
                if (originalDepartmentProfile) {
                    originalDepartmentProfile.attributes = departmentProfileAttrArray;
                } else {
                    var departmentProfile = {
                        name: CMPFService.ORGANIZATION_DEPARTMENT_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_DEPARTMENT_PROFILE,
                        attributes: departmentProfileAttrArray
                    };

                    organizationItem.profiles.push(departmentProfile);
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
            $state.go('subsystems.provisioning.operations.users.departments.list');
        };
    });

    ProvisioningUsersDepartmentsOperationsModule.controller('ProvisioningOperationsUsersDepartmentsCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                    departmentsOrganization, DateTimeConstants, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('ProvisioningOperationsUsersDepartmentsCtrl');

        $controller('ProvisioningOperationsUsersDepartmentsCommonCtrl', {
            $scope: $scope,
            departmentsOrganization: departmentsOrganization
        });

        $scope.departments = CMPFService.getDepartments($scope.departmentsOrganization);
        $scope.departments = $filter('orderBy')($scope.departments, 'profileId');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.Provisioning.Departments.Id'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.Provisioning.Departments.Name'
                },
                {
                    fieldName: 'LastUpdateTime',
                    headerKey: 'CommonLabels.LastUpdateTime',
                    filter: {name: 'date', params: ['yyyy-MM-dd HH:mm:ss', DateTimeConstants.OFFSET]}
                },
                {
                    fieldName: 'LegacyID',
                    headerKey: 'CommonLabels.LegacyID'
                },
                {
                    fieldName: 'Description',
                    headerKey: 'CommonLabels.Description'
                },
                {
                    fieldName: 'Status',
                    headerKey: 'CommonLabels.State'
                }
            ]
        };

        // Department list
        $scope.departmentList = {
            list: $scope.departments,
            tableParams: {}
        };

        $scope.departmentList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.departmentList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.departmentList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.departmentList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Department list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.departmentList.tableParams.settings().$scope.filterText = filterText;
            $scope.departmentList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.departmentList.tableParams.page(1);
            $scope.departmentList.tableParams.reload();
        }, 750);

        var findTeamsUsingTheDepartment = function (allTeams, department) {
            var teams = [];
            _.each(allTeams, function (team) {
                if (Number(team.DepartmentID) === Number(department.profileId)) {
                    teams.push(team);
                }
            });

            return teams;
        };

        // Teams
        $scope.viewTeams = function (department) {
            $uibModal.open({
                templateUrl: 'subsystems/provisioning/operations/users/operations.users.teams.view.modal.html',
                controller: function ($scope, $uibModalInstance, teamsOrganization) {
                    $scope.pageHeaderKey = 'Subsystems.Provisioning.Departments.TeamsModalTitle';
                    $scope.itemName = department.Name;

                    $scope.teamsOrganization = teamsOrganization.organizations[0];
                    var allTeams = CMPFService.getTeams($scope.teamsOrganization);
                    allTeams = $filter('orderBy')(allTeams, 'profileId');

                    $scope.teams = findTeamsUsingTheDepartment(allTeams, department);

                    $scope.tableParams = new NgTableParams({
                        page: 1,
                        count: 10,
                        sorting: {
                            "profileId": 'asc'
                        }
                    }, {
                        $scope: $scope,
                        total: 0,
                        getData: function ($defer, params) {
                            var filterText = params.settings().$scope.filterText;
                            var filterColumns = params.settings().$scope.filterColumns;
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.teams);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.teams;
                            params.total(orderedData.length); // set total for recalc pagination
                            if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                                params.page(params.page() - 1);
                            }

                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });

                    $scope.filterTable = _.debounce(function (filterText, filterColumns) {
                        $scope.tableParams.settings().$scope.filterText = filterText;
                        $scope.tableParams.settings().$scope.filterColumns = filterColumns;
                        $scope.tableParams.page(1);
                        $scope.tableParams.reload();
                    }, 500);

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'lg',
                resolve: {
                    teamsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_TEAMS_ORGANIZATION_NAME);
                    }
                }
            });
        };

        $scope.remove = function (department) {

            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_TEAMS_ORGANIZATION_NAME).then(function (response) {
                var allTeams = CMPFService.getTeams(response.organizations[0]);
                var teams = findTeamsUsingTheDepartment(allTeams, department);

                if (teams && teams.length > 0) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ThereAreLinkedTeams')
                    });
                } else {
                    department.rowSelected = true;

                    var modalInstance = $uibModal.open({
                        templateUrl: 'partials/modal/modal.confirmation.html',
                        controller: 'ConfirmationModalInstanceCtrl',
                        size: 'sm'
                    });

                    modalInstance.result.then(function () {
                        department.rowSelected = false;

                        $scope.updateDepartment($scope.departmentsOrganization, department, true).then(function (response) {
                            var deletedListItem = _.findWhere($scope.departmentList.list, {profileId: department.profileId});
                            $scope.departmentList.list = _.without($scope.departmentList.list, deletedListItem);

                            $scope.departmentList.tableParams.reload();

                            notification({
                                type: 'success',
                                text: $translate.instant('CommonLabels.OperationSuccessful')
                            });
                        }, function (response) {
                            CMPFService.showApiError(response);
                        });
                    }, function () {
                        department.rowSelected = false;
                    });
                }
            });
        };
    });

    ProvisioningUsersDepartmentsOperationsModule.controller('ProvisioningOperationsUsersDepartmentsNewCtrl', function ($scope, $log, $controller, $filter, $translate, notification, CMPFService,
                                                                                                                       departmentsOrganization) {
        $log.debug('ProvisioningOperationsUsersDepartmentsNewCtrl');

        $controller('ProvisioningOperationsUsersDepartmentsCommonCtrl', {
            $scope: $scope,
            departmentsOrganization: departmentsOrganization
        });

        $scope.department = {
            Name: '',
            Description: '',
            Status: 'ACTIVE',
            LastUpdateTime: null
        };

        $scope.save = function (department) {
            $scope.updateDepartment($scope.departmentsOrganization, department).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.provisioning.operations.users.departments.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    ProvisioningUsersDepartmentsOperationsModule.controller('ProvisioningOperationsUsersDepartmentsUpdateCtrl', function ($scope, $log, $controller, $stateParams, $filter, $translate, notification, CMPFService,
                                                                                                                          departmentsOrganization) {
        $log.debug('ProvisioningOperationsUsersDepartmentsUpdateCtrl');

        $controller('ProvisioningOperationsUsersDepartmentsCommonCtrl', {
            $scope: $scope,
            departmentsOrganization: departmentsOrganization
        });

        var id = $stateParams.id;

        // DepartmentProfile
        var departmentProfiles = CMPFService.getDepartments($scope.departmentsOrganization);
        if (departmentProfiles.length > 0) {
            var foundDepartment = _.findWhere(departmentProfiles, {"profileId": Number(id)});
            $scope.department = angular.copy(foundDepartment);
        }

        $scope.originalDepartment = angular.copy($scope.department);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalDepartment, $scope.department);
        };

        $scope.save = function (department) {
            $scope.updateDepartment($scope.departmentsOrganization, department).then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $scope.go('subsystems.provisioning.operations.users.departments.list');
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

})();
