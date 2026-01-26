(function () {

    'use strict';

    angular.module('adminportal.products.smsc.message-templates.message-templates', []);

    var SmscMessageTemplatesOperationsModule = angular.module('adminportal.products.smsc.message-templates.message-templates');

    SmscMessageTemplatesOperationsModule.config(function ($stateProvider) {

        var getTemplatesResolve = ['$stateParams', 'SmscConfService', function ($stateParams, SmscConfService) {
            var appId = $stateParams.appId;
            var languageCode = $stateParams.languageCode;

            return SmscConfService.getMessageTemplatesByLanguageCode(languageCode, appId);
        }];

        $stateProvider.state('products.smsc.message-templates.message-templates', {
            abstract: true,
            url: "/message-templates",
            template: "<div ui-view></div>"
        }).state('products.smsc.message-templates.message-templates.global', {
            abstract: true,
            url: "/smsc",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": true,
                "listState": "products.smsc.message-templates.message-templates.global.list",
                "newState": "products.smsc.message-templates.message-templates.global.new",
                "updateState": "products.smsc.message-templates.message-templates.global.update",
                "pageHeaderKey": "Products.SMSC.Operations.MessageTemplates.Global.PageHeader",
                "detailPageHeaderKey": "Products.SMSC.Operations.MessageTemplates.GlobalDetails.PageHeader"
            },
            resolve: {
                smppApplications: function () {
                    return [];
                },
                organizations: function () {
                    return {organizations: []};
                },
                languages: function (SmscConfService) {
                    return SmscConfService.getLanguages();
                }
            }
        }).state('products.smsc.message-templates.message-templates.global.list', {
            url: "/:languageCode",
            templateUrl: "products/smsc/message-templates/operations.message-templates.html",
            controller: 'SmscMessageTemplateOperationsCtrl'
        }).state('products.smsc.message-templates.message-templates.global.new', {
            url: "/new/:languageCode",
            templateUrl: "products/smsc/message-templates/operations.message-templates.details.html",
            controller: 'SmscNewMessageTemplateOperationsCtrl',
            resolve: {
                templates: getTemplatesResolve
            }
        }).state('products.smsc.message-templates.message-templates.global.update', {
            url: "/update/:languageCode/{id:[0-9]*}",
            templateUrl: "products/smsc/message-templates/operations.message-templates.details.html",
            controller: 'SmscUpdateMessageTemplateOperationsCtrl',
            resolve: {
                templates: getTemplatesResolve
            }
        });

        $stateProvider.state('products.smsc.message-templates.message-templates.per-application', {
            abstract: true,
            url: "/per-application/templates",
            template: "<div ui-view></div>",
            data: {
                "isGlobal": false,
                "listState": "products.smsc.message-templates.message-templates.per-application.list",
                "newState": "products.smsc.message-templates.message-templates.per-application.new",
                "updateState": "products.smsc.message-templates.message-templates.per-application.update",
                "pageHeaderKey": "Products.SMSC.Operations.MessageTemplates.PerApplication.PageHeader",
                "detailPageHeaderKey": "Products.SMSC.Operations.MessageTemplates.PerApplicationDetails.PageHeader"
            },
            resolve: {
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                },
                organizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                    return CMPFService.getAllOrganizations(0, DEFAULT_REST_QUERY_LIMIT);
                },
                languages: function (SmscConfService) {
                    return SmscConfService.getLanguages();
                }
            }
        }).state('products.smsc.message-templates.message-templates.per-application.list', {
            url: "/{appId:[0-9]*}/:languageCode",
            templateUrl: "products/smsc/message-templates/operations.message-templates.html",
            controller: 'SmscMessageTemplateOperationsCtrl'
        }).state('products.smsc.message-templates.message-templates.per-application.new', {
            url: "/new/{appId:[0-9]*}/:languageCode",
            templateUrl: "products/smsc/message-templates/operations.message-templates.details.html",
            controller: 'SmscNewMessageTemplateOperationsCtrl',
            resolve: {
                templates: getTemplatesResolve,
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                }
            }
        }).state('products.smsc.message-templates.message-templates.per-application.update', {
            url: "/update/{appId:[0-9]*}/:languageCode/{id:[0-9]*}",
            templateUrl: "products/smsc/message-templates/operations.message-templates.details.html",
            controller: 'SmscUpdateMessageTemplateOperationsCtrl',
            resolve: {
                templates: getTemplatesResolve,
                smppApplications: function (SmscProvService) {
                    return SmscProvService.getAllSMPPApplications();
                }
            }
        });

    });

    SmscMessageTemplatesOperationsModule.controller('SmscMessageTemplateOperationsCtrl', function ($scope, $state, $q, $stateParams, $log, $filter, $uibModal, $translate, notification,
                                                                                                         UtilService, Restangular, NgTableParams, NgTableService, SmscConfService,
                                                                                                         DateTimeConstants, smppApplications, organizations, languages) {
        $log.debug('SmscMessageTemplateOperationsCtrl');

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;
        $scope.newState = $state.current.data.newState;
        $scope.updateState = $state.current.data.updateState;
        $scope.templatesState = $state.current.data.templatesState;
        $scope.showTable = false;

        // Initialize application list by taking organization and application names.
        var smppApplicationList = Restangular.stripRestangular(smppApplications);
        var organizationList = Restangular.stripRestangular(organizations).organizations;
        $scope.smppApplicationList = _.filter(smppApplicationList, function (smppApplication) {
            smppApplication.organization = _.findWhere(organizationList, {id: smppApplication.organizationId});

            // Preparing the uib-dropdown error code as "<organization name> - <application name>"
            smppApplication.label = (smppApplication.organization ? smppApplication.organization.name + ' - ' : '') + smppApplication.name;

            $log.debug("Found SMPP Application: ", smppApplication, ", Organization: ", smppApplication.organization);

            return true;
        });
        $scope.smppApplicationList = $filter('orderBy')($scope.smppApplicationList, ['organization.name', 'name']);
        $scope.smppApplication = {};

        // Initialize language list.
        $scope.languageList = Restangular.stripRestangular(languages);
        _.each($scope.languageList, function (language) {
            language.label = language.code + ' (' + language.name + ')';
        });
        $scope.language = {};

        var isShowTable = function (selectedSMPPApplicationId, selectedLanguageCode) {
            return ((!_.isUndefined(selectedSMPPApplicationId) || $scope.isGlobal) && !_.isUndefined(selectedLanguageCode));
        };

        var getMessageTemplatesByLanguageCode = function (selectedSMPPApplicationId, selectedLanguageCode) {
            selectedSMPPApplicationId = (s.isBlank(selectedSMPPApplicationId) ? undefined : selectedSMPPApplicationId);
            selectedLanguageCode = (s.isBlank(selectedLanguageCode) ? undefined : selectedLanguageCode);

            var deferred = $q.defer();
            if (isShowTable(selectedSMPPApplicationId, selectedLanguageCode)) {
                SmscConfService.getMessageTemplatesByLanguageCode(selectedLanguageCode, selectedSMPPApplicationId).then(function (response) {
                    $scope.templateList.list = Restangular.stripRestangular(response);

                    _.each($scope.templateList.list, function (template) {
                        template.languageLabel = $scope.language.selected.label;
                        if (!_.isEmpty($scope.smppApplication.selected)) {
                            template.applicationLabel = $scope.smppApplication.selected.label;
                        }
                    });

                    $scope.templateList.tableParams.page(1);
                    $scope.templateList.tableParams.reload();

                    deferred.resolve();
                }, function (response) {
                    $log.debug('Cannot read templates by language code: ', selectedLanguageCode, ', response: ', response);
                    deferred.resolve();
                });
            } else {
                deferred.reject(false);
            }

            return deferred.promise;
        };

        $scope.findTemplates = function (selectedSMPPApplication, selectedLanguage) {
            $log.debug("Selected SMPP Application: ", selectedSMPPApplication, ", Language: ", selectedLanguage);

            if (!selectedSMPPApplication && !selectedLanguage) {
                $scope.showTable = false;

                return;
            }

            var selectedSMPPApplicationId = selectedSMPPApplication ? selectedSMPPApplication.id : undefined;
            var selectedLanguageCode = selectedLanguage ? selectedLanguage.code : undefined;

            var params = {
                languageCode: selectedLanguageCode
            };

            if (!$scope.isGlobal) {
                params.appId = selectedSMPPApplicationId;
            }

            $state.transitionTo($state.$current, params, {
                reload: false,
                inherit: false,
                notify: true
            });
        };

        // Check the if any application selected before.
        var selectedSMPPApplication = _.findWhere($scope.smppApplicationList, {id: Number($stateParams.appId)});
        if (selectedSMPPApplication) {
            $scope.smppApplication.selected = selectedSMPPApplication;
        }

        // Check the if any language selected before.
        var selectedLanguage = _.findWhere($scope.languageList, {code: $stateParams.languageCode});
        if (selectedLanguage) {
            $scope.language.selected = selectedLanguage;
        }

        // Get templates if smpp application and/or language selected already.
        getMessageTemplatesByLanguageCode($stateParams.appId, $stateParams.languageCode).then(function () {
            $scope.showTable = true;
        }, function () {
            $scope.showTable = false;
        });

        // Export options
        $scope.exportOptions = {columns: []};
        $scope.exportOptions.columns.push({
            fieldName: 'id',
            headerKey: 'Products.SMSC.Operations.MessageTemplates.TableColumns.Id'
        });
        $scope.exportOptions.columns.push({
            fieldName: 'template',
            headerKey: 'Products.SMSC.Operations.MessageTemplates.TableColumns.Template'
        });
        $scope.exportOptions.columns.push({
            fieldName: 'languageLabel',
            headerKey: 'Products.SMSC.Operations.MessageTemplates.TableColumns.LanguageCode'
        });
        if (!_.isEmpty($scope.smppApplication.selected)) {
            $scope.exportOptions.columns.push({
                fieldName: 'applicationLabel',
                headerKey: 'Products.SMSC.Operations.MessageTemplates.TableColumns.ApplicationName'
            });
        }
        // --

        // Template list
        $scope.templateList = {
            list: [],
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.templateList.tableParams.settings().$scope.filterText = filterText;
            $scope.templateList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.templateList.tableParams.page(1);
            $scope.templateList.tableParams.reload();
        }, 750);

        $scope.templateList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "id": 'asc' // initial sorting
            }
        }, {
            total: $scope.templateList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.templateList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.templateList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        $scope.templateList.tableParams.settings().$scope = $scope;
        // END - Template list

        $scope.removeTemplate = function (template) {
            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Template: ', template);

                SmscConfService.deleteMessageTemplate(template.languageCode, template.id, $scope.smppApplication.selected.id).then(function (response) {
                    $log.debug('Removed Template: ', response);

                    var apiResponse = Restangular.stripRestangular(response);

                    if (apiResponse.errorCode) {
                        var message = '';

                        if (apiResponse.errorMsg) {
                            message = apiResponse.errorMsg;
                        } else {
                            message = $translate.instant('CommonMessages.GenericServerError');
                        }

                        notification({
                            type: 'danger',
                            text: message
                        });
                    } else {
                        var deletedListItem = _.findWhere($scope.templateList.list, {
                            languageCode: template.languageCode,
                            id: template.id
                        });
                        $scope.templateList.list = _.without($scope.templateList.list, deletedListItem);

                        $scope.templateList.tableParams.reload();

                        notification({
                            type: 'success',
                            text: $translate.instant('CommonLabels.OperationSuccessful')
                        });
                    }
                }, function (response) {
                    $log.debug('Cannot delete Template: ', response);
                });
            });
        };

    });

    SmscMessageTemplatesOperationsModule.controller('SmscNewMessageTemplateOperationsCtrl', function ($scope, $state, $stateParams, $log, $filter, $uibModal, $translate, notification,
                                                                                                            Restangular, NgTableParams, NgTableService, SmscConfService, templates, smppApplications) {
        $log.debug('SmscNewMessageTemplateOperationsCtrl');

        // Get state urls for using in generic pages.
        $scope.listState = $state.current.data.listState;

        $scope.appId = $stateParams.appId;
        $scope.languageCode = $stateParams.languageCode;

        $scope.smppApplication = _.findWhere(smppApplications, {id: Number($scope.appId)});

        $scope.templateList = Restangular.stripRestangular(templates);

        $scope.template = {};

        $scope.save = function (template) {
            var templateItem = {
                "id": template.id,
                "languageCode": $scope.languageCode,
                "template": template.template
            };

            SmscConfService.addMessageTemplate(templateItem, $scope.appId).then(function (response) {
                $log.debug('Added Template: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorCode === 500) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Products.SMSC.Operations.MessageTemplates.Messages.TemplateAlreadyDefinedError', {
                                languageCode: templateItem.languageCode,
                                id: templateItem.id
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

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot add Template: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {appId: $scope.appId, languageCode: $scope.languageCode}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };

    });

    SmscMessageTemplatesOperationsModule.controller('SmscUpdateMessageTemplateOperationsCtrl', function ($scope, $state, $stateParams, $log, $filter, $uibModal, $translate, notification,
                                                                                                               Restangular, NgTableParams, NgTableService, SmscConfService, templates, smppApplications) {
        $log.debug("SMSCUpdateMessageTemplateOperationsCtrl");

        // Get state urls for using in generic pages.
        $scope.isGlobal = $state.current.data.isGlobal;
        $scope.listState = $state.current.data.listState;

        $scope.appId = $stateParams.appId;
        $scope.languageCode = $stateParams.languageCode;

        $scope.smppApplication = _.findWhere(smppApplications, {id: Number($scope.appId)});

        var templateList = Restangular.stripRestangular(templates);

        if (templateList.length > 0) {
            $scope.template = _.findWhere(templateList, {id: Number($stateParams.id)});
            $scope.template.uniqueId = _.uniqueId();
        }

        $scope.templateOriginal = angular.copy($scope.template);
        $scope.isTemplateNotChanged = function () {
            return angular.equals($scope.template, $scope.templateOriginal);
        };

        $scope.save = function (template) {
            var templateItem = {
                "id": $scope.templateOriginal.id,
                "languageCode": $scope.templateOriginal.languageCode,
                "template": template.template
            };

            SmscConfService.updateMessageTemplate(templateItem, $scope.appId).then(function (response) {
                $log.debug('Updated Template: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                // If there is an error message appears a notification bar.
                if (apiResponse.errorCode === 500) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        message = apiResponse.errorMsg;
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

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot update Template: ', response);
            });
        };

        $scope.cancel = function () {
            $state.transitionTo($scope.listState, {appId: $scope.appId, languageCode: $scope.languageCode}, {
                reload: true,
                inherit: true,
                notify: true
            });
        };

    });

})();
