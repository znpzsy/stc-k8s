(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.rule', []);

    var BulkMessagingInteractiveCampaignsOperationsRuleModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.rule');

    BulkMessagingInteractiveCampaignsOperationsRuleModule.controller('BulkMessagingInteractiveCampaignsOperationsRuleCommonCtrl', function ($scope, $log, $translate, UtilService, campaign) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsRuleCommonCtrl');

        $scope.questionList = campaign.qaInfoLists || campaign.questionAnswerList;
        $scope.actionList = [];
        _.each($scope.questionList, function (question, index) {
            question.id = _.uniqueId();
            question.name = 'Q' + (index + 1);
            question.answerList = [];

            _.each(question.dtmfCodes || question.keywords, function (value, index) {
                var answerItem = {
                    id: _.uniqueId(),
                    value: 'A' + (index + 1),
                    name: 'A' + (index + 1) + ' [' + value + (question.identifiers[index] ? ':' + question.identifiers[index] : '' ) + ']'
                }

                question.answerList.push(answerItem);
            });

            // Add the other answers
            question.answerList.push({
                id: _.uniqueId(),
                value: 'INVALID_RESPONSE',
                name: $translate.instant('Products.BulkMessaging.Operations.InteractiveCampaigns.InvalidResponse')
            });

            // Create the action list
            $scope.actionList.push({
                id: question.id,
                value: question.name,
                name: $translate.instant('Products.BulkMessaging.Operations.InteractiveCampaigns.GoToQ', {question: question.name})
            });
        });

        // Add the other action
        $scope.actionList.push({
            id: _.uniqueId(),
            value: 'END_OF_SURVEY',
            name: $translate.instant('Products.BulkMessaging.Operations.InteractiveCampaigns.EndOfSurvey')
        });

        $scope.$watch('rule.question', function (newVal, oldVal) {
            if (newVal !== oldVal) {
                $scope.actionList = _.filter($scope.actionList, function (obj) {
                    return (obj.id !== newVal.id);
                });
            }
        });
    });

    BulkMessagingInteractiveCampaignsOperationsRuleModule.controller('BulkMessagingInteractiveCampaignsOperationsRuleCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsRuleCtrl');

        // Rules managing methods.
        $scope.addRule = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.rule.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $controller, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $controller('BulkMessagingInteractiveCampaignsOperationsRuleCommonCtrl', {
                        $scope: $scope,
                        campaign: campaign
                    });

                    $scope.rule = {
                        question: null,
                        answer: null,
                        action: null
                    };

                    $scope.save = function (rule) {
                        $uibModalInstance.close(rule);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (rule) {
                campaign.ruleList = campaign.ruleList || [];

                rule.id = _.uniqueId();
                campaign.ruleList.push(rule);
            }, function () {
                //
            });
        };
        $scope.editRule = function (campaign, rule) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.rule.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $controller, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $controller('BulkMessagingInteractiveCampaignsOperationsRuleCommonCtrl', {
                        $scope: $scope,
                        campaign: campaign
                    });

                    $scope.rule = {
                        id: rule.id,
                        question: rule.question,
                        answer: rule.answer,
                        action: rule.action
                    };

                    $scope.ruleOriginal = {
                        id: rule.id,
                        question: rule.question,
                        answer: rule.answer,
                        action: rule.action
                    };

                    $scope.isNotChanged = function () {
                        return angular.equals($scope.rule, $scope.ruleOriginal);
                    };

                    $scope.save = function (rule) {
                        $uibModalInstance.close(rule);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedRule) {
                var foundRule = _.findWhere(campaign.ruleList, {id: editedRule.id});
                if (foundRule) {
                    foundRule.question = editedRule.question;
                    foundRule.answer = editedRule.answer;
                    foundRule.action = editedRule.action;
                }
            }, function () {
            });
        };
        $scope.removeRule = function (campaign, rule) {
            var index = _.indexOf(campaign.ruleList, rule);
            if (index !== -1) {
                campaign.ruleList.splice(index, 1);
            }
        };
        $scope.getRuleString = function (rule) {
            var resultStr = rule.question.name + ', ' + rule.answer.name + ', ' + rule.action.name;

            return resultStr;
        };

    });

})();