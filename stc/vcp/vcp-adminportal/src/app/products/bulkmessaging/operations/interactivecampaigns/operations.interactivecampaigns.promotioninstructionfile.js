(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.promotioninstructionfile', []);

    var BulkMessagingInteractiveCampaignsOperationsPromotionInstructionFileModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.promotioninstructionfile');

    BulkMessagingInteractiveCampaignsOperationsPromotionInstructionFileModule.controller('BulkMessagingInteractiveCampaignsOperationsPromotionInstructionFileCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsPromotionInstructionFileCtrl');

        // PromotionInstructionFiles managing methods.
        $scope.addPromotionInstructionFile = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.promotioninstructionfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.promotionInstructionFile = {
                        file: null
                    };

                    $scope.save = function (promotionInstructionFile) {
                        $uibModalInstance.close(promotionInstructionFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (promotionInstructionFile) {
                campaign.promotionInstructionFileList = campaign.promotionInstructionFileList || [];

                promotionInstructionFile.id = _.uniqueId();
                campaign.promotionInstructionFileList.push(promotionInstructionFile);
            }, function () {
                //
            });
        };
        $scope.editPromotionInstructionFile = function (campaign, promotionInstructionFile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.promotioninstructionfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.promotionInstructionFile = {
                        id: promotionInstructionFile.id,
                        file: new File([promotionInstructionFile.file], promotionInstructionFile.file.name, {type: promotionInstructionFile.file.type})
                    };

                    $scope.promotionInstructionFileOriginal = {
                        id: promotionInstructionFile.id,
                        file: $scope.promotionInstructionFile.file
                    };

                    $scope.isNotChanged = function () {
                        return angular.equals($scope.promotionInstructionFile, $scope.promotionInstructionFileOriginal);
                    };

                    $scope.save = function (promotionInstructionFile) {
                        $uibModalInstance.close(promotionInstructionFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedPromotionInstructionFile) {
                var foundPromotionInstructionFile = _.findWhere(campaign.promotionInstructionFileList, {id: editedPromotionInstructionFile.id});
                if (foundPromotionInstructionFile) {
                    foundPromotionInstructionFile.file = editedPromotionInstructionFile.file;
                }
            }, function () {
            });
        };
        $scope.removePromotionInstructionFile = function (campaign, promotionInstructionFile) {
            var index = _.indexOf(campaign.promotionInstructionFileList, promotionInstructionFile);
            if (index !== -1) {
                campaign.promotionInstructionFileList.splice(index, 1);
            }
        };
        $scope.getPromotionInstructionFileString = function (promotionInstructionFile) {
            var resultStr = promotionInstructionFile.file.name

            return resultStr;
        };

    });

})();
