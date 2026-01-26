(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.templates.message-templates', [
        'adminportal.subsystems.subscriptionmanagement.templates.message-templates.global',
        'adminportal.subsystems.subscriptionmanagement.templates.message-templates.offerspecific'
    ]);

    var SubscriptionManagementMessageTemplatesModule = angular.module('adminportal.subsystems.subscriptionmanagement.templates.message-templates');

    SubscriptionManagementMessageTemplatesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.templates.message-templates', {
            abstract: true,
            url: "/message-templates",
            template: "<div ui-view></div>"
        });

    });

    SubscriptionManagementMessageTemplatesModule.controller('SubscriptionManagementMessageTemplatesCtrl', function ($scope, $log, $state, $stateParams, $q, $filter, $uibModal, $translate, notification, Restangular,
                                                                                                                    NgTableParams, NgTableService, SMSPortalProvisioningService, templates) {
        $log.debug('SubscriptionManagementMessageTemplatesCtrl');

        $scope.showTable = $stateParams.languageCode && ($state.$current.data.isGlobal || $stateParams.scenarioName);

        $scope.exportOptions = {
            columns: [
                {
                    fieldName: 'language',
                    headerKey: 'CommonLabels.Language'
                },
                {
                    fieldName: 'name',
                    headerKey: 'Subsystems.SubscriptionManagement.Templates.MessageTemplates.Fields.Name'
                },
                {
                    fieldName: 'text',
                    headerKey: 'Subsystems.SubscriptionManagement.Templates.MessageTemplates.Fields.Text'
                }
            ]
        };

        var templateList = Restangular.stripRestangular(templates);
        templateList = $filter('orderBy')(templateList, 'name');

        if ($stateParams.languageCode) {
            $scope.selectedLanguage = $stateParams.languageCode;

            _.each(templateList, function (template) {
                template.language = $scope.selectedLanguage + ' (' + $translate.instant('Languages.' + $scope.selectedLanguage) + ')';
            });
        }

        // For offer specific case
        if ($stateParams.scenarioName) {
            $scope.selectedSubscriptionScenario = $stateParams.scenarioName;

            _.each(templateList, function (template) {
                template.subscriptionScenario = $scope.selectedSubscriptionScenario;
            });

            // Add offer name column to the export array for offer specific case
            $scope.exportOptions.columns.splice(1, 0, {
                fieldName: 'subscriptionScenario',
                headerKey: 'CommonLabels.Offer'
            });
        }

        // Template list
        $scope.templateList = {
            list: templateList,
            tableParams: {}
        };

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.templateList.tableParams.settings().$scope.filterText = filterText;
            $scope.templateList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.templateList.tableParams.page(1);
            $scope.templateList.tableParams.reload();
        }, 500);

        $scope.templateList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "name": 'asc'
            }
        }, {
            total: $scope.templateList.list.length,
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
        // END - Template list

        $scope.remove = function (template) {
            template.rowSelected = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'partials/modal/modal.confirmation.html',
                controller: 'ConfirmationModalInstanceCtrl',
                size: 'sm'
            });

            modalInstance.result.then(function () {
                $log.debug('Removing Template: ', template);

                SMSPortalProvisioningService.deleteMessageTemplate($scope.selectedLanguage, $scope.selectedSubscriptionScenario, template.name).then(function (response) {
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
                            type: 'warning',
                            text: message
                        });
                    } else {
                        var deletedListItem = _.findWhere($scope.templateList.list, {
                            name: template.name
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

                template.rowSelected = false;
            }, function () {
                template.rowSelected = false;
            });
        };

    });

    SubscriptionManagementMessageTemplatesModule.controller('SubscriptionManagementMessageTemplatesNewCtrl', function ($scope, $log, $state, $stateParams, $filter, $translate, notification, Restangular,
                                                                                                                       SMSPortalProvisioningService, availableTemplates) {
        $log.debug('SubscriptionManagementMessageTemplatesNewCtrl');

        if ($stateParams.languageCode) {
            $scope.selectedLanguage = $stateParams.languageCode;
        }

        // For offer specific case
        if ($stateParams.scenarioName) {
            $scope.selectedSubscriptionScenario = $stateParams.scenarioName;
        }

        $scope.availableTemplates = Restangular.stripRestangular(availableTemplates);
        $scope.availableTemplates = $filter('orderBy')($scope.availableTemplates, 'name');

        $scope.save = function (template) {
            var templateItem = {
                name: template.name,
                text: template.text
            };

            $log.debug('Creating template: ', templateItem);

            SMSPortalProvisioningService.createMessageTemplate($scope.selectedLanguage, $scope.selectedSubscriptionScenario, templateItem).then(function (response) {
                $log.debug('Created template: ', templateItem, ', response: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Subsystems.SubscriptionManagement.Templates.MessageTemplates.Messages.AlreadyDefinedError', {
                                name: templateItem.name
                            });
                        } else {
                            message = apiResponse.errorMsg;
                        }
                    } else {
                        message = $translate.instant('CommonMessages.GenericServerError');
                    }

                    notification({
                        type: 'warning',
                        text: message
                    });
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot create template: ', templateItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current.data.listState, {
                languageCode: $scope.selectedLanguage,
                scenarioName: $scope.selectedSubscriptionScenario
            }, {reload: true});
        };
    });

    SubscriptionManagementMessageTemplatesModule.controller('SubscriptionManagementMessageTemplatesUpdateCtrl', function ($scope, $log, $state, $stateParams, $filter, $translate, notification, Restangular,
                                                                                                                          SMSPortalProvisioningService, template) {
        $log.debug("SubscriptionManagementMessageTemplatesUpdateCtrl");

        if ($stateParams.languageCode) {
            $scope.selectedLanguage = $stateParams.languageCode;
        }

        // For offer specific case
        if ($stateParams.scenarioName) {
            $scope.selectedSubscriptionScenario = $stateParams.scenarioName;
        }

        if ($stateParams.name) {
            $scope.templateName = $stateParams.name;
        }

        $scope.template = Restangular.stripRestangular(template);
        _.defaults($scope.template, {
            id: _.uniqueId()
        });

        $scope.templateOriginal = angular.copy($scope.template);
        $scope.isNotChanged = function () {
            return angular.equals($scope.template, $scope.templateOriginal);
        };

        $scope.save = function (template) {
            var templateItem = {
                name: $scope.templateOriginal.name,
                text: template.text
            };

            $log.debug('Updating template: ', templateItem);

            SMSPortalProvisioningService.updateMessageTemplate($scope.selectedLanguage, $scope.selectedSubscriptionScenario, templateItem).then(function (response) {
                $log.debug('Updated template: ', templateItem, ', response: ', response);

                var apiResponse = Restangular.stripRestangular(response);

                if (apiResponse.errorCode) {
                    var message = '';

                    if (apiResponse.errorMsg) {
                        if (apiResponse.errorMsg.indexOf('already') > -1) {
                            message = $translate.instant('Subsystems.SubscriptionManagement.Templates.MessageTemplates.Messages.AlreadyDefinedError', {
                                name: templateItem.name
                            });
                        } else {
                            message = apiResponse.errorMsg;
                        }
                    } else {
                        message = $translate.instant('CommonMessages.GenericServerError');
                    }

                    notification({
                        type: 'warning',
                        text: message
                    });
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot update template: ', templateItem, ', response: ', response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current.data.listState, {
                languageCode: $scope.selectedLanguage,
                scenarioName: $scope.selectedSubscriptionScenario
            }, {reload: true});
        };
    });

})();
