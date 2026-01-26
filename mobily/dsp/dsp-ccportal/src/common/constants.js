(function () {

    'use strict';

    /* Constants */
    angular.module('Application.constants', []);

    var ApplicationConstants = angular.module('Application.constants');

    ApplicationConstants.constant('RESOURCE_NAME', 'DSP Customer Care Portal');

    ApplicationConstants.constant('CURRENCY', {
        code: 682,
        abbr: 'SAR',
        coin: 'halalah'
    });

    // This method finds locale datetime string by specified timezone string (e.g. 'Europe/London'). Calculates time
    // offset between the found date value and the current utc date value. Converts that calculated offset value to
    // a timezone offset string (as like +0300) finally.
    var getTimezoneOffsetString = function (tz, withColon) {
        return moment().tz(tz).format(withColon ? 'Z' : 'ZZ');
    };

    var TIMEZONE = 'Asia/Riyadh';

    ApplicationConstants.constant('DateTimeConstants', {
        TIMEZONE: TIMEZONE,
        OFFSET: getTimezoneOffsetString(TIMEZONE),
        OFFSET_WITH_COLON: getTimezoneOffsetString(TIMEZONE, true)
    });

    ApplicationConstants.constant('DEFAULT_REST_QUERY_LIMIT', 10000);
    ApplicationConstants.constant('DEFAULT_WIDE_REST_QUERY_LIMIT', 50000);
    ApplicationConstants.constant('BATCH_SIZE', 2500);

    ApplicationConstants.constant('TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION', 5000);

    ApplicationConstants.constant('STATUS_TYPES', [
        {value: 'ACTIVE', label: 'StatusTypes.ACTIVE'},
        {value: 'INACTIVE', label: 'StatusTypes.INACTIVE'}
    ]);

    ApplicationConstants.constant('CMPF_USER_KEYS', ['lOcAl_UsEr', 'a02b11bf']);

    ApplicationConstants.constant('HTTP_METHODS', ['POST', 'PUT', 'DELETE']);

    ApplicationConstants.constant('PROVISIONING_CHANNEL_TYPES', [
        {id: 1, label: "IVR"},
        {id: 2, label: "USSD"},
        {id: 3, label: "SMS"},
        {id: 4, label: "WEB"},
        {id: 5, label: "WAP"},
        {id: 6, label: "SSM"},
        {id: 7, label: "Provisioning"},
        {id: 8, label: "Customer Care"},
        {id: 9, label: "Third Party"},
        {id: 10, label: "Mobile Application"},
        {id: 11, label: "OTHER"}
    ]);

    ApplicationConstants.constant('DAYS_OF_WEEK', [
        {id: 0, text: "CommonLabels.DaysOfWeek.Sunday", value: 1},
        {id: 1, text: "CommonLabels.DaysOfWeek.Monday", value: 2},
        {id: 2, text: "CommonLabels.DaysOfWeek.Tuesday", value: 3},
        {id: 3, text: "CommonLabels.DaysOfWeek.Wednesday", value: 4},
        {id: 4, text: "CommonLabels.DaysOfWeek.Thursday", value: 5},
        {id: 5, text: "CommonLabels.DaysOfWeek.Friday", value: 6},
        {id: 6, text: "CommonLabels.DaysOfWeek.Saturday", value: 7}
    ]);

    ApplicationConstants.constant('SCREENING_MANAGER_RULES', [
        {value: 'AcceptAll', label: 'ScreeningManagerRules.AcceptAll'},
        {value: 'AcceptWhitelist', label: 'ScreeningManagerRules.AcceptWhitelist'},
        {value: 'RejectAll', label: 'ScreeningManagerRules.RejectAll'},
        {value: 'RejectBlacklist', label: 'ScreeningManagerRules.RejectBlacklist'}
    ]);

    ApplicationConstants.constant('DIAMETER_SERVICE_IDENTIFIER_MAPPING', [
        {id: 21, label: 'MOMT MMS'},
        {id: 22, label: 'MOAT MMS'},
        {id: 23, label: 'AOMT MMS'},
        {id: 26, label: 'AOMT SMS'},
        {id: 30, label: 'Roaming MO SMS'},
        {id: 31, label: 'MOAT SMS'}
    ]);

    ApplicationConstants.constant('POINT_TYPES', ['SUCCESS', 'FAILURE']);

    // Subscription
    ApplicationConstants.constant('SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES', [
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
    ApplicationConstants.constant('SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT', [
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
    ApplicationConstants.constant('SUBSCRIPTION_MANAGEMENT_ERROR_CODES', [
        {key: 0, text: 'SUCCESS'},
        {key: 5200000, text: 'GENERAL_ERROR'},
        {key: 5201000, text: 'MANDATORY_PARAMETER_MISSING'},
        {key: 5201001, text: 'ERR_LAST_SUBSCRIPTION_DATE_PASSED'},
        {key: 5201002, text: 'ERR_START_DATE_INVALID'},
        {key: 5201003, text: 'ERR_ILLEGAL_SUBSCRIBER_STATE'},
        {key: 5201004, text: 'ERR_OFFER_SUBSCRIPTION_EXISTS'},
        {key: 5201005, text: 'ERR_OFFER_SUBSCRIPTION_DOESNOT_EXIST'},
        {key: 5201006, text: 'ERR_EVENT_SCHEDULING_FAILED'},
        {key: 5201007, text: 'ERR_OFFER_NOT_EXISTS'},
        {key: 5201008, text: 'ERR_SUBSCRIBER_NOT_FOUND'},
        {key: 5201009, text: 'ERR_SERVICE_NOT_FOUND'},
        {key: 5201010, text: 'ERR_OFFER_NOT_FOUND'},
        {key: 5201011, text: 'ERR_INVALID_MSISDN_FORMAT'},
        {key: 5201012, text: 'ERR_INVALID_OFFER_STATE'},
        {key: 5201013, text: 'ERR_EVENT_REMOVAL_FAILED'},
        {key: 5201014, text: 'ERR_CREATE_SUBSCRIPTION_FAILED'},
        {key: 5201015, text: 'ERR_INVALID_SERVICE_STATE'},
        {key: 5201016, text: 'ERR_TRIAL_SUBSCRIPTION_NOT_ALLOWED_MORE_THAN_ONCE'},
        {key: 5201017, text: 'ERR_ORGANIZATION_NOT_FOUND'},
        {key: 5201018, text: 'MANDATORY_PROFILE_MISSING'},
        {key: 5201019, text: 'MANDATORY_ATTRIBUTE_MISSING'},
        {key: 5201020, text: 'ERR_SUBSCRIBER_IS_NOT_ELIGIBLE'},
        {key: 5201021, text: 'ERR_SCREENING_FAILED'},
        {key: 5201022, text: 'ERR_SUBSCRIBER_IS_NOT_ACTIVE'},
        {key: 5201023, text: 'ERR_CMPF_NOT_ACCESSIBLE'},
        {key: 5201024, text: 'ERR_CHGW_NOT_ACCESSIBLE'},
        {key: 5201025, text: 'ERR_SRE_NOT_ACCESSIBLE'},
        {key: 5201026, text: 'ERR_SCR_MGR_NOT_ACCESSIBLE'},
        {key: 5201027, text: 'ERR_NGSSM_REPO_NOT_ACCESSIBLE'},
        {key: 5201028, text: 'ERR_CMPFCACHE_NOT_ACCESSIBLE'},
        {key: 5201029, text: 'ERR_EQM_NOT_ACCESSIBLE'},
        {key: 5201030, text: 'ERR_SMSPORTAL_NOT_ACCESSIBLE'},
        {key: 5201031, text: 'ERR_TERMINATION_OF_SUBSCRIPTION_FAILED'},
        {key: 5201032, text: 'ERR_NGSSM_REPO_OPERATION'},
        {key: 5201033, text: 'ERR_NEXT_TRY_SUBS_DATE_NOT_REACHED'},
        {key: 5202034, text: 'ERR_CHARGING_INSUFFICIENT_CREDIT'},
        {key: 5202035, text: 'ERR_CHARGING_FAILED'},
        {key: 5202036, text: 'ERR_BALANCE_CHECK_FAILED'},
        {key: 5202037, text: 'ERR_INSUFFICIENT_BALANCE'},
        {key: 5202038, text: 'ERR_NGSSM_REPO_DB_ERROR'},
        {key: 5202039, text: 'ERR_INVALID_INPUT'},
        {key: 5202040, text: 'ERR_NGSSM_REPO_OPTIMISTIC_LOCK_ERROR'},
        {key: 5202041, text: 'ERR_HLR_PROVISIONING'},
        {key: 5202042, text: 'ERR_SERVICE_IS_NOT_OWNED_BY_OFFER'},
        {key: 5202043, text: 'ERR_INVALID_RBT_MAIN_SUBS_STATE'},
        {key: 5202044, text: 'ERR_OTHER_OFFER_SUBSCRIPTION_EXISTS_FOR_SERVICE'},
        {key: 5202045, text: 'ERR_CONTENT_NOT_FOUND'},
        {key: 5202046, text: 'ERR_CONTENT_SUBSCRIPTION_DOESNOT_EXIST'},
        {key: 5202047, text: 'ERR_ANOTHER_REQUEST_IN_PROGRESS'},
        {key: 5202048, text: 'ERR_STATE_WRONG'},
        {key: 5202049, text: 'ERR_NGSSM_REPO_AUTH_ERROR'},
        {key: 5202050, text: 'ERR_CONTENT_SUBSCRIPTION_EXIST'},
        {key: 5202051, text: 'ERR_NGSSM_REPO_GENERIC_ERROR'},
        {key: 5202052, text: 'ERR_HLR_LISTENER_FAILED'},
        {key: 5202053, text: 'ERR_CONTENT_GIFT_LISTENER_FAILED'},
        {key: 5202054, text: 'ERR_ILLEGAL_SUBSCRIPTION_STATE'},
        // Internals
        {key: 5201038, text: 'ERR_NEXT_OFFER_NOT_EXISTS'},
        {key: 5201039, text: 'ERR_INVALID_DURATION_FORMAT'},
        {key: 5201040, text: 'ERR_PROFILEDEF_NOT_EXISTS'},
        {key: 5201041, text: 'ERR_INACTIVATED_BY_SUBSCRIBER'},
        {key: 5202042, text: 'ERR_CHARGING_NOT_NEEDED'},
        {key: 5201043, text: 'ERR_SERVICE_NOTIFICATION_FAILED'},
        {key: 5201044, text: 'ERR_NEXT_SUBSCRIPTION_FAILED'},
        {key: 5201045, text: 'ERR_CHARGING_EVENT_FAILED'},
        {key: 5201046, text: 'ERR_TERMINATION_OF_TRIAL_SUBSCRIPTION_FAILED'},
        {key: 5201047, text: 'ERR_SUBSCRIBER_NOTIFICATION_FAILED'},
        {key: 5201048, text: 'ERR_SETSTATE_OF_SUBSCRIPTION_FAILED'},
        {key: 5201049, text: 'ERR_SERVICE_IS_NOT_OWNED_BY_PROVIDER'},
        {key: 5201050, text: 'ERR_NO_REMAINING_DAYS_FOR_SUBSCRIPTION'},
        {key: 5201051, text: 'ERR_SUBSCRIBER_NOTIFICATION_NOT_ENABLED'},
        {key: 5201052, text: 'ERR_COULD_NOT_PROCESS_CONFIRMATION'},
        {key: 5201053, text: 'ERR_RENEW_SUBS_FAILED'},
        {key: 5201054, text: 'ERR_CMPF_OPERATION'},
        {key: 5202055, text: 'ERR_DOB_NOT_ALLOWED'},
        {key: 5202056, text: 'ERR_CACHED_OBJECT_NULL'},
        {key: 5202058, text: 'ERR_STATE_NULL'}
    ]);

    ApplicationConstants.constant('SUBSCRIPTION_MANAGEMENT_EVENT_TYPES', [
        {key: 1, text: 'SUBSCRIBE_TO_OFFER_ATTEMPT'},
        {key: 2, text: 'SUBSCRIBE_TO_OFFER_SUCCESS'},
        {key: 3, text: 'SUBSCRIBE_TO_OFFER_FAIL'},
        {key: 4, text: 'UNSUBSCRIBE_FROM_OFFER_ATTEMPT'},
        {key: 5, text: 'UNSUBSCRIBE_FROM_OFFER_SUCCESS'},
        {key: 6, text: 'UNSUBSCRIBE_FROM_OFFER_FAIL'},
        {key: 7, text: 'CHARGING_ATTEMPT'},
        {key: 8, text: 'CHARGING_SUCCESS'},
        {key: 9, text: 'CHARGING_FAIL'},
        {key: 10, text: 'INITIAL_CHARGING_ATTEMPT'},
        {key: 11, text: 'INITIAL_CHARGING_SUCCESS'},
        {key: 12, text: 'INITIAL_CHARGING_FAIL'},
        {key: 13, text: 'DEBT_CHARGING_ATTEMPT'},
        {key: 14, text: 'DEBT_CHARGING_SUCCESS'},
        {key: 15, text: 'DEBT_CHARGING_FAIL'},
        {key: 16, text: 'CHARGING_EVENT_ATTEMPT'},
        {key: 17, text: 'CHARGING_EVENT_SUCCESS'},
        {key: 18, text: 'CHARGING_EVENT_FAIL'},
        {key: 19, text: 'CHARGING_RETRY_EVENT_ATTEMPT'},
        {key: 20, text: 'CHARGING_RETRY_EVENT_SUCCESS'},
        {key: 21, text: 'CHARGING_RETRY_EVENT_FAIL'},
        {key: 22, text: 'SERVICE_SUBSCRIPTION_STATE_NOTIFICATION_ATTEMPT'},
        {key: 23, text: 'SERVICE_SUBSCRIPTION_STATE_NOTIFICATION_SUCCESS'},
        {key: 24, text: 'SERVICE_SUBSCRIPTION_STATE_NOTIFICATION_FAIL'},
        {key: 25, text: 'SUBSCRIBER_NOTIFICATION_ATTEMPT'},
        {key: 26, text: 'SUBSCRIBER_NOTIFICATION_SUCCESS'},
        {key: 27, text: 'SUBSCRIBER_NOTIFICATION_FAIL'},
        {key: 28, text: 'SETSTATEOF_SUBSCRIPTION_ATTEMPT'},
        {key: 29, text: 'SETSTATEOF_SUBSCRIPTION_SUCCESS'},
        {key: 30, text: 'SETSTATEOF_SUBSCRIPTION_FAIL'},
        {key: 31, text: 'RENEW_SUBSCRIPTION_ATTEMPT'},
        {key: 32, text: 'RENEW_SUBSCRIPTION_SUCCESS'},
        {key: 33, text: 'RENEW_SUBSCRIPTION_FAIL'},
        {key: 34, text: 'NEXT_SUBSCRIPTION_ATTEMPT'},
        {key: 35, text: 'NEXT_SUBSCRIPTION_SUCCESS'},
        {key: 36, text: 'NEXT_SUBSCRIPTION_FAIL'},
        {key: 37, text: 'EXTEND_SUBSCRIPTION_ATTEMPT'},
        {key: 38, text: 'EXTEND_SUBSCRIPTION_SUCCESS'},
        {key: 39, text: 'EXTEND_SUBSCRIPTION_FAIL'},
        {key: 40, text: 'PROCESS_CONFIRMATION_ATTEMPT'},
        {key: 41, text: 'PROCESS_CONFIRMATION_SUCCESS'},
        {key: 42, text: 'PROCESS_CONFIRMATION_FAIL'},
        {key: 43, text: 'SUBSCRIBE_TO_SERVICE_ATTEMPT'},
        {key: 44, text: 'SUBSCRIBE_TO_SERVICE_SUCCESS'},
        {key: 45, text: 'SUBSCRIBE_TO_SERVICE_FAIL'},
        {key: 46, text: 'UNSUBSCRIBE_FROM_SERVICE_ATTEMPT'},
        {key: 47, text: 'UNSUBSCRIBE_FROM_SERVICE_SUCCESS'},
        {key: 48, text: 'UNSUBSCRIBE_FROM_SERVICE_FAIL'},
        {key: 49, text: 'IS_SUBSCRIBED_TO_SERVICE_ATTEMPT'},
        {key: 50, text: 'IS_SUBSCRIBED_TO_SERVICE_SUCCESS'},
        {key: 51, text: 'IS_SUBSCRIBED_TO_SERVICE_FAIL'},
        {key: 52, text: 'ASKED_CONSENT_FOR_SERVICE'},
        {key: 53, text: 'RECEIVED_CONSENT_RESULT_NOTIFICATION_FOR_SERVICE'},
        {key: 54, text: 'SETTING_HLR_FLAG_SUCCESS'},
        {key: 55, text: 'SETTING_HLR_FLAG_FAILED'},
        {key: 56, text: 'SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_ATTEMPT'},
        {key: 57, text: 'SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_SUCCESS'},
        {key: 58, text: 'SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_FAIL'},
        {key: 59, text: 'TERMINATE_TRIAL_SUBSCRIPTION_ATTEMPT'},
        {key: 60, text: 'TERMINATE_TRIAL_SUBSCRIPTION_SUCCESS'},
        {key: 61, text: 'TERMINATE_TRIAL_SUBSCRIPTION_FAIL'},
        {key: 62, text: 'INITIAL_CHARGING_RETRY_EVENT_ATTEMPT'},
        {key: 63, text: 'INITIAL_CHARGING_RETRY_EVENT_SUCCESS'},
        {key: 64, text: 'INITIAL_CHARGING_RETRY_EVENT_FAIL'},
        {key: 65, text: 'INITIAL_CONNECTION_RETRY_EVENT_ATTEMPT'},
        {key: 66, text: 'INITIAL_CONNECTION_RETRY_EVENT_SUCCESS'},
        {key: 67, text: 'INITIAL_CONNECTION_RETRY_EVENT_FAIL'},
        {key: 70, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_GRACE'},
        {key: 71, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_SUSPEND'},
        {key: 72, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_INACTIVE'},
        {key: 73, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_SUSPEND'},
        {key: 74, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_ACTIVE'},
        {key: 75, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_INACTIVE'},
        {key: 76, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_ACTIVE'},
        {key: 77, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_INACTIVE'},
        {key: 78, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_GRACE'},
        {key: 79, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_ACTIVE'},
        {key: 80, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_SUSPEND'},
        {key: 81, text: 'OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_GRACE'},
        {key: 82, text: 'SUBSCRIPTION_MANAGER_RESPONSE'},
        {key: 83, text: 'SET_NEXT_STEP_OF_SUBSCRIPTION_ATTEMPT'},
        {key: 84, text: 'SET_NEXT_STEP_OF_SUBSCRIPTION_SUCCESS'},
        {key: 85, text: 'SET_NEXT_STEP_OF_SUBSCRIPTION_FAIL'},
        {key: 86, text: 'SKIPPED_CONSENT_FOR_SERVICE'},
        {key: 87, text: 'GET_HLR_FLAG_ATTEMPT'},
        {key: 88, text: 'GET_HLR_FLAG_SUCCESS'},
        {key: 89, text: 'GET_HLR_FLAG_FAIL'},
        {key: 90, text: 'SET_HLR_FLAG_ATTEMPT'},
        {key: 91, text: 'SET_HLR_FLAG_SUCCESS'},
        {key: 92, text: 'SET_HLR_FLAG_FAIL'},
        {key: 93, text: 'CLEAR_HLR_FLAG_ATTEMPT'},
        {key: 94, text: 'CLEAR_HLR_FLAG_SUCCESS'},
        {key: 95, text: 'CLEAR_HLR_FLAG_FAIL'},
        {key: 96, text: 'FORCE_RENEWAL_SUCCES'},
        {key: 97, text: 'SCHEDULE_EVENT_ATTEMPT'},
        {key: 98, text: 'SCHEDULE_EVENT_SUCCESS'},
        {key: 99, text: 'SCHEDULE_EVENT_FAIL'},
        {key: 100, text: 'CANCEL_EVENT_ATTEMPT'},
        {key: 101, text: 'CANCEL_EVENT_SUCCESS'},
        {key: 102, text: 'CANCEL_EVENT_FAIL'},

        {key: 103, text: 'SUBSCRIBE_TO_CONTENT_ATTEMPT'},
        {key: 104, text: 'SUBSCRIBE_TO_CONTENT_SUCCESS'},
        {key: 105, text: 'SUBSCRIBE_TO_CONTENT_FAIL'},

        {key: 106, text: 'PAUSE_OFFER_SUBS_ATTEMPT'},
        {key: 107, text: 'PAUSE_OFFER_SUBS_SUCCESS'},
        {key: 108, text: 'PAUSE_OFFER_SUBS_FAIL'},

        {key: 109, text: 'UNPAUSE_OFFER_SUBS_ATTEMPT'},
        {key: 110, text: 'UNPAUSE_OFFER_SUBS_SUCCESS'},
        {key: 111, text: 'UNPAUSE_OFFER_SUBS_FAIL'},

        {key: 112, text: 'ACTIVATE_OFFER_SUBS_ATTEMPT'},
        {key: 113, text: 'ACTIVATE_OFFER_SUBS_SUCCESS'},
        {key: 114, text: 'ACTIVATE_OFFER_SUBS_FAIL'},

        {key: 115, text: 'UNSUBSCRIBE_FROM_CONTENT_ATTEMPT'},
        {key: 116, text: 'UNSUBSCRIBE_FROM_CONTENT_SUCCESS'},
        {key: 117, text: 'UNSUBSCRIBE_FROM_CONTENT_FAIL'},

        {key: 118, text: 'PAUSE_CONTENT_SUBS_ATTEMPT'},
        {key: 119, text: 'PAUSE_CONTENT_SUBS_SUCCESS'},
        {key: 120, text: 'PAUSE_CONTENT_SUBS_FAIL'},

        {key: 121, text: 'UNPAUSE_CONTENT_SUBS_ATTEMPT'},
        {key: 122, text: 'UNPAUSE_CONTENT_SUBS_SUCCESS'},
        {key: 123, text: 'UNPAUSE_CONTENT_SUBS_FAIL'},

        {key: 124, text: 'ACTIVATE_CONTENT_SUBS_ATTEMPT'},
        {key: 125, text: 'ACTIVATE_CONTENT_SUBS_SUCCESS'},
        {key: 126, text: 'ACTIVATE_CONTENT_SUBS_FAIL'},

        {key: 127, text: 'RECEIVE_HLR_FLAG_ATTEMPT'},
        {key: 128, text: 'RECEIVE_HLR_FLAG_SUCCESS'},
        {key: 129, text: 'RECEIVE_HLR_FLAG_FAIL'},

        {key: 130, text: 'CONTENT_GIFT_ATTEMPT'},
        {key: 131, text: 'CONTENT_GIFT_SUCCESS'},
        {key: 132, text: 'CONTENT_GIFT_FAIL'},

        {key: 133, text: 'RENEW_CONTENT_SUBSCRIPTION_ATTEMPT'},
        {key: 134, text: 'RENEW_CONTENT_SUBSCRIPTION_SUCCESS'},
        {key: 135, text: 'RENEW_CONTENT_SUBSCRIPTION_FAIL'}
    ]);

    // Service
    ApplicationConstants.constant('SERVICE_STATUS_TYPES', ['ACTIVE', 'SUSPENDED', 'INACTIVE', 'PENDING']);

    ApplicationConstants.constant('SERVICE_TYPES', [
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

})();
