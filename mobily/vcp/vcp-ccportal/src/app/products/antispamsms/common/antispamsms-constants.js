(function () {
    'use strict';

    /* Constants */
    angular.module('ccportal.products.antispamsms.constants', []);

    var AntiSpamSMSConstants = angular.module('ccportal.products.antispamsms.constants');

    AntiSpamSMSConstants.constant('SMS_ANTISPAM_EDR_TYPE', [
        {type_key: 100, text: 'MO SMS Received'},
        {type_key: 101, text: 'MO SMS Accepted'},
        {type_key: 102, text: 'MO SMS Rejected'},
        {type_key: 120, text: 'MT SMS Received'},
        {type_key: 121, text: 'MT SMS Accepted'},
        {type_key: 122, text: 'MT SMS Rejected'},
        {type_key: 130, text: 'SRI SM Received'},
        {type_key: 131, text: 'SRI SM Accepted'},
        {type_key: 132, text: 'SRI SM Rejected'},
        {type_key: 133, text: 'SRI SM HLR Error'},
        {type_key: 134, text: 'SRI SM Location Check'},
        {type_key: 141, text: 'Subscriber Blocked'},
        {type_key: 142, text: 'Subscriber Unblocked'},
        {type_key: 143, text: 'Subscriber Reblocked'},
        {type_key: 150, text: 'AO SMS Received'},
        {type_key: 151, text: 'AO SMS Accepted'},
        {type_key: 152, text: 'AO SMS Rejected'},
        {type_key: 161, text: 'Counter Accepted'},
        {type_key: 162, text: 'Counter Rejected'},
        {type_key: 163, text: 'Counter Proceeded'},
        {type_key: 172, text: 'External Rejected'},
        {type_key: 181, text: 'Screening Accepted'},
        {type_key: 182, text: 'Screening Rejected'},
        {type_key: 183, text: 'Screening Proceeded'},
        {type_key: 201, text: 'Route Error'},
        {type_key: 202, text: 'Relayed To SMSC'},
        {type_key: 203, text: 'Routed to SMSC'},
        {type_key: 204, text: 'Routed to MSC'},
        {type_key: 205, text: 'Routed To STP'}
    ]);

    AntiSpamSMSConstants.constant('SMS_ANTISPAM_TRAFFIC_TYPES', [
        {value: 11, text: 'MO'},
        {value: 12, text: 'MO Inbound'},
        {value: 13, text: 'MO Outbound'},
        {value: 21, text: 'MT'},
        {value: 22, text: 'MT Alphanumeric'},
        {value: 23, text: 'MT Shortcode'},
        {value: 24, text: 'MT Intl to Inbound'},
        {value: 31, text: 'SRI'},
        {value: 40, text: 'AO'}
    ]);

    AntiSpamSMSConstants.constant('SMS_ANTISPAM_OP_REJECT_REASONS', [
        {value: 0, text: 'No Error'},
        {value: 1, text: 'Spam Counter'},
        {value: 2, text: 'Parameter Screening'},
        {value: 5, text: 'Fraud (MO Inbound)'},
        {value: 6, text: 'Fraud (MO Outbound)'},
        {value: 7, text: 'Fraud (MT)'},
        {value: 8, text: 'MT w/out SRI'},
        {value: 9, text: 'A2P SMS'},
        {value: 10, text: 'Intl to Inbound Roamer'},
        {value: 11, text: 'SRI Filter'},
        {value: 12, text: 'MO Spoofing'},
        {value: 13, text: 'MAP Error'},
        {value: 14, text: 'Fraud (MO BlackList)'},
        {value: 15, text: 'External Security'}
    ]);

    AntiSpamSMSConstants.constant('SMS_ANTISPAM_OP_REJECT_METHODS', [
        {value: 1, text: 'Reject with Positive Ack'},
        {value: 2, text: 'Reject with Negative Ack'},
        {value: 3, text: 'Silent Discard'},
        {value: 4, text: 'Log and Accept'},
        {value: 5, text: 'Reject with Positive Ack and Alert'},
        {value: 6, text: 'Reject with Negative Ack and Alert'},
        {value: 7, text: 'Alert Only'}
    ]);

    AntiSpamSMSConstants.constant('SMS_ANTISPAM_OP_ERROR_CODES', [
        {value: -1, text: 'TCAP User Abort'},
        {value: -2, text: 'TCAP Provider Abort'},
        {value: -3, text: 'TCAP Notice'},
        {value: -4, text: 'TCAP Local Cancel'},
        {value: -5, text: 'Internal Timeout'},
        {value: 1, text: 'Unknown Subscriber'},
        {value: 5, text: 'Unidentified Subscriber'},
        {value: 6, text: 'Absent Subscriber SM'},
        {value: 9, text: 'Illegal Subscriber'},
        {value: 11, text: 'Teleservice Not Provisioned'},
        {value: 12, text: 'Illegal Equipment'},
        {value: 13, text: 'Call Barred'},
        {value: 21, text: 'Facility not Supported'},
        {value: 27, text: 'Absent Subscriber'},
        {value: 31, text: 'Subscriber Busy for MT'},
        {value: 32, text: 'SM Delivery Failure'},
        {value: 33, text: 'Message Waiting List Full'},
        {value: 34, text: 'System Failure'},
        {value: 35, text: 'Data Missing'},
        {value: 36, text: 'Unexpected Data Value'}
    ]);

})();
