(function () {

    'use strict';

    angular.module('adminportal.services.mca.messagetemplates.messagetemplates.mca', []);

    var MCAMessageTemplatesOperationsModule = angular.module('adminportal.services.mca.messagetemplates.messagetemplates.mca');

    MCAMessageTemplatesOperationsModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.messagetemplates.messagetemplates.mca', {
            url: "/missed-call-notification/mca",
            templateUrl: "services/mca/message-templates/operations.messagetemplates.main.html",
            data: {
                listState: 'services.mca.messagetemplates.messagetemplates.mca.list',
                pageHeaderKey: 'Services.MCA.Operations.MessageFormats.Title',
                subPageHeaderKey: 'Services.MCA.Operations.MessageFormats.MCA'
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
                    return MCAConfService.updateMcaMessageTemplateByTemplateName;
                }
            }
        }).state('services.mca.messagetemplates.messagetemplates.mca.list', {
            url: "/",
            views: {
                'templatesTable': {
                    templateUrl: "services/mca/message-templates/operations.messagetemplates.mca.html",
                    controller: 'MCAMessageTemplatesOperationsTableCtrl',
                    resolve: {
                        messageTemplates: function ($stateParams, MCAConfService) {
                            return MCAConfService.getMcaMessageTemplates();
                        }
                    }
                }
            }
        }).state('services.mca.messagetemplates.messagetemplates.mca.update', {
            url: "/update/:templateName",
            views: {
                'templatesForm': {
                    templateUrl: "services/mca/message-templates/operations.messagetemplates.mca.detail.html",
                    controller: 'MCAMessageTemplatesOperationsUpdateCtrl',
                    resolve: {
                        messageTemplate: function ($stateParams, MCAConfService) {
                            return MCAConfService.getMcaMessageTemplateByTemplateName($stateParams.templateName);
                        }
                    }
                }
            }
        });

    });

})();
