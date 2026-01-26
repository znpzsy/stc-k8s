(function () {

    'use strict';

    angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.questionnairequestionfile', []);

    var BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionFileModule = angular.module('adminportal.products.bulkmessaging.operations.interactivecampaigns.questionnairequestionfile');

    BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionFileModule.controller('BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionFileCommonCtrl', function ($scope, $log, UtilService, ContentManagementService) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionFileCommonCtrl');

        $scope.questionFileSelected = function (files, events, questionFile) {
            if (files.length) {
                var newQuestionFile = {
                    id: _.uniqueId(),
                    file: new File([questionFile.file], questionFile.file.name, {type: questionFile.file.type})
                };

                $scope.qaInfo.questionFileList.push(newQuestionFile);

                questionFile = {
                    file: null
                };
            }
        };
        $scope.removeQuestionFile = function (questionFile) {
            var foundQuestionFile = _.findWhere($scope.qaInfo.questionFileList, {id: questionFile.id});
            var index = _.indexOf($scope.qaInfo.questionFileList, foundQuestionFile);
            if (index !== -1) {
                questionFile = null;
                $scope.qaInfo.questionFileList.splice(index, 1);
            }

            $scope.questionFile.file = null;
        };

        $scope.newDTMFCode = function (dtmfCode) {
            var isValid = UtilService.Validators.PhoneKeypad.test(dtmfCode);

            $scope.form.dtmfCodes.$setDirty();
            $scope.form.dtmfCodes.$setValidity('pattern', isValid);

            return isValid ? dtmfCode : undefined;
        };

        $scope.toneList = [];
        $scope.searchPromotedTones = _.throttle(function (text) {
            $scope.toneList = [];
            ContentManagementService.searchTones(0, 100, text, null, true).then(function (response) {
                $scope.toneList = (response ? response.items : []);
            });
        }, 500);
    });

    BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionFileModule.controller('BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionFileCtrl', function ($scope, $log, $uibModal, $filter) {
        $log.debug('BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionFileCtrl');

        // QuestionAnswerFiles managing methods.
        $scope.addQAInfoFileList = function (campaign) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.questionnairequestionfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $controller, $translate, notification, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $controller('BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionFileCommonCtrl', {$scope: $scope});

                    $scope.questionFile = {
                        file: null
                    };

                    $scope.qaInfo = {
                        questionFileList: [],
                        dtmfCodes: [],
                        identifiers: [],
                        promotedTones: []
                    };

                    $scope.save = function (qaInfo) {
                        var dtmfCodesLen = $scope.qaInfo.dtmfCodes.length;
                        var identifiersLen = $scope.qaInfo.identifiers.length;

                        if (dtmfCodesLen !== identifiersLen) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Products.BulkMessaging.Operations.Messages.DigitsIdentifiersDoNotMatch')
                            });
                        } else {
                            $uibModalInstance.close(qaInfo);
                        }
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (qaInfo) {
                campaign.qaInfoLists = campaign.qaInfoLists || [];

                qaInfo.id = _.uniqueId();
                campaign.qaInfoLists.push(qaInfo);
            }, function () {
                //
            });
        };
        $scope.editQAInfoFileList = function (campaign, qaInfo) {
            var modalInstance = $uibModal.open({
                templateUrl: 'products/bulkmessaging/operations/interactivecampaigns/operations.interactivecampaigns.questionnairequestionfile.modal.html',
                backdrop: 'static',
                controller: function ($scope, $log, $controller, $translate, notification, $uibModalInstance, Restangular) {
                    $scope.campaign = campaign;

                    $controller('BulkMessagingInteractiveCampaignsOperationsQuestionnaireQuestionFileCommonCtrl', {$scope: $scope});

                    $scope.questionFile = {
                        file: null
                    };
                    $scope.qaInfo = {
                        id: qaInfo.id,
                        questionFileList: [],
                        dtmfCodes: qaInfo.dtmfCodes,
                        identifiers: qaInfo.identifiers,
                        promotedTones: qaInfo.promotedTones
                    };
                    $scope.qaInfoOriginal = {
                        questionFileList: [],
                        dtmfCodes: angular.copy(qaInfo.dtmfCodes),
                        identifiers: angular.copy(qaInfo.identifiers),
                        promotedTones: angular.copy(qaInfo.promotedTones)
                    };

                    _.each(qaInfo.questionFileList, function (questionFile) {
                        $scope.qaInfo.questionFileList.push({
                            id: questionFile.id,
                            file: new File([questionFile.file], questionFile.file.name, {type: questionFile.file.type})
                        });

                        $scope.qaInfoOriginal.questionFileList.push({
                            id: questionFile.id,
                            file: new File([questionFile.file], questionFile.file.name, {type: questionFile.file.type})
                        });
                    });

                    $scope.isNotChanged = function () {
                        var isQuestionsEquals = ($scope.qaInfo.questionFileList.length === $scope.qaInfoOriginal.questionFileList.length);
                        isQuestionsEquals = isQuestionsEquals && _.every($scope.qaInfo.questionFileList, function (questionFile) {
                            var foundQuestionFileOriginal = _.findWhere($scope.qaInfoOriginal.questionFileList, {id: questionFile.id});
                            if (foundQuestionFileOriginal) {
                                return (foundQuestionFileOriginal.file.name === questionFile.file.name &&
                                    foundQuestionFileOriginal.file.size === questionFile.file.size &&
                                    foundQuestionFileOriginal.file.type === questionFile.file.type);
                            }

                            return false;
                        });

                        isQuestionsEquals = isQuestionsEquals && _.isEqual($scope.qaInfo.dtmfCodes, $scope.qaInfoOriginal.dtmfCodes);
                        isQuestionsEquals = isQuestionsEquals && _.isEqual($scope.qaInfo.identifiers, $scope.qaInfoOriginal.identifiers);
                        isQuestionsEquals = isQuestionsEquals && _.isEqual($scope.qaInfo.promotedTones, $scope.qaInfoOriginal.promotedTones);

                        return isQuestionsEquals;
                    };

                    $scope.save = function (qaInfo) {
                        var dtmfCodesLen = $scope.qaInfo.dtmfCodes.length;
                        var identifiersLen = $scope.qaInfo.identifiers.length;

                        if (dtmfCodesLen !== identifiersLen) {
                            notification({
                                type: 'warning',
                                text: $translate.instant('Products.BulkMessaging.Operations.Messages.DigitsIdentifiersDoNotMatch')
                            });
                        } else {
                            $uibModalInstance.close({
                                id: qaInfo.id,
                                questionFileList: qaInfo.questionFileList,
                                dtmfCodes: qaInfo.dtmfCodes,
                                identifiers: qaInfo.identifiers,
                                promotedTones: qaInfo.promotedTones
                            });
                        }
                    };

                    $scope.cancel = function () {
                        $uibModalInstance.dismiss('cancel');
                    };
                },
                resolve: {}
            });

            modalInstance.result.then(function (editedQAInfo) {
                var foundQAInfo = _.findWhere(campaign.qaInfoLists, {id: editedQAInfo.id});
                if (foundQAInfo) {
                    foundQAInfo.questionFileList = editedQAInfo.questionFileList;
                    foundQAInfo.dtmfCodes = editedQAInfo.dtmfCodes;
                    foundQAInfo.identifiers = editedQAInfo.identifiers;
                    foundQAInfo.promotedTones = editedQAInfo.promotedTones;
                }
            }, function () {
                //
            });
        };
        $scope.removeQAInfoFileList = function (campaign, qaInfo) {
            var foundQAInfo = _.findWhere(campaign.qaInfoLists, {id: qaInfo.id});
            var index = _.indexOf(campaign.qaInfoLists, foundQAInfo);
            if (index !== -1) {
                campaign.qaInfoLists.splice(index, 1);
            }
        };
        $scope.getQAInfoFileString = function (questionFile) {
            var resultStr = questionFile.file.name;

            return resultStr;
        };
        $scope.getQAInfoString = function (qaInfo) {
            var resultStr = '[' +
                qaInfo.dtmfCodes.join(', ') + ']' + ', [' +
                qaInfo.identifiers.join(', ') + ']' +
                (qaInfo.promotedTones && qaInfo.promotedTones.length > 0 ? ', [' + _.pluck(qaInfo.promotedTones, 'name').join(', ') + ']' : '');

            return resultStr;
        };
    });

})();
