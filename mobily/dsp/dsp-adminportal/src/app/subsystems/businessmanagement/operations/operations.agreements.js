(function () {

    'use strict';

    angular.module('adminportal.subsystems.businessmanagement.operations.agreements', []);

    var BusinessManagementOperationsAgreementsModule = angular.module('adminportal.subsystems.businessmanagement.operations.agreements');

    BusinessManagementOperationsAgreementsModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.businessmanagement.operations.agreements', {
            abstract: true,
            url: "/agreements",
            template: '<div ui-view></div>',
            data: {
                exportFileName: 'Agreements',
                permissions: [
                    'BIZ__OPERATIONS_AGREEMENT_READ'
                ]
            },
            resolve: {
                agreementsOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_AGREEMENTS_ORGANIZATION_NAME);
                }
            }
        }).state('subsystems.businessmanagement.operations.agreements.list', {
            url: "",
            templateUrl: "subsystems/businessmanagement/operations/operations.agreements.html",
            controller: 'BusinessManagementOperationsAgreementsCtrl'
        }).state('subsystems.businessmanagement.operations.agreements.new', {
            url: "/new",
            templateUrl: "subsystems/businessmanagement/operations/operations.agreements.details.html",
            controller: 'BusinessManagementOperationsAgreementsNewCtrl'
        }).state('subsystems.businessmanagement.operations.agreements.update', {
            url: "/update/:id",
            templateUrl: "subsystems/businessmanagement/operations/operations.agreements.details.html",
            controller: 'BusinessManagementOperationsAgreementsUpdateCtrl'
        });

    });

    BusinessManagementOperationsAgreementsModule.controller('BusinessManagementOperationsAgreementsCommonCtrl', function ($scope, $log, $q, $state, $filter, $uibModal, notification, $translate, CMPFService,
                                                                                                                          agreementsOrganization, BUSINESS_MANAGEMENT_STATUS_TYPES, BUSINESS_MANAGEMENT_AGREEMENT_TYPES) {
        $log.debug('BusinessManagementOperationsAgreementsCommonCtrl');

        $scope.agreementsOrganization = agreementsOrganization.organizations[0];

        $scope.BUSINESS_MANAGEMENT_STATUS_TYPES = BUSINESS_MANAGEMENT_STATUS_TYPES;
        $scope.BUSINESS_MANAGEMENT_AGREEMENT_TYPES = BUSINESS_MANAGEMENT_AGREEMENT_TYPES;

        $scope.updateAgreement = function (agreementsOrganizationOriginal, agreement, isDelete) {
            var deferred = $q.defer();

            $log.debug('Trying update default organization: ', agreementsOrganizationOriginal, agreement);

            // Update the last update time for create first time or for update everytime.
            agreement.LastUpdateTime = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

            var organizationItem = {
                id: agreementsOrganizationOriginal.id,
                name: agreementsOrganizationOriginal.name,
                type: agreementsOrganizationOriginal.type,
                orgType: agreementsOrganizationOriginal.orgType,
                parentId: agreementsOrganizationOriginal.parentId,
                parentName: agreementsOrganizationOriginal.parentName,
                state: agreementsOrganizationOriginal.state,
                description: agreementsOrganizationOriginal.description,
                // Profiles
                profiles: angular.copy(agreementsOrganizationOriginal.profiles)
            };

            var originalAgreementProfiles = CMPFService.findProfilesByName(organizationItem.profiles, CMPFService.ORGANIZATION_AGREEMENT_PROFILE);

            var updatedAgreementProfile = JSON.parse(angular.toJson(agreement));

            // Remove the unnecessary and invalid attributes.
            delete updatedAgreementProfile.cmsContentFile;

            var originalAgreementProfile = _.findWhere(originalAgreementProfiles, {id: updatedAgreementProfile.profileId});

            if (isDelete) {
                organizationItem.profiles = _.without(organizationItem.profiles, originalAgreementProfile);
            } else {
                var agreementProfileAttrArray = CMPFService.prepareProfile(updatedAgreementProfile, originalAgreementProfile);
                // ---
                if (originalAgreementProfile) {
                    originalAgreementProfile.attributes = agreementProfileAttrArray;
                } else {
                    var agreementProfile = {
                        name: CMPFService.ORGANIZATION_AGREEMENT_PROFILE,
                        profileDefinitionName: CMPFService.ORGANIZATION_AGREEMENT_PROFILE,
                        attributes: agreementProfileAttrArray
                    };

                    organizationItem.profiles.push(agreementProfile);
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
            $state.go('subsystems.businessmanagement.operations.agreements.list');
        };
    });

    BusinessManagementOperationsAgreementsModule.controller('BusinessManagementOperationsAgreementsCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                    agreementsOrganization, DateTimeConstants, CMPFService, DEFAULT_REST_QUERY_LIMIT) {
        $log.debug('BusinessManagementOperationsAgreementsCtrl');

        $controller('BusinessManagementOperationsAgreementsCommonCtrl', {
            $scope: $scope,
            agreementsOrganization: agreementsOrganization
        });

        $scope.agreements = CMPFService.getAgreements($scope.agreementsOrganization);
        $scope.agreements = $filter('orderBy')($scope.agreements, 'profileId');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'profileId',
                    headerKey: 'Subsystems.BusinessManagement.Operations.Agreements.Id'
                },
                {
                    fieldName: 'Name',
                    headerKey: 'Subsystems.BusinessManagement.Operations.Agreements.Name'
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

        // Agreement list
        $scope.agreementList = {
            list: $scope.agreements,
            tableParams: {}
        };

        $scope.agreementList.tableParams = new NgTableParams({
            page: 1,
            count: 10,
            sorting: {
                "profileId": 'asc'
            }
        }, {
            total: $scope.agreementList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.agreementList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.agreementList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Agreement list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.agreementList.tableParams.settings().$scope.filterText = filterText;
            $scope.agreementList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.agreementList.tableParams.page(1);
            $scope.agreementList.tableParams.reload();
        }, 750);

        var findBusinessTypesUsingTheAgreement = function (allBusinessTypes, agreement) {
            var businessTypes = [];
            _.each(allBusinessTypes, function (businessType) {
                if (Number(businessType.AgreementID) === Number(agreement.profileId)) {
                    businessTypes.push(businessType);
                }
            });

            return businessTypes;
        };

        // Business Types
        $scope.viewBusinessTypes = function (agreement) {
            $uibModal.open({
                templateUrl: 'subsystems/businessmanagement/operations/operations.businesstypes.view.modal.html',
                controller: function ($scope, $uibModalInstance, businessTypesOrganization) {
                    $scope.pageHeaderKey = 'Subsystems.BusinessManagement.Operations.Agreements.BusinessTypesModalTitle';
                    $scope.itemName = agreement.Name;

                    $scope.businessTypesOrganization = businessTypesOrganization.organizations[0];
                    var allBusinessTypes = CMPFService.getBusinessTypes($scope.businessTypesOrganization);
                    allBusinessTypes = $filter('orderBy')(allBusinessTypes, 'profileId');

                    $scope.businessTypes = findBusinessTypesUsingTheAgreement(allBusinessTypes, agreement);

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
                            var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.businessTypes);
                            var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.businessTypes;
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
                    businessTypesOrganization: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME);
                    }
                }
            });
        };

        $scope.remove = function (agreement) {
            CMPFService.getAllOrganizationsByName(0, DEFAULT_REST_QUERY_LIMIT, CMPFService.DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME).then(function (response) {
                var allBusinessTypes = CMPFService.getBusinessTypes(response.organizations[0]);
                var businessTypes = findBusinessTypesUsingTheAgreement(allBusinessTypes, agreement);

                if (businessTypes && businessTypes.length > 0) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ThereAreLinkedBusinessTypes')
                    });
                } else {
                    agreement.rowSelected = true;

                    var modalInstance = $uibModal.open({
                        templateUrl: 'partials/modal/modal.confirmation.html',
                        controller: 'ConfirmationModalInstanceCtrl',
                        size: 'sm'
                    });

                    modalInstance.result.then(function () {
                        agreement.rowSelected = false;

                        $scope.updateAgreement($scope.agreementsOrganization, agreement, true).then(function (response) {
                            var deletedListItem = _.findWhere($scope.agreementList.list, {profileId: agreement.profileId});
                            $scope.agreementList.list = _.without($scope.agreementList.list, deletedListItem);

                            $scope.agreementList.tableParams.reload();

                            notification({
                                type: 'success',
                                text: $translate.instant('CommonLabels.OperationSuccessful')
                            });
                        }, function (response) {
                            CMPFService.showApiError(response);
                        });

                        // TODO - delete the file content here
                    }, function () {
                        agreement.rowSelected = false;
                    });
                }
            });
        };
    });

    BusinessManagementOperationsAgreementsModule.controller('BusinessManagementOperationsAgreementsNewCtrl', function ($scope, $log, $controller, $q, $filter, $translate, notification, CMPFService, UtilService,
                                                                                                                       ContentManagementService, agreementsOrganization) {
        $log.debug('BusinessManagementOperationsAgreementsNewCtrl');

        $controller('BusinessManagementOperationsAgreementsCommonCtrl', {
            $scope: $scope,
            agreementsOrganization: agreementsOrganization
        });

        $scope.agreement = {
            Name: '',
            Description: '',
            Status: null,
            LastUpdateTime: null,
            Type: 'BUSINESS_TYPE'
        };

        var showSuccessMessage = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.go('subsystems.businessmanagement.operations.agreements.list');
        };

        $scope.save = function (agreement) {
            // Generate an id for file content.
            agreement.CMSContentID = UtilService.generateObjectId();
            var cmsContentFile = agreement.cmsContentFile;

            $scope.updateAgreement($scope.agreementsOrganization, agreement).then(function (response) {
                var cmsContentFileAsBlob = new Blob([cmsContentFile], {type: 'text/plain'});

                var promises = [];

                if (cmsContentFileAsBlob) {
                    // Content creating step
                    promises.push(ContentManagementService.uploadFile(cmsContentFileAsBlob, agreement.Name, agreement.CMSContentID));
                }

                $q.all(promises).then(function () {
                    showSuccessMessage();
                });
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

    BusinessManagementOperationsAgreementsModule.controller('BusinessManagementOperationsAgreementsUpdateCtrl', function ($scope, $log, $controller, $stateParams, $q, $filter, $translate, notification, CMPFService, UtilService,
                                                                                                                          ContentManagementService, FileDownloadService, agreementsOrganization) {
        $log.debug('BusinessManagementOperationsAgreementsUpdateCtrl');

        $controller('BusinessManagementOperationsAgreementsCommonCtrl', {
            $scope: $scope,
            agreementsOrganization: agreementsOrganization
        });

        var id = $stateParams.id;

        // AgreementProfile
        var agreementProfiles = CMPFService.getAgreements($scope.agreementsOrganization);
        if (agreementProfiles.length > 0) {
            var foundAgreement = _.findWhere(agreementProfiles, {"profileId": Number(id)});
            $scope.agreement = angular.copy(foundAgreement);

            // Get the CMSContent file by id value.
            if ($scope.agreement.CMSContentID) {
                var srcUrl = ContentManagementService.generateFilePath($scope.agreement.CMSContentID);
                var reader = new FileReader();
                reader.onload = function () {
                    $scope.agreement.cmsContentFile = reader.result;

                    $scope.originalAgreement = angular.copy($scope.agreement);
                }
                FileDownloadService.downloadFile(srcUrl, function (blob, fileName) {
                    reader.readAsText(blob);
                    $scope.agreement.cmsContentFile.name = fileName;
                });
            }
        }

        $scope.originalAgreement = angular.copy($scope.agreement);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalAgreement, $scope.agreement);
        };

        var showSuccessMessage = function () {
            notification.flash({
                type: 'success',
                text: $translate.instant('CommonLabels.OperationSuccessful')
            });

            $scope.go('subsystems.businessmanagement.operations.agreements.list');
        };

        $scope.save = function (agreement) {
            var cmsContentFile = agreement.cmsContentFile;

            $scope.updateAgreement($scope.agreementsOrganization, agreement).then(function (response) {
                var cmsContentFileAsBlob = new Blob([cmsContentFile], {type: 'text/plain'});

                var promises = [];

                if (cmsContentFileAsBlob) {
                    // Content creating step
                    promises.push(ContentManagementService.uploadFile(cmsContentFileAsBlob, agreement.Name, agreement.CMSContentID));
                }

                $q.all(promises).then(function () {
                    showSuccessMessage();
                });
            }, function (response) {
                CMPFService.showApiError(response);
            });
        };
    });

})();
