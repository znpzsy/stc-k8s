(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.campaigns.bulkivr.announcementfile', []);

    var BulkMessagingCampaignsBulkIVROperationsAnnouncementFileModule = angular.module('adminportal.products.bulkmessaging.operations.campaigns.bulkivr.announcementfile');

    BulkMessagingCampaignsBulkIVROperationsAnnouncementFileModule.controller('BulkMessagingCampaignsBulkIVROperationsAnnouncementFileCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingCampaignsBulkIVROperationsAnnouncementFileCtrl');

        // AnnouncementFiles managing methods.
        $scope.addAnnouncementFile = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/campaigns/operations.campaigns.announcementfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.announcementFile = {
                        file: null
                    };

                    $scope.save = function (announcementFile) {
                        $uibModalInstance.close(announcementFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (announcementFile) {
                campaign.announcementFileList = campaign.announcementFileList || [];

                announcementFile.id = _.uniqueId();
                campaign.announcementFileList.push(announcementFile);
            }, function () {
                //
            });
        };
        $scope.editAnnouncementFile = function (campaign, announcementFile) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/campaigns/operations.campaigns.announcementfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $scope.announcementFile = {
                        id: announcementFile.id,
                        file: new File([announcementFile.file], announcementFile.file.name, { type: announcementFile.file.type })
                    };

                    $scope.announcementFileOriginal = {
                        id: announcementFile.id,
                        file: $scope.announcementFile.file
                    };

                    $scope.isNotChanged = function () {
                        return angular.equals($scope.announcementFile, $scope.announcementFileOriginal);
                    };

                    $scope.save = function (announcementFile) {
                        $uibModalInstance.close(announcementFile);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedAnnouncementFile) {
                var foundAnnouncementFile = _.findWhere(campaign.announcementFileList, {id: editedAnnouncementFile.id});
                if (foundAnnouncementFile) {
                    foundAnnouncementFile.file = editedAnnouncementFile.file;
                }
            }, function () {
            });
        };
        $scope.removeAnnouncementFile = function (campaign, announcementFile) {
            var index = _.indexOf(campaign.announcementFileList, announcementFile);
            if (index !== -1) {
                campaign.announcementFileList.splice(index, 1);
            }
        };
        $scope.getAnnouncementFileString = function (announcementFile) {
            var resultStr = announcementFile.file.name

            return resultStr;
        };

    });

})();
