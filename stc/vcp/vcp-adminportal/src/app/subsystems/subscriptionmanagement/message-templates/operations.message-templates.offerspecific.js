(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.templates.message-templates.offerspecific', []);

    var SubscriptionManagementMessageTemplatesOfferSpecificModule = angular.module('adminportal.subsystems.subscriptionmanagement.templates.message-templates.offerspecific');

    SubscriptionManagementMessageTemplatesOfferSpecificModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.templates.message-templates.offerspecific', {
            url: "/offer-specific",
            templateUrl: "subsystems/subscriptionmanagement/message-templates/operations.message-templates.main.html",
            data: {
                isGlobal: false,
                exportFilePrefix: 'SubscriptionManagementMessageTemplatesOfferSpecific',
                pageHeaderKey: 'Subsystems.SubscriptionManagement.Templates.MessageTemplates.OfferSpecific',
                listState: 'subsystems.subscriptionmanagement.templates.message-templates.offerspecific.list',
                newState: 'subsystems.subscriptionmanagement.templates.message-templates.offerspecific.new',
                updateState: 'subsystems.subscriptionmanagement.templates.message-templates.offerspecific.update'
            },
            resolve: {
                languages: function (SMSPortalProvisioningService) {
                    return SMSPortalProvisioningService.getLanguages();
                },
                subscriptionScenarios: function (SMSPortalProvisioningService) {
                    // Get all subscription scenarios instead of offers since we keep them one to one matched
                    // with each offers.
                    return SMSPortalProvisioningService.getSubscriptionScenarios();
                }
            }
        }).state('subsystems.subscriptionmanagement.templates.message-templates.offerspecific.list', {
            url: "/:languageCode/:scenarioName/list",
            views: {
                'languageForm': {
                    templateUrl: "subsystems/subscriptionmanagement/message-templates/operations.language.html",
                    controller: 'SubscriptionManagementTemplatesLanguagesCtrl'
                },
                'templatesTable': {
                    templateUrl: "subsystems/subscriptionmanagement/message-templates/operations.message-templates.html",
                    controller: 'SubscriptionManagementMessageTemplatesCtrl',
                    resolve: {
                        templates: function ($q, $stateParams, SMSPortalProvisioningService) {
                            var languageCode = $stateParams.languageCode;
                            var scenarioName = $stateParams.scenarioName;

                            var deferred = $q.defer();

                            if (languageCode && scenarioName) {
                                SMSPortalProvisioningService.getMessageTemplates(languageCode, scenarioName).then(function (response) {
                                    if (response) {
                                        deferred.resolve(response);
                                    } else {
                                        deferred.resolve([]);
                                    }
                                }, function (response) {
                                    deferred.reject(response);
                                });
                            } else {
                                deferred.resolve([]);
                            }

                            return deferred.promise;
                        }
                    }
                }
            }
        }).state('subsystems.subscriptionmanagement.templates.message-templates.offerspecific.new', {
            url: "/:languageCode/:scenarioName/new",
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
        }).state('subsystems.subscriptionmanagement.templates.message-templates.offerspecific.update', {
            url: "/:languageCode/:scenarioName/update/:name",
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
                            var scenarioName = $stateParams.scenarioName;
                            var name = $stateParams.name;

                            return SMSPortalProvisioningService.getMessageTemplate(languageCode, scenarioName, name);
                        }
                    }
                }
            }
        });

    });

})();
