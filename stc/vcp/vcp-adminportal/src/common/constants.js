(function () {

    'use strict';

    /* Constants */
    angular.module('Application.constants', []);

    var ApplicationConstants = angular.module('Application.constants');

    ApplicationConstants.constant('RESOURCE_NAME', 'VCP Admin Portal');

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

    ApplicationConstants.constant('DAYS_OF_WEEK', [
        {id: 1, shortKey: 'SUN', text: "Sunday"},
        {id: 2, shortKey: 'MON', text: "Monday"},
        {id: 3, shortKey: 'TUE', text: "Tuesday"},
        {id: 4, shortKey: 'WED', text: "Wednesday"},
        {id: 5, shortKey: 'THU', text: "Thursday"},
        {id: 6, shortKey: 'FRI', text: "Friday"},
        {id: 7, shortKey: 'SAT', text: "Saturday"}
    ]);

    ApplicationConstants.constant('DEFAULT_REST_QUERY_LIMIT', 10000);
    ApplicationConstants.constant('DEFAULT_WIDE_REST_QUERY_LIMIT', 50000);
    ApplicationConstants.constant('TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION', 5000);

    // Below two are taken from DSP
    ApplicationConstants.constant('MAXIMUM_RECORD_DOWNLOAD_SIZE', 10000);
    ApplicationConstants.constant('BATCH_SIZE', 2500);

    ApplicationConstants.constant('P4M_MVNO_NAME', 'Stc');
    ApplicationConstants.constant('P4M_MVNO_NAME_UPPER', 'STC');

    ApplicationConstants.constant('STATUS_TYPES', [
        {name: 'ACTIVE', label: 'StatusTypes.ACTIVE', value: 0},
        {name: 'INACTIVE', label: 'StatusTypes.INACTIVE', value: 1}
    ]);
    ApplicationConstants.constant('STATES', ['ACTIVE', 'INACTIVE']);
    ApplicationConstants.constant('USER_STATES', ['ACTIVE', 'INACTIVE']);

    ApplicationConstants.constant('SCREENING_MANAGER_RULES', [
        {value: 'AcceptAll', label: 'ScreeningManagerRules.AcceptAll'},
        {value: 'AcceptWhitelist', label: 'ScreeningManagerRules.AcceptWhitelist'},
        {value: 'RejectAll', label: 'ScreeningManagerRules.RejectAll'},
        {value: 'RejectBlacklist', label: 'ScreeningManagerRules.RejectBlacklist'}
    ]);

    ApplicationConstants.constant('SMSC_SCREENING_IDENTIFIERS', [
        {value: 'MSISDN', label: 'ScreeningLists.Identifiers.MSISDN'},
        {value: 'IMSI', label: 'ScreeningLists.Identifiers.IMSI'},
        {value: 'MSC', label: 'ScreeningLists.Identifiers.MSC'},
        {value: 'HLR', label: 'ScreeningLists.Identifiers.HLR'}
    ]);

    ApplicationConstants.constant('SM_SCREENING_IDENTIFIERS', [
        {value: 'MSISDN', label: 'ScreeningLists.Identifiers.MSISDN'}
    ]);

    ApplicationConstants.constant('CC_SCREENING_IDENTIFIERS', [
        {value: 'MSISDN', label: 'ScreeningLists.Identifiers.MSISDN'}
    ]);

    ApplicationConstants.constant('CMB_SCREENING_IDENTIFIERS', [
        {value: 'MSISDN', label: 'ScreeningLists.Identifiers.MSISDN'}
    ]);

    ApplicationConstants.constant('VM_SCREENING_IDENTIFIERS', [
        {value: 'MSISDN', label: 'ScreeningLists.Identifiers.MSISDN'}
    ]);

    ApplicationConstants.constant('DURATION_UNITS', [
        {key: 'Days', label: 'CommonLabels.Days'},
        {key: 'Weeks', label: 'CommonLabels.Weeks'},
        {key: 'Months', label: 'CommonLabels.Months'},
        {key: 'Years', label: 'CommonLabels.Years'},
        {key: 'Hours', label: 'CommonLabels.Hours'},
        {key: 'Minutes', label: 'CommonLabels.Minutes'},
        {key: 'Seconds', label: 'CommonLabels.Seconds'}
    ]);

    ApplicationConstants.constant('CHARGING_FAILURE_POLICIES', [
        {key: 'ContinueWithDebt', label: 'Subsystems.Provisioning.Offers.XsmCharging.ContinueWithDebt'},
        {key: 'Terminate', label: 'Subsystems.Provisioning.Offers.XsmCharging.Terminate'}
    ]);

    ApplicationConstants.constant('CHARGING_HANDLERS', [
        {key: 'Suspended', label: 'Subsystems.Provisioning.Offers.XsmCharging.Suspended'},
        {key: 'Active', label: 'Subsystems.Provisioning.Offers.XsmCharging.Active'}
    ]);

    ApplicationConstants.constant('TERMINATION_POLICIES', [
        {
            key: 'ImmediateTermination',
            label: 'Subsystems.Provisioning.Offers.XsmOffer.ImmediateTermination'
        },
        {
            key: 'DeferredTermination',
            label: 'Subsystems.Provisioning.Offers.XsmOffer.DeferredTermination'
        }
    ]);

    ApplicationConstants.constant('RENEWAL_POLICIES', [
        {
            key: 'NoRenewal',
            label: 'Subsystems.Provisioning.Offers.XsmRenewal.NoRenewal'
        },
        {
            key: 'AutoWithNotification',
            label: 'Subsystems.Provisioning.Offers.XsmRenewal.AutoWithNotification'
        },
        {
            key: 'Auto',
            label: 'Subsystems.Provisioning.Offers.XsmRenewal.Auto'
        }
    ]);

    ApplicationConstants.constant('TRIAL_POLICIES', [
        {
            key: 'BuyWithConfirmation',
            label: 'Subsystems.Provisioning.Offers.XsmTrial.BuyWithConfirmation'
        },
        {
            key: 'AutoBuyWithNotification',
            label: 'Subsystems.Provisioning.Offers.XsmTrial.AutoBuyWithNotification'
        },
        {
            key: 'AutoBuyWithoutNotification',
            label: 'Subsystems.Provisioning.Offers.XsmTrial.AutoBuyWithoutNotification'
        },
        {
            key: 'EndWithoutNotification',
            label: 'Subsystems.Provisioning.Offers.XsmTrial.EndWithoutNotification'
        }
    ]);

    ApplicationConstants.constant('TEMPLATE_PAYMENT_TYPES', [
        {value: 'PREPAID', label: 'PaymentTypes.Prepaid'},
        {value: 'POSTPAID', label: 'PaymentTypes.Postpaid'}
    ]);

    ApplicationConstants.constant('TEMPLATE_REDIRECTION_REASONS', ["UNREACHABLE", "NOANSWER", "BUSY", "UNCONDITIONAL", "UNDEFINED"]);

    ApplicationConstants.constant('LANGUAGES', [
        {value: 'AR', label: 'Languages.AR'},
        {value: 'EN', label: 'Languages.EN'}
    ]);

    ApplicationConstants.constant('SUBSCRIBER_LANGUAGES', [
        {value: 'ar', label: 'Languages.AR'},
        {value: 'en', label: 'Languages.EN'}
    ]);

    ApplicationConstants.constant('PROVISIONING_STATUSES', [
        {cmpf_name: 'ACTIVE', label: 'StatusTypes.ACTIVE', value: 1},
        {cmpf_name: 'INACTIVE', label: 'StatusTypes.INACTIVE', value: 2}
    ]);

    ApplicationConstants.constant('APPLICATION_GATEWAY_POLICIES', ['TRUNCATE', 'REJECT']);

    ApplicationConstants.constant('VALID_INVALID', [
        {value: true, label: 'CommonLabels.Translate'},
        {value: false, label: 'CommonLabels.Reject'}
    ]);

    ApplicationConstants.constant('EQUAL_NOTEQUAL', [
        {value: true, label: 'CommonLabels.Equal'},
        {value: false, label: 'CommonLabels.NotEqual'}
    ]);

    ApplicationConstants.constant('TRANSLATION_TYPES', [
        {id: 'NO_PREFIX', key: 'NO_PREFIX'},
        {id: 'TRANSLATE_BY_PREFIX', key: 'TRANSLATE_BY_PREFIX'},
        {id: 'TRANSLATE_BY_SOURCE_ADDRESS', key: 'TRANSLATE_BY_SOURCE_ADDRESS'}
    ]);

    ApplicationConstants.constant('SHORT_CODES_ACTIONS', ['SUBSCRIBE', 'UNSUBSCRIBE']);

    ApplicationConstants.constant('CMPF_USER_KEYS', ['lOcAl_UsEr', 'a02b11bf']);

})();
