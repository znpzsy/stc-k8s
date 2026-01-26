(function () {
    'use strict';

    /* Constants */
    angular.module('adminportal.products.bulkmessaging.constants', []);

    var BulkMessagingConstants = angular.module('adminportal.products.bulkmessaging.constants');

    BulkMessagingConstants.constant('BMS_CAMPAIGN_STATUS_LIST', [
        {text: 'RUNNING', value: 0}, // ACTIVE
        {text: 'COMPLETED', value: 1}, // COMPLETED
        {text: 'PAUSED', value: 4}, // PAUSED
        {text: 'CANCELLED', value: 2}, // CANCELLED
        {text: 'SCHEDULED', value: 7}, // TIMECONSTRAINT_WAIT
        {text: 'RETRYING', value: 8}, // RETRYING
        {text: 'INITIAL', value: 9} // INITIAL
        // {text: 'DISABLED', value: 3},
        // {text: 'WAITINGAPPROVAL', value: 5},
        // {text: 'REJECTED', value: 6},
    ]);

    BulkMessagingConstants.constant('BMS_CAMPAIGN_STATUSES', {
        RUNNING: 'ACTIVE',
        PAUSED: 'PAUSED',
        COMPLETED: 'COMPLETED',
        CANCELLED: 'CANCELLED',
        SCHEDULED: 'TIMECONSTRAINT_WAIT',
        RETRYING: 'RETRYING'
    });

    BulkMessagingConstants.constant('BMS_DISTRIBUTION_LIST_TYPES', [
        {key: 'GLOBAL', textKey: 'Products.BulkMessaging.Operations.Global.Title'},
        {key: 'PER_ORGANIZATION', textKey: 'Products.BulkMessaging.Operations.PerOrganization.MenuHeader'},
        {key: 'PER_USER', textKey: 'Products.BulkMessaging.Operations.PerUser.MenuHeader'}
    ]);

    BulkMessagingConstants.constant('BMS_EDR_CHANNELS', [
        {text: 'PORTAL', value: 1},
        {text: 'REST', value: 2},
        {text: 'WS', value: 3}
    ]);

    BulkMessagingConstants.constant('BMS_JOB_TYPES', {
        BULK_MMS: 1,
        BULK_SMS: 2,
        BULK_USSD: 3,
        BULK_IVR: 4
    });

    var baseInteractivityTemplates = [
        {'group': 'DSP Templates', 'label': 'DSP Poll', 'value': 'Poll'},
        {'group': 'DSP Templates', 'label': 'DSP Questionnaire', 'value': 'Questionnaire'},
        {'group': 'RBT Templates', 'label': 'RBT Poll', 'value': 'RBT Poll'},
        {'group': 'RBT Templates', 'label': 'RBT Questionnaire', 'value': 'RBT Questionnaire'}
    ];
    BulkMessagingConstants.constant('BMS_SMS_INTERACTIVITY_TEMPLATES', baseInteractivityTemplates);
    BulkMessagingConstants.constant('BMS_IVR_INTERACTIVITY_TEMPLATES', baseInteractivityTemplates.concat([
        {'group': 'RBT Templates', 'label': 'RBT Outdial', 'value': 'RBT Outdial'},
        {'group': 'RBT Templates', 'label': 'RBT Fast-Key', 'value': 'RBT Fast-Key'}
    ]));

})();
