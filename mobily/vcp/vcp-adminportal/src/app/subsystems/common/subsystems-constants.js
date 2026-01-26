(function () {
    'use strict';

    /* Constants */
    angular.module('adminportal.subsystems.constants', []);

    var SubsystemsConstants = angular.module('adminportal.subsystems.constants');

    // Reporting related constants
    SubsystemsConstants.constant('REPORTING_SCHEDULE_RECURRENCE', ['DAILY', 'WEEKLY', 'MONTHLY']);

    SubsystemsConstants.constant('REPORTING_QUALIFIERS', [
        {id: 0, label: 'First'},
        {id: 1, label: 'Second'},
        {id: 2, label: 'Third'},
        {id: 3, label: 'Fourth'},
        {id: 4, label: 'Last'}
    ]);

    SubsystemsConstants.constant('DESTINATION_NETWORKS', [
        {name: 'Mobily', mcc: '420', mnc: '03'},
        {name: 'ALL', mcc: null, mnc: null},
        {name: 'CUSTOM', mcc: null, mnc: null}
    ]);

    SubsystemsConstants.constant('XSM_SMS_PROFILE_LANGUAGES', [
        {key: 'AR', label: 'Languages.AR'},
        {key: 'EN', label: 'Languages.EN'}
    ]);

    // Provisioning
    SubsystemsConstants.constant('PROVISIONING_STATUSES', [
        {label: 'ProvisioningStatusTypes.Active', value: 'Active'},
        {label: 'ProvisioningStatusTypes.Inactive', value: 'Inactive'}
    ]);

    SubsystemsConstants.constant('PROVISIONING_PAYMENT_TYPES', [
        {label: 'PaymentTypes.Prepaid', value: 'Prepaid', cmpf_value: 0},
        {label: 'PaymentTypes.Postpaid', value: 'Postpaid', cmpf_value: 1},
        {label: 'PaymentTypes.VIP', value: 'VIP', cmpf_value: 3}
    ]);

    SubsystemsConstants.constant('PROVISIONING_LANGUAGES', [
        {label: 'Languages.AR', value: 'AR'},
        {label: 'Languages.EN', value: 'EN'}
    ]);

    SubsystemsConstants.constant('HTTP_METHODS', ['POST', 'PUT', 'DELETE']);

})();

