(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.pollchoicetext', []);

    var BulkMessagingInteractiveCampaignsOperationsPollChoiceTextModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.pollchoicetext');

    BulkMessagingInteractiveCampaignsOperationsPollChoiceTextModule.controller('BulkMessagingInteractiveCampaignsOperationsPollChoiceTextCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsPollChoiceTextCtrl');

        // Choices managing methods.
        $scope.addPollChoiceText = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.pollchoicetext.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, ContentManagementService, Restangular) {
                    $scope.campaign = campaign;

                    $scope.choice = {
                        text: null,
                        keyword: null,
                        identifier: null,
                        promotedTone: null
                    };

                    $scope.toneList = [];
                    $scope.searchPromotedTones = _.throttle(function (text) {
                        $scope.toneList = [];
                        ContentManagementService.searchTones(0, 100, text, null, true).then(function (response) {
                            $scope.toneList = (response ? response.items : []);
                        });
                    }, 500);

                    $scope.save = function (choice) {
                        $uibModalInstance.close(choice);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (choice) {
                campaign.choiceList = campaign.choiceList || [];

                choice.id = _.uniqueId();
                campaign.choiceList.push(choice);
            }, function () {
                //
            });
        };
        $scope.editPollChoiceText = function (campaign, choice) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.pollchoicetext.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, ContentManagementService, Restangular) {
                    $scope.campaign = campaign;

                    $scope.choice = {
                        id: choice.id,
                        text: choice.text,
                        keyword: choice.keyword,
                        identifier: choice.identifier,
                        promotedTone: choice.promotedTone
                    };

                    $scope.choiceOriginal = angular.copy($scope.choice);
                    $scope.isNotChanged = function () {
                        return angular.equals($scope.choice, $scope.choiceOriginal);
                    };

                    $scope.toneList = [];
                    $scope.searchPromotedTones = _.throttle(function (text) {
                        $scope.toneList = [];
                        ContentManagementService.searchTones(0, 100, text, null, true).then(function (response) {
                            $scope.toneList = (response ? response.items : []);
                        });
                    }, 500);

                    $scope.save = function (choice) {
                        $uibModalInstance.close(choice);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedChoice) {
                var foundChoice = _.findWhere(campaign.choiceList, {id: editedChoice.id});
                if (foundChoice) {
                    foundChoice.text = editedChoice.text;
                    foundChoice.keyword = editedChoice.keyword;
                    foundChoice.identifier = editedChoice.identifier;
                    foundChoice.promotedTone = editedChoice.promotedTone;
                }
            }, function () {
            });
        };
        $scope.removePollChoiceText = function (campaign, choice) {
            var index = _.indexOf(campaign.choiceList, choice);
            if (index !== -1) {
                campaign.choiceList.splice(index, 1);
            }
        };
        $scope.getPollChoiceTextString = function (choice) {
            var resultStr = (choice.text ? choice.text + ', ' : '') + choice.keyword + ', ' + choice.identifier
                + (choice.promotedTone ? ', ' + choice.promotedTone.name : '');

            return resultStr;
        };

    });

})();
