(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations.presskey.management.new', []);

    var RBTOperationsPressKeyNewManagementModule = angular.module('adminportal.services.rbt.operations.presskey.management.new');

    RBTOperationsPressKeyNewManagementModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations.presskey.management.new', {
                url: "/new/:dtmfKey",
                templateUrl: "services/rbt/operations/operations.presskey.management.detail.html",
                controller: 'RBTOperationsPressKeyManagementNewCtrl',
                data: {
                    pageHeaderKey: 'Services.RBT.Operations.PressKey.Title',
                    subPageHeaderKey: 'Services.RBT.Operations.PressKey.Management.Title',
                    contentTypeHeaderKey: 'Services.RBT.Operations.PressKey.Management.New'
                },
                resolve: {
                    dtmfKey: function ($stateParams) {
                        return decodeURIComponent($stateParams.dtmfKey);
                    }
                }
            })
            .state('services.rbt.operations.presskey.management.new.copy', {
                url: "/copy",
                templateUrl: "services/rbt/operations/operations.presskey.management.detail.copy.html",
                controller: 'RBTOperationsPressKeyManagementNewCopyCtrl'
            })
            .state('services.rbt.operations.presskey.management.new.service', {
                url: "/service",
                templateUrl: "services/rbt/operations/operations.presskey.management.detail.service.html",
                controller: 'RBTOperationsPressKeyManagementNewServiceCtrl',
                resolve: {
                    offers: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getOffers(0, DEFAULT_REST_QUERY_LIMIT, false, true);
                    }
                }
            })
            .state('services.rbt.operations.presskey.management.new.tone', {
                url: "/tone",
                templateUrl: "services/rbt/operations/operations.presskey.management.detail.tone.html",
                controller: 'RBTOperationsPressKeyManagementNewToneCtrl',
            });
    });

    RBTOperationsPressKeyNewManagementModule.controller('RBTOperationsPressKeyManagementNewCommonCtrl', function ($scope, $state, $stateParams, $log, $translate, $timeout, notification, Upload, SERVICES_BASE, RBT_DTMF_KEYS, RBT_DTMF_PROMOTION_TYPES, UtilService) {
        $log.debug('RBTOperationsPressKeyManagementNewCommonCtrl');

        $scope.RBT_DTMF_KEYS = RBT_DTMF_KEYS;
        $scope.RBT_DTMF_PROMOTION_TYPES = RBT_DTMF_PROMOTION_TYPES;
        $scope.newRecord = true;

        $scope.cancel = function() {
            $state.go('services.rbt.operations.presskey.management.list');
        }

        $scope.toneFileChanged = function (file, formCtrlId, form) {

            // TODO: Implement audio file validation when the RBT Service Validation endpoint is ready
            $log.debug('Validation in progress, toneFileChanged: ', file);

            $scope.validationInProgress = true;

            file.upload = Upload.http({
                method: 'PUT',
                url: SERVICES_BASE + '/rbt-audio-rest/v1/audiofiles/validation',
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                data: file
            });

            file.upload.then(function (response) {
                $log.debug('Validated file. response: ', response);

                $timeout(function () {
                    $scope.validationInProgress = false;
                    file.result = response.data;

                    UtilService.setError(form, formCtrlId, 'audioValiditiyCheck', (response && response.data && response.data.allowed));

                });
            }, function (response) {

                $log.debug('Validation upload error. response: ', response);
                $scope.validationInProgress = false;
                UtilService.setError(form, formCtrlId, 'audioValiditiyCheck', (response && response.data && response.data.allowed));

            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
                $scope.validationInProgress = true;
                $log.debug('Upload event: ', evt);
            });
        };

        $scope.changePromotionType = function (promotionType){
            $log.debug('changePromotionType: ' + promotionType);

            if ($scope.promotionType === 'COPY') {
                $state.go('services.rbt.operations.presskey.management.new.copy');
            } else if ($scope.promotionType === 'SERVICE') {
                $state.go('services.rbt.operations.presskey.management.new.service');
            } else if ($scope.promotionType === 'TONE') {
                $state.go('services.rbt.operations.presskey.management.new.tone');
            }
        }

        $scope.changeDtmfKey = function(key) {
            $log.debug('changeDtmfKey: ' + key);
            //$state.params.dtmfKey = dtmfKey;
            $scope.dtmfKey = key;
        }
    });

    RBTOperationsPressKeyNewManagementModule.controller('RBTOperationsPressKeyManagementNewCtrl', function ($scope, $controller, $log, $state, $stateParams, dtmfKey) {
        $log.debug('RBTOperationsPressKeyManagementNewCtrl');
        $controller('RBTOperationsPressKeyManagementNewCommonCtrl', {$scope: $scope});

        $scope.dtmfKey = dtmfKey;
        $scope.promotionType = $state.current.url.replace('/','').toUpperCase();
    });

    RBTOperationsPressKeyNewManagementModule.controller('RBTOperationsPressKeyManagementNewCopyCtrl', function ($scope, $state, $controller, $log, $filter, $timeout, $translate, notification, Restangular, RBTPressKeyManagementService) {
        $log.debug('RBTOperationsPressKeyManagementNewCopyCtrl');

        $scope.promotionType = 'COPY';
        $scope.key = encodeURIComponent($scope.$parent.dtmfKey);
        $scope.contentMetadata = { freePrompt: null, paidPrompt: null};
        $scope.originalContentMetadata = angular.copy($scope.contentMetadata);

        $scope.isNotChanged = function () {
            return angular.equals($scope.originalContentMetadata, $scope.contentMetadata)
        };

        $scope.uploadFile = function (copyPromptData) {
            $log.debug('Uploading copy prompt files: ', copyPromptData);

            var path = '/enhancedPressOne/promotions/copy/' + $scope.key;
            RBTPressKeyManagementService.uploadFormData(copyPromptData.freePrompt, copyPromptData.paidPrompt, path).then(function (response) {
                $log.debug('Upload response', response);
                if (response && response.data && response.data.errorCode) {
                    notification({
                        type: 'warning',
                        text: response.data.errorCode + ' - ' + response.data.detail
                    });
                } else {
                    notification({
                        type: 'success',
                        text: $translate.instant('CommonMessages.FileUploadSucceded')
                    });

                    $scope.cancel();
                }

            }, function (response) {
                $log.debug('Upload error response: ', response);
                if (response.status > 0) {
                    var message = '';
                    if (response.data && response.data.errorCode) {
                        message = response.data.errorCode + ' - ' + response.data.detail;
                    } else {
                        message = response.status + ' - ' + response.data;
                    }

                    notification({
                        type: 'warning',
                        text: message
                    });
                }
            });
        };

        $scope.save = function() {
            if($scope.isNotChanged()) {
                $log.debug('No changes detected. Nothing to save.');
            } else {
                $scope.uploadFile($scope.contentMetadata);
            }

        };

    });

    RBTOperationsPressKeyNewManagementModule.controller('RBTOperationsPressKeyManagementNewServiceCtrl', function ($scope, $state, $controller, $log, $filter, $timeout, $translate, Restangular, RBTPressKeyManagementService, offers) {
        $log.debug('RBTOperationsPressKeyManagementNewServiceCtrl');

        $scope.promotionType = 'SERVICE';

        var offers = Restangular.stripRestangular(offers);
        var filteredOffers = _.filter(offers.offers, function (offer) {
            return offer.profiles.some(function(profile) {
                return profile.name === "OfferRbtProfile" &&
                    profile.attributes.some(function(attr) {
                        return attr.name === "OfferRbtType" && (attr.value !== "Content" && attr.value !== "RbtMain");
                    });
            })
        });

        $scope.offers = $filter('orderBy')(filteredOffers, 'id');
        $scope.key = encodeURIComponent($scope.$parent.dtmfKey);

        $scope.removeFile = function() {
            delete $scope.servicePromptFile;
        };

        $scope.uploadFile = function (file) {
            $log.debug('Uploading system prompt voice file: ', file);

            var srcUrl = RBTPressKeyManagementService.generatePath(true, 'service', $scope.key, [$scope.offer]);
            RBTPressKeyManagementService.uploadFile(file, 'POST', srcUrl, function(response) {
                $scope.cancel();
            }, function(error) {
                $log.debug('Failed to upload the file:', error);
            });
        };

        $scope.save = function() {
            $scope.uploadFile($scope.servicePromptFile);
        };
    });

    RBTOperationsPressKeyNewManagementModule.controller('RBTOperationsPressKeyManagementNewToneCtrl', function ($scope, $q, $state, $stateParams, $controller, $timeout, $log, $uibModal, $filter, $translate, notification, NgTableParams, NgTableService,
                                                                                                                RBTPressKeyManagementService) {
        $log.debug('RBTOperationsPressKeyManagementNewToneCtrl');
        $scope.promotionType = 'TONE';
        $scope.key = encodeURIComponent($scope.$parent.dtmfKey);

        $scope.toneIdsList = [];
        $scope.newTonePromotionData = { tonePromptFile: undefined, toneSubscriptionCode: undefined, alias: undefined };

        $scope.uploadFile = function (file, subscriptionCode) {
            $log.debug('Uploading tone prompt audio file: subscriptionCode, file ', subscriptionCode, file);

            var srcUrl = RBTPressKeyManagementService.generatePath(true, 'tone', $scope.key, [subscriptionCode]);
            RBTPressKeyManagementService.uploadFile(file, 'POST', srcUrl, function(response) {
                $state.go('services.rbt.operations.presskey.management.update.tone', {dtmfKey: $scope.key});
            }, function(error) {
                $log.debug('Failed to upload the file:', error);
            });
        };

        $scope.save = function() {
            $log.debug('Saving tone promotion entry: ', $scope.toneId, $scope.newTonePromotionData, $scope.newTonePromotionData.tonePromptFile);

            $scope.uploadFile($scope.newTonePromotionData.tonePromptFile, $scope.newTonePromotionData.toneSubscriptionCode);
        };

        $scope.removeFile = function() {
            delete $scope.newTonePromotionData.tonePromptFile;
        };


        $scope.removeToneSelection = function (data) {
            $scope.newTonePromotionData.toneSubscriptionCode = undefined;
        };


        $scope.openToneSelectionModal = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'services/rbt/operations/operations.presskey.management.toneselection.modal.html',
                controller: 'RBTOperationsPressKeyManagementToneSelectionModalInstanceCtrl',
                size: 'lg',
                resolve: {
                    allOrganizations: function (CMPFService, DEFAULT_REST_QUERY_LIMIT) {
                        return CMPFService.getAllOrganizationsCustom(false, true, [CMPFService.OPERATOR_PROFILE]);
                    }
                }
            });

            modalInstance.result.then(function (selectedItem) {
                $log.debug('Selected tone: ', selectedItem);
                $scope.newTonePromotionData.toneSubscriptionCode = selectedItem.offers[0].subscriptionCode;
                $scope.newTonePromotionData.alias = selectedItem.alias;
                $scope.newTonePromotionData.name = selectedItem.name;
                $scope.newTonePromotionData.organizationName = selectedItem.organizationName;
            }, function () {
            });
        };
    });

   
})();
