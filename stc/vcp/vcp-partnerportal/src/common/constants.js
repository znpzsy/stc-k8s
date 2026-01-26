(function () {

    'use strict';

    /* Constants */
    angular.module('Application.constants', []);

    var ApplicationConstants = angular.module('Application.constants');

    ApplicationConstants.constant('RESOURCE_NAME', 'VCP Partner Portal');

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
        {id: 1, text: "CommonLabels.DaysOfWeek.Sunday", abbr: 'Sun'},
        {id: 2, text: "CommonLabels.DaysOfWeek.Monday", abbr: 'Mon'},
        {id: 3, text: "CommonLabels.DaysOfWeek.Tuesday", abbr: 'Tue'},
        {id: 4, text: "CommonLabels.DaysOfWeek.Wednesday", abbr: 'Wed'},
        {id: 5, text: "CommonLabels.DaysOfWeek.Thursday", abbr: 'Thu'},
        {id: 6, text: "CommonLabels.DaysOfWeek.Friday", abbr: 'Fri'},
        {id: 7, text: "CommonLabels.DaysOfWeek.Saturday", abbr: 'Sat'}
    ]);

    ApplicationConstants.constant('DEFAULT_REST_QUERY_LIMIT', 10000);
    ApplicationConstants.constant('DEFAULT_WIDE_REST_QUERY_LIMIT', 50000);
    ApplicationConstants.constant('TROUBLESHOOTING_RECORD_COUNT_LIMIT_FOR_NOTIFICATION', 5000);
    ApplicationConstants.constant('BATCH_SIZE', 2500);

    ApplicationConstants.constant('STATUS_TYPES', [
        {value: 'ACTIVE', label: 'StatusTypes.Active'},
        {value: 'INACTIVE', label: 'StatusTypes.Inactive'}
    ]);

    ApplicationConstants.constant('CMPF_USER_KEYS', ['lOcAl_UsEr', 'a02b11bf']);

    // Service Provider
    ApplicationConstants.constant('SERVICE_PROVIDER_BANK_ACCOUNT_TYPES', ['IBAN', 'SWIFT_CODE']);

    ApplicationConstants.constant('SERVICE_PROVIDER_LEGAL_FILE_TYPES', ['POACopyDocReq', 'CITCLicenseDocReq', 'MOCILicenseDocReq', 'CompanyProfileDocReq', 'CORDocReq']);

})();
