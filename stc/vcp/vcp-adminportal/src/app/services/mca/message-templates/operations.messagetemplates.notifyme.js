(function () {

    'use strict';

    angular.module('adminportal.services.mca.messagetemplates.messagetemplates.notifyme', []);

    var MCAMessageTemplatesOperationsNotifyMeModule = angular.module('adminportal.services.mca.messagetemplates.messagetemplates.notifyme');

    MCAMessageTemplatesOperationsNotifyMeModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.messagetemplates.messagetemplates.notifyme', {
            url: "/missed-call-notification/notifyme",
            templateUrl: "services/mca/message-templates/operations.messagetemplates.main.html",
            data: {
                listState: 'services.mca.messagetemplates.messagetemplates.notifyme.list',
                pageHeaderKey: 'Services.MCA.Operations.MessageFormats.Title',
                subPageHeaderKey: 'Services.MCA.Operations.MessageFormats.NotifyMe'
            },
            resolve: {
                defaultMessageTemplates: function ($stateParams) {
                    return {
                        name: $stateParams.templateName,
                        type: 'notifyMeMessageFormat',
                        language: null,
                        paymentType: null,
                        useCalledNumberAsSmsSourceAddress: 1,
                        smsSourceAddress: '',
                        smsTemplate: '',
                        datetimeFormat: '',
                        datetimeDelimiter: ''
                    };
                },
                updateMethod: function (MCAConfService) {
                    return MCAConfService.updateNotifyMeMessageTemplateByTemplateName;
                }
            }
        }).state('services.mca.messagetemplates.messagetemplates.notifyme.list', {
            url: "/",
            views: {
                'templatesTable': {
                    templateUrl: "services/mca/message-templates/operations.messagetemplates.notifyme.html",
                    controller: 'MCAMessageTemplatesOperationsTableCtrl',
                    resolve: {
                        messageTemplates: function ($stateParams, MCAConfService) {
                            return MCAConfService.getNotifyMeMessageTemplates();
                        }
                    }
                }
            }
        }).state('services.mca.messagetemplates.messagetemplates.notifyme.update', {
            url: "/update/:templateName",
            views: {
                'templatesForm': {
                    templateUrl: "services/mca/message-templates/operations.messagetemplates.notifyme.detail.html",
                    controller: 'MCAMessageTemplatesOperationsUpdateCtrl',
                    resolve: {
                        messageTemplate: function ($stateParams, MCAConfService) {
                            return MCAConfService.getNotifyMeMessageTemplateByTemplateName($stateParams.templateName);
                        }
                    }
                }
            }
        });

    });

})();
