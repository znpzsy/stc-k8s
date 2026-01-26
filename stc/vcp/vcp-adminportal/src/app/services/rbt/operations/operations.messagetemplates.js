
(function () {

    'use strict';

    angular.module('adminportal.services.rbt.operations.messagetemplates', [
        'adminportal.services.rbt.operations.messagetemplates.hangup',
        'adminportal.services.rbt.operations.messagetemplates.promoted',
        'adminportal.services.rbt.operations.messagetemplates.prayertimes',
        'adminportal.services.rbt.operations.messagetemplates.smsautomation'
    ]);

    var RBTOperationsMessageTemplatesModule = angular.module('adminportal.services.rbt.operations.messagetemplates');

    RBTOperationsMessageTemplatesModule.config(function ($stateProvider) {

        $stateProvider.state('services.rbt.operations.messagetemplates', {
           // abstract: true,
            url: "/messagetemplates",
            template: "<div ui-view></div>"
        });

    });

    RBTOperationsMessageTemplatesModule.controller('RBTOperationsMessageTemplatesLanguagesCtrl', function ($scope, $log, $state, $stateParams, languages) {
        $log.debug("RBTOperationsMessageTemplatesLanguagesCtrl");

        // Language list
        $scope.languageList = [];
        _.each(languages.languageCodes, function (shortCode) {
            $scope.languageList.push({
                languageCode: shortCode
            });
        });

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

        $scope.changeLanguage = function (languageCode) {
            $log.debug("Selected language: ", languageCode);

            $state.transitionTo($state.$current, {languageCode: languageCode ? languageCode : undefined}, {
                reload: false,
                inherit: false,
                notify: true
            });
        };
    });



    RBTOperationsMessageTemplatesModule.controller('RBTOperationsMessageTemplatesCommonCtrl', function ($scope, $log, $q, $filter, $translate, UtilService, RBTConfService,notification) {
        $log.debug('RBTOperationsMessageTemplatesCommonCtrl');

        $scope.saveMessageTemplates = function (messageTemplatesPayload){

            RBTConfService.updateMessageTemplates( $scope.languageCode, messageTemplatesPayload).then(function (messageTemplatesResponse) {

                $log.debug("saveMessageTemplates:", messageTemplatesResponse);

                if ((messageTemplatesResponse && messageTemplatesResponse.errorCode)) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: messageTemplatesResponse.errorCode,
                            errorText: messageTemplatesResponse.detail
                        })
                    });
                } else {

                    $scope.originalConf = angular.copy($scope.conf);

                    notification({
                        type: 'success',
                        text: $translate.instant('CommonLabels.OperationSuccessful')
                    });
                }
            }, function (messageTemplatesResponse) {
                $log.debug('Cannot update messageTemplate.Error: ', messageTemplatesResponse);

                notification({
                    type: 'warning',
                    text: $translate.instant('CommonMessages.ApiError', {
                        errorCode: messageTemplatesResponse.data.errorCode,
                        errorText: messageTemplatesResponse.data.detail
                    })
                });

            });

        }
});

    RBTOperationsMessageTemplatesModule.controller('RBTOperationsMessageTemplatesConfCtrl', function ($scope, $log, $q, $state, $stateParams) {
        $log.debug("RBTOperationsMessageTemplatesConfCtrl");

        if ($stateParams.languageCode) {
            $scope.languageCode = $stateParams.languageCode;
        }

    });

})();