(function () {

    'use strict';

    angular.module('adminportal.products.smsc.operations.translationtables.addresses', [
        'adminportal.products.smsc.operations.translationtables.addresses.contentfiltering',
        'adminportal.products.smsc.operations.translationtables.addresses.translationtest'
    ]);

    var SmscTranslationTablesAddressesOperationsModule = angular.module('adminportal.products.smsc.operations.translationtables.addresses');

    SmscTranslationTablesAddressesOperationsModule.config(function ($stateProvider) {

        // Dest. Address
        $stateProvider.state('products.smsc.operations.translationtables.destaddress', {
            abstract: true,
            url: "/dest-address",
            template: "<div ui-view></div>"
        });
        // Global
        $stateProvider.state('products.smsc.operations.translationtables.destaddress.global', {
            abstract: true,
            url: "/smsc",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "key": "destination",
                "listState": "products.smsc.operations.translationtables.destaddress.global.list",
                "newState": "products.smsc.operations.translationtables.destaddress.global.new",
                "updateState": "products.smsc.operations.translationtables.destaddress.global.update",
                "pageHeaderKey": "Products.SMSC.Operations.TranslationTables.DestAddress.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.TranslationTables.Global.MenuLabel"
            },
            resolve: {
                smppApplications: function () {
                    return [];
                },
                organizations: function () {
                    return {organizations: []};
                }
            }
        }).state('products.smsc.operations.translationtables.destaddress.global.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.html",
            controller: 'SmscTranslationTablesAddressesOperationsCtrl',
            resolve: {
                addressTranslations: function (SmscConfService) {
                    return SmscConfService.getAddressTranslations('destination');
                }
            }
        }).state('products.smsc.operations.translationtables.destaddress.global.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.details.html",
            controller: 'SmscTranslationTablesNewAddressesOperationsCtrl',
            resolve: {
                precedence: function (SmscConfService) {
                    return SmscConfService.getAddressTranslationNextPrecedence('destination');
                }
            }
        }).state('products.smsc.operations.translationtables.destaddress.global.update', {
            url: "/update/:name",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.details.html",
            controller: 'SmscTranslationTablesUpdateAddressesOperationsCtrl',
            resolve: {
                addressTranslation: function ($stateParams, SmscConfService) {
                    var name = $stateParams.name;

                    return SmscConfService.getAddressTranslation('destination', name);
                }
            }
        });
        // Per Application
        $stateProvider.state('products.smsc.operations.translationtables.destaddress.perapplication', {
            abstract: true,
            url: "/per-application",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": false,
                "key": "destination",
                "listState": "products.smsc.operations.translationtables.destaddress.perapplication.list",
                "newState": "products.smsc.operations.translationtables.destaddress.perapplication.new",
                "updateState": "products.smsc.operations.translationtables.destaddress.perapplication.update",
                "pageHeaderKey": "Products.SMSC.Operations.TranslationTables.DestAddress.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.TranslationTables.PerApplication.MenuLabel"
            },
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('products.smsc.operations.translationtables.destaddress.perapplication.list', {
            url: "/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.html",
            controller: 'SmscTranslationTablesAddressesOperationsCtrl',
            resolve: {
                addressTranslations: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;

                    if (appId) {
                        return SmscConfService.getAddressTranslations('destination', appId);
                    }

                    return [];
                }
            }
        }).state('products.smsc.operations.translationtables.destaddress.perapplication.new', {
            url: "/new/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.details.html",
            controller: 'SmscTranslationTablesNewAddressesOperationsCtrl',
            resolve: {
                precedence: function (SmscConfService) {
                    return SmscConfService.getAddressTranslationNextPrecedence('destination');
                }
            }
        }).state('products.smsc.operations.translationtables.destaddress.perapplication.update', {
            url: "/update/{appId:[0-9]*}/:name",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.details.html",
            controller: 'SmscTranslationTablesUpdateAddressesOperationsCtrl',
            resolve: {
                addressTranslation: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;
                    var name = $stateParams.name;

                    return SmscConfService.getAddressTranslation('destination', name, appId);
                }
            }
        });

        // Orig. Address
        $stateProvider.state('products.smsc.operations.translationtables.origaddress', {
            abstract: true,
            url: "/orig-address",
            template: "<div ui-view></div>"
        });
        // Global
        $stateProvider.state('products.smsc.operations.translationtables.origaddress.global', {
            abstract: true,
            url: "/smsc",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "key": "source",
                "listState": "products.smsc.operations.translationtables.origaddress.global.list",
                "newState": "products.smsc.operations.translationtables.origaddress.global.new",
                "updateState": "products.smsc.operations.translationtables.origaddress.global.update",
                "pageHeaderKey": "Products.SMSC.Operations.TranslationTables.OrigAddress.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.TranslationTables.Global.MenuLabel"
            },
            resolve: {
                smppApplications: function () {
                    return [];
                },
                organizations: function () {
                    return {organizations: []};
                }
            }
        }).state('products.smsc.operations.translationtables.origaddress.global.list', {
            url: "",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.html",
            controller: 'SmscTranslationTablesAddressesOperationsCtrl',
            resolve: {
                addressTranslations: function (SmscConfService) {
                    return SmscConfService.getAddressTranslations('source');
                }
            }
        }).state('products.smsc.operations.translationtables.origaddress.global.new', {
            url: "/new",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.details.html",
            controller: 'SmscTranslationTablesNewAddressesOperationsCtrl',
            resolve: {
                precedence: function (SmscConfService) {
                    return SmscConfService.getAddressTranslationNextPrecedence('source');
                }
            }
        }).state('products.smsc.operations.translationtables.origaddress.global.update', {
            url: "/update/:name",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.details.html",
            controller: 'SmscTranslationTablesUpdateAddressesOperationsCtrl',
            resolve: {
                addressTranslation: function ($stateParams, SmscConfService) {
                    var name = $stateParams.name;

                    return SmscConfService.getAddressTranslation('source', name);
                }
            }
        });
        // Per Application
        $stateProvider.state('products.smsc.operations.translationtables.origaddress.perapplication', {
            abstract: true,
            url: "/per-application",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": false,
                "key": "source",
                "listState": "products.smsc.operations.translationtables.origaddress.perapplication.list",
                "newState": "products.smsc.operations.translationtables.origaddress.perapplication.new",
                "updateState": "products.smsc.operations.translationtables.origaddress.perapplication.update",
                "pageHeaderKey": "Products.SMSC.Operations.TranslationTables.OrigAddress.PageHeader",
                "subPageHeaderKey": "Products.SMSC.Operations.TranslationTables.PerApplication.MenuLabel"
            },
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                }
            }
        }).state('products.smsc.operations.translationtables.origaddress.perapplication.list', {
            url: "/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.html",
            controller: 'SmscTranslationTablesAddressesOperationsCtrl',
            resolve: {
                addressTranslations: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;

                    if (appId) {
                        return SmscConfService.getAddressTranslations('source', appId);
                    }

                    return [];
                }
            }
        }).state('products.smsc.operations.translationtables.origaddress.perapplication.new', {
            url: "/new/{appId:[0-9]*}",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.details.html",
            controller: 'SmscTranslationTablesNewAddressesOperationsCtrl',
            resolve: {
                precedence: function (SmscConfService) {
                    return SmscConfService.getAddressTranslationNextPrecedence('source');
                }
            }
        }).state('products.smsc.operations.translationtables.origaddress.perapplication.update', {
            url: "/update/{appId:[0-9]*}/:name",
            templateUrl: "products/smsc/operations/operations.translationtables.addresses.details.html",
            controller: 'SmscTranslationTablesUpdateAddressesOperationsCtrl',
            resolve: {
                addressTranslation: function ($stateParams, SmscConfService) {
                    var appId = $stateParams.appId;
                    var name = $stateParams.name;

                    return SmscConfService.getAddressTranslation('source', name, appId);
                }
            }
        });

    });

    SmscTranslationTablesAddressesOperationsModule.controller('SmscTranslationTablesAddressesOperationsCtrl', function ($scope, $log, $state, $stateParams, $translate, $filter, notification, $uibModal,
                                                                                                                                      UtilService, $timeout, SmscConfService, Restangular, NgTableParams, NgTableService,
                                                                                                                                      addressTranslations, smppApplications, organizations, ReportingExportService) {
        $log.debug('SmscTranslationTablesAddressesOperationsCtrl');

        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.key = $state.current.data.key;
        $scope.listState = $state.current.data.listState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;

        var addressTranslations = Restangular.stripRestangular(addressTranslations);
        var smppApplicationList = Restangular.stripRestangular(smppApplications);
        var organizationList = Restangular.stripRestangular(organizations).organizations;

        // Initialize application list by taking organization and application names.
        $scope.smppApplicationList = _.filter(smppApplicationList, function (smppApplication) {
            smppApplication.organization = _.findWhere(organizationList, {id: smppApplication.organizationId});

            // Preparing the uib-dropdown content ad "<organization name> - <application name>"
            smppApplication.label = (smppApplication.organization ? smppApplication.organization.name + ' - ' : '') + smppApplication.name;

            $log.debug("Found SMPP Application: ", smppApplication, ", Organization: ", smppApplication.organization);

            return true;
        });
        $scope.smppApplicationList = $filter('orderBy')($scope.smppApplicationList, ['organization.name', 'name']);
        $scope.smppApplication = {};

        if ($stateParams.appId || $scope.isGlobal) {
            $scope.showTable = true;
        }

        // Check the if any application selected before and send over URL.
        var selectedSMPPApplication = _.findWhere($scope.smppApplicationList, {id: Number($stateParams.appId)});
        if (selectedSMPPApplication) {
            $scope.smppApplication.selected = selectedSMPPApplication;
        }

        // Change only the application id state parameter.
        $scope.changeSMPPApplication = function (selectedSMPPApplication) {
            $log.debug("Selected SMPP Application: ", selectedSMPPApplication);

            $state.transitionTo($state.$current, {appId: selectedSMPPApplication ? selectedSMPPApplication.id : undefined}, {
                reload: false,
                inherit: false,
                notify: true
            });
        };

        // SMPP translation table list definitions
        $scope.addressTranslationList = {
            list: addressTranslations,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.addressTranslationList.tableParams.settings().$scope.filterText = filterText;
            $scope.addressTranslationList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.addressTranslationList.tableParams.page(1);
            $scope.addressTranslationList.tableParams.reload();
        }, 750);

        $scope.addressTranslationList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "name": 'asc' // initial sorting
            }
        }, {
            total: $scope.addressTranslationList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.addressTranslationList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.addressTranslationList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - SMPP translation table list definitions

        // Opens the content filter management modal.
        $scope.manageContentFilters = function (addressTranslation) {
            $uibModal.open({
                templateUrl: 'products/smsc/operations/operations.translationtables.addresses.contentfiltering.modal.html',
                size: 'lg',
                controller: 'SmscTranslationTablesAddressesContentFilteringOperationsCtrl',
                resolve: {
                    addressTranslationKey: function () {
                        return $scope.key;
                    },
                    addressTranslation: function (SmscConfService) {
                        return SmscConfService.getAddressTranslation($scope.key, addressTranslation.name, $scope.smppApplication.selected ? $scope.smppApplication.selected.id : null);
                    },
                    selectedSMPPApplication: function () {
                        return $scope.smppApplication.selected;
                    }
                }
            });
        };

        // Opens the address translation test form.
        $scope.showAddressTranslationTestForm = function () {
            $uibModal.open({
                templateUrl: 'products/smsc/operations/operations.translationtables.addresses.translationtest.modal.html',
                size: 'lg',
                controller: 'SmscTranslationTablesAddressesTranslationTestOperationsCtrl',
                resolve: {
                    addressTranslationKey: function () {
                        return $scope.key;
                    },
                    selectedSMPPApplication: function () {
                        return $scope.smppApplication.selected;
                    }
                }
            });
        };

        $scope.remove = function (addressTranslation) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Address Translation: ', addressTranslation);

                SmscConfService.deleteAddressTranslation($scope.key, addressTranslation.name, $scope.smppApplication.selected ? $scope.smppApplication.selected.id : null).then(function (response) {
                    $log.debug('Removed Address Translation: ', response);

                    var deletedListItem = _.findWhere($scope.addressTranslationList.list, {
                        name: addressTranslation.name
                    });
                    $scope.addressTranslationList.list = _.without($scope.addressTranslationList.list, deletedListItem);

                    $scope.addressTranslationList.tableParams.reload();

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }, function (response) {
                    $log.debug('Cannot delete Address Translation: ', response);
                });
            });
        };

        $scope.exportRecords = function (key, mimeType, selectedSmppApplication) {
            var srcUrl = '/smsc-gr-rest/configuration/v1/address-translation-matcher/' + key + '/export?response-content-type=' + mimeType;

            if (selectedSmppApplication && selectedSmppApplication.id) {
                srcUrl += '&application-id=' + selectedSmppApplication.id;
            }

            $log.debug('Downloading SMSC address translation matcher records. URL: ', srcUrl);

            ReportingExportService.showReport(srcUrl, mimeType.toUpperCase());
        };

    });

    SmscTranslationTablesAddressesOperationsModule.controller('SmscTranslationTablesNewAddressesOperationsCtrl', function ($scope, $state, $stateParams, $log, $filter, $translate, notification, Restangular,
                                                                                                                                         SmscConfService, SMPP_APPS_NPI, SMPP_APPS_TON, VALID_INVALID, TRANSLATION_TYPES,
                                                                                                                                         precedence) {
        $log.debug('SmscTranslationTablesNewAddressesOperationsCtrl');

        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.key = $state.current.data.key;
        $scope.listState = $state.current.data.listState;

        $scope.SMPP_APPS_NPI = SMPP_APPS_NPI;
        $scope.SMPP_APPS_TON = SMPP_APPS_TON;
        $scope.VALID_INVALID = VALID_INVALID;

        $scope.TRANSLATION_TYPES = TRANSLATION_TYPES;
        if ($scope.key === 'source') {
            $scope.TRANSLATION_TYPES = _.without($scope.TRANSLATION_TYPES, $scope.TRANSLATION_TYPES[2]);
        }

        $scope.addressTranslation = {
            valid: $scope.VALID_INVALID[0],
            digitsRemoveFromBegin: 0,
            digitsRemoveFromEnd: 0,
            digitsToAdd: 1,
            defaultPrefix: '',
            forceDefaultPrefix: false,
            npi: null,
            ton: null,
            priority: precedence.nextPrecedence,
            protocolIdSelection: '',
            protocolId: 0
        };

        if ($scope.key === 'destination') {
            $scope.addressTranslation.forceDefaultPrefix = true;
        }

        $scope.addressTranslation.prefixAdditionStrategy = $scope.TRANSLATION_TYPES[0];

        $scope.save = function (addressTranslation) {
            var addressTranslationItem = {
                "name": addressTranslation.name,
                "priority": addressTranslation.priority,
                "regex": addressTranslation.regex,
                "valid": addressTranslation.valid.value,
                "digitsRemoveFromBegin": addressTranslation.valid.value ? addressTranslation.digitsRemoveFromBegin : 0,
                "digitsRemoveFromEnd": addressTranslation.valid.value ? addressTranslation.digitsRemoveFromEnd : 0,
                "defaultPrefix": addressTranslation.valid.value ? addressTranslation.defaultPrefix : '',
                "digitsToAdd": addressTranslation.valid.value ? addressTranslation.digitsToAdd : 1,
                "ton": (addressTranslation.ton === '' || addressTranslation.ton === null) ? -1 : addressTranslation.ton,
                "npi": (addressTranslation.npi === '' || addressTranslation.npi === null) ? -1 : addressTranslation.npi,
                "protocolId": (addressTranslation.protocolIdSelection === '' || addressTranslation.protocolIdSelection === null) ? -1 : addressTranslation.protocolId
            };

            if (addressTranslation.prefixAdditionStrategy.id === 'TRANSLATE_BY_PREFIX') {
                addressTranslationItem.forceDefaultPrefix = true;
                addressTranslationItem.digitsToAdd = 0;
            } else if (addressTranslation.prefixAdditionStrategy.id === 'TRANSLATE_BY_SOURCE_ADDRESS') {
                addressTranslationItem.forceDefaultPrefix = false;
                addressTranslationItem.defaultPrefix = "";
            } else {
                addressTranslationItem.forceDefaultPrefix = false;
                addressTranslationItem.defaultPrefix = "";
                addressTranslationItem.digitsToAdd = 0;
            }

            SmscConfService.addAddressTranslation($scope.key, addressTranslationItem, $stateParams.appId).then(function (response) {
                $log.debug('Added Address Translation: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.TranslationTables.Messages.AlreadyDefinedError', {
                                name: addressTranslationItem.name
                            });
                        } else {
                            message = apiResponse.errorMsg;
                        }
                    } else {
                        message = $translate.instant('CommonMessages.GenericServerError');
                    }

                    notification({
                        type: 'danger',
                        text: message
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot add Address Translation: ', response);
            });

        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

    SmscTranslationTablesAddressesOperationsModule.controller('SmscTranslationTablesUpdateAddressesOperationsCtrl', function ($scope, $state, $stateParams, $log, $filter, $translate, notification, Restangular,
                                                                                                                                            SmscConfService, addressTranslation, SMPP_APPS_NPI, SMPP_APPS_TON, VALID_INVALID, TRANSLATION_TYPES) {
        $log.debug('SmscTranslationTablesUpdateAddressesOperationsCtrl');

        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.key = $state.current.data.key;
        $scope.listState = $state.current.data.listState;

        $scope.SMPP_APPS_NPI = SMPP_APPS_NPI;
        $scope.SMPP_APPS_TON = SMPP_APPS_TON;
        $scope.VALID_INVALID = VALID_INVALID;

        $scope.TRANSLATION_TYPES = TRANSLATION_TYPES;
        if ($scope.key === 'source') {
            $scope.TRANSLATION_TYPES = _.without($scope.TRANSLATION_TYPES, $scope.TRANSLATION_TYPES[2]);
        }

        $scope.addressTranslation = Restangular.stripRestangular(addressTranslation);
        $scope.addressTranslation.id = $scope.addressTranslation.name;
        $scope.addressTranslation.valid = $scope.addressTranslation.valid ? $scope.VALID_INVALID[0] : $scope.VALID_INVALID[1];

        if ($scope.addressTranslation.forceDefaultPrefix && $scope.addressTranslation.digitsToAdd === 0) {
            $scope.addressTranslation.prefixAdditionStrategy = $scope.TRANSLATION_TYPES[1];
            $scope.addressTranslation.digitsToAdd = 1;
        } else if (!$scope.addressTranslation.forceDefaultPrefix && $scope.addressTranslation.defaultPrefix === '' && $scope.addressTranslation.digitsToAdd > 0) {
            $scope.addressTranslation.prefixAdditionStrategy = $scope.TRANSLATION_TYPES[2];
        } else {
            $scope.addressTranslation.prefixAdditionStrategy = $scope.TRANSLATION_TYPES[0];
            $scope.addressTranslation.digitsToAdd = 1;
        }

        if ($scope.addressTranslation.protocolId === -1) {
            $scope.addressTranslation.protocolIdSelection = '';
            $scope.addressTranslation.protocolId = 0;
        } else {
            $scope.addressTranslation.protocolIdSelection = 'change';
        }

        $scope.addressTranslationCodeOriginal = angular.copy($scope.addressTranslation);
        $scope.addressTranslationNotChanged = function () {
            return angular.equals($scope.addressTranslation, $scope.addressTranslationCodeOriginal);
        };

        $scope.save = function (addressTranslation) {
            var addressTranslationItem = {
                "name": $scope.addressTranslationCodeOriginal.name,
                "priority": addressTranslation.priority,
                "regex": addressTranslation.regex,
                "valid": addressTranslation.valid.value,
                "digitsRemoveFromBegin": addressTranslation.valid.value ? addressTranslation.digitsRemoveFromBegin : 0,
                "digitsRemoveFromEnd": addressTranslation.valid.value ? addressTranslation.digitsRemoveFromEnd : 0,
                "defaultPrefix": addressTranslation.valid.value ? addressTranslation.defaultPrefix : '',
                "digitsToAdd": addressTranslation.valid.value ? addressTranslation.digitsToAdd : 1,
                "ton": (addressTranslation.ton === '' || addressTranslation.ton === null) ? -1 : addressTranslation.ton,
                "npi": (addressTranslation.npi === '' || addressTranslation.npi === null) ? -1 : addressTranslation.npi,
                "protocolId": (addressTranslation.protocolIdSelection === '' || addressTranslation.protocolIdSelection === null) ? -1 : addressTranslation.protocolId
            };

            if (addressTranslation.prefixAdditionStrategy.id === 'TRANSLATE_BY_PREFIX') {
                addressTranslationItem.forceDefaultPrefix = true;
                addressTranslationItem.digitsToAdd = 0;
            } else if (addressTranslation.prefixAdditionStrategy.id === 'TRANSLATE_BY_SOURCE_ADDRESS') {
                addressTranslationItem.forceDefaultPrefix = false;
                addressTranslationItem.defaultPrefix = "";
            } else {
                addressTranslationItem.forceDefaultPrefix = false;
                addressTranslationItem.defaultPrefix = "";
                addressTranslationItem.digitsToAdd = 0;
            }

            SmscConfService.updateAddressTranslation($scope.key, addressTranslationItem, $stateParams.appId).then(function (response) {
                $log.debug('Updated Address Translation: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.TranslationTables.Messages.AlreadyDefinedError', {
                                name: addressTranslationItem.name
                            });
                        } else {
                            message = apiResponse.errorMsg;
                        }
                    } else {
                        message = $translate.instant('CommonMessages.GenericServerError');
                    }

                    notification({
                        type: 'danger',
                        text: message
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                        reload: true,
                        inherit: true,
                        notify: true
                    });
                }
            }, function (response) {
                $log.debug('Cannot update Address Translation: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {appId: $stateParams.appId}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };
    });

})();
