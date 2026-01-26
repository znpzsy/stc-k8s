(function () {

    'use strict';

    angular.module('adminportal.services.mca.messagetemplates.messagetemplates.ann', []);

    var MCAMessageTemplatesOperationsAnnModule = angular.module('adminportal.services.mca.messagetemplates.messagetemplates.ann');

    MCAMessageTemplatesOperationsAnnModule.config(function ($stateProvider) {

        $stateProvider.state('services.mca.messagetemplates.messagetemplates.ann', {
            url: "/missed-call-notification/ann",
            templateUrl: "services/mca/message-templates/operations.messagetemplates.main.html",
            data: {
                listState: 'services.mca.messagetemplates.messagetemplates.ann.list',
                pageHeaderKey: 'Services.MCA.Operations.MessageFormats.Title',
                subPageHeaderKey: 'Services.MCA.Operations.MessageFormats.ANN'
            },
            resolve: {
                defaultMessageTemplates: function ($stateParams) {
                    return {
                        name: $stateParams.templateName,
                        type: 'annMessageFormat',
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
                    return MCAConfService.updateAnnMessageTemplateByTemplateName;
                }
            }
        }).state('services.mca.messagetemplates.messagetemplates.ann.list', {
            url: "/",
            views: {
                'templatesTable': {
                    templateUrl: "services/mca/message-templates/operations.messagetemplates.ann.html",
                    controller: 'MCAMessageTemplatesOperationsTableCtrl',
                    resolve: {
                        messageTemplates: function ($stateParams, MCAConfService) {
                            return MCAConfService.getAnnMessageTemplates();
                        }
                    }
                }
            }
        }).state('services.mca.messagetemplates.messagetemplates.ann.update', {
            url: "/update/:templateName",
            views: {
                'templatesForm': {
                    templateUrl: "services/mca/message-templates/operations.messagetemplates.ann.detail.html",
                    controller: 'MCAMessageTemplatesOperationsUpdateCtrl',
                    resolve: {
                        messageTemplate: function ($stateParams, MCAConfService) {
                            return MCAConfService.getAnnMessageTemplateByTemplateName($stateParams.templateName);
                        }
                    }
                }
            }
        });

    });

})();
