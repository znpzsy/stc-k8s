(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.pollchoicefile', []);

    var BulkMessagingInteractiveCampaignsOperationsPollChoiceFileModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.pollchoicefile');

    BulkMessagingInteractiveCampaignsOperationsPollChoiceFileModule.controller('BulkMessagingInteractiveCampaignsOperationsPollChoiceFileCommonCtrl', function ($scope, $log, ContentManagementService) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsPollChoiceFileCommonCtrl');

        $scope.choiceFileSelected = function (files, events, choiceFile) {
            if (files.length) {
                var newChoiceFile = {
                    id: _.uniqueId(),
                    file: new File([choiceFile.file], choiceFile.file.name, {type: choiceFile.file.type})
                };

                $scope.optionInfo.choiceFileList.push(newChoiceFile);

                choiceFile = {
                    file: null
                };
            }
        };
        $scope.removeChoiceFile = function (choiceFile) {
            var foundChoiceFile = _.findWhere($scope.optionInfo.choiceFileList, {id: choiceFile.id});
            var index = _.indexOf($scope.optionInfo.choiceFileList, foundChoiceFile);
            if (index !== -1) {
                choiceFile = null;
                $scope.optionInfo.choiceFileList.splice(index, 1);
            }

            $scope.choiceFile.file = null;
        };

        $scope.toneList = [];
        $scope.searchPromotedTones = _.throttle(function (text) {
            $scope.toneList = [];
            ContentManagementService.searchTones(0, 100, text, null, true).then(function (response) {
                $scope.toneList = (response ? response.items : []);
            });
        }, 500);
    });

    BulkMessagingInteractiveCampaignsOperationsPollChoiceFileModule.controller('BulkMessagingInteractiveCampaignsOperationsPollChoiceFileCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsPollChoiceFileCtrl');

        // ChoiceAnswerFiles managing methods.
        $scope.addOptionInfoFileList = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.pollchoicefile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $controller, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $controller('BulkMessagingInteractiveCampaignsOperationsPollChoiceFileCommonCtrl', {$scope: $scope});

                    $scope.choiceFile = {
                        file: null
                    };

                    $scope.optionInfo = {
                        choiceFileList: [],
                        dtmfCode: [],
                        identifier: [],
                        promotedTone: null
                    };

                    $scope.save = function (optionInfo) {
                        $uibModalInstance.close(optionInfo);
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (optionInfo) {
                campaign.optionInfoLists = campaign.optionInfoLists || [];

                optionInfo.id = _.uniqueId();
                campaign.optionInfoLists.push(optionInfo);
            }, function () {
                //
            });
        };
        $scope.editOptionInfoFileList = function (campaign, optionInfo) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.pollchoicefile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $controller, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $controller('BulkMessagingInteractiveCampaignsOperationsPollChoiceFileCommonCtrl', {$scope: $scope});

                    $scope.choiceFile = {
                        file: null
                    };
                    $scope.optionInfo = {
                        id: optionInfo.id,
                        choiceFileList: [],
                        dtmfCode: optionInfo.dtmfCode,
                        identifier: optionInfo.identifier,
                        promotedTone: optionInfo.promotedTone
                    };
                    $scope.optionInfoOriginal = {
                        choiceFileList: [],
                        dtmfCode: angular.copy(optionInfo.dtmfCode),
                        identifier: angular.copy(optionInfo.identifier),
                        promotedTone: angular.copy(optionInfo.promotedTone)
                    };

                    _.each(optionInfo.choiceFileList, function (choiceFile) {
                        $scope.optionInfo.choiceFileList.push({
                            id: choiceFile.id,
                            file: new File([choiceFile.file], choiceFile.file.name, {type: choiceFile.file.type})
                        });

                        $scope.optionInfoOriginal.choiceFileList.push({
                            id: choiceFile.id,
                            file: new File([choiceFile.file], choiceFile.file.name, {type: choiceFile.file.type})
                        });
                    });

                    $scope.isNotChanged = function () {
                        var isChoicesEquals = ($scope.optionInfo.choiceFileList.length === $scope.optionInfoOriginal.choiceFileList.length);
                        isChoicesEquals = isChoicesEquals && _.every($scope.optionInfo.choiceFileList, function (choiceFile) {
                            var foundChoiceFileOriginal = _.findWhere($scope.optionInfoOriginal.choiceFileList, {id: choiceFile.id});
                            if (foundChoiceFileOriginal) {
                                return (foundChoiceFileOriginal.file.name === choiceFile.file.name &&
                                    foundChoiceFileOriginal.file.size === choiceFile.file.size &&
                                    foundChoiceFileOriginal.file.type === choiceFile.file.type);
                            }

                            return false;
                        });

                        isChoicesEquals = isChoicesEquals && _.isEqual($scope.optionInfo.dtmfCode, $scope.optionInfoOriginal.dtmfCode);
                        isChoicesEquals = isChoicesEquals && _.isEqual($scope.optionInfo.identifier, $scope.optionInfoOriginal.identifier);
                        isChoicesEquals = isChoicesEquals && _.isEqual($scope.optionInfo.promotedTone, $scope.optionInfoOriginal.promotedTone);

                        return isChoicesEquals;
                    };

                    $scope.save = function (optionInfo) {
                        $uibModalInstance.close({
                            id: optionInfo.id,
                            choiceFileList: optionInfo.choiceFileList,
                            dtmfCode: optionInfo.dtmfCode,
                            identifier: optionInfo.identifier,
                            promotedTone: optionInfo.promotedTone
                        });
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedOptionInfo) {
                var foundOptionInfo = _.findWhere(campaign.optionInfoLists, {id: editedOptionInfo.id});
                if (foundOptionInfo) {
                    foundOptionInfo.choiceFileList = editedOptionInfo.choiceFileList;
                    foundOptionInfo.dtmfCode = editedOptionInfo.dtmfCode;
                    foundOptionInfo.identifier = editedOptionInfo.identifier;
                    foundOptionInfo.promotedTone = editedOptionInfo.promotedTone;
                }
            }, function () {
                //
            });
        };
        $scope.removeOptionInfoFileList = function (campaign, optionInfo) {
            var foundOptionInfo = _.findWhere(campaign.optionInfoLists, {id: optionInfo.id});
            var index = _.indexOf(campaign.optionInfoLists, foundOptionInfo);
            if (index !== -1) {
                campaign.optionInfoLists.splice(index, 1);
            }
        };
        $scope.getOptionInfoFileString = function (choiceFile) {
            var resultStr = choiceFile.file.name;

            return resultStr;
        };
        $scope.getOptionInfoString = function (optionInfo) {
            var resultStr = optionInfo.dtmfCode + ', ' + optionInfo.identifier
                + (optionInfo.promotedTone ? ', ' + optionInfo.promotedTone.name : '');

            return resultStr;
        };
    });

})();
