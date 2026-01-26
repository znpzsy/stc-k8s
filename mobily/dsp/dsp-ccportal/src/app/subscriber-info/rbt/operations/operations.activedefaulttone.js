(function () {

    'use strict';

    angular.module('ccportal.subscriber-info.rbt.operations.activedefaulttone', []);

    var RBTOperationsActiveDefaultToneModule = angular.module('ccportal.subscriber-info.rbt.operations.activedefaulttone');

    RBTOperationsActiveDefaultToneModule.config(function ($stateProvider) {

        $stateProvider.state('subscriber-info.rbt.operations.activedefaulttone', {
            url: "/active-default-tone",
            templateUrl: 'subscriber-info/rbt/operations/operations.activedefaulttone.details.html',
            controller: 'RBTOperationsActiveDefaultToneCtrl',
            resolve: {
                contentOfferSubscriptions: function ($q, SessionService, RBTSCGatewayService) {
                    var msisdn = SessionService.getMsisdn();

                    var deferred = $q.defer();

                    RBTSCGatewayService.getContentOfferSubscriptions(msisdn).then(function (response) {
                        deferred.resolve(response);
                    }, function (response) {
                        RBTSCGatewayService.showApiError(response);

                        deferred.resolve(response);
                    });

                    return deferred.promise;
                },
                activeDefaultTone: function (UtilService, RBTContentManagementService) {
                    var msisdn = UtilService.getSubscriberMsisdn();

                    return RBTContentManagementService.getActiveDefaultTone(msisdn);
                }
            }
        });

    });

    RBTOperationsActiveDefaultToneModule.controller('RBTOperationsActiveDefaultToneCtrl', function ($scope, $log, $controller, $state, $uibModal, $filter, $translate, notification, DateTimeConstants, Restangular, UtilService,
                                                                                                    RBTContentManagementService, contentOfferSubscriptions, activeDefaultTone) {
        $log.debug('RBTOperationsActiveDefaultToneCtrl');

        var msisdn = UtilService.getSubscriberMsisdn();

        $scope.toneList = contentOfferSubscriptions ? contentOfferSubscriptions.subscriptions : [];
        $scope.toneList = _.filter($scope.toneList, function (tone) {
            return (tone.state.toLowerCase() === 'active' && tone.subscriptionType.toLowerCase() === 'tone');
        });
        $scope.toneList = $filter('orderBy')($scope.toneList, 'contentName');

        $scope.activeDefaultTone = Restangular.stripRestangular(activeDefaultTone);

        $scope.activeDefaultToneOriginal = angular.copy($scope.activeDefaultTone);
        $scope.isNotChanged = function () {
            var origToneId = $scope.activeDefaultToneOriginal.tone ? $scope.activeDefaultToneOriginal.tone.id : null;
            var toneId = $scope.activeDefaultTone.tone ? $scope.activeDefaultTone.tone.id : null;

            return angular.equals(origToneId, toneId);
        };

        $scope.save = function (activeDefaultTone) {
            var activeDefaultToneItem = {
                "tone": activeDefaultTone.tone ? {"id": activeDefaultTone.tone.id} : null
            };

            RBTContentManagementService.updateActiveDefaultTone(msisdn, activeDefaultToneItem).then(function (response) {
                $log.debug('Updated active default tone: ', activeDefaultToneItem, ', response: ', response);

                if (response && response.errorCode) {
                    RBTContentManagementService.showApiError(response);
                } else {
                    notification.flash({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });

                    $scope.cancel();
                }
            }, function (response) {
                $log.debug('Cannot update active default tone: ', activeDefaultToneItem, ', response: ', response);

                RBTContentManagementService.showApiError(response);
            });
        };

        $scope.cancel = function () {
            $state.go($state.$current, null, {reload: true});
        };
    });


})();
