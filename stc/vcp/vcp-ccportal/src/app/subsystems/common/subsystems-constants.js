(function () {
    'use strict';

    /* Constants */
    angular.module('ccportal.subsystems.constants', []);

    var SubsystemsConstants = angular.module('ccportal.subsystems.constants');

    // Provisioning
    SubsystemsConstants.constant('PROVISIONING_PAYMENT_TYPES', [
        {label: 'PaymentTypes.Prepaid', value: 'Prepaid'},
        {label: 'PaymentTypes.Postpaid', value: 'Postpaid'}
    ]);

    SubsystemsConstants.constant('PROVISIONING_LANGUAGES', [
        {label: 'Languages.AR', value: 'AR'},
        {label: 'Languages.EN', value: 'EN'}
    ]);

    SubsystemsConstants.constant('PROVISIONING_STATES', [
        {label: 'StatusTypes.Active', value: 'ACTIVE'},
        {label: 'StatusTypes.Inactive', value: 'INACTIVE'}
    ]);

    SubsystemsConstants.constant('PROVISIONING_STATUSES', [
        {label: 'ProvisioningStatusTypes.Normal', value: 0},
        {label: 'ProvisioningStatusTypes.FullBarring', value: 1},
        {label: 'ProvisioningStatusTypes.OGBarring', value: 10}
    ]);

    SubsystemsConstants.constant('PROVISIONING_STATUSES_FTTH', [
        {label: 'ProvisioningStatusTypes.Normal', value: 0},
        {label: 'ProvisioningStatusTypes.FullBarring', value: 1},
        {label: 'ProvisioningStatusTypes.OGBarring', value: 10},
        {label: 'ProvisioningStatusTypes.Suspended', value: 2},
        {label: 'ProvisioningStatusTypes.Frozen', value: 3},
        {label: 'ProvisioningStatusTypes.GP4Blocked', value: 4}
    ]);

    SubsystemsConstants.constant('PROVISIONING_GENDERS', [
        {label: 'ProvisioningGenders.Male', value: 1},
        {label: 'ProvisioningGenders.Female', value: 2}
    ]);

    SubsystemsConstants.constant('PROVISIONING_TYPES', [
        {label: 'ProvisioningTypes.Common', value: 0},
        {label: 'ProvisioningTypes.Corporate', value: 1},
        {label: 'ProvisioningTypes.Test', value: 4}
    ]);

    SubsystemsConstants.constant('PROVISIONING_CREDIT_SEGMENTS', [
        {text: 'MA', value: 0},
        {text: 'MB', value: 1},
        {text: 'MC', value: 2},
        {text: 'MD', value: 3},
        {text: 'ME', value: 4},
        {text: 'MF', value: 5},
        {text: 'MN', value: 6},
        {text: 'OTHER', value: 10}
    ]);

    SubsystemsConstants.constant('PROVISIONING_VIP_CATEGORIES', [
        {label: 'ProvisioningVipCategories.SocialVip', value: 1},
        {label: 'ProvisioningVipCategories.VipHighSpender', value: 2},
        {label: 'ProvisioningVipCategories.VipByPackage', value: 3}
    ]);

    SubsystemsConstants.constant('PROVISIONING_VIP_SUB_CATEGORIES', [
        {label: 'ProvisioningVipSubCategories.Platinum', value: 1},
        {label: 'ProvisioningVipSubCategories.Gold', value: 2}
    ]);

    SubsystemsConstants.constant('PROVISIONING_CUSTOMER_CATEGORIES', [
        {label: 'ProvisioningCustomerCategories.Consumer', value: 1},
        {label: 'ProvisioningCustomerCategories.Business', value: 2}
    ]);

    SubsystemsConstants.constant('PROVISIONING_PACKAGE_CATEGORIES', [
        {label: 'ProvisioningPackageCategories.Connect', value: 1},
        {label: 'ProvisioningPackageCategories.GSM', value: 2}
    ]);


    SubsystemsConstants.constant('PROVISIONING_PACKAGE_CATEGORIES_FTTH', [
        {label: 'ProvisioningPackageCategories.Connect', value: 1},
        {label: 'ProvisioningPackageCategories.GSM', value: 2},
        {label: 'ProvisioningPackageCategories.FTTH', value: 3}
    ]);

    SubsystemsConstants.constant('SHORT_CODES_STATUS_TYPES', ['PENDING', 'FREE', 'APPLIED', 'IN_REVIEW', 'USED']);

    // Offer
    SubsystemsConstants.constant('OFFER_STATUS_TYPES', ['PENDING', 'ACTIVE', 'HIDDEN', 'INACTIVE']);

    SubsystemsConstants.constant('OFFER_SHORT_CODE_AND_KEYWORD_SCENARIOS', ['SUBSCRIBE', 'UNSUBSCRIBE', 'SUBSCRIBE_TRIAL']);

    SubsystemsConstants.constant('OFFER_XSM_SMS_PROFILE_LANGUAGES', [
        {label: 'Languages.AR', value: 'AR'},
        {label: 'Languages.EN', value: 'EN'}
    ]);

    SubsystemsConstants.constant('OFFER_CHARGING_POLICIES', [
        {
            key: 'Immediate',
            label: 'Subsystems.SubscriptionManagement.Operations.Offers.XsmChargingProfile.Immediate'
        },
        {
            key: 'Deferred',
            label: 'Subsystems.SubscriptionManagement.Operations.Offers.XsmChargingProfile.Deferred'
        }
    ]);

    SubsystemsConstants.constant('OFFER_INITIAL_CHARGING_POLICIES', ['ChargingOnAttempt', 'ChargingOnActivation']);

    SubsystemsConstants.constant('OFFER_CHARGING_FAILURE_POLICIES', ['ContinueWithDebt', 'Terminate']);

    SubsystemsConstants.constant('OFFER_HANDLERS', ['Active', 'Suspended']);

    SubsystemsConstants.constant('OFFER_CHARGE_ONS', ['MO', 'MT']);

    SubsystemsConstants.constant('OFFER_TERMINATION_POLICIES', ['DeferredTermination', 'ImmediateTermination']);

    SubsystemsConstants.constant('OFFER_RENEWAL_POLICIES', ['NoRenewal', 'Auto', 'AutoWithNotification', 'AutoWithConfirmation']);

    SubsystemsConstants.constant('OFFER_BLACK_LISTED_SUBSCRIBER_POLICIES', ['SuspendSubscription', 'InactivateSubscription', 'KeepSubscription']);

    SubsystemsConstants.constant('OFFER_TRY_AND_BUY_POLICIES', ['AutoBuyWithNotification', 'AutoBuyWithoutNotification', 'BuyWithNotification', 'BuyWithConfirmation', 'EndWithoutNotification']);

    SubsystemsConstants.constant('OFFER_PACKAGE_ELIGIBILITIES', ['NoControl', 'Whitelist', 'Blacklist']);

    SubsystemsConstants.constant('OFFER_SCREENING_IDENTIFIERS', [
        {value: 'MSISDN', label: 'ScreeningLists.Identifiers.MSISDN'},
        {value: 'SAN', label: 'ScreeningLists.Identifiers.SAN'}
    ]);

    SubsystemsConstants.constant('OFFER_BUNDLING_TYPES', ['SOFT_BUNDLE', 'HARD_BUNDLE']); // 'NOT_BUNDLED' for the disabled offer bundling

    SubsystemsConstants.constant('OFFER_ELIGIBILITY_EVALUATION_POLICIES', ['N/A', 'BLACKLIST', 'WHITELIST']);

    SubsystemsConstants.constant('OFFER_MAIN_OFFER_EVALUATION_POLICY', ['N/A', 'ALL_OF', 'ANY_OF', 'NONE_OF']);

    // Service
    SubsystemsConstants.constant('SERVICE_STATUS_TYPES', ['PENDING', 'ACTIVE', 'SUSPENDED', 'HIDDEN', 'INACTIVE']);

    SubsystemsConstants.constant('SERVICE_TYPES', [
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

    SubsystemsConstants.constant('SERVICE_USAGES', ['ON_DEMAND', 'SUBSCRIPTION']);

    SubsystemsConstants.constant('SERVICE_LANGUAGES', ['ARABIC', 'URDU', 'TAGALOG', 'ENGLISH', 'OTHER']);

    SubsystemsConstants.constant('SERVICE_TEMPLATES', ['ALERTS', 'ON_DEMAND', 'CHAPTERED', 'SEQUENTIAL']);

    SubsystemsConstants.constant('SERVICE_CURRENCIES', ['SAR', 'AED', 'USD']);

    SubsystemsConstants.constant('SERVICE_OUTBOUND_APIS', ['NEW_REST', 'LEGACY_SOAP']);

    SubsystemsConstants.constant('SERVICE_HIDE_MSISDN_WITH_VALUES', ['SAN', 'LEGACY_FAKEID']);

    SubsystemsConstants.constant('SERVICE_ALERT_SCHEDULING_TYPES', ['SCHEDULED', 'REAL_TIME']);

    SubsystemsConstants.constant('SERVICE_CYCLE_PERIODS', ['DAY', 'WEEK', 'MONTH']);

    SubsystemsConstants.constant('SERVICE_LEGACY_PRODUCT_STATUSES', ['DRAFT', 'COMMERCIAL', 'SUSPENDED', 'OFFLINE']);

    SubsystemsConstants.constant('SERVICE_SLA_VIOLATION_POLICIES', ['REJECT_AND_ALARM', 'ACCEPT_AND_LOG']);

    SubsystemsConstants.constant('SERVICE_DCB_SUBSCRIBER_IDS_AT_OPERATOR', ['SAN', 'MSISDN']);

    SubsystemsConstants.constant('SERVICE_DCB_PREPAID_CAPPING_RULE_TYPES', ['PER_PURCHASE', 'PER_DAY', 'PER_MONTH']);

    SubsystemsConstants.constant('SERVICE_DCB_PREPAID_CAPPING_POLICIES', ['PERCENTAGE_OF_BALANCE', 'FIXED_AMOUNT']);

    SubsystemsConstants.constant('SERVICE_DCB_POSTPAID_CAPPING_RULE_TYPES', ['PER_PURCHASE', 'PER_DAY', 'PER_MONTH', 'FOR_ALL']);

    SubsystemsConstants.constant('SERVICE_DCB_POSTPAID_CAPPING_POLICIES', ['PERCENTAGE_OF_BALANCE', 'PERCENTAGE_OF_CREDIT_LIMIT', 'FIXED_AMOUNT']);

    SubsystemsConstants.constant('SERVICE_DCB_POSTPAID_CREDIT_SEGMENTS', ['MA', 'MB', 'MC', 'MD', 'ME', 'MF', 'MN']);

    SubsystemsConstants.constant('SERVICE_DCB_SERVICE_DISPUTE_RULE_STATUSES', ['SUCCESS', 'MISSING', 'FAIL']);

    SubsystemsConstants.constant('SERVICE_DCB_SERVICE_DISPUTE_RULE_ACTIONS', ['CHARGE', 'REFUND', 'ACCEPT_CLIENT_EXCEPTION', 'ACCEPT_CARRIER_EXCEPTION', 'NO_ACTION']);

    SubsystemsConstants.constant('SERVICE_DCB_SERVICE_DISPUTE_RULE_THRESHOLD_CONDITIONS', ['ABOVE', 'BELOW', 'UNCONDITIONAL']);

    SubsystemsConstants.constant('SERVICE_DCB_SERVICE_DISPUTE_RULE_TRANSACTION_TYPES', ['CHARGE', 'REFUND']);

    SubsystemsConstants.constant('SERVICE_DCB_SERVICE_RECONCILIATION_CHARGING_METHODS', ['DEAL_PURCHASE', 'CDR']);

    SubsystemsConstants.constant('SERVICE_DCB_SERVICE_RECONCILIATION_POLICY_FILE_PERIODS', ['DAILY', 'MONTHLY', 'NEVER']);

    SubsystemsConstants.constant('SERVICE_NOTIFICATION_PROTOCOLS', [
        {value: 'LEGACY_SOAP', text: 'SOAP'},
        {value: 'NEW_REST', text: 'REST'}
    ]);

    SubsystemsConstants.constant('SERVICE_DCB_SERVICE_MESSAGES_PAYMENT_TYPES', [
        {label: 'PaymentTypes.Prepaid', value: 'PREPAID'},
        {label: 'PaymentTypes.Postpaid', value: 'POSTPAID'}
    ]);

    SubsystemsConstants.constant('SERVICE_VAT_CATEGORIES', ['FEE_VAT_FREE', 'FEE_VAT_INCLUSIVE', 'FEE_VAT_EXCLUSIVE']);

    // User Account
    SubsystemsConstants.constant('USER_ACCOUNT_TYPES', [
        {value: 'DEFAULT', label: 'Subsystems.Provisioning.UserAccounts.Types.Default'},
        {value: 'COMMON', label: 'Subsystems.Provisioning.UserAccounts.Types.Common'}
    ]);

    // Service Provider
    SubsystemsConstants.constant('SERVICE_PROVIDER_HTTP_AUTHENTICATION_POLICIES', [
        {value: 'USRID+IP', text: 'USER ID + IP ADDRESS'},
        {value: 'USRID+PWD', text: 'USER ID + PASSWORD'},
        {value: 'USRID+IP+PWD', text: 'USER ID + IP ADDRESS + PASSWORD'}
    ]);

    SubsystemsConstants.constant('SERVICE_PROVIDER_BANK_ACCOUNT_TYPES', ['IBAN', 'SWIFT_CODE']);

    SubsystemsConstants.constant('SERVICE_PROVIDER_STATUS_TYPES', ['PENDING', 'ACTIVE', 'SUSPENDED', 'HIDDEN', 'INACTIVE']);

    SubsystemsConstants.constant('SERVICE_PROVIDER_LEGAL_FILE_TYPES', ['POACopyDocReq', 'CITCLicenseDocReq', 'MOCILicenseDocReq', 'CompanyProfileDocReq', 'CORDocReq']);

    SubsystemsConstants.constant('SERVICE_PROVIDER_BUSINESS_TYPE_TRUST_STATUSES', ['TRUSTED', 'UNTRUSTED']);

    // Clients
    SubsystemsConstants.constant('CLIENTS_STATUSES', ['DRAFT', 'COMMERCIAL', 'SUSPENDED', 'OFFLINE']);

    SubsystemsConstants.constant('CLIENTS_TYPES', ['CONFIDENTIAL', 'PUBLIC']);

    SubsystemsConstants.constant('CLIENTS_SCOPES', ['PARTNER', 'ALL']);

    // Subscription
    SubsystemsConstants.constant('SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES', [
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
        // {value: 'IVR_MBLY', text: 'Mobily IVR [IVR_MBLY]'},
        // {value: 'USSD_MBLY', text: 'Mobily USSD [USSD_MBLY]'},
        // {value: 'DGTL_WEB_MBLY', text: 'Mobily E-Portal [DGTL_WEB_MBLY]'},
        {value: 'IVR_STC', text: 'STC IVR [IVR_STC]'},
        {value: 'USSD_STC', text: 'STC USSD [USSD_STC]'},
        {value: 'DGTL_WEB_STC', text: 'STC E-Portal [DGTL_WEB_STC]'},
        {value: 'SIM_BUNDLE', text: 'Package Bundle by Provisioning [SIM_BUNDLE]'},
        {value: 'SSM', text: 'Service Subscription Management [SSM]'},
        {value: 'CSM', text: 'Content Subscription Management [CSM]'},
        {value: 'OTHER', text: 'OTHER'}
    ]);
    SubsystemsConstants.constant('SUBSCRIPTION_MANAGEMENT_CHANNEL_TYPES_RBT', [
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
        // {value: 'IVR_MBLY', text: 'Mobily IVR [IVR_MBLY]'},
        // {value: 'USSD_MBLY', text: 'Mobily USSD [USSD_MBLY]'},
        // {value: 'DGTL_WEB_MBLY', text: 'Mobily E-Portal [DGTL_WEB_MBLY]'},
        // {value: 'DGTL_APP_MBLY', text: 'Mobily Mobile Application [DGTL_APP_MBLY]'},
        {value: 'IVR_STC', text: 'STC IVR [IVR_STC]'},
        {value: 'USSD_STC', text: 'STC USSD [USSD_STC]'},
        {value: 'DGTL_WEB_STC', text: 'STC E-Portal [DGTL_WEB_STC]'},
        {value: 'DGTL_APP_STC', text: 'STC Mobile Application [DGTL_APP_STC]'},
        {value: 'SIM_BUNDLE', text: 'Package Bundle by Provisioning [SIM_BUNDLE]'},
        {value: 'SSM', text: 'Service Subscription Management [SSM]'},
        {value: 'CSM', text: 'Content Subscription Management [CSM]'},
        {value: 'OTHER', text: 'OTHER'}
    ]);
    SubsystemsConstants.constant('SUBSCRIPTION_MANAGEMENT_ERROR_CODES', [
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

    SubsystemsConstants.constant('SUBSCRIPTION_MANAGEMENT_EVENT_TYPES', [
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

    // Business management
    SubsystemsConstants.constant('BUSINESS_MANAGEMENT_STATUS_TYPES', ['DRAFT', 'COMMERCIAL']);

    SubsystemsConstants.constant('BUSINESS_MANAGEMENT_STATUS_TYPES_2', ['DRAFT', 'COMMERCIAL', 'OFFLINE']);

    SubsystemsConstants.constant('BUSINESS_MANAGEMENT_PROVISION_TYPES', ['NO_PROVISION', 'SMS_CONTENT', 'MMS_MESSAGE', 'WAP_PUSH_CONTENT', 'APPLICATION_DOWNLOAD', 'PICTURE_DOWNLOAD', 'FULLTRACK_DOWNLOAD', 'RINGTONE_DOWNLOAD', 'TEXT_DOWNLOAD', 'VIDEO_DOWNLOAD']);

    SubsystemsConstants.constant('BUSINESS_MANAGEMENT_SETTLEMENT_MODELS', ['FIXED_PERCENTAGE', 'PERCENTAGE_FOR_GRADED', 'PERCENTAGE_FOR_RESELLER']);

    SubsystemsConstants.constant('BUSINESS_MANAGEMENT_REVENUE_SOURCES', ['BASED_ON_ALL_INCOME', 'BASED_ON_USAGE', 'BASED_ON_SUBSCRIPTION']);

    SubsystemsConstants.constant('BUSINESS_MANAGEMENT_APPLICANT_SCOPES', ['PARTNER_TYPE', 'AVAILABLE_PARTNER']);

    SubsystemsConstants.constant('BUSINESS_MANAGEMENT_PARTNER_TYPES', ['NORMAL_CP/SP', 'ENTERPRISE', 'INDIVIDUAL_DEVELOPER', 'COMPANY_DEVELOPER']);

    SubsystemsConstants.constant('BUSINESS_MANAGEMENT_DOCUMENT_TYPES', ['IRRELEVANT', 'OPTIONAL', 'MANDATORY']);

    SubsystemsConstants.constant('BUSINESS_MANAGEMENT_AGREEMENT_TYPES', ['BUSINESS_TYPE', 'COMMON']);

    // Reporting related constants

    // MSGGW won't be providing MMS reports in STC
    SubsystemsConstants.constant('REPORTING_MSGGW_REPORT_CHANNELS', ['SMS']);

    SubsystemsConstants.constant('REPORTING_SCHEDULE_RECURRENCE', ['DAILY', 'WEEKLY', 'MONTHLY']);

    SubsystemsConstants.constant('REPORTING_BMS_CHANNELS', ['Bulk SMS', 'Bulk MMS', 'Bulk IVR']);

    SubsystemsConstants.constant('REPORTING_QUALIFIERS', [
        {id: 0, label: 'First'},
        {id: 1, label: 'Second'},
        {id: 2, label: 'Third'},
        {id: 3, label: 'Fourth'},
        {id: 4, label: 'Last'}
    ]);

    SubsystemsConstants.constant('REPORTING_APPROVALS_STATUS_TYPES', ['Pending', 'Approved']);

    SubsystemsConstants.constant('HTTP_METHODS', ['POST', 'PUT', 'DELETE']);

    // Content Management
    SubsystemsConstants.constant('CMS_STATUS_TYPES', ['PENDING', 'ACTIVE', 'SUSPENDED', 'INACTIVE']);

    SubsystemsConstants.constant('CMS_GENDERS', ['MALE', 'FEMALE']);

    SubsystemsConstants.constant('CMS_ACCESS_CHANNELS', ["IVR", "USSD", "SMS", "SMS_HU", "IVR_FK", "CC", "AdminPortal", "RBTPortal", "RBTMobileApp", "MySTC", "CPWhiteBrandedPortal", "CorporatePortal", "BackOfficeBulkOps", "RBTBackend", "RBTDecisionEngine"]);

    SubsystemsConstants.constant('CMS_LANGUAGES', [
        {key: 'AR', label: 'Languages.AR'},
        {key: 'EN', label: 'Languages.EN'}
    ]);

    SubsystemsConstants.constant('CMS_RBT_STATUS_TYPES', ['PENDING', 'ACTIVE', 'HIDDEN', 'SUSPENDED', 'REJECTED', 'INACTIVE']);

    SubsystemsConstants.constant('CMS_RBT_CONTENT_TYPES', ['CATEGORY', 'MOOD', 'ARTIST', 'ALBUM', 'TONE']);

    SubsystemsConstants.constant('CMS_RBT_REV_SHARE_POLICIES_ALL', ['NONE', 'COMPLEX']);
    SubsystemsConstants.constant('CMS_RBT_REV_SHARE_POLICIES_TONE', ['NONE', 'SIMPLE']);

    SubsystemsConstants.constant('CMS_RBT_REV_SHARE_CARRIER_DEDUCTION', ['NONE', 'FIXED', 'PERCENTAGE']);

    SubsystemsConstants.constant('CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALL', ['EQUAL']);
    SubsystemsConstants.constant('CMS_RBT_REV_SHARE_SPLIT_ACROSS_TONES_ALBUM', ['EQUAL', 'WEIGHTED', 'PERCENTAGES']);

})();

