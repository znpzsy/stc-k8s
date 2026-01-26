(function () {

    'use strict';

    angular.module('adminportal.services.mca.messagetemplates.messagetemplates.mcabasic', []);

    var MCAMessageTemplatesOperationsModule = angular.module('adminportal.services.mca.messagetemplates.messagetemplates.mcabasic');

    MCAMessageTemplatesOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.messagetemplates.messagetemplates.mcabasic', {
            url: "/missed-call-notification/mcabasic",
            templateUrl: "services/mca/message-templates/operations.messagetemplates.main.html",
            data: {
                listState: 'services.mca.messagetemplates.messagetemplates.mcabasic.list',
                updateState: 'services.mca.messagetemplates.messagetemplates.mcabasic.update',
                pageHeaderKey: 'Services.MCA.Operations.MessageFormats.Title',
                subPageHeaderKey: 'Services.MCA.Operations.MessageFormats.MCA',
                showPaymentType: true
            },
            resolve: {
                defaultMessageTemplates: function ($stateParams) {
                    return {
                        name: $stateParams.templateName,
                        type: 'mcaMessageFormat',
                        language: null,
                        paymentType: null,
                        redirectionReason: null,
                        useCallingNumberAsSmsSourceAddress: 1,
                        smsSourceAddress: '',
                        distinctNumbersPerMessage: 1,
                        singleCallSmsTemplate: '',
                        datetimeDelimiter: '',
                        datetimeFormat: '',
                        restrictedNumberText: ''
                    };
                },
                updateMethod: function (MCAConfService) {
                    return MCAConfService.updateMcaBasicMessageTemplateByTemplateName;
                }
            }
        }).state('services.mca.messagetemplates.messagetemplates.mcabasic.list', {
            url: "/",
            views: {
                'templatesTable': {
                    templateUrl: "services/mca/message-templates/operations.messagetemplates.mca.html",
                    controller: 'MCAMessageTemplatesOperationsTableCtrl',
                    resolve: {
                        messageTemplates: function ($stateParams, MCAConfService) {
                            return MCAConfService.getMcaBasicMessageTemplates();
                        }
                    }
                }
            }
        }).state('services.mca.messagetemplates.messagetemplates.mcabasic.update', {
            url: "/update/:templateName",
            views: {
                'templatesForm': {
                    templateUrl: "services/mca/message-templates/operations.messagetemplates.mca.detail.html",
                    controller: 'MCAMessageTemplatesOperationsUpdateCtrl',
                    resolve: {
                        messageTemplate: function ($stateParams, MCAConfService) {
                            return MCAConfService.getMcaBasicMessageTemplateByTemplateName($stateParams.templateName);
                        }
                    }
                }
            }
        });

    });

})();
