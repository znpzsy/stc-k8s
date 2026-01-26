(function () {

    'use strict';

    angular.module('adminportal.subsystems.subscriptionmanagement.templates', [
        'adminportal.subsystems.subscriptionmanagement.templates.message-templates'
    ]);

    var SubscriptionManagementTemplatesModule = angular.module('adminportal.subsystems.subscriptionmanagement.templates');

    SubscriptionManagementTemplatesModule.config(function ($stateProvider) {

        $stateProvider.state('subsystems.subscriptionmanagement.templates', {
            abstract: true,
            url: "",
            templateUrl: "subsystems/subscriptionmanagement/message-templates/operations.html",
            data: {
                permissions: [
                    'ALL__TEMPLATES_READ'
                ]
            }
        });

    });

    SubscriptionManagementTemplatesModule.controller('SubscriptionManagementTemplatesLanguagesCtrl', function ($scope, $log, $filter, $state, $stateParams, Restangular,
                                                                                                               languages, subscriptionScenarios) {
        $log.debug("SubscriptionManagementTemplatesLanguagesCtrl");

        // Language list
        $scope.languageList = Restangular.stripRestangular(languages);
        _.each($scope.languageList, function (language) {
            language.label = language.prefix + ' (' + language.name + ')';
        });

        // Subscription Scenario list
        var subscriptionScenarioList = Restangular.stripRestangular(subscriptionScenarios);
        $scope.subscriptionScenarioList = $filter('orderBy')(subscriptionScenarioList, 'name');

        if ($stateParams.languageCode) {
            $scope.selectedLanguage = $stateParams.languageCode;
        }

        if ($stateParams.scenarioName) {
            $scope.selectedSubscriptionScenario = $stateParams.scenarioName;
        }

        $scope.changeSubscriptionScenario = function (languageCode, subscriptionScenario) {
            $log.debug("Selected language: ", languageCode, ', Subscription scenario: ', subscriptionScenario);

            $state.transitionTo($state.$current,
                {
                    languageCode: languageCode ? languageCode : undefined,
                    scenarioName: subscriptionScenario ? subscriptionScenario : undefined
                },
                {
                    reload: false,
                    inherit: false,
                    notify: true
                }
            );
        };
    });

})();
