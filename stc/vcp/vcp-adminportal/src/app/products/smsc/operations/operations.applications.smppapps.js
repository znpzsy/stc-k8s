(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.applications.smppapps', [
        'adminportal.products.smsc.operations.applications.smppapps.liveconnections',
        'adminportal.products.smsc.operations.applications.smppapps.blackhourrules'
    ]);

    var SmscApplicationsSMPPAppsOperationsModule = angular.module('adminportal.products.smsc.operations.applications.smppapps');

    SmscApplicationsSMPPAppsOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('products.smsc.operations.applications.smppapps', {
            url: "/smppapps",
            templateUrl: "products/smsc/operations/operations.applications.smppapps.html",
            controller: 'SmscApplicationsSMPPAppsOperationsCtrl',
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('products.smsc.operations.applications.smppapps-new', {
            url: "/smppapps/new",
            templateUrl: "products/smsc/operations/operations.applications.smppapps.details.html",
            controller: 'SmscApplicationsNewSMPPAppOperationsCtrl'
        }).state('products.smsc.operations.applications.smppapps-update', {
            url: "/smppapps/update/:appId/:organizationId",
            templateUrl: "products/smsc/operations/operations.applications.smppapps.details.html",
            controller: function ($scope, $stateParams, $controller, SmscProvService, Restangular, smppApplication, organization) {
                var appId = $stateParams.appId;

                SmscProvService.getSmppApplicationQuota(appId).then(function (response) {
                    var smppApplicationQuota = Restangular.stripRestangular(response);

                    $controller('SmscApplicationsUpdateSMPPAppOperationsCtrl', {
                        $scope: $scope,
                        smppApplication: smppApplication,
                        organization: organization,
                        smppApplicationQuota: smppApplicationQuota
                    });
                });
            },
            resolve: {
                smppApplication: function (SmscProvService, $stateParams) {
                    var appId = $stateParams.appId;
                    return SmscProvService.getSmppApplication(appId);
                },
                organization: function (SmscProvService, CMPFService, $stateParams, $q, $log, Restangular, DEFAULT_REST_QUERY_LIMIT) {
                    var deferred = $q.defer();

                    var organizationId = $stateParams.organizationId;
                    CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT).then(function (organizationsResponse) {
                        var _organizationsResponse = Restangular.stripRestangular(organizationsResponse);
                        var organizations = _organizationsResponse.organizations;
                        var organization = _.findWhere(organizations, {"id": Number(organizationId)});

                        $log.debug('Found Organization: ', organization);

                        deferred.resolve(organization);
                    }, function (response) {
                        $log.debug('Cannot read Organizations. Error: ', response);
                        deferred.reject(response);
                    });

                    return deferred.promise;
                }
            }
        });

    });

    SmscApplicationsSMPPAppsOperationsModule.controller('SmscApplicationsSMPPAppsOperationsCommonCtrl', function ($scope, $log, $uibModal) {

        $log.debug("SmscApplicationsSMPPAppsOperationsCommonCtrl");

        // Tags
        $scope.showTags = function () {
            if (!$scope.selectedTags) {
                $scope.selectedTags = [];
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'products/smsc/operations/operations.applications.smppapps.tags.modal.html',
                controller: function ($scope, $uibModalInstance, selectedTags, appParameter, SMPP_APPS_TAGS) {
                    $scope.selected = {
                        tag: null
                    };

                    $scope.selectedTags = selectedTags;
                    $scope.app = appParameter;

                    $scope.SMPP_APPS_TAGS = SMPP_APPS_TAGS;

                    $scope.$watch('selected.tagName', function (newVal, oldVal) {
                        $scope.form.tagName.$setValidity('availabilityCheck', true);

                        if (!angular.equals(newVal, oldVal)) {
                            // Check availability.
                            var foundTag = ($scope.selectedTags.indexOf(newVal) > -1);

                            $scope.form.tagName.$setValidity('availabilityCheck', !foundTag);
                        }
                    });

                    $scope.ok = function (selected) {
                        $uibModalInstance.close(selected);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                size: 'md',
                resolve: {
                    selectedTags: function () {
                        return angular.copy($scope.selectedTags);
                    },
                    appParameter: function () {
                        return $scope.app;
                    }
                }
            });

            modalInstance.result.then(function (selected) {
                var tag = selected.tagName + '=' + selected.tagValue;
                $scope.selectedTags.push(tag);

                $scope.selectedTags = _.uniq($scope.selectedTags, true);
            }, function () {
            });
        };

        $scope.removeTag = function (tag) {
            var index = _.indexOf($scope.selectedTags, tag);
            if (index != -1) {
                $scope.selectedTags.splice(index, 1);
            }
        };

    });

    SmscApplicationsSMPPAppsOperationsModule.controller('SmscApplicationsSMPPAppsOperationsCtrl', function ($scope, $state, $log, $filter, $uibModal, $translate, notification, Restangular, UtilService,
                                                                                                            NgTableParams, NgTableService, SmscProvService, smppApplications, organizations, ReportingExportService) {
        $log.debug('SmscApplicationsSMPPAppsOperationsCtrl');

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'id',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.TableColumns.Id'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.TableColumns.AppName'
                },
                {
                    fieldName: 'organization.name',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.TableColumns.Organization'
                },
                {
                    fieldName: 'state',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.TableColumns.State'
                },
                {
                    fieldName: 'systemId',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.FormFields.SystemId.Label'
                },
                {
                    fieldName: 'password',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.FormFields.Password.Label'
                },
                {
                    fieldName: 'systemType',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.FormFields.SystemType.Label'
                },
                {
                    fieldName: 'maxConnections',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.FormFields.MaxConnections.Label'
                },
                {
                    fieldName: 'chargingState',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.Charging.ChargingState'
                },
                {
                    fieldName: 'incomingChargingState',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.Charging.IncomingChargingState'
                },
                {
                    fieldName: 'billingAddress',
                    headerKey: 'Products.SMSC.Operations.Applications.SmppApps.Charging.BillingAddress'
                }
            ]
        };

        var smppApplicationList = Restangular.stripRestangular(smppApplications);
        organizations = Restangular.stripRestangular(organizations).organizations;

        // Finds suitable organizations for each smpp applications and set to it.
        _.each(smppApplicationList, function (smppApplication) {
            smppApplication.organization = _.findWhere(organizations, {"id": Number(smppApplication.organizationId)});
        });

        // SMPP Application list
        $scope.smppApplicationList = {
            list: smppApplicationList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.smppApplicationList.tableParams.settings().$scope.filterText = filterText;
            $scope.smppApplicationList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.smppApplicationList.tableParams.page(1);
            $scope.smppApplicationList.tableParams.reload();
        }, 750);

        $scope.smppApplicationList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "name": 'asc' // initial sorting
            }
        }, {
            total: $scope.smppApplicationList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.smppApplicationList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.smppApplicationList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP Application list definitions

        $scope.showLiveConnections = function (smppApplication) {
            $uibModal.open({
                templateUrl: 'products/smsc/operations/operations.applications.smppapps.liveconnections.modal.html',
                size: 'lg',
                controller: function ($scope, $uibModalInstance, $controller, liveSmppConnections) {
                    $scope.app = smppApplication;

                    $controller('SmscApplicationsSMPPLiveConnectionsOperationsCtrl', {
                        $scope: $scope,
                        $uibModalInstance: $uibModalInstance,
                        liveSmppConnections: liveSmppConnections
                    });
                },
                resolve: {
                    liveSmppConnections: function (SmscProvService) {
                        return SmscProvService.getLiveSmppConnections(smppApplication.id);
                    }
                }
            });
        };

        $scope.remove = function (app) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Smpp Application: ', app);

                SmscProvService.deleteSmppApplication(app).then(function (response) {
                    $log.debug('Removed Smpp Application: ', response);

                    var apiResponse = Restangular.stripRestangular(response);

                    if (apiResponse.errorCode) {
                        notification({
                            type: 'danger',
                            text: $translate.instant('CommonMessages.ApiError', {
                                errorCode: apiResponse.errorCode,
                                errorText: apiResponse.errorMsg
                            })
                        });
                    } else {
                        var deletedListItem = _.findWhere($scope.smppApplicationList.list, {id: app.id});
                        $scope.smppApplicationList.list = _.without($scope.smppApplicationList.list, deletedListItem);

                        $scope.smppApplicationList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot delete Smpp Application: ', response);
                });
            });
        };
    });

    SmscApplicationsSMPPAppsOperationsModule.controller('SmscApplicationsNewSMPPAppOperationsCtrl', function ($scope, $log, $q, $controller, $state, notification, $translate, $uibModal, Restangular, SmscProvService,
                                                                                                              STATES, SMPP_APPS_QUOTA_PERIODS, SMPP_APPS_DIRECTIONS, SMPP_APPS_SERVICE_TYPES,
                                                                                                              SMPP_APPS_TRANSACTION_MODES, SMPP_APPS_ACCESS_PROTOCOLS, SMPP_APPS_MAX_CONNECTION_CHECK_POLICIES) {
        $log.debug("SmscApplicationsNewSMPPAppOperationsCtrl");

        $controller('SmscApplicationsSMPPAppsOperationsCommonCtrl', {$scope: $scope});

        $scope.STATES = STATES;
        $scope.SMPP_APPS_QUOTA_PERIODS = SMPP_APPS_QUOTA_PERIODS;
        $scope.SMPP_APPS_DIRECTIONS = SMPP_APPS_DIRECTIONS;
        $scope.SMPP_APPS_SERVICE_TYPES = SMPP_APPS_SERVICE_TYPES;
        $scope.SMPP_APPS_TRANSACTION_MODES = SMPP_APPS_TRANSACTION_MODES;
        $scope.SMPP_APPS_ACCESS_PROTOCOLS = SMPP_APPS_ACCESS_PROTOCOLS;
        $scope.SMPP_APPS_MAX_CONNECTION_CHECK_POLICIES = SMPP_APPS_MAX_CONNECTION_CHECK_POLICIES;

        // Set default values
        $scope.app = {
            state: $scope.STATES[0],
            direction: $scope.SMPP_APPS_DIRECTIONS[0],
            defaultSourceAddress: '',
            accessProtocol: SMPP_APPS_ACCESS_PROTOCOLS[0],
            defaultSourceNpi: 'ITU_UNKNOWN_ANSI_UNKNOWN',
            defaultSourceTon: 'ITU_UNKNOWN_ANSI_NATIONAL',
            inputWindowSize: 1000,
            outputWindowSize: 1000,
            maxConnections: 2,
            //maxConnectionsCheckPolicy: 'PER_HOST',
            maxConnectionsCheckPolicy: SMPP_APPS_MAX_CONNECTION_CHECK_POLICIES[0],
            transactionResponseTimeout: 20000,
            maxPriorityLevelForRetry: 0,
            sourceAddressOverride: false,
            sourceAddressValidation: false,
            allowSubmitMulti: false,
            defaultTrxMode: SMPP_APPS_TRANSACTION_MODES[2],
            submitMultiMaxDests: 0,
            maxMessageLength: 2048,
            maxNumberOfSegments: 26,
            enableKeywordScreening: true,
            tag: '',
            allowedSourceAddresses: '',
            allowedPids: '',
            allowedDcs: '',
            allowedSmppOperations: '',
            enableMsgReassembly: false,
            enableIncomingMsgReassembly: false,
            msgReassemblyTimeout: 3000,
            smppApplicationQuota: {
                enabled: false,
                limit: 1000,
                period: 1
            },
            chargingState: $scope.STATES[0], // ACTIVE
            incomingChargingState: $scope.STATES[0], // ACTIVE
            billingAddress: ''
        };

        $scope.openOrganizations = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.selectedOrganization ? $scope.selectedOrganization.organization : undefined;
                    },
                    itemName: function () {
                        return $scope.app.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByType(0, DEFAULT_REST_QUERY_LIMIT, 'NetworkOperator,Partner');
                    },
                    organizationsModalTitleKey: function () {
                        return 'Products.SMSC.Operations.Applications.SmppApps.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selectedOrganization = selectedItem;
                $scope.app.organizationId = selectedItem.organization.id;
            }, function () {
                //
            });
        };

        $scope.save = function (application) {
            var applicationItem = {
                "name": application.name,
                "accessProtocol": application.accessProtocol,
                "descriptiveText": application.descriptiveText,
                "organizationId": application.organizationId,
                "state": application.state,
                "systemId": application.systemId,
                "password": application.password,
                "systemType": application.systemType,
                "defaultServiceType": application.defaultServiceType,
                "direction": application.direction,
                "inputWindowSize": application.inputWindowSize,
                "maxConnections": application.maxConnections,
                "transactionResponseTimeout": application.transactionResponseTimeout,
                "maxPriorityLevelForRetry": application.maxPriorityLevelForRetry,
                "maxMessageLength": application.maxMessageLength,
                "maxNumberOfSegments": application.maxNumberOfSegments,
                "enableKeywordScreening": application.enableKeywordScreening,
                // Other hidden attributes
                "defaultSourceAddress": application.defaultSourceAddress,
                "defaultSourceNpi": application.defaultSourceNpi,
                "defaultSourceTon": application.defaultSourceTon,
                "outputWindowSize": application.outputWindowSize,
                "sourceAddressOverride": application.sourceAddressOverride,
                "sourceAddressValidation": application.sourceAddressValidation,
                "allowSubmitMulti": application.allowSubmitMulti,
                "defaultTrxMode": application.defaultTrxMode,
                "submitMultiMaxDests": application.submitMultiMaxDests,
                "maxConnectionsCheckPolicy": application.maxConnectionsCheckPolicy,
                "allowedSourceAddresses": application.allowedSourceAddresses,
                "allowedPids": application.allowedPids,
                "allowedDcs": application.allowedDcs,
                "allowedSmppOperations": application.allowedSmppOperations,
                "checkOnAntispam": application.checkOnAntispam,
                "enableMsgReassembly": application.enableMsgReassembly,
                "enableIncomingMsgReassembly": application.enableIncomingMsgReassembly,
                "msgReassemblyTimeout": application.msgReassemblyTimeout,
                // Charging
                "chargingState": application.chargingState,
                "incomingChargingState": application.incomingChargingState,
                "billingAddress": application.billingAddress
            };

            if ($scope.selectedTags) {
                applicationItem.tag = $scope.selectedTags.join(',');
            }

            var deferred = $q.defer();

            SmscProvService.addSmppApplication(applicationItem).then(function (response) {
                $log.debug('Added Smpp Application: ', response);

                var smppApplicationResponse = Restangular.stripRestangular(response);
                if (smppApplicationResponse.errorCode) {
                    deferred.reject({
                        message: 'Cannot add Smpp Application.',
                        result: response
                    });
                } else {
                    var newAppId = smppApplicationResponse.id;

                    // Quota preferences creating
                    if (application.smppApplicationQuota.enabled) {
                        var smppApplicationQuotaItem = {
                            "limit": application.smppApplicationQuota.limit,
                            "period": application.smppApplicationQuota.period
                        };

                        SmscProvService.createSmppApplicationQuota(newAppId, smppApplicationQuotaItem).then(function () {
                            deferred.resolve();
                        }, function () {
                            deferred.resolve();
                        });
                    } else {
                        deferred.resolve();
                    }
                }
            }, function (response) {
                deferred.reject({
                    message: 'Cannot add Smpp Application.',
                    result: response
                });
            });

            // Listen result of the below two nested update requests.
            deferred.promise.then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go('products.smsc.operations.applications.smppapps');
            }, function (response) {
                $log.debug('Error occurred on creating SMPP application: ', response);

                // If there is an error message appears a notification bar.
                if (response.result.errorCode === 500 && response.result.errorMsg) {
                    if (response.result.errorMsg.indexOf('already') > -1) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.SMSC.Operations.Applications.SmppApps.Messages.SMPPAppAlreadyDefinedError', {
                                name: application.name
                            })
                        });
                    } else {
                        notification({
                            type: 'warning',
                            text: response.result.errorMsg
                        });
                    }
                }
            });
        };

        $scope.cancel = function () {
            $state.go('products.smsc.operations.applications.smppapps');
        };

    });

    SmscApplicationsSMPPAppsOperationsModule.controller('SmscApplicationsUpdateSMPPAppOperationsCtrl', function ($scope, $log, $q, $controller, notification, $translate, $uibModal, $state, Restangular, SmscProvService,
                                                                                                                 smppApplication, organization, smppApplicationQuota, STATES, SMPP_APPS_QUOTA_PERIODS, SMPP_APPS_DIRECTIONS,
                                                                                                                 SMPP_APPS_SERVICE_TYPES, SMPP_APPS_TRANSACTION_MODES, SMPP_APPS_ACCESS_PROTOCOLS, SMPP_APPS_MAX_CONNECTION_CHECK_POLICIES) {
        $log.debug("SmscApplicationsUpdateSMPPAppOperationsCtrl");

        $controller('SmscApplicationsSMPPAppsOperationsCommonCtrl', {$scope: $scope});

        $scope.STATES = STATES;
        $scope.SMPP_APPS_QUOTA_PERIODS = SMPP_APPS_QUOTA_PERIODS;
        $scope.SMPP_APPS_DIRECTIONS = SMPP_APPS_DIRECTIONS;
        $scope.SMPP_APPS_SERVICE_TYPES = SMPP_APPS_SERVICE_TYPES;
        $scope.SMPP_APPS_TRANSACTION_MODES = SMPP_APPS_TRANSACTION_MODES;
        $scope.SMPP_APPS_ACCESS_PROTOCOLS = SMPP_APPS_ACCESS_PROTOCOLS;
        $scope.SMPP_APPS_MAX_CONNECTION_CHECK_POLICIES = SMPP_APPS_MAX_CONNECTION_CHECK_POLICIES;

        // Application form is initializing
        $scope.app = Restangular.stripRestangular(smppApplication);

        if ($scope.app && $scope.app.tag) {
            $scope.selectedTags = $scope.app.tag.split(/,|\:|\;|\//);

            $scope.selectedTags = _.sortBy($scope.selectedTags);
        }

        // Quota preferences form is initializing
        if (!_.isEmpty(smppApplicationQuota) && !_.isUndefined(smppApplicationQuota)) {
            smppApplicationQuota = Restangular.stripRestangular(smppApplicationQuota);

            $scope.app.smppApplicationQuota = {
                enabled: true,
                limit: smppApplicationQuota.limit,
                period: smppApplicationQuota.period
            };
        } else {
            $scope.app.smppApplicationQuota = {
                enabled: false,
                limit: 1000,
                period: 1
            };
        }

        $scope.selectedOrganization = {organization: organization};

        $scope.originalApp = angular.copy($scope.app);
        $scope.originalSelectedTags = angular.copy($scope.selectedTags);
        $scope.isNotChanged = function () {
            return angular.equals($scope.app, $scope.originalApp) &&
                angular.equals($scope.selectedTags, $scope.originalSelectedTags);
        };

        $scope.openOrganizations = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.organizations.html',
                controller: 'OrganizationsModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    organizationParameter: function () {
                        return $scope.selectedOrganization ? $scope.selectedOrganization.organization : undefined;
                    },
                    itemName: function () {
                        return $scope.app.name;
                    },
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsByType(0, DEFAULT_REST_QUERY_LIMIT, 'NetworkOperator,Partner');
                    },
                    organizationsModalTitleKey: function () {
                        return 'Products.SMSC.Operations.Applications.SmppApps.OrganizationsModalTitle';
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $scope.selectedOrganization = selectedItem;
                $scope.app.organizationId = selectedItem.organization.id;
            }, function () {
                //
            });
        };

        $scope.save = function (application) {
            var applicationItem = {
                "id": $scope.originalApp.id,
                "name": $scope.originalApp.name,
                // Editable attributes.
                "accessProtocol": application.accessProtocol,
                "descriptiveText": application.descriptiveText,
                "organizationId": application.organizationId,
                "state": application.state,
                "systemId": application.systemId,
                "password": application.password,
                "systemType": application.systemType,
                "defaultServiceType": application.defaultServiceType,
                "direction": application.direction,
                "inputWindowSize": application.inputWindowSize,
                "maxConnections": application.maxConnections,
                "transactionResponseTimeout": application.transactionResponseTimeout,
                "maxPriorityLevelForRetry": application.maxPriorityLevelForRetry,
                "maxMessageLength": application.maxMessageLength,
                "maxNumberOfSegments": application.maxNumberOfSegments,
                "enableKeywordScreening": application.enableKeywordScreening,
                // Other hidden attributes
                "defaultSourceAddress": application.defaultSourceAddress,
                "defaultSourceNpi": application.defaultSourceNpi,
                "defaultSourceTon": application.defaultSourceTon,
                "outputWindowSize": application.outputWindowSize,
                "sourceAddressOverride": application.sourceAddressOverride,
                "sourceAddressValidation": application.sourceAddressValidation,
                "allowSubmitMulti": application.allowSubmitMulti,
                "defaultTrxMode": application.defaultTrxMode,
                "submitMultiMaxDests": application.submitMultiMaxDests,
                "maxConnectionsCheckPolicy": application.maxConnectionsCheckPolicy,
                "allowedSourceAddresses": application.allowedSourceAddresses,
                "allowedPids": application.allowedPids,
                "allowedDcs": application.allowedDcs,
                "allowedSmppOperations": application.allowedSmppOperations,
                "checkOnAntispam": application.checkOnAntispam,
                "enableMsgReassembly": application.enableMsgReassembly,
                "enableIncomingMsgReassembly": application.enableIncomingMsgReassembly,
                "msgReassemblyTimeout": application.msgReassemblyTimeout,
                // Charging
                "chargingState": application.chargingState,
                "incomingChargingState": application.incomingChargingState,
                "billingAddress": application.billingAddress
            };

            if ($scope.selectedTags) {
                applicationItem.tag = $scope.selectedTags.join(',');
            }

            var deferred = $q.defer();

            SmscProvService.updateSmppApplication(applicationItem).then(function (response) {
                $log.debug('Updated Smpp Application: ', response);

                var smppApplicationResponse = Restangular.stripRestangular(response);
                if (smppApplicationResponse.errorCode) {
                    deferred.reject(smppApplicationResponse);
                } else {
                    var newAppId = smppApplicationResponse.id;

                    // Quota preferences updating
                    if (application.smppApplicationQuota.enabled) {
                        var smppApplicationQuotaItem = {
                            "limit": application.smppApplicationQuota.limit,
                            "period": application.smppApplicationQuota.period
                        };

                        SmscProvService.updateSmppApplicationQuota(newAppId, smppApplicationQuotaItem).then(function () {
                            deferred.resolve();
                        }, function () {
                            deferred.resolve();
                        });
                    } else {
                        SmscProvService.deleteSmppApplicationQuota(newAppId).then(function () {
                            deferred.resolve();
                        }, function () {
                            deferred.resolve();
                        });
                    }
                }
            }, function (response) {
                deferred.reject({
                    message: 'Cannot add Smpp Application',
                    result: response
                });
            });

            // Listen result of the below two nested update requests.
            deferred.promise.then(function (response) {
                notification.flash({
                    type: 'success',
                    text: $translate.instant('CommonLabels.OperationSuccessful')
                });

                $state.go('products.smsc.operations.applications.smppapps');
            }, function (response) {
                $log.debug('Error occurred: ', response);

                // If there is an error message appears a notification bar.
                if (response.errorCode === 500 && response.errorMsg) {
                    if (response.errorMsg.indexOf('already') > -1) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('Products.SMSC.Operations.Applications.SmppApps.Messages.SMPPAppAlreadyDefinedError', {
                                name: application.name
                            })
                        });
                    } else {
                        notification({
                            type: 'warning',
                            text: response.errorMsg
                        });
                    }
                }
            });
        };

        $scope.cancel = function () {
            $state.go('products.smsc.operations.applications.smppapps');
        };

    });

})();
