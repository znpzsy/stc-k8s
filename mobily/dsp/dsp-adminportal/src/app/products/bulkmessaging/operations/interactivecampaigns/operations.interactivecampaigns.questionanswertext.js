(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.questionanswertext', []);

    var BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionAnswerTextModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.questionanswertext');

    BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionAnswerTextModule.controller('BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionAnswerTextCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionAnswerTextCtrl');

        // Choices managing methods.
        $scope.addQuestionnaireQuestionAnswerText = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.questionanswertext.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, $translate, notification, ContentManagementService, Restangular) {
                    $scope.campaign = campaign;

                    $scope.questionAnswer = {
                        questionText: null,
                        keywords: null,
                        identifiers: null,
                        promotedTones: []
                    };

                    $scope.toneList = [];
                    $scope.searchPromotedTones = _.throttle(function (text) {
                        $scope.toneList = [];
                        ContentManagementService.searchTones(0, 100, text, null, true).then(function (response) {
                            $scope.toneList = (response ? response.items : []);
                        });
                    }, 500);

                    $scope.save = function (questionAnswer) {
                        var keywordsLen = $scope.questionAnswer.keywords.length;
                        var identifiersLen = $scope.questionAnswer.identifiers.length;

                        if (keywordsLen !== identifiersLen) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Products.BulkMessaging.Operations.Messages.KeywordsIdentifiersDoNotMatch')
                            });
                        } else {
                            $uibModalInstance.close(questionAnswer);
                        }
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (questionAnswer) {
                campaign.questionAnswerList = campaign.questionAnswerList || [];

                questionAnswer.id = _.uniqueId();
                campaign.questionAnswerList.push(questionAnswer);
            }, function () {
                //
            });
        };
        $scope.editQuestionnaireQuestionAnswerText = function (campaign, questionAnswer) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.questionanswertext.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, $translate, notification, ContentManagementService, Restangular) {
                    $scope.campaign = campaign;

                    $scope.questionAnswer = {
                        id: questionAnswer.id,
                        questionText: questionAnswer.questionText,
                        keywords: questionAnswer.keywords,
                        identifiers: questionAnswer.identifiers,
                        promotedTones: questionAnswer.promotedTones
                    };

                    $scope.questionAnswerOriginal = angular.copy($scope.questionAnswer);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.questionAnswer, $scope.questionAnswerOriginal);
                    };

                    $scope.toneList = [];
                    $scope.searchPromotedTones = _.throttle(function (text) {
                        $scope.toneList = [];
                        ContentManagementService.searchTones(0, 100, text, null, true).then(function (response) {
                            $scope.toneList = (response ? response.items : []);
                        });
                    }, 500);

                    $scope.save = function (questionAnswer) {
                        var keywordsLen = $scope.questionAnswer.keywords.length;
                        var identifiersLen = $scope.questionAnswer.identifiers.length;

                        if (keywordsLen !== identifiersLen) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Products.BulkMessaging.Operations.Messages.KeywordsIdentifiersDoNotMatch')
                            });
                        } else {
                            $uibModalInstance.close(questionAnswer);
                        }
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedChoice) {
                var foundChoice = _.findWhere(campaign.questionAnswerList, {id: editedChoice.id});
                if (foundChoice) {
                    foundChoice.questionText = editedChoice.questionText;
                    foundChoice.keywords = editedChoice.keywords;
                    foundChoice.identifiers = editedChoice.identifiers;
                    foundChoice.promotedTones = editedChoice.promotedTones;
                }
            }, function () {
            });
        };
        $scope.removeQuestionnaireQuestionAnswerText = function (campaign, questionAnswer) {
            var index = _.indexOf(campaign.questionAnswerList, questionAnswer);
            if (index !== -1) {
                campaign.questionAnswerList.splice(index, 1);
            }
        };
        $scope.getQuestionnaireQuestionAnswerTextString = function (questionAnswer) {
            var resultStr = (questionAnswer.questionText ? questionAnswer.questionText + ', [' : '[') +
                questionAnswer.keywords.join(', ') + '], [' +
                questionAnswer.identifiers.join(', ') + ']' +
                (questionAnswer.promotedTones && questionAnswer.promotedTones.length > 0 ? ', [' + _.pluck(questionAnswer.promotedTones, 'name').join(', ') + ']' : '');

            return resultStr;
        };

    });

})();
