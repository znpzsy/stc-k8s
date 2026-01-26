(function () {

    'use strict';

    angular.module('adminportal.services.mca.messagetemplates.messagetemplates', [
        'adminportal.services.mca.messagetemplates.messagetemplates.mca',
        'adminportal.services.mca.messagetemplates.messagetemplates.notifyme'
    ]);

    var MCAMessageTemplatesOperationsModule = angular.module('adminportal.services.mca.messagetemplates.messagetemplates');

    MCAMessageTemplatesOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.messagetemplates.messagetemplates', {
            abstract: true,
            url: "/message-templates",
            template: "<div ui-view></div>"
        });

    });

    MCAMessageTemplatesOperationsModule.controller('MCAMessageTemplatesOperationsTableCtrl', function ($scope, $log, $stateParams, $filter, $uibModal, $translate, notification, NgTableParams, NgTableService,
                                                                                                       Restangular, messageTemplates, MCAConfService) {
        $log.debug("MCAMessageTemplatesOperationsTableCtrl");

        $scope.showTable = true;

        // Filter all items of the message template list.
        _.each(messageTemplates, function (messageTemplate) {
            messageTemplate.languageText = $translate.instant($filter('LanguageCodeFilter')(messageTemplate.language));
        });

        // Message Template list
        $scope.messageTemplateList = {
            list: messageTemplates,
            tableParams: {}
        };

        $scope.messageTemplateList.tableParams = new NgTableParams({
            page: 1, // show first page
            count: 10, // count per page
            sorting: {
                "name": 'asc' // initial sorting
            }
        }, {
            total: $scope.messageTemplateList.list.length, // length of data
            $scope: $scope,
            getData: function ($defer, params) {
                var filterText = params.settings().$scope.filterText;
                var filterColumns = params.settings().$scope.filterColumns;
                var filteredListData = NgTableService.filterList(filterText, filterColumns, $scope.messageTemplateList.list);
                var orderedData = params.sorting() ? $filter('orderBy')(filteredListData, params.orderBy()) : $scope.messageTemplateList.list;
                params.total(orderedData.length); // set total for recalc pagination
                if ((params.total() > 0) && (params.total() === (params.count() * (params.page() - 1)))) {
                    params.page(params.page() - 1);
                }

                $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });
        // END - Message Template list

        $scope.filterTable = _.debounce(function (filterText, filterColumns) {
            $scope.messageTemplateList.tableParams.settings().$scope.filterText = filterText;
            $scope.messageTemplateList.tableParams.settings().$scope.filterColumns = filterColumns;
            $scope.messageTemplateList.tableParams.page(1);
            $scope.messageTemplateList.tableParams.reload();
        }, 750);
    });

    MCAMessageTemplatesOperationsModule.controller('MCAMessageTemplatesOperationsUpdateCtrl', function ($scope, $log, $q, $state, $stateParams, $translate, notification, Restangular,
                                                                                                        messageTemplate, defaultMessageTemplates, updateMethod,  LANGUAGES, TEMPLATE_PAYMENT_TYPES,
                                                                                                        TEMPLATE_REDIRECTION_REASONS) {
        $log.debug("MCAMessageTemplatesOperationsUpdateCtrl");

        $scope.LANGUAGES = LANGUAGES;
        $scope.TEMPLATE_PAYMENT_TYPES = TEMPLATE_PAYMENT_TYPES;
        $scope.TEMPLATE_REDIRECTION_REASONS = TEMPLATE_REDIRECTION_REASONS;

        if ($stateParams.templateName) {
            $scope.templateName = $stateParams.templateName;
        }

        $scope.conf = {
            id: _.uniqueId(),
            messageTemplate: Restangular.stripRestangular(messageTemplate)
        };

        // If template is not available at the server side, assign create method to the update method.
        // So that the new template will be created with returned template in the main template  list.
        if ($scope.conf.messageTemplate.status === 3004 && $scope.conf.messageTemplate.explanation === 'Template cannot be found.') {
            // Default assignments on the form.
            $scope.conf.messageTemplate = defaultMessageTemplates;
        }

        $scope.originalConf = angular.copy($scope.conf);
        $scope.isNotChanged = function () {
            return angular.equals($scope.originalConf, $scope.conf);
        };

        $scope.save = function (conf) {
            $log.debug('Updating MCA [', $scope.templateName, '] message template configuration: ', conf);

            var apiCall = updateMethod($scope.templateName, conf.messageTemplate);

            apiCall.then(function (response) {
                var apiResponse = Restangular.stripRestangular(response);

                $log.debug('Updated MCA [', $scope.templateName, '] message template configuration: ', conf, ', response: ', apiResponse);

                if (apiResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode,
                            errorText: apiResponse.message
                        })
                    });
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot update MCA [', $scope.templateName, '] message template configuration: ', conf, ', response: ', response);

                if (response.data && response.data.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.data.errorCode,
                            errorText: response.data.message
                        })
                    });
                }
            });
        };

        $scope.cancel = function () {
            $state.go($state.current.data.listState, null, {reload: true});
        };
    });

})();
