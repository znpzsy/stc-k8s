(function () {
    'use strict';

    /* Constants */
    angular.module('partnerportal.partner-info.constants', []);

    var PartnerInfoConstants = angular.module('partnerportal.partner-info.constants');

    PartnerInfoConstants.constant('PROVISIONING_LANGUAGES', [
        {label: 'Languages.AR', value: 'AR'},
        {label: 'Languages.EN', value: 'EN'}
    ]);

    PartnerInfoConstants.constant('DURATION_UNITS', [
        {key: 'Days', label: 'CommonLabels.Days'},
        {key: 'Weeks', label: 'CommonLabels.Weeks'},
        {key: 'Months', label: 'CommonLabels.Months'},
        {key: 'Years', label: 'CommonLabels.Years'},
        {key: 'Hours', label: 'CommonLabels.Hours'},
        {key: 'Minutes', label: 'CommonLabels.Minutes'},
        {key: 'Seconds', label: 'CommonLabels.Seconds'}
    ]);

    PartnerInfoConstants.constant('MSGGW_EDR_RESULT_REASONS', [
        {reason_context: 0, reason_code: 5014001, text: 'MSG_EXCEPTION'},
        {reason_context: 0, reason_code: 5014002, text: 'UNKNOWN_DEST_AGENT_TYPE'},
        {reason_context: 0, reason_code: 5014003, text: 'PREPAID_SYSTEM_PROBLEM'},
        {reason_context: 0, reason_code: 5014004, text: 'CHARGING_EXCEPTION'},
        {reason_context: 0, reason_code: 5014005, text: 'MSG_SEND_EXCEPTION'},
        {reason_context: 0, reason_code: 5014006, text: 'MSG_SEND_FAILED'},
        {reason_context: 0, reason_code: 5014007, text: 'MSG_CANCEL_EXCEPTION'},
        {reason_context: 0, reason_code: 5014008, text: 'MSG_REPLACE_EXCEPTION'},
        {reason_context: 0, reason_code: 5014009, text: 'MSG_QUERY_EXCEPTION'},
        {reason_context: 0, reason_code: 5014010, text: 'MSG_QUERY_FAILED'},
        {reason_context: 0, reason_code: 5014011, text: 'DEST_ADDRESS_GLOBAL_BLOCKED'},
        {reason_context: 0, reason_code: 5014012, text: 'DEST_ADDRESS_LOCAL_BLOCKED'},
        {reason_context: 0, reason_code: 5014013, text: 'ORIG_ADDRESS_GLOBAL_BLOCKED'},
        {reason_context: 0, reason_code: 5014014, text: 'ORIG_ADDRESS_LOCAL_BLOCKED'},
        {reason_context: 0, reason_code: 5014015, text: 'NO_ROUTE_TO_DESTINATION_ADDRESS'},
        {reason_context: 0, reason_code: 5014016, text: 'NO_ACTIVE_SESSION_FOR_CLIENT'},
        {reason_context: 0, reason_code: 5014017, text: 'UNKNOWN_TRX_MESSAGE_GROUP'},
        {reason_context: 0, reason_code: 5014018, text: 'MSG_INSERT_FAILED'},
        {reason_context: 0, reason_code: 5014019, text: 'MSG_DB_INSERTION_FAILED'},
        {reason_context: 0, reason_code: 5014026, text: 'INSUFFICIENT_CREDIT_EXCEPTION'},
        {reason_context: 0, reason_code: 5014027, text: 'LICENSE_LIMIT_EXCEEDED'},
        {reason_context: 0, reason_code: 5014028, text: 'QUOTA_LIMIT_EXCEEDED'},
        {reason_context: 0, reason_code: 5014029, text: 'MO_CORRELATION_ID_SET_FAILED'},
        {reason_context: 0, reason_code: 5014030, text: 'INVALID_TARIFF_INFO'},
        {reason_context: 0, reason_code: 5014031, text: 'CHARGING_ENGINE_IS_NULL'},
        {reason_context: 0, reason_code: 5014032, text: 'SERVER_ERROR'},
        {reason_context: 0, reason_code: 5014033, text: 'SERVER_TICKET_NOT_FOUND'},
        {reason_context: 0, reason_code: 5014034, text: 'APPLICATION_NOT_ACTIVE'},
        {reason_context: 0, reason_code: 5014035, text: 'APPLICATION_NOT_TRANSMITTER'},
        {reason_context: 0, reason_code: 5014036, text: 'APPLICATION_NOT_RECEIVER'},
        {reason_context: 0, reason_code: 5014040, text: 'SUBSCRIBER_DATA_IS_NULL'},
        {reason_context: 0, reason_code: 5014041, text: 'PROVISIONING_EXCEPTION'},
        {reason_context: 0, reason_code: 5014050, text: 'NO_BINARY_SMS_PRIVILEGE'},
        {reason_context: 0, reason_code: 5014051, text: 'NO_CONCAT_SMS_PRIVILEGE'},
        {reason_context: 0, reason_code: 5014052, text: 'SM_LENGTH_NOT_ALLOWED'},
        {reason_context: 0, reason_code: 5014053, text: 'SERVICE_TO_OTHER_OPERATOR_SUBSCRIBER_REJECTED'},
        {reason_context: 0, reason_code: 5014054, text: 'SERVICE_TO_INACTIVE_RECIPIENT_SUBSCRIBER_REJECTED'},
        {reason_context: 0, reason_code: 5014055, text: 'SERVICE_TO_INACTIVE_SENDER_SUBSCRIBER_REJECTED'},
        {reason_context: 0, reason_code: 5014056, text: 'APPLICATION_SHORT_CODE_NOT_ACCEPTED'},
        {reason_context: 0, reason_code: 5014057, text: 'ALPHANUMERIC_ADDRESS_NOT_ALLOWED'},
        {reason_context: 0, reason_code: 5014058, text: 'SMSC_TIMEOUT_EXCEPTION'},
        {reason_context: 0, reason_code: 5014059, text: 'MULTIPLE_RECIPIENT_NOT_SUPPORTED'},
        {reason_context: 0, reason_code: 5014060, text: 'CONSENT_DENIED'},
        {reason_context: 0, reason_code: 5014061, text: 'CONSENT_EXPIRED'},
        {reason_context: 0, reason_code: 5014062, text: 'CONSENT_NORESPONSE'},
        {reason_context: 0, reason_code: 5014063, text: 'CONSENT_UNKNOWN'},
        {reason_context: 0, reason_code: 5014064, text: 'BLACKHOUR_INTERVAL'},
        {reason_context: 0, reason_code: 5014065, text: 'DUPLICATE_MESSAGE'},
        {reason_context: 0, reason_code: 5014066, text: 'THROTTLER_EXCEEDED'},
        {reason_context: 0, reason_code: 5014067, text: 'INPUT_RATE_EXCEEDED'},
        {reason_context: 0, reason_code: 5014068, text: 'KEYWORD_SCREENING'},
        {reason_context: 0, reason_code: 196609, text: 'CLIENT_NOT_FOUND'},
        {reason_context: 0, reason_code: 196610, text: 'PROCESSOR_NOT_FOUND'},
        {reason_context: 0, reason_code: 196611, text: 'MSG_INSERT_FAILED'},
        {reason_context: 0, reason_code: 196612, text: 'MSG_EXCEPTION'},
        {reason_context: 0, reason_code: 196613, text: 'UNKNOWN_TRX'},
        {reason_context: 0, reason_code: 196614, text: 'UNBOUND_CLIENT_IMPL'},
        {reason_context: 0, reason_code: 196615, text: 'INPUT_WINDOW_SIZE_EXCEEDED'},
        {reason_context: 0, reason_code: 196616, text: 'OUTPUT_WINDOW_SIZE_EXCEEDED'},
        {reason_context: 0, reason_code: 196617, text: 'TEMPORARY_SYSTEM_ERROR'},
        {reason_context: 0, reason_code: 196618, text: 'TCP_SENT_FAILURE'},
        {reason_context: 0, reason_code: 196619, text: 'EXCEPTION_OCCURRED'},
        {reason_context: 0, reason_code: 196620, text: 'TRX_CANCELLED'},
        {reason_context: 0, reason_code: 196621, text: 'ROUTE_NOT_FOUND'},
        {reason_context: 0, reason_code: 196622, text: 'DEST_ADDRESS_GLOBAL_BLOCKED'},
        {reason_context: 0, reason_code: 196623, text: 'DEST_ADDRESS_LOCAL_BLOCKED'},
        {reason_context: 0, reason_code: 196624, text: 'ORIG_ADDRESS_GLOBAL_BLOCKED'},
        {reason_context: 0, reason_code: 196625, text: 'ORIG_ADDRESS_LOCAL_BLOCKED'},
        {reason_context: 0, reason_code: 196626, text: 'VALIDATION_ERROR'}
    ]);

    PartnerInfoConstants.constant('MSGGW_EDR_TYPES', [
        {type_key: 1, text: 'EVENT_MT_DELIVERY_ATTEMPTED_VALUE'},
        {type_key: 2, text: 'EVENT_MT_DELIVERY_SUCCESSFUL_VALUE'},
        {type_key: 3, text: 'EVENT_MT_DELIVERY_UNSUCCESSFUL_VALUE'},
        {type_key: 4, text: 'EVENT_MO_DELIVERY_ATTEMPTED_VALUE'},
        {type_key: 5, text: 'EVENT_MO_DELIVERY_SUCCESSFUL_VALUE'},
        {type_key: 6, text: 'EVENT_MO_DELIVERY_UNSUCCESSFUL_VALUE'},
        {type_key: 7, text: 'EVENT_SR_DELIVERY_ATTEMPTED_VALUE'},
        {type_key: 8, text: 'EVENT_SR_DELIVERY_SUCCESSFUL_VALUE'},
        {type_key: 9, text: 'EVENT_SR_DELIVERY_UNSUCCESSFUL_VALUE'},
        {type_key: 10, text: 'EVENT_QUERY_SUCCESSFUL_VALUE'},
        {type_key: 11, text: 'EVENT_QUERY_UNSUCCESSFUL_VALUE'},
        {type_key: 12, text: 'EVENT_CANCEL_SUCCESSFUL_VALUE'},
        {type_key: 13, text: 'EVENT_CANCEL_UNSUCCESSFUL_VALUE'},
        {type_key: 14, text: 'EVENT_REPLACE_SUCCESSFUL_VALUE'},
        {type_key: 15, text: 'EVENT_REPLACE_UNSUCCESSFUL_VALUE'},
        {type_key: 16, text: 'EVENT_ALERT_REQUEST_ATTEMPTED_VALUE'},
        {type_key: 17, text: 'EVENT_ALERT_REQUEST_SUCCESSFUL_VALUE'},
        {type_key: 18, text: 'EVENT_ALERT_REQUEST_UNSUCCESSFUL_VALUE'},
        {type_key: 19, text: 'EVENT_STATUS_REPORT_GENERATED_VALUE'},
        {type_key: 20, text: 'EVENT_CHARGING_ATTEMPTED_VALUE'},
        {type_key: 21, text: 'EVENT_CHARGING_SUCCESSFUL_VALUE'},
        {type_key: 22, text: 'EVENT_CHARGING_UNSUCCESSFUL_VALUE'},
        {type_key: 23, text: 'EVENT_MT_REQUEST_RECEIVED_VALUE'},
        {type_key: 24, text: 'EVENT_MO_REQUEST_RECEIVED_VALUE'},
        {type_key: 25, text: 'EVENT_SR_REQUEST_RECEIVED_VALUE'},
        {type_key: 26, text: 'EVENT_MT_REQUEST_SILENTLY_DROPPED_VALUE'},
        {type_key: 27, text: 'EVENT_MO_REQUEST_SILENTLY_DROPPED_VALUE'},
        {type_key: 28, text: 'EVENT_SR_REQUEST_SILENTLY_DROPPED_VALUE'},
        {type_key: 29, text: 'EVENT_MO_CONSENT_ATTEMPTED_VALUE'},
        {type_key: 30, text: 'EVENT_MO_CONSENT_PENDING_VALUE'},
        {type_key: 31, text: 'EVENT_MO_CONSENT_RECEIVED_VALUE'},
        {type_key: 32, text: 'EVENT_LICENSE_CONSUMED_VALUE'},
        {type_key: 257, text: 'EVENT_SUBMIT_RECEIVED_VALUE'},
        {type_key: 258, text: 'EVENT_SUBMIT_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 259, text: 'EVENT_SUBMIT_RECEIVED_REJECTED_VALUE'},
        {type_key: 260, text: 'EVENT_DATA_RECEIVED_VALUE'},
        {type_key: 261, text: 'EVENT_DATA_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 262, text: 'EVENT_DATA_RECEIVED_REJECTED_VALUE'},
        {type_key: 263, text: 'EVENT_QUERY_RECEIVED_VALUE'},
        {type_key: 264, text: 'EVENT_QUERY_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 265, text: 'EVENT_QUERY_RECEIVED_REJECTED_VALUE'},
        {type_key: 266, text: 'EVENT_CANCEL_RECEIVED_VALUE'},
        {type_key: 267, text: 'EVENT_CANCEL_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 268, text: 'EVENT_CANCEL_RECEIVED_REJECTED_VALUE'},
        {type_key: 269, text: 'EVENT_REPLACE_RECEIVED_VALUE'},
        {type_key: 270, text: 'EVENT_REPLACE_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 271, text: 'EVENT_REPLACE_RECEIVED_REJECTED_VALUE'},
        {type_key: 272, text: 'EVENT_SM_RECEIVED_VALUE'},
        {type_key: 273, text: 'EVENT_SM_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 274, text: 'EVENT_SM_RECEIVED_REJECTED_VALUE'},
        {type_key: 275, text: 'EVENT_DELIVER_SENT_VALUE'},
        {type_key: 276, text: 'EVENT_DELIVER_SENT_ACCEPTED_VALUE'},
        {type_key: 277, text: 'EVENT_DELIVER_SENT_REJECTED_VALUE'},
        {type_key: 278, text: 'EVENT_DATA_SENT_VALUE'},
        {type_key: 279, text: 'EVENT_DATA_SENT_ACCEPTED_VALUE'},
        {type_key: 280, text: 'EVENT_DATA_SENT_REJECTED_VALUE'},
        {type_key: 281, text: 'EVENT_ALERT_NOTIFICATION_SENT_VALUE'},
        {type_key: 282, text: 'EVENT_LONG_MESSAGES_ACCEPTED_VALUE'},
        {type_key: 283, text: 'EVENT_LONG_MESSAGE_PARTS_VALUE'},
        {type_key: 284, text: 'EVENT_SM_ITEMS_ACCEPTED_VALUE'},
        {type_key: 285, text: 'EVENT_SM_ITEMS_REJECTED_VALUE'},
        {type_key: 769, text: 'EVENT_STORE_DB_INSERTION_ATTEMPT_VALUE'},
        {type_key: 770, text: 'EVENT_STORE_DB_INSERTION_SUCCESSFUL_VALUE'},
        {type_key: 771, text: 'EVENT_STORE_DB_INSERTION_UNSUCCESSFUL_VALUE'},
        {type_key: 772, text: 'EVENT_STORE_DB_RETRY_VALUE'},
        {type_key: 773, text: 'EVENT_STORE_DB_DELETION_DELIVERED_VALUE'},
        {type_key: 774, text: 'EVENT_STORE_DB_DELETION_EXPIRED_VALUE'},
        {type_key: 2305, text: 'EVENT_SUBMIT_REQUEST_RECEIVED_VALUE'},
        {type_key: 2306, text: 'EVENT_SUBMIT_REQUEST_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 2307, text: 'EVENT_SUBMIT_REQUEST_RECEIVED_REJECTED_VALUE'},
        {type_key: 2308, text: 'EVENT_CANCEL_REQUEST_RECEIVED_VALUE'},
        {type_key: 2309, text: 'EVENT_CANCEL_REQUEST_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 2310, text: 'EVENT_CANCEL_REQUEST_RECEIVED_REJECTED_VALUE'},
        {type_key: 2311, text: 'EVENT_REPLACE_REQUEST_RECEIVED_VALUE'},
        {type_key: 2312, text: 'EVENT_REPLACE_REQUEST_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 2313, text: 'EVENT_REPLACE_REQUEST_RECEIVED_REJECTED_VALUE'},
        {type_key: 2314, text: 'EVENT_DELIVERY_REQUEST_SENT_VALUE'},
        {type_key: 2315, text: 'EVENT_DELIVERY_REQUEST_SENT_ACCEPTED_VALUE'},
        {type_key: 2316, text: 'EVENT_DELIVERY_REQUEST_SENT_REJECTED_VALUE'},
        {type_key: 2561, text: 'EVENT_MT_DELIVERY_ATTEMPTED_VALUE'},
        {type_key: 2562, text: 'EVENT_MT_DELIVERY_SUCCESSFUL_VALUE'},
        {type_key: 2563, text: 'EVENT_MT_DELIVERY_UNSUCCESSFUL_VALUE'},
        {type_key: 2564, text: 'EVENT_MO_DELIVERY_ATTEMPTED_VALUE'},
        {type_key: 2565, text: 'EVENT_MO_DELIVERY_SUCCESSFUL_VALUE'},
        {type_key: 2566, text: 'EVENT_MO_DELIVERY_UNSUCCESSFUL_VALUE'},
        {type_key: 2567, text: 'EVENT_SR_DELIVERY_ATTEMPTED_VALUE'},
        {type_key: 2568, text: 'EVENT_SR_DELIVERY_SUCCESSFUL_VALUE'},
        {type_key: 2569, text: 'EVENT_SR_DELIVERY_UNSUCCESSFUL_VALUE'},
        {type_key: 2570, text: 'EVENT_QUERY_SUCCESSFUL_VALUE'},
        {type_key: 2571, text: 'EVENT_QUERY_UNSUCCESSFUL_VALUE'},
        {type_key: 2572, text: 'EVENT_CANCEL_SUCCESSFUL_VALUE'},
        {type_key: 2573, text: 'EVENT_CANCEL_UNSUCCESSFUL_VALUE'},
        {type_key: 2574, text: 'EVENT_REPLACE_SUCCESSFUL_VALUE'},
        {type_key: 2575, text: 'EVENT_REPLACE_UNSUCCESSFUL_VALUE'},
        {type_key: 2576, text: 'EVENT_STATUS_REPORT_GENERATED_VALUE'},
        {type_key: 2577, text: 'EVENT_CHARGING_ATTEMPTED_VALUE'},
        {type_key: 2578, text: 'EVENT_CHARGING_SUCCESSFUL_VALUE'},
        {type_key: 2579, text: 'EVENT_CHARGING_UNSUCCESSFUL_VALUE'},
        {type_key: 2580, text: 'EVENT_LICENSE_CONSUMED_VALUE'},
        {type_key: 2817, text: 'EVENT_SMS_FORWARD_REQ_RECEIVED_VALUE'},
        {type_key: 2818, text: 'EVENT_SMS_FORWARD_REQ_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 2819, text: 'EVENT_SMS_FORWARD_REQ_RECEIVED_REJECTED_VALUE'},
        {type_key: 2820, text: 'EVENT_SMS_FORWARD_ATTEMPTED_VALUE'},
        {type_key: 2821, text: 'EVENT_SMS_FORWARD_ATTEMPTED_SUCCESS_VALUE'},
        {type_key: 2822, text: 'EVENT_SMS_FORWARD_ATTEMPTED_FAILURE_VALUE'},
        {type_key: 2823, text: 'EVENT_SMS_FORWARD_REPORT_RECEIVED_STATUS_SUCCESS_VALUE'},
        {type_key: 2824, text: 'EVENT_SMS_FORWARD_REPORT_RECEIVED_STATUS_FAILURE_VALUE'},
        {type_key: 2825, text: 'EVENT_SMS_FORWARD_STATUS_REPORT_RECEIVED_VALUE'},
        {type_key: 2826, text: 'EVENT_SMS_FORWARD_STATUS_REPORT_RECEIVED_ACCEPTED_VALUE'},
        {type_key: 2827, text: 'EVENT_SMS_FORWARD_STATUS_REPORT_RECEIVED_REJECTED_VALUE'},
        {type_key: 2828, text: 'EVENT_SMS_FORWARD_STATUS_REPORT_ATTEMPTED_VALUE'},
        {type_key: 2829, text: 'EVENT_SMS_FORWARD_STATUS_REPORT_ATTEMPTED_SUCCESS_VALUE'}
    ]);

    PartnerInfoConstants.constant('MSGGW_SMS_DELIVERY_STATES', [
        {state: 0, text: 'UNKNOWN'},
        {state: 1, text: 'SUBMIT'},
        {state: 2, text: 'DELIVER'},
        {state: 3, text: 'WAIT4RETRY'},
        {state: 4, text: 'DELIVERED'},
        {state: 5, text: 'UNDELIVERED'},
        {state: 6, text: 'WAIT4REPLACE'},
        {state: 7, text: 'WAIT4CANCEL'},
        {state: 8, text: 'WAIT4RECOVERY'},
        {state: 9, text: 'EXPIRED'},
        {state: 10, text: 'REPLACED'},
        {state: 11, text: 'CANCELED'}
    ]);

    PartnerInfoConstants.constant('MSGGW_SMSC_AGENT_TYPES', [
        {type_key: 8, text: 'SMSC'},
        {type_key: 1, text: 'SERVICE'}
    ]);

    PartnerInfoConstants.constant('MSGGW_MMSC_AGENT_TYPES', [
        {type_key: 9, text: 'MMSC'},
        {type_key: 1, text: 'SERVICE'}
    ]);

    PartnerInfoConstants.constant('CHARGING_GW_EVENT_TYPES', [
        {type_key: 1, text: 'EVENT_CHARGE_AMOUNT_ATTEMPT'},
        {type_key: 2, text: 'EVENT_CHARGE_AMOUNT_SUCCESS'},
        {type_key: 3, text: 'EVENT_CHARGE_AMOUNT_FAIL'},
        {type_key: 4, text: 'EVENT_REFUND_AMOUNT_ATTEMPT'},
        {type_key: 5, text: 'EVENT_REFUND_AMOUNT_SUCCESS'},
        {type_key: 6, text: 'EVENT_REFUND_AMOUNT_FAIL'}
    ]);

    PartnerInfoConstants.constant('CHARGING_GW_EVENT_ERROR_TYPES', [
        {type_key: "POL0501", text: 'INSUFFICIENT_CREDIT'},
        {type_key: "POL0502", text: 'CHARGING_FAILED'},
        {type_key: "POL0503", text: 'SERVICE_IS_NOT_AUTHENTICATED'},
        {type_key: "POL0504", text: 'CHARGING_ID_NOT_MATCHES'},
        {type_key: "POL0505", text: 'SPECIFY_CHARGING_ID'},
        {type_key: "POL0506", text: 'SERVICE_NEEDS_SUBSCRIPTION'},
        {type_key: "POL0507", text: 'NO_SUBSCRIBER_FOUND'},
        {type_key: "POL0508", text: 'NO_SERVICE_IS_FOUND'},
        {type_key: "POL0509", text: 'SERVICE_BELONGS_NO_ORGANIZATION'},
        {type_key: "POL0510", text: 'MANDATORY_PARAMETER_MISSING'},
        {type_key: "POL0511", text: 'CHARGING_RECORD_MISSING'},
        {type_key: "POL0512", text: 'ALREADY_REFUNDED'},
        {type_key: "POL0513", text: 'SERVICE_BELONGS_NO_OFFER'},
        {type_key: "POL0516", text: 'OFFER_NOT_FOUND'},
        {type_key: "POL0517", text: 'ORGANIZATION_NOT_MATCHES'},
        {type_key: "POL0518", text: 'SPECIFY_ORGANIZATION'},
        {type_key: "POL0519", text: 'NOT_OPCO_RELATED_CHARGING_REQUEST'},
        {type_key: "POL0520", text: 'CHARGING_LIMIT_REACHED'},
        {type_key: "POL0521", text: 'SINGLE_CHARGING_LIMIT_REACHED'},
        {type_key: "POL0522", text: 'DUPLICATE_REFUND_REQUEST'},
        {type_key: "POL0523", text: 'NOT_ENOUGH_REFUNDABLE_AMOUNT'},
        {type_key: "SVC0001", text: 'SYSTEM_ERROR'},
        {type_key: "SVC0002", text: 'INVALID_INPUT_VALUE'},
        {type_key: "SVC0005", text: 'DUPLICATE_CHARGING_REQUEST'},
        {type_key: "SVC0007", text: 'INVALID_CHARGING_INFO'},
        {type_key: "POL0001", text: 'POLICY_ERROR'}
    ]);

    PartnerInfoConstants.constant('CHGGW_EVENTS', [
        {key: 0, value: 'UNSET'},
        {key: 100, value: 'DIRECT_DEBIT_ATTEMPTED'},
        {key: 101, value: 'DIRECT_DEBIT_ACCEPTED'},
        {key: 102, value: 'DIRECT_DEBIT_SUCCESS'},
        {key: 103, value: 'DIRECT_DEBIT_FAIL'},
        {key: 110, value: 'DIRECT_REFUND_ATTEMPTED'},
        {key: 111, value: 'DIRECT_REFUND_ACCEPTED'},
        {key: 112, value: 'DIRECT_REFUND_SUCCESS'},
        {key: 113, value: 'DIRECT_REFUND_FAIL'},
        {key: 200, value: 'RESERVATION_RESERVE_ATTEMPTED'},
        {key: 201, value: 'RESERVATION_RESERVE_ACCEPTED'},
        {key: 202, value: 'RESERVATION_RESERVE_SUCCESS'},
        {key: 203, value: 'RESERVATION_RESERVE_FAIL'},
        {key: 210, value: 'RESERVATION_COMMIT_ATTEMPTED'},
        {key: 211, value: 'RESERVATION_COMMIT_ACCEPTED'},
        {key: 212, value: 'RESERVATION_COMMIT_SUCCESS'},
        {key: 213, value: 'RESERVATION_COMMIT_FAIL'},
        {key: 220, value: 'RESERVATION_CANCEL_ATTEMPTED'},
        {key: 221, value: 'RESERVATION_CANCEL_ACCEPTED'},
        {key: 222, value: 'RESERVATION_CANCEL_SUCCESS'},
        {key: 223, value: 'RESERVATION_CANCEL_FAIL'},
        {key: 300, value: 'DURATION_START_ATTEMPTED'},
        {key: 301, value: 'DURATION_START_ACCEPTED'},
        {key: 302, value: 'DURATION_START_SUCCESS'},
        {key: 303, value: 'DURATION_START_FAIL'},
        {key: 310, value: 'DURATION_STOP_ATTEMPTED'},
        {key: 311, value: 'DURATION_STOP_ACCEPTED'},
        {key: 312, value: 'DURATION_STOP_SUCCESS'},
        {key: 313, value: 'DURATION_STOP_FAIL'},
        {key: 400, value: 'DURATION_NOTIFICATION_CHARGING_EXCEPTION_ATTEMPTED'},
        {key: 401, value: 'DURATION_NOTIFICATION_CHARGING_EXCEPTION_SUCCESS'},
        {key: 402, value: 'DURATION_NOTIFICATION_CHARGING_EXCEPTION_FAIL'},
        {key: 410, value: 'DURATION_NOTIFICATION_LOW_CREDIT_ATTEMPTED'},
        {key: 411, value: 'DURATION_NOTIFICATION_LOW_CREDIT_SUCCESS'},
        {key: 412, value: 'DURATION_NOTIFICATION_LOW_CREDIT_FAIL'},
        {key: 420, value: 'DURATION_NOTIFICATION_NO_CREDIT_ATTEMPTED'},
        {key: 421, value: 'DURATION_NOTIFICATION_NO_CREDIT_SUCCESS'},
        {key: 422, value: 'DURATION_NOTIFICATION_NO_CREDIT_FAIL'},
        {key: 430, value: 'DURATION_NOTIFICATION_PING_CLIENT_ATTEMPTED'},
        {key: 431, value: 'DURATION_NOTIFICATION_PING_TRANSACTION_ATTEMPTED'},
        {key: 432, value: 'DURATION_NOTIFICATION_PING_SUCCESS'},
        {key: 433, value: 'DURATION_NOTIFICATION_PING_FAIL'},
        {key: 434, value: 'DURATION_NOTIFICATION_PING_FAIL_STOP_CHARGING'},
    ]);

    PartnerInfoConstants.constant('CHGGW_ERROR_CODES', [
        {key: -1, value: 'UNKNOWN_ERROR'},
        {key: 0, value: 'SUCCESS'},
        {key: 1, value: 'GENERAL_ERROR'},
        {key: 2, value: 'INVALID_REQUEST'},
        {key: 3, value: 'LICENSE_ERROR'},
        {key: 4, value: 'INSUFFICIENT_CREDIT'},
        {key: 5, value: 'CHARGING_ERROR'},
        {key: 6, value: 'SUBSCRIBER_IS_NOT_PROVISIONED'},
        {key: 7, value: 'SUBSCRIBER_IS_NOT_ALLOWED'},
        {key: 8, value: 'NO_DEBIT_TRANSACTION'},
        {key: 9, value: 'REFUND_EXCEEDS_DEBIT'},
        {key: 10, value: 'UNKNOWN_SERVICE'},
        {key: 11, value: 'UNKNOWN_OFFER'},
        {key: 12, value: 'NO_RESERVATION_FOUND'},
        {key: 13, value: 'THROTTLED'},
        {key: 14, value: 'BLACK_LIST'}
    ]);

    PartnerInfoConstants.constant('CHGGW_UNITS', [
        {key: 1, value: 'MONEY'},
        {key: 2, value: 'PIECES'},
        {key: 3, value: 'BYTES'},
        {key: 4, value: 'SECONDS'}
    ]);

    PartnerInfoConstants.factory('CHGGW_PRICE_UNITS', function (CURRENCY) {
        return [
            {key: 1, value: CURRENCY.coin},
            {key: 2, value: 'pieces'},
            {key: 3, value: 'bytes'},
            {key: 4, value: 'sec'}
        ];
    });

    // Offer
    PartnerInfoConstants.constant('OFFER_STATUS_TYPES', ['PENDING', 'ACTIVE', 'HIDDEN', 'INACTIVE']);

    PartnerInfoConstants.constant('OFFER_CHARGING_POLICIES', [
        {
            key: 'Immediate',
            label: 'PartnerInfo.Offers.XsmChargingProfile.Immediate'
        },
        {
            key: 'Deferred',
            label: 'PartnerInfo.Offers.XsmChargingProfile.Deferred'
        }
    ]);

    PartnerInfoConstants.constant('OFFER_INITIAL_CHARGING_POLICIES', ['ChargingOnAttempt', 'ChargingOnActivation']);

    PartnerInfoConstants.constant('OFFER_CHARGING_FAILURE_POLICIES', ['ContinueWithDebt', 'Terminate']);

    PartnerInfoConstants.constant('OFFER_HANDLERS', ['Active', 'Suspended']);

    PartnerInfoConstants.constant('OFFER_CHARGE_ONS', ['MO', 'MT']);

    PartnerInfoConstants.constant('OFFER_TERMINATION_POLICIES', ['DeferredTermination', 'ImmediateTermination']);

    PartnerInfoConstants.constant('OFFER_RENEWAL_POLICIES', ['NoRenewal', 'Auto', 'AutoWithNotification', 'AutoWithConfirmation']);

    PartnerInfoConstants.constant('OFFER_BLACK_LISTED_SUBSCRIBER_POLICIES', ['SuspendSubscription', 'InactivateSubscription', 'KeepSubscription']);

    PartnerInfoConstants.constant('OFFER_TRY_AND_BUY_POLICIES', ['AutoBuyWithNotification', 'AutoBuyWithoutNotification', 'BuyWithNotification', 'BuyWithConfirmation', 'EndWithoutNotification']);

    PartnerInfoConstants.constant('OFFER_PACKAGE_ELIGIBILITIES', ['NoControl', 'Whitelist', 'Blacklist']);

    // Service
    PartnerInfoConstants.constant('SERVICE_STATUS_TYPES', ['PENDING', 'ACTIVE', 'SUSPENDED', 'HIDDEN', 'INACTIVE']);

    PartnerInfoConstants.constant('SERVICE_TYPES', [
        {value: 'DCB_SERVICE', text: 'DCB_SERVICE'},
        {value: 'STANDARD_SMS_SERVICE', text: 'STANDARD_SMS_SERVICE'},
        {value: 'STANDARD_MMS_SERVICE', text: 'STANDARD_MMS_SERVICE'},
        //{value: 'STANDARD_WEB_WAP_SERVICE', text: 'STANDARD_WEB_WAP_SERVICE'}, // Temporarily removed
        {value: 'CUSTOMIZED_SMS_SERVICE', text: 'CUSTOMIZED_SMS_SERVICE'},
        {value: 'CUSTOMIZED_MMS_SERVICE', text: 'CUSTOMIZED_MMS_SERVICE'},
        {value: 'CUSTOMIZED_WEB_WAP_SERVICE', text: 'CUSTOMIZED_WEB_WAP_SERVICE'},
        //{value: 'DATA_TOLL_SERVICE', text: 'DATA_TOLL_SERVICE'}, // Temporarily removed
        {value: 'MULTI_CAPABILITY_SERVICE', text: 'MULTI_CAPABILITY_SERVICE'}
    ]);

    PartnerInfoConstants.constant('SERVICE_USAGES', ['ON_DEMAND', 'SUBSCRIPTION']);

    PartnerInfoConstants.constant('SERVICE_LANGUAGES', ['ARABIC', 'URDU', 'TAGALOG', 'ENGLISH', 'OTHER']);

    PartnerInfoConstants.constant('SERVICE_TEMPLATES', ['ALERTS', 'ON_DEMAND', 'CHAPTERED', 'SEQUENTIAL']);

    PartnerInfoConstants.constant('SERVICE_CURRENCIES', ['SAR', 'AED', 'USD']);

    PartnerInfoConstants.constant('SERVICE_OUTBOUND_APIS', ['NEW_REST', 'LEGACY_SOAP']);

    PartnerInfoConstants.constant('SERVICE_HIDE_MSISDN_WITH_VALUES', ['SAN', 'LEGACY_FAKEID']);

    PartnerInfoConstants.constant('SERVICE_ALERT_SCHEDULING_TYPES', ['SCHEDULED', 'REAL_TIME']);

    PartnerInfoConstants.constant('SERVICE_CYCLE_PERIODS', ['DAY', 'WEEK', 'MONTH']);

    PartnerInfoConstants.constant('SERVICE_LEGACY_PRODUCT_STATUSES', ['DRAFT', 'COMMERCIAL', 'SUSPENDED', 'OFFLINE']);

    PartnerInfoConstants.constant('SERVICE_SLA_VIOLATION_POLICIES', ['REJECT_AND_ALARM', 'ACCEPT_AND_LOG']);

    PartnerInfoConstants.constant('SERVICE_DCB_SUBSCRIBER_IDS_AT_OPERATOR', ['SAN', 'MSISDN']);

    PartnerInfoConstants.constant('SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES', ['PER_PURCHASE', 'PER_DAY', 'PER_MONTH']);

    PartnerInfoConstants.constant('SERVICE_DCB_PREPAID_CAPPING_POLICIES', ['PERCENTAGE_OF_BALANCE', 'FIXED_AMOUNT']);

    PartnerInfoConstants.constant('SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES', ['PER_PURCHASE', 'PER_DAY', 'PER_MONTH', 'FOR_ALL']);

    PartnerInfoConstants.constant('SERVICE_DCB_POSTPAID_CAPPING_POLICIES', ['PERCENTAGE_OF_BALANCE', 'PERCENTAGE_OF_CREDIT_LIMIT', 'FIXED_AMOUNT']);

    PartnerInfoConstants.constant('SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS', ['MA', 'MB', 'MC', 'MD', 'ME', 'MF', 'MN']);

    PartnerInfoConstants.constant('SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES', ['SUCCESS', 'MISSING', 'FAIL']);

    PartnerInfoConstants.constant('SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS', ['CHARGE', 'REFUND', 'ACCEPT_CLIENT_EXCEPTION', 'ACCEPT_CARRIER_EXCEPTION', 'NO_ACTION']);

    PartnerInfoConstants.constant('SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS', ['ABOVE', 'BELOW', 'UNCONDITIONAL']);

    PartnerInfoConstants.constant('SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES', ['CHARGE', 'REFUND']);

    PartnerInfoConstants.constant('SERVICE_DCB_SERVICE_RECONCILIATION_CHARGING_METHODS', ['DEAL_PURCHASE', 'CDR']);

    PartnerInfoConstants.constant('SERVICE_DCB_SERVICE_RECONCILIATION_POLICY_FILE_PERIODS', ['DAILY', 'MONTHLY', 'NEVER']);

    PartnerInfoConstants.constant('SERVICE_NOTIFICATION_PROTOCOLS', [
        {value: 'LEGACY_SOAP', text: 'SOAP'},
        {value: 'NEW_REST', text: 'REST'}
    ]);

    PartnerInfoConstants.constant('SERVICE_VAT_CATEGORIES', ['FEE_VAT_FREE', 'FEE_VAT_INCLUSIVE', 'FEE_VAT_EXCLUSIVE']);

    // Reporting related constants
    PartnerInfoConstants.constant('REPORTING_MSGGW_REPORT_CHANNELS', ['SMS', 'MMS']);

    PartnerInfoConstants.constant('REPORTING_BMS_CHANNELS', ['Bulk SMS', 'Bulk MMS', 'Bulk IVR']);

    // Content Management
    PartnerInfoConstants.constant('CMS_STATUS_TYPES', ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE']);

    PartnerInfoConstants.constant('CMS_GENDERS', ['MALE', 'FEMALE']);

    PartnerInfoConstants.constant('CMS_ACCESS_CHANNELS', ["IVR", "USSD", "SMS", "RBTMobileApp", "RBTSubscriberPortal", "MobilyMobileApp", "MobilyEPortal", "OTHER"]);

    PartnerInfoConstants.constant('CMS_RBT_STATUS_TYPES', ['PENDING', 'ACTIVE', 'HIDDEN', 'INACTIVE']);

    PartnerInfoConstants.constant('CMS_RBT_CONTENT_TYPES', ['CATEGORY', 'MOOD', 'ARTIST', 'ALBUM', 'TONE']);

    PartnerInfoConstants.constant('CMS_RBT_REV_SHARE_POLICIES_ALL', ['NONE', 'COMPLEX']);
    PartnerInfoConstants.constant('CMS_RBT_REV_SHARE_POLICIES_TONE', ['NONE', 'SIMPLE']);

    PartnerInfoConstants.constant('CMS_RBT_REV_SHARE_CARRIER_DEDUCTION', ['NONE', 'FIXED', 'PERCENTAGE']);

    PartnerInfoConstants.constant('CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALL', ['EQUAL']);
    PartnerInfoConstants.constant('CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALBUM', ['EQUAL', 'WEIGHTED', 'PERCENTAGES']);

    // Short Codes
    PartnerInfoConstants.constant('SHORT_CODES_STATUS_TYPES', ['FREE', 'APPLIED', 'IN_REVIEW', 'USED']);

    // Subscription
    PartnerInfoConstants.constant('SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES', [
        {value: 'WEB', text: 'Legacy WEB [WEB]'},
        {value: 'SMS', text: 'Legacy SMS [SMS]'},
        {value: 'TP', text: 'Third Party [TP]'},
        {value: 'PROV', text: 'Subscriber Provisioning [PROV]'},
        {value: 'SMS_HU', text: 'SMS Hang-Up Campaign [SMS_HU]'},
        {value: 'SMS_PC', text: 'SMS Poll Campaign [SMS_PC]'},
        {value: 'SMS_QC', text: 'SMS Questionaire Campaign [SMS_QC]'},
        {value: 'IVR_FK', text: 'IVR Fast-Key Campaign [IVR_FK]'},
        {value: 'IVR_PC', text: 'IVR Poll Campaign [IVR_PC]'},
        {value: 'IVR_QC', text: 'IVR Questionaire Campaign [IVR_QC]'},
        {value: 'IVR_OD', text: 'IVR Outdial Campaign [IVR_OD]'},
        {value: 'SMS_DIRECT', text: 'SMS Portal [SMS_DIRECT]'},
        {value: 'CC-Portal', text: 'Customer Care [CC]'},
        {value: 'DGTL_WEB', text: 'Subscriber Portal [DGTL_WEB]'},
        {value: 'DGTL_APP', text: 'Mobile Application [DGTL_APP]'},
        {value: 'IVR_MBLY', text: 'Mobily IVR [IVR_MBLY]'},
        {value: 'USSD_MBLY', text: 'Mobily USSD [USSD_MBLY]'},
        {value: 'DGTL_WEB_MBLY', text: 'Mobily E-Portal [DGTL_WEB_MBLY]'},
        {value: 'SIM_BUNDLE', text: 'Package Bundle by Provisioning [SIM_BUNDLE]'},
        {value: 'SSM', text: 'Service Subscription Management [SSM]'},
        {value: 'CSM', text: 'Content Subscription Management [CSM]'},
        {value: 'OTHER', text: 'OTHER'}
    ]);
    PartnerInfoConstants.constant('SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT', [
        {value: 'SMS_HU', text: 'SMS Hang-Up Campaign [SMS_HU]'},
        {value: 'SMS_PC', text: 'SMS Poll Campaign [SMS_PC]'},
        {value: 'SMS_QC', text: 'SMS Questionaire Campaign [SMS_QC]'},
        {value: 'IVR_FK', text: 'IVR Fast-Key Campaign [IVR_FK]'},
        {value: 'IVR_PC', text: 'IVR Poll Campaign [IVR_PC]'},
        {value: 'IVR_QC', text: 'IVR Questionaire Campaign [IVR_QC]'},
        {value: 'IVR_OD', text: 'IVR Outdial Campaign [IVR_OD]'},
        {value: 'SMS_DIRECT', text: 'SMS Portal [SMS_DIRECT]'},
        {value: 'CC-Portal', text: 'Customer Care Portal [CC]'},
        {value: 'DGTL_WEB', text: 'Subscriber Portal [DGTL_WEB]'},
        {value: 'DGTL_APP', text: 'Mobile Application [DGTL_APP]'},
        {value: 'IVR_MBLY', text: 'Mobily IVR [IVR_MBLY]'},
        {value: 'USSD_MBLY', text: 'Mobily USSD [USSD_MBLY]'},
        {value: 'DGTL_WEB_MBLY', text: 'Mobily E-Portal [DGTL_WEB_MBLY]'},
        {value: 'DGTL_APP_MBLY', text: 'Mobily Mobile Application [DGTL_APP_MBLY]'},
        {value: 'SIM_BUNDLE', text: 'Package Bundle by Provisioning [SIM_BUNDLE]'},
        {value: 'SSM', text: 'Service Subscription Management [SSM]'},
        {value: 'CSM', text: 'Content Subscription Management [CSM]'},
        {value: 'OTHER', text: 'OTHER'}
    ]);

})();


