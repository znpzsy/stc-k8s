(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.templates.message-templates.global', []);

    var SubscriptionManagementMessageTemplatesGlobalModule = angular.module('adminportal.subsystems.subscriptionmanagement.templates.message-templates.global');

    SubscriptionManagementMessageTemplatesGlobalModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.templates.message-templates.global', {
            url: "/global",
            templateUrl: "subsystems/subscriptionmanagement/message-templates/operations.message-templates.main.html",
            data: {
                isGlobal: true,
                exportFilePrefix: 'SubscriptionManagementMessageTemplatesGlobal',
                pageHeaderKey: 'Subsystems.SubscriptionManagement.Templates.MessageTemplates.Global',
                listState: 'subsystems.subscriptionmanagement.templates.message-templates.global.list',
                newState: 'subsystems.subscriptionmanagement.templates.message-templates.global.new',
                updateState: 'subsystems.subscriptionmanagement.templates.message-templates.global.update'
            },
            resolve: {
                languages: function (SMSPortalProvisioningService) {
                    return SMSPortalProvisioningService.getLanguages();
                },
                subscriptionScenarios: function () {
                    // Return empty array since we do not use subscription scenarios at global.
                    return [];
                }
            }
        }).state('subsystems.subscriptionmanagement.templates.message-templates.global.list', {
            url: "/:languageCode/list",
            views: {
                'languageForm': {
                    templateUrl: "subsystems/subscriptionmanagement/message-templates/operations.language.html",
                    controller: 'SubscriptionManagementTemplatesLanguagesCtrl'
                },
                'templatesTable': {
                    templateUrl: "subsystems/subscriptionmanagement/message-templates/operations.message-templates.html",
                    controller: 'SubscriptionManagementMessageTemplatesCtrl',
                    resolve: {
                        templates: function ($stateParams, SMSPortalProvisioningService) {
                            var languageCode = $stateParams.languageCode;

                            if (languageCode) {
                                return SMSPortalProvisioningService.getMessageTemplates(languageCode);
                            } else {
                                return [];
                            }
                        }
                    }
                }
            }
        }).state('subsystems.subscriptionmanagement.templates.message-templates.global.new', {
            url: "/:languageCode/new",
            views: {
                'languageForm': {
                    template: "<div ui-view></div>"
                },
                'templatesTable': {
                    templateUrl: "subsystems/subscriptionmanagement/message-templates/operations.message-templates.details.html",
                    controller: 'SubscriptionManagementMessageTemplatesNewCtrl',
                    resolve: {
                        availableTemplates: function (SMSPortalProvisioningService) {
                            return SMSPortalProvisioningService.getAvailableMessageTemplates();
                        }
                    }
                }
            }
        }).state('subsystems.subscriptionmanagement.templates.message-templates.global.update', {
            url: "/:languageCode/update/:name",
            views: {
                'languageForm': {
                    template: "<div ui-view></div>"
                },
                'templatesTable': {
                    templateUrl: "subsystems/subscriptionmanagement/message-templates/operations.message-templates.details.html",
                    controller: 'SubscriptionManagementMessageTemplatesUpdateCtrl',
                    resolve: {
                        template: function ($stateParams, SMSPortalProvisioningService) {
                            var languageCode = $stateParams.languageCode;
                            var name = $stateParams.name;

                            return SMSPortalProvisioningService.getMessageTemplate(languageCode, null, name);
                        }
                    }
                }
            }
        });

    });

})();
