(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.successfulsubscriptionfile', []);

    var BulkMessagingInteractiveCampaignsOperationsSuccessfulSubscriptionFileModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.successfulsubscriptionfile');

    BulkMessagingInteractiveCampaignsOperationsSuccessfulSubscriptionFileModule.controller('BulkMessagingInteractiveCampaignsOperationsSuccessfulSubscriptionFileCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsSuccessfulSubscriptionFileCtrl');

        // SuccessfulSubscriptionFiles managing methods.
        $scope.addSuccessfulSubscriptionFile = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.successfulsubscriptionfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.successfulSubscriptionFile = {
                        file: null
                    };

                    $scope.save = function (successfulSubscriptionFile) {
                        $uibModalInstance.close(successfulSubscriptionFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (successfulSubscriptionFile) {
                campaign.successfulSubscriptionFileList = campaign.successfulSubscriptionFileList || [];

                successfulSubscriptionFile.id = _.uniqueId();
                campaign.successfulSubscriptionFileList.push(successfulSubscriptionFile);
            }, function () {
                //
            });
        };
        $scope.editSuccessfulSubscriptionFile = function (campaign, successfulSubscriptionFile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.successfulsubscriptionfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.successfulSubscriptionFile = {
                        id: successfulSubscriptionFile.id,
                        file: new File([successfulSubscriptionFile.file], successfulSubscriptionFile.file.name, {type: successfulSubscriptionFile.file.type})
                    };

                    $scope.successfulSubscriptionFileOriginal = {
                        id: successfulSubscriptionFile.id,
                        file: $scope.successfulSubscriptionFile.file
                    };

                    $scope.isNotChanged = function () {
                        return angular.equals($scope.successfulSubscriptionFile, $scope.successfulSubscriptionFileOriginal);
                    };

                    $scope.save = function (successfulSubscriptionFile) {
                        $uibModalInstance.close(successfulSubscriptionFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedSuccessfulSubscriptionFile) {
                var foundSuccessfulSubscriptionFile = _.findWhere(campaign.successfulSubscriptionFileList, {id: editedSuccessfulSubscriptionFile.id});
                if (foundSuccessfulSubscriptionFile) {
                    foundSuccessfulSubscriptionFile.file = editedSuccessfulSubscriptionFile.file;
                }
            }, function () {
            });
        };
        $scope.removeSuccessfulSubscriptionFile = function (campaign, successfulSubscriptionFile) {
            var index = _.indexOf(campaign.successfulSubscriptionFileList, successfulSubscriptionFile);
            if (index !== -1) {
                campaign.successfulSubscriptionFileList.splice(index, 1);
            }
        };
        $scope.getSuccessfulSubscriptionFileString = function (successfulSubscriptionFile) {
            var resultStr = successfulSubscriptionFile.file.name

            return resultStr;
        };

    });

})();
