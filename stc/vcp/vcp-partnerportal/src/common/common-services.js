(function () {
    'use strict';

    /* Services */
    angular.module('Application.services', []);

    var ApplicationServices = angular.module('Application.services');

    ApplicationServices.factory('UtilService', function ($window, $timeout, $translate, notification, PartnerPortalMainPromiseTracker, DURATION_UNITS,
                                                         cfpLoadingBar) {
        var calculateDaysAgo = function (dayCount) {
            return moment().startOf('day').subtract(dayCount, 'days').toDate();
        };

        return {
            COUNTRY_CODE: "966",
            TASK_COUNT_KEY: '_sa_mb_dsp_p_tkk',
            SESSION_KEY: '_sa_mb_dsp_p_sk',
            SITE_INFORMATION_KEY: '_sa_mb_dsp_p_si',
            LATEST_STATE: '_sa_mb_dsp_p_lst',
            USERNAME_KEY: '_sa_mb_dsp_p_un',
            USER_RIGHTS: '_sa_mb_dsp_p_ur',
            USER_IS_ADMIN_KEY: '_sa_mb_dsp_p_uiak',
            USER_ACCOUNT_KEY: '_sa_mb_dsp_p_uak',
            USER_ORGANIZATION_KEY: '_sa_mb_dsp_p_uok',
            RBT_ALLOWED_CATEGORY_KEY: '_sa_mb_dsp_p_rack',
            SERVICE_PROVIDER_DETAILS_KEY: '_sa_mb_dsp_p_spdk',
            // Created with this command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
            BILLIE_HOLIDAY: "4af504ea25f22d9508cf7e4b0f596bc51eaab730b0f9df56a1c3fde0f29c2b62",
            Validators: {
                Msisdn: /^[0-9]{0,15}$/,
                InternationalPhoneNumber: /^(\+){0,1}[0-9]{0,15}$/,
                ValidPhoneNumber: /^(966){1}[0-9]{0,15}$/,
                UrlSimple: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                IntegerNumber: /^-?[0-9][^\.]*$/,
                Alphanumeric: /^[a-zA-Z0-9]+$/,
                SpecialInput1: /^[a-zA-Z0-9\-_]+$/,
                UserPassword: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/,
                WordsBetweenOneCharOrSpace: /^([\p\u0600-\u06FFa-zA-Z0-9]+[\w -]?)*\s*$/,
                CheckCommas: /^((?![,]).)*$/
            },
            getCurrentNanoTime: function () {
                return (new Date()).getTime();
            },
            getOneWeekAgo: function () {
                return calculateDaysAgo(7);
            },
            getOneDayAgo: function () {
                return calculateDaysAgo(1);
            },
            getTodayBegin: function () {
                return moment().startOf('day').toDate();
            },
            getTodayEnd: function () {
                return moment().endOf('day').toDate();
            },
            calculateDate: function (date, hour, minute) {
                var dateObj = new Date(date);
                dateObj.setHours(hour, minute, 0, 0);
                return dateObj;
            },
            showDummySpinner: function () {
                cfpLoadingBar.start();
                cfpLoadingBar.set(10);
            },
            hideDummySpinner: function () {
                cfpLoadingBar.complete();
            },
            getFromSessionStore: function (key) {
                var objectCipherText = $window.localStorage.getItem(key);
                if (_.isEmpty(objectCipherText))
                    return {};

                // Decrypt
                try {
                    var bytes = CryptoJS.AES.decrypt(objectCipherText, this.BILLIE_HOLIDAY);
                    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

                    return decryptedData;
                } catch (error) {
                    return {};
                }
            },
            putToSessionStore: function (key, object) {
                var jsonStringOfObj = JSON.stringify(object);

                // Encrypt
                var objectCipherText = CryptoJS.AES.encrypt(jsonStringOfObj, this.BILLIE_HOLIDAY);

                $window.localStorage.setItem(key, objectCipherText.toString());
            },
            removeFromSessionStore: function (key) {
                $window.localStorage.removeItem(key);
            },
            injectStringIntoAText: function (text, string, position) {
                if (!_.isEmpty(text) && !_.isEmpty(text)) {
                    text = text.substr(0, position) + string + text.substr(position);
                }
                return text;
            },
            setError: function (form, fieldName, validation, validationValue) {
                form[fieldName].$dirty = true;
                form[fieldName].$setValidity(validation, validationValue);
            },
            removeReservedCharacters: function (text) {
                text = text.replace(/\+/g, '');
                text = text.replace(/\-/g, '');
                text = text.replace(/\&/g, '');
                text = text.replace(/\|/g, '');
                text = text.replace(/\!/g, '');
                text = text.replace(/\(/g, '');
                text = text.replace(/\)/g, '');
                text = text.replace(/\{/g, '');
                text = text.replace(/\}/g, '');
                text = text.replace(/\[/g, '');
                text = text.replace(/\]/g, '');
                text = text.replace(/\^/g, '');
                text = text.replace(/\"/g, '');
                text = text.replace(/\~/g, '');

                if (text !== "*")
                    text = text.replace(/\*/g, '');

                text = text.replace(/\?/g, '');
                text = text.replace(/\:/g, '');
                text = text.replace(/\\/g, '');
                text = text.replace(/\//g, '');

                return text;
            },
            comparePeriodStrings: function (period1Str, period2Str) {
                // Period 1
                var periodAndTime1 = s.words(s.words(period1Str, 'P'), 'T');

                var period1 = periodAndTime1[0];
                var year1 = s.toNumber(s.strLeft(period1, 'Y'));
                var month1 = s.toNumber(s.strLeft(s.strRight(period1, 'Y'), 'M'));
                var day1 = s.toNumber(s.strLeft(s.strRight(period1, 'M'), 'D'));

                var time1 = periodAndTime1[1];
                var hour1 = s.toNumber(s.strLeft(time1, 'H'));
                var minute1 = s.toNumber(s.strLeft(s.strRight(time1, 'H'), 'M'));
                var second1 = s.toNumber(s.strLeft(s.strRight(time1, 'M'), 'S'));

                var period1DayValue = (year1 * 365) + (month1 * 30) + day1;
                var period1SecondValue = (period1DayValue * 24 * 60 * 60) + (hour1 * 60 * 60) + (minute1 * 60) + second1;

                // Period 2
                var periodAndTime2 = s.words(s.words(period2Str, 'P'), 'T');

                var period2 = periodAndTime2[0];
                var year2 = s.toNumber(s.strLeft(period2, 'Y'));
                var month2 = s.toNumber(s.strLeft(s.strRight(period2, 'Y'), 'M'));
                var day2 = s.toNumber(s.strLeft(s.strRight(period2, 'M'), 'D'));

                var time2 = periodAndTime2[1];
                var hour2 = s.toNumber(s.strLeft(time2, 'H'));
                var minute2 = s.toNumber(s.strLeft(s.strRight(time2, 'H'), 'M'));
                var second2 = s.toNumber(s.strLeft(s.strRight(time2, 'M'), 'S'));

                var period2DayValue = (year2 * 365) + (month2 * 30) + day2;
                var period2SecondValue = (period2DayValue * 24 * 60 * 60) + (hour2 * 60 * 60) + (minute2 * 60) + second2;

                // Comparison
                return period1SecondValue - period2SecondValue;
            },
            comparePeriods: function (period1, period2) {
                var period1Str = this.convertSimpleObjectToPeriod(period1);
                var period2Str = this.convertSimpleObjectToPeriod(period2);

                return this.comparePeriodStrings(period1Str, period2Str);
            },
            convertPeriodStringToSimpleObject: function (string) {
                var periodAndTime = s.words(s.words(string, 'P'), 'T');

                var period = periodAndTime[0];
                var year = s.toNumber(s.strLeft(period, 'Y'));
                if (year) {
                    return {unit: DURATION_UNITS[3].key, duration: year};
                }
                var month = s.toNumber(s.strLeft(s.strRight(period, 'Y'), 'M'));
                if (month) {
                    return {unit: DURATION_UNITS[2].key, duration: month};
                }
                var day = s.toNumber(s.strLeft(s.strRight(period, 'M'), 'D'));
                if (day) {
                    return {unit: DURATION_UNITS[0].key, duration: day};
                }

                var time = periodAndTime[1];
                var hour = s.toNumber(s.strLeft(time, 'H'));
                if (hour) {
                    return {unit: DURATION_UNITS[4].key, duration: hour};
                }
                var minute = s.toNumber(s.strLeft(s.strRight(time, 'H'), 'M'));
                if (minute) {
                    return {unit: DURATION_UNITS[5].key, duration: minute};
                }
                var second = s.toNumber(s.strLeft(s.strRight(time, 'M'), 'S'));
                if (second) {
                    return {unit: DURATION_UNITS[6].key, duration: second};
                }

                return {unit: DURATION_UNITS[0].key, duration: 1};
            },
            convertSimpleObjectToPeriod: function (obj) {
                var year = '000';
                var day = '000';
                var month = '000';
                var hour = '00';
                var minute = '00';
                var second = '00';

                if (obj.unit === 'Days') {
                    day = obj.duration;
                } else if (obj.unit === 'Weeks') {
                    day = obj.duration * 7;
                } else if (obj.unit === 'Months') {
                    month = obj.duration;
                } else if (obj.unit === 'Hours') {
                    hour = obj.duration;
                } else if (obj.unit === 'Minutes') {
                    minute = obj.duration;
                } else if (obj.unit === 'Seconds') {
                    second = obj.duration;
                } else {
                    year = obj.duration;
                }

                year = s.lpad(year, 3, '0');
                day = s.lpad(day, 3, '0');
                month = s.lpad(month, 3, '0');

                hour = s.lpad(hour, 2, '0');
                minute = s.lpad(minute, 2, '0');
                second = s.lpad(second, 2, '0');

                return 'P' + year + 'Y' + month + 'M' + day + 'D' + 'T' + hour + 'H' + minute + 'M' + second + 'S';
            },
            convertPeriodStringToHumanReadable: function (string) {
                var periodAndTime = s.words(s.words(string, 'P'), 'T');
                var period = periodAndTime[0];
                var year = s.toNumber(s.strLeft(period, 'Y'));
                var month = s.toNumber(s.strLeft(s.strRight(period, 'Y'), 'M'));
                var day = s.toNumber(s.strLeft(s.strRight(period, 'M'), 'D'));

                var time = periodAndTime[1];
                var hour = s.toNumber(s.strLeft(time, 'H'));
                var minute = s.toNumber(s.strLeft(s.strRight(time, 'H'), 'M'));
                var second = s.toNumber(s.strLeft(s.strRight(time, 'M'), 'S'));

                var text = '';
                text += (year !== 0) ? year + ' ' + $translate.instant('Period.Year') + (year > 1 ? 's' : '') : '';
                text += (month !== 0) ? month + ' ' + $translate.instant('Period.Month') + (month > 1 ? 's' : '') : '';
                text += (day !== 0) ? day + ' ' + $translate.instant('Period.Day') + (day > 1 ? 's' : '') : '';
                text += (hour !== 0) ? hour + ' ' + $translate.instant('Period.Hour') + (hour > 1 ? 's' : '') : '';
                text += (minute !== 0) ? minute + ' ' + $translate.instant('Period.Minute') + (minute > 1 ? 's' : '') : '';
                text += (second !== 0) ? second + ' ' + $translate.instant('Period.Second') + (second > 1 ? 's' : '') : '';

                return text === '' ? '0 ' + $translate.instant('Period.Day') : text;
            },
            escapeRegExp: function (text) {
                return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\\\$&');
            },
            addPromiseToTracker: function (promise, promiseTracker) {
                if (_.isUndefined(promiseTracker))
                    PartnerPortalMainPromiseTracker.addPromise(promise);
                else
                    promiseTracker.addPromise(promise);
            },
            defineReportsAsH: function (url) {
                return [
                    {name: 'HOURLY', url: url, reportType: 'Hourly'}
                ];
            },
            defineReportsAsDH: function (url) {
                return [
                    {name: 'DAILY', url: url, reportType: 'Daily'},
                    {name: 'HOURLY', url: url, reportType: 'Hourly'}
                ];
            },
            defineReportsAsDM: function (url) {
                return [
                    {name: 'DAILY', url: url, reportType: 'Daily'},
                    {name: 'MONTHLY', url: url, reportType: 'Monthly'}
                ];
            },
            defineReportsAsDHM: function (url) {
                return [
                    {name: 'DAILY', url: url, reportType: 'Daily'},
                    {name: 'HOURLY', url: url, reportType: 'Hourly'},
                    {name: 'MONTHLY', url: url, reportType: 'Monthly'}
                ];
            },
            defineReportsAsMDHM: function (url) {
                var reports = this.defineReportsAsDHM(url);

                reports.splice(0, 0, {
                    name: 'MINUTELY', url: url, reportType: 'Minutely'
                });

                return reports;
            },
            defineReportsAsAll: function (url) {
                return [
                    {name: 'ALL', url: url}
                ];
            },
            parseJwt: function (token) {
                if (token) {
                    var base64Url = token.split('.')[1];
                    var base64 = base64Url.replace('-', '+').replace('_', '/');

                    return JSON.parse(atob(base64));
                } else {
                    return null;
                }
            },
            showResponseErrorNotification: function (response) {
                var serviceLabel = response.config ? response.config.headers.ServiceLabel : 'N/A';

                $translate("CommonMessages.ServerError", {
                    status: response.status,
                    message: response.statusText + (serviceLabel ? ' (' + serviceLabel + ')' : '')
                }).then(function (message) {
                    notification({
                        type: 'warning',
                        text: message
                    });
                });
            },
            generateObjectId: function () {
                return (new ObjectId()).toString();
            },
            replaceParametersValues: function (object, text) {
                _.each(object, function (attrValue, attrName) {
                    var regexRule = new RegExp('\\$\\{' + attrName + '\\}', 'g');
                    text = text.replace(regexRule, attrValue);
                })

                return text;
            }
        };
    });

    ApplicationServices.factory('FileDownloadService', function ($log, $q, $window, $timeout, SERVICES_BASE, RESOURCE_NAME, SessionService, UtilService) {
        return {
            extractFileNameFromContentDisposition: function (contentDisposition) {
                var filename = '';

                if (contentDisposition && (contentDisposition.indexOf('inline') !== -1 || contentDisposition.indexOf('attachment') !== -1)) {
                    var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
                    var matches = filenameRegex.exec(contentDisposition);
                    if (matches != null && matches[1]) {
                        filename = matches[1].trim().replace(/UTF-8|\'|\"/g, '');
                    }
                }

                return filename;
            },
            downloadFile: function (url, callback) {
                var _self = this;

                var sessionKey = SessionService.getSessionKey();

                var xhr = new XMLHttpRequest();
                xhr.open('GET', SERVICES_BASE + url, true);
                xhr.setRequestHeader("Authorization", 'Bearer ' + sessionKey.token);
                xhr.setRequestHeader("Channel", 'CC ');
                xhr.setRequestHeader("Username", SessionService.getUsername());
                xhr.setRequestHeader("TransactionId", new Date().getTime());
                xhr.setRequestHeader("ServiceLabel", 'Download Service');
                xhr.setRequestHeader("ResourceName", RESOURCE_NAME);
                xhr.responseType = "blob";
                xhr.onreadystatechange = function () {
                    UtilService.showDummySpinner();

                    if (callback && (this.readyState == this.DONE)) {
                        UtilService.hideDummySpinner();

                        if (this.status === 200) {
                            var contentDisposition = this.getResponseHeader('content-disposition');
                            var fileName = _self.extractFileNameFromContentDisposition(contentDisposition);

                            callback(this.response, fileName, this.status);
                        } else {
                            callback(this.response, '', this.status);
                        }
                    }
                };
                xhr.send(null);
            },
            downloadFileAndGetBlob: function (srcUrl, callback) {
                this.downloadFile(srcUrl, function (blob, fileName, status) {
                    callback(blob, fileName, status);
                });
            },
            downloadFileAndGenerateUrl: function (srcUrl, callback) {
                this.downloadFile(srcUrl, function (blob, fileName) {
                    var _URL = $window.URL || $window.webkitURL || $window.mozURL;
                    var url = _URL.createObjectURL(blob);

                    // Revoke the url after 3 minutes.
                    $timeout(function () {
                        // Add this url to the url revoke queue.
                        _URL.revokeObjectURL(url);
                    }, 3 * 60 * 1000);

                    callback(url, fileName);
                });
            }
        }
    });

    ApplicationServices.factory('ReportingExportService', function ($log, $window, $timeout, $translate, notification, FileDownloadService, UtilService) {
        return {
            showReport: function (srcUrl, formatName) {
                UtilService.showDummySpinner();

                var htmlName = 'partials/report.html';
                if (formatName !== 'HTML') {
                    htmlName = 'partials/download.html';
                }

                FileDownloadService.downloadFile(srcUrl, function (blob, fileName) {
                    UtilService.hideDummySpinner();

                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, fileName);
                    } else {
                        var _URL = $window.URL || $window.webkitURL || $window.mozURL;
                        var url = _URL.createObjectURL(blob);

                        var win = $window.open(htmlName += '?url=' + encodeURIComponent(url));

                        if (!win || win.closed || typeof win.closed == 'undefined') {
                            // Pup-up Blocked
                            notification({
                                type: 'warning',
                                text: $translate.instant('CommonMessages.PopupBlockerDetected')
                            });

                            return;
                        }

                        if (formatName === 'HTML') {
                            // Do nothing if HTML
                        } else if (formatName === 'CSV' || formatName === 'MS EXCEL' || formatName === 'EXCEL 2007' || formatName === 'XLS' || formatName === 'WAV') {
                            if (formatName === 'WAV' && blob.type === 'text/html') {
                                notification({
                                    type: 'warning',
                                    text: $translate.instant('CommonMessages.GenericServerError')
                                });

                                // Close the download window if any error occurred.
                                $timeout(function () {
                                    win.close();
                                }, 100);
                            } else {
                                var onload = function (e) {
                                    $timeout(function () {
                                        // Construct an <a> element and give the url to it to be able to give filename
                                        // to the file which want to be downloaded.
                                        var link = win.document.createElement("a");
                                        link.download = fileName;
                                        link.href = url;
                                        win.document.body.appendChild(link);
                                        link.click();

                                        $timeout(function () {
                                            // Close the download window after download modal window has appeared.
                                            win.close();
                                        }, 200);
                                    }, 1000);
                                };

                                angular.element(win).bind('load', onload);
                            }
                        } else {
                            $timeout(function () {
                                win.location = url;
                            }, 1000);
                        }

                        // Revoke the url after 3 minutes.
                        $timeout(function () {
                            // Add this url to the url revoke queue.
                            _URL.revokeObjectURL(url);
                        }, 3 * 60 * 1000);
                    }
                });
            }
        };
    });

    ApplicationServices.factory('NgTableService', function ($log, $translate, UtilService) {
        return {
            filterList: function (filterText, columns, list) {
                var filteredListData;

                if (_.isEmpty(filterText)) {
                    filteredListData = list;
                } else {
                    filteredListData = _.filter(list, function (obj) {
                        for (var i in columns) {
                            // Use {translate} prefix in order to search in translations.
                            var propName = columns[i].split('{translate}');
                            var propValue;
                            try {
                                if (propName.length > 1) {
                                    propValue = $translate.instant(eval('obj.' + propName[1]));
                                } else {
                                    // For evaluating nested object properties like "property.name".
                                    propValue = eval('obj.' + propName[0]);
                                }
                            } catch (e) {
                                // ignore
                            }

                            if (typeof propValue !== 'undefined') {
                                // `~` with `indexOf` means "contains"
                                // `toLowerCase` to discard case of question string
                                var matched = ~String(propValue).toLowerCase().indexOf(filterText.toLowerCase());

                                if (matched)
                                    return true;
                            }
                        }

                        return false;
                    });
                }

                return filteredListData;
            }
        };
    });

    ApplicationServices.service('SessionService', function ($log, $window, $http, $rootScope, $timeout, $state, UtilService, Idle, RESOURCE_NAME) {
        return {
            setTaskCount: function (count) {
                UtilService.putToSessionStore(UtilService.TASK_COUNT_KEY, count);
            },
            getTaskCount: function () {
                var taskCount = UtilService.getFromSessionStore(UtilService.TASK_COUNT_KEY);
                if (_.isObject(taskCount) && _.isEmpty(taskCount)) {
                    taskCount = 0;
                }

                return Number(taskCount);
            },
            getSessionKey: function () {
                var sessionKey = UtilService.getFromSessionStore(UtilService.SESSION_KEY);

                return sessionKey;
            },
            getUserAccount: function () {
                var userAccount = UtilService.getFromSessionStore(UtilService.USER_ACCOUNT_KEY);

                return userAccount;
            },
            getUserId: function () {
                var sessionKey = this.getSessionKey();

                var jwt = UtilService.parseJwt(sessionKey.token);

                return jwt.sub.cmpfToken.uid;
            },
            isUserAdmin: function () {
                return true;
                // var isAdmin = UtilService.getFromSessionStore(UtilService.USER_IS_ADMIN_KEY);
                //
                // return isAdmin;
            },
            getUsername: function () {
                var username = UtilService.getFromSessionStore(UtilService.USERNAME_KEY);

                return username;
            },
            getSessionUserRights: function () {
                var userRights = UtilService.getFromSessionStore(UtilService.USER_RIGHTS);

                return userRights;
            },
            getSessionOrganization: function () {
                return UtilService.getFromSessionStore(UtilService.USER_ORGANIZATION_KEY);
            },
            getSessionOrganizationId: function () {
                var organization = this.getSessionOrganization();

                return organization ? organization.id : null;
            },
            getRbtAllowedCategories: function () {
                return UtilService.getFromSessionStore(UtilService.RBT_ALLOWED_CATEGORY_KEY);
            },
            setResourceNameHeader: function () {
                $http.defaults.headers.common.ResourceName = RESOURCE_NAME;
            },
            setAuthorizationHeader: function (token) {
                $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            },
            saveUserAttributesInSession: function (username, authenticateResponse) {
                $http.defaults.headers.common.Authorization = 'Bearer ' + authenticateResponse.token;

                UtilService.putToSessionStore(UtilService.SESSION_KEY, authenticateResponse);
                UtilService.putToSessionStore(UtilService.USERNAME_KEY, username);
            },
            isSessionValid: function () {
                // Check the session key, username and user rights only to be sure there is a valid session. The portal will be
                // used the tokens that saved in the session key to be able to go to the restful services.
                return !_.isEmpty(this.getSessionKey()) && !_.isEmpty(this.getUsername()) && !_.isEmpty(this.getSessionUserRights());
            },
            logout: function () {
                angular.element(document.querySelector('body')).addClass('hidden');

                this.sessionInvalidate();

                $timeout(function () {
                    $window.location = 'app.html';
                    $window.location.reload(true);
                }, 0);
            },
            cleanValues: function () {
                UtilService.removeFromSessionStore(UtilService.TASK_COUNT_KEY);
                UtilService.removeFromSessionStore(UtilService.SESSION_KEY);
                UtilService.removeFromSessionStore(UtilService.SITE_INFORMATION_KEY);
                UtilService.removeFromSessionStore(UtilService.LATEST_STATE);
                UtilService.removeFromSessionStore(UtilService.USER_ACCOUNT_KEY);
                UtilService.removeFromSessionStore(UtilService.USERNAME_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_RIGHTS);
                UtilService.removeFromSessionStore(UtilService.USER_IS_ADMIN_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_KEY);
                UtilService.removeFromSessionStore(UtilService.RBT_ALLOWED_CATEGORY_KEY);
                UtilService.removeFromSessionStore(UtilService.SERVICE_PROVIDER_DETAILS_KEY);
            },
            sessionInvalidate: function () {
                delete $http.defaults.headers.common.Authorization;

                this.cleanValues();

                // Stop idle watch.
                Idle.unwatch();
            }
        };
    });

    // Server Configuration and Information Services
    ApplicationServices.factory('ServerConfigurationService', function ($log, $q, ServerInformationRestangular, UtilService) {
        return {
            // The methods which gets data from the free zone.
            getSiteInformation: function (promiseTracker) {
                var promise = ServerInformationRestangular.one('site.json?' + UtilService.getCurrentNanoTime()).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });

    // Below services are using in order to communicate with 3rd party restful based services.
    ApplicationServices.factory('CMPFService', function ($log, $q, $filter, notification, $translate, UtilService, CMPFAuthRestangular,
                                                         SessionService, CMPFRestangular, DEFAULT_REST_QUERY_LIMIT, BATCH_SIZE) {
        return {
            DEFAULT_ORGANIZATION_NAME: "STC",
            DEFAULT_RBT_ORGANIZATION_NAME: "STC",
            // Organization names
            DEFAULT_CHANNELS_ORGANIZATION_NAME: "Mobily Channels",
            DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME: "Mobily Service Categories",
            DEFAULT_SERVICE_LABELS_ORGANIZATION_NAME: "Mobily Service Labels",
            DEFAULT_SERVICE_TYPES_ORGANIZATION_NAME: "Mobily Service Types",
            DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME: "Mobily Settlement Types",
            DEFAULT_AGREEMENTS_ORGANIZATION_NAME: "Mobily Agreements",
            DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME: "Mobily Business Types",
            DEFAULT_PROJECTS_ORGANIZATION_NAME: "Mobily Projects",
            DEFAULT_DEPARTMENTS_ORGANIZATION_NAME: "Mobily Departments",
            DEFAULT_TEAMS_ORGANIZATION_NAME: "Mobily Teams",
            DEFAULT_SHORT_CODES_ORGANIZATION_NAME: "Mobily Short Codes",
            DEFAULT_REVENUE_RANGES_ORGANIZATION_NAME: "Mobily Revenue Ranges",
            DEFAULT_DCB_SETTINGS_ORGANIZATION_NAME: "Mobily DCB Settings",
            DEFAULT_CUSTOMER_PROFILES_ORGANIZATION_NAME: "Mobily Customer Profiles",
            RBT_BUSINESS_TYPE_NAME: "RBT",
            // Subscriber related profiles
            // ...
            // Organization related profiles
            OPERATOR_PROFILE: 'OperatorProfile',
            ORGANIZATION_CHANNEL_PROFILE: 'ChannelProfile',
            ORGANIZATION_MAIN_SERVICE_CATEGORY_PROFILE: 'ServiceMainCategoryProfile',
            ORGANIZATION_SUB_SERVICE_CATEGORY_PROFILE: 'ServiceSubCategoryProfile',
            ORGANIZATION_SERVICE_LABEL_PROFILE: 'ServiceLabelProfile',
            ORGANIZATION_SERVICE_TYPE_PROFILE: 'ServiceTypeProfile',
            ORGANIZATION_SETTLEMENT_TYPE_PROFILE: 'SettlementTypeProfile',
            ORGANIZATION_BUSINESS_TYPE_PROFILE: 'BusinessTypeProfile',
            ORGANIZATION_PROJECT_PROFILE: 'ProjectProfile',
            ORGANIZATION_AGREEMENT_PROFILE: 'AgreementProfile',
            ORGANIZATION_DEPARTMENT_PROFILE: 'DepartmentProfile',
            ORGANIZATION_TEAM_PROFILE: 'TeamProfile',
            ORGANIZATION_SHORT_CODE_PROFILE: 'ShortCodeProfile',
            ORGANIZATION_REVENUE_RANGE_PROFILE: 'RevenueRangeProfile',
            BULK_ORGANIZATION_PROFILE: 'BulkOrganizationProfile',
            MSISDN_PREFIX_PROFILE: 'MSISDNPrefixProfile',
            ORGANIZATION_CUSTOMER_PROFILING_PROFILE: 'CustomerProfilingProfile',
            // Service provider related profiles
            SERVICE_PROVIDER_COMMON_PROFILE: 'ProviderCommonProfile',
            SERVICE_PROVIDER_ADDRESS_PROFILE: 'ProviderAddressProfile',
            SERVICE_PROVIDER_CONTACTS_PROFILE: 'ProviderContactsProfile',
            SERVICE_PROVIDER_LEGACY_ID_PROFILE: 'ProviderLegacyIDProfile',
            SERVICE_PROVIDER_ALLOWED_CATEGORY_PROFILE: 'ProviderAllowedCategoryProfile',
            // DSP Related
            SERVICE_PROVIDER_PROFILE: 'ServiceProviderProfile',
            SERVICE_PROVIDER_I18N_PROFILE: 'Provideri18nProfile',
            SERVICE_PROVIDER_AUTH_PROFILE: 'ProviderAuthProfile',
            SERVICE_PROVIDER_REGISTRATION_PROFILE: 'ProviderRegistrationProfile',
            SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE: 'ProviderBankAccountProfile',
            SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE: 'ProviderBusinessTypeProfile',
            SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE: 'ProviderSettlementTypeProfile',
            SERVICE_PROVIDER_LEGAL_DOCS_PROFILE: 'ProviderLegalDocsProfile',
            // Service related profiles
            SERVICE_PROFILE: 'ServiceProfile',
            SERVICE_LEGACY_ID_PROFILE: "ServiceLegacyIDProfile",
            SERVICE_I18N_PROFILE: 'Servicei18nProfile',
            SERVICE_CAPABILITY_ACCESS_PROFILE: 'ServiceCapabilityAccessProfile',
            SERVICE_ALERT_TEMPLATE_PROFILE: 'AlertTemplateProfile',
            SERVICE_ON_DEMAND_TEMPLATE_PROFILE: 'OnDemandTemplateProfile',
            SERVICE_OTHER_TEMPLATE_PROFILE: 'OtherTemplateProfile',
            SERVICE_SMS_SLA_PROFILE: 'SMSSLAProfile',
            SERVICE_MMS_SLA_PROFILE: 'MMSSLAProfile',
            SERVICE_WEB_WAP_SLA_PROFILE: 'WEBWAPSLAProfile',
            SERVICE_PRODUCT_PROFILE: 'ProductProfile',
            SERVICE_MO_CHARGING_PROFILE: 'MOChargingProfile',
            SERVICE_MT_CHARGING_PROFILE: 'MTChargingProfile',
            SERVICE_SENDER_ID_PROFILE: 'SenderIdProfile',
            SERVICE_KEYWORD_CHAPTER_MAPPING_PROFILE: 'KeywordChapterMappingProfile',
            SERVICE_ON_DEMAND_I18N_PROFILE: 'OnDemandi18nProfile',
            SERVICE_SUBSCRIPTION_NOTIFICATION_PROFILE: 'SubscriptionNotificationProfile',
            SERVICE_COPYRIGHT_FILE_PROFILE: 'ServiceCopyrightFileProfile',
            SERVICE_VAT_PROFILE: 'ServiceVATProfile',
            SERVICE_CONTENT_BASED_SETTLEMENT_PROFILE: 'ServiceContentBasedSettlementProfile',
            // Service DCB related profiles
            SERVICE_DCB_PROFILE: 'DCBProfile',
            SERVICE_DCB_SERVICE_PROFILE: 'DCBServiceProfile',
            SERVICE_DCB_PREPAID_CAPPING_RULE_PROFILE: 'DCBPrepaidCappingRuleProfile',
            SERVICE_DCB_POSTPAID_CAPPING_RULE_PROFILE: 'DCBPostpaidCappingRuleProfile',
            SERVICE_DCB_SERVICE_DISPUTE_RULE_PROFILE: 'DCBServiceDisputeRuleProfile',
            SERVICE_DCB_SERVICE_MESSAGE_I18N_PROFILE: 'DCBServiceMessagei18nProfile',
            SERVICE_DCB_SERVICE_INVOICE_I18N_PROFILE: 'DCBServiceInvoicei18nProfile',
            SERVICE_DCB_SERVICE_ACTIVATION_PROFILE: 'DCBServiceActivationProfile',
            SERVICE_DCB_SERVICE_DEACTIVATION_PROFILE: 'DCBServiceDeactivationProfile',
            SERVICE_DCB_SERVICE_ELIGIBILITY_PROFILE: 'DCBServiceEligibilityProfile',
            SERVICE_DCB_SERVICE_SLA_PROFILE: 'DCBServiceSLAProfile',
            SERVICE_DCB_SERVICE_CDR_PROFILE: 'DCBServiceCDRProfile',
            SERVICE_DCB_SERVICE_RECONCILIATION_POLICY_PROFILE: 'DCBServiceReconciliationPolicyProfile',
            SERVICE_DCB_SERVICE_RECONCILIATION_PROFILE: 'DCBServiceReconciliationProfile',
            // Offer related profiles
            OFFER_I18N_PROFILE: "Offeri18nProfile",
            XSM_OFFER_PROFILE: "XsmOfferProfile",
            XSM_CHARGING_PROFILE: "XsmChargingProfile",
            XSM_RENEWAL_PROFILE: "XsmRenewalProfile",
            XSM_TRIAL_PROFILE: "XsmTrialProfile",
            SMS_PORTAL_I18N_PROFILE: "SMSPortali18nProfile",
            OFFER_ELIGIBILITY_PROFILE: "OfferEligibilityProfile",
            SUBSCRIPTION_RENEWAL_NOTIFICATION_PROFILE: "SubscriptionRenewalNotificationProfile",
            BUNDLE_OFFER_PROFILE: "BundleOfferProfile",
            OFFER_BUNDLING_PROFILE: "OfferBundlingProfile",
            // Profile definition or orphan profile names
            SERVICE_UI_CATEGORIES_PROFILE: "ServiceUICategories",
            SERVICE_REPORTING_CATEGORIES_PROFILE: "ServiceReportingCategories",
            OFFER_CATEGORIES_PROFILE: "OfferCategories",
            PACKAGE_LIST_PROFILE: "PackageListProfile",
            // User related profiles
            USER_PROFILE_NAME: 'UserProfile',
            USER_REPORT_TEMPLATE_PROFILE: 'UserReportTemplateProfile',
            // Generic profile names
            ENTITY_AUDIT_PROFILE: 'EntityAuditProfile',
            RELATED_RESOURCES: ['VCP Partner Portal'],
            // User group related definitions
            DSP_PARTNER_ADMIN_GROUP: 'DSP Partner Admin',
            DSP_PARTNER_USER_GROUP: 'DSP Partner User',
            DSP_BUSINESS_ADMIN_GROUP: 'DSP Business Admin',
            DSP_MARKETING_ADMIN_GROUP: 'DSP Marketing Admin',
            DSP_IT_ADMIN_GROUP: 'DSP IT Admin',
            // Others
            ORGANIZATION_TYPES: {
                PARTNER: 'Partner',
                NETWORK_OPERATOR: 'NetworkOperator',
                VIRTUAL_OPERATOR: 'VirtualOperator'
            },
            ERROR_CODES: {
                DUPLICATE_USER_NAME: 5025801
            },
            // Methods
            prepareProfile: function (updatedProfile, originalProfile) {
                // First we delete the profileId since it is for internal usage.
                delete updatedProfile.profileId;

                var attrArray = [];

                // Check the all fields of the updated object and put them into the new array
                // or the previous one.
                _.each(updatedProfile, function (value, key) {
                    var attr;
                    if (originalProfile) {
                        attrArray = originalProfile.attributes;
                        attr = _.find(attrArray, function (attribute) {
                            return attribute.name === key;
                        });
                    }

                    if (attr) {
                        if (value && _.isArray(value)) {
                            attr.listValues = value;
                        } else {
                            attr.value = value;
                        }
                    } else {
                        if (value && _.isArray(value)) {
                            attrArray.push({
                                "name": key,
                                "listValues": value
                            });
                        } else {
                            attrArray.push({
                                "name": key,
                                "value": value
                            });
                        }
                    }
                });

                return attrArray;
            },
            showApiError: function (response) {
                var type = 'warning', message;

                if (response) {
                    if (response.errorDescription) {
                        message = response.errorDescription.split(':')[0] + '...';
                    } else if (response.data) {
                        if (response.data.errorDescription) {
                            message = response.data.errorDescription.split(':')[0] + '...';
                        } else {
                            type = 'danger';
                            message = $translate.instant('CommonMessages.ApiError');
                        }
                    }
                }

                if (message) {
                    notification({
                        type: type,
                        text: message
                    });
                }
            },
            // Authentication
            authenticate: function (credential) {
                var authenticateProm = CMPFAuthRestangular.all('authenticate').post(credential);
                UtilService.addPromiseToTracker(authenticateProm);
                return authenticateProm;
            },
            // Password Reset
            requestPasswordReset: function (username) {
                var payload = {
                    "username": username
                };

                var promise = CMPFAuthRestangular.all('authenticate/resetpassword').post(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            refreshToken: function (refreshToken) {
                var refreshTokenProm = CMPFAuthRestangular.all('refresh-token').customGET(null, null, {
                    Authorization: 'Bearer ' + refreshToken
                });
                UtilService.addPromiseToTracker(refreshTokenProm);
                return refreshTokenProm;
            },
            // All Organizations without specifying type
            getAllOrganizationsByName: function (offset, limit, name) {
                var url = 'organizations?withprofiles=true&offset=' + offset + '&limit=' + limit + '&name=%25' + name + '%25';

                var promise = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAllOrganizationsByExactName: function (offset, limit, name) {
                var url = 'organizations?withprofiles=true&offset=' + offset + '&limit=' + limit + '&name=' + name;

                var promise = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getOrganizationByName: function (name, withprofiles) {
                var deferred = $q.defer();

                var url = 'organizations?offset=0&limit=1&withprofiles=' + (withprofiles ? withprofiles : false) + '&name=%25' + name + '%25';

                var promise = CMPFRestangular.one(url).get();
                promise.then(function (response) {
                    if (response && response.organizations && response.organizations.length > 0) {
                        deferred.resolve(response.organizations[0]);
                    } else {
                        deferred.reject();
                    }
                })

                UtilService.addPromiseToTracker(deferred.promise);

                return deferred.promise;
            },
            updateOperator: function (operator) {
                $log.debug('operator:', operator);
                var prom = CMPFRestangular.all('networkoperators/' + operator.id).customPUT(operator);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getOrganizationByAttribute: function (profileName, attributeName, attributeValue) {
                var url = 'organizations?offset=0&limit=1&profileDefName=' + profileName + '&' + attributeName + '=' + attributeValue;

                var promise = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getOrganizationShortcodeCommands: function (organizationId, shortcodeId) {
                var prom = CMPFRestangular.one('organizations/' + organizationId + '/shortcodes/' + shortcodeId+ '/commands').get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            // Partners
            getPartnerById: function (partnerId) {
                var promise = CMPFRestangular.one('partners/' + partnerId + '?withchildren=false&withprofiles=true').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Services
            getService: function (id) {
                var prom = CMPFRestangular.one('services/' + id + '?withchildren=true&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // Services
            getServicesByOrganizationId: function (organizationId, withchildren, withprofiles, state, resultProfileDefNames, promiseTracker) {
                var _self = this;
                var deferred = $q.defer();

                _self.getServices(0, BATCH_SIZE, organizationId, withchildren, withprofiles, state, resultProfileDefNames, promiseTracker).then(function (firstResponse) {

                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getServices(offset, BATCH_SIZE, organizationId, withchildren, withprofiles, state, resultProfileDefNames, promiseTracker));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.services = firstResponse.services.concat(totalResponse.services);
                                });

                                deferred.resolve(firstResponse);
                            });
                        }
                    } else {
                        deferred.reject(firstResponse);
                    }
                }, function (respose) {
                    deferred.reject(response);
                });

                UtilService.addPromiseToTracker(deferred.promise, promiseTracker);

                return deferred.promise;
            },
            getServices: function (offset, limit, organizationId, withchildren, withprofiles, state, resultProfileDefNames, promiseTracker) {
                var url = 'services?offset=' + offset + '&limit=' + limit + '&organizationId=' + organizationId + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);
                if (state) {
                    url += '&state=' + state;
                }

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            // Offers
            getOffer: function (id, withchildren, withprofiles) {
                var url = 'offers/' + id +
                    '?withchildren=' + (withchildren ? withchildren : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false);

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // Offers
            getOffersByOrganizationId: function (organizationId, withchildren, withorganization, withprofiles, state, resultProfileDefNames, promiseTracker) {
                var _self = this;
                var deferred = $q.defer();

                _self.getOffers(0, BATCH_SIZE, organizationId, withchildren, withorganization, withprofiles, state, resultProfileDefNames, promiseTracker).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getOffers(offset, BATCH_SIZE, organizationId, withchildren, withorganization, withprofiles, state, resultProfileDefNames, promiseTracker));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.offers = firstResponse.offers.concat(totalResponse.offers);
                                });

                                deferred.resolve(firstResponse);
                            });
                        }
                    } else {
                        deferred.reject(firstResponse);
                    }
                }, function (respose) {
                    deferred.reject(response);
                });

                UtilService.addPromiseToTracker(deferred.promise, promiseTracker);

                return deferred.promise;
            },
            getOffers: function (offset, limit, organizationId, withchildren, withorganization, withprofiles, state, resultProfileDefNames, promiseTracker) {
                var url = 'offers?offset=' + offset + '&limit=' + limit + '&organizationId=' + organizationId +
                    '&withchildren=' + (withchildren ? withchildren : false) +
                    '&withorganization=' + (withorganization ? withorganization : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false);

                if (state) {
                    url += '&state=' + state;
                }

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getOffersByName: function (offset, limit, withchildren, withorganization, withprofiles, organizationId, name, resultProfileDefNames) {
                var url = 'offers?offset=' + offset + '&limit=' + limit +
                    (name ? '&name=%25' + name + '%25' : '') +
                    (organizationId ? '&organizationId=' + organizationId : '') +
                    '&withchildren=' + (withchildren ? withchildren : false) +
                    '&withorganization=' + (withorganization ? withorganization : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false);

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                return prom;
            },
            getOffersByOrganizationIdByServiceName: function (offset, limit, organizationId, serviceName) {
                var prom = CMPFRestangular.one('offers?withchildren=false&offset=' + offset + '&limit=' + limit + '&serviceName=' + serviceName + '&organizationId=' + organizationId).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // User accounts
            getUserAccount: function (userId, withchildren, withprofiles) {
                var promise = CMPFRestangular.one('useraccounts/' + userId + '?withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false)).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getUserAccountsByOrganizationId: function (offset, limit, organizationId) {
                var promise = CMPFRestangular.one('useraccounts?withchildren=true&withprofiles=true&offset=' + offset + '&limit=' + limit + '&organizationId=' + organizationId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getUserAccountGroups: function (userId, withchildren, withprofiles) {
                var promise = CMPFRestangular.one('useraccounts/' + userId + '/usergroups?withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false)).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getUserAccountGroupsByName: function (name) {
                var promise = CMPFRestangular.one('usergroups?withchildren=false&name=%25' + name + '%25').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createUserAccount: function (newItem) {
                var promise = CMPFRestangular.all('useraccounts').post(newItem);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateUserAccount: function (account) {
                var promise = CMPFRestangular.all('useraccounts/' + account.id).customPUT(account);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteUserAccount: function (account) {
                var promise = CMPFRestangular.one('useraccounts/' + account.id).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getUserAccountRights: function (id) {
                var _self = this;
                var deferred = $q.defer();

                UtilService.addPromiseToTracker(deferred.promise);

                CMPFRestangular.one('useraccounts/' + id + '/rights').get().then(function (response) {
                    if (response) {
                        response = _.filter(response, function (right) {
                            return _.contains(_self.RELATED_RESOURCES, right.resourceName);
                        });
                    }

                    deferred.resolve(response);
                }, function (response) {
                    deferred.reject(response);
                });

                return deferred.promise;

                /*var _self = this;
                var deferred = $q.defer();

                UtilService.addPromiseToTracker(deferred.promise);

                CMPFRestangular.one('useraccounts/' + id + '/rights').get().then(function (response) {

                    /!*var combinedRights = [
                        {
                            "operationName": "PRM::Offer:Update",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Service:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Service:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceCategory:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Configuration:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:ScreeningKeyword:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceCategory:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:CustomerProfiling:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:BusinessType:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:BusinessType:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ListOrganizations",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "PRM::Content:Delete",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Signature:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageService",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "CMS::Operations:ContentType:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Reports:Scheduled:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:Global:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentType:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ShortCode:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Dashboard:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Task:Notify",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "ViewOrganizationToCreateUser",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerOrganization:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:SettlementType:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentMetadata:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceType:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Channel:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:InteractiveCampaign:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Operator:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserGroup:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetRule",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "SCRM::Operations:Global:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Tone:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Reports:OnDemand:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ServiceProvider:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceLabel:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:ShortCode:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:PerService:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Artist:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:ShortCode:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Monitoring:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Reports:Scheduled:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Subscriber:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Configuration:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerUserAccount:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:BusinessType:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Assign",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserGroup:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "PRM::UserAccount:Read",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:BusinessType:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:RoutingTable:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageSubscriber",
                            "resourceName": "Subscription Management"
                        },
                        {
                            "operationName": "ALL::FinancialReports:OnDemand:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserGroup:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Diagnostics:AlarmLogs",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Team:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentMetadata:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BPM::Task:Reject",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:RoutingTable:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Reports:Scheduled:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetService",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "RBT::Operations:SpecialCondition:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ServiceProvider:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Channel:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Service:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentCategory:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerOrganization:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ServiceProvider:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "GetOffer",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "SSM::Operations:ShortCode:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerOrganization:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentFile:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Templates:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "Products:OTP",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:PerService:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Products:BMS",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserAccount:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:BusinessType:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:ScreeningKeyword:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "Products:DCB",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Service:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Agreement:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:ScreeningKeyword:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:Campaign:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerOrganization:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetOrganization",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "ALL::Subsystems:SCRM",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Troubleshooting:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentMetadata:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Channel:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Album:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::ShortCode:Read",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceCategory:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "AdminPageOperation",
                            "resourceName": "AdminPageResource"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:Global:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentMetadata:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:Global:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Project:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Reports:Scheduled:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:SettlementType:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceType:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Operator:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Templates:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:BusinessType:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Service:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Agreement:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:Global:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:SettlementType:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "GetSubscriber",
                            "resourceName": "Subscription Management"
                        },
                        {
                            "operationName": "CMPF::Operations:Service:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Client:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Monitoring:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ManageProfile",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "CMPF::Operations:UserGroup:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Campaigns:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Project:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Role:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Subsystems:BIZ",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetProfileBinding",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:Global:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Channel:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Artist:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Configuration:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Category:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:Global:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerOrganization:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::ShortCode:Create",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Subscriber:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceCategory:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:Global:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:InteractiveCampaign:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerOrganization:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentFile:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Event:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:CustomerProfiling:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:InteractiveCampaign:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Reports:OnDemand:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "PRM::Content:Update",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceCategory:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Charging:Debit",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:InteractiveCampaign:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:PerService:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Role:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Service:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:SpecialCondition:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Subsystems:DIAG",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerOrganization:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Approve",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:SettlementType:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:PerService:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Troubleshooting:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Client:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceType:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentMetadata:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerUserAccount:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerUserAccount:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceCategory:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManagePricing",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "CMS::Operations:ContentType:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Subscriber:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Client:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ServiceProvider:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Offer:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Task:Create",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "GetPrice",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "RBT::Operations:Signature:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Products:MSGW",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Artist:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetPolicy",
                            "resourceName": "Security Management"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Notify",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:Campaign:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:PerService:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Team:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Subscriber:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Team:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Service:Delete",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "GetProfileDefinition",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerUserAccount:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ServiceProvider:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserAccount:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Channel:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:SpecialCondition:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentCategory:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Department:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentCategory:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Department:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceLabel:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:ShortCode:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserGroup:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Approve",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:Global:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:BusinessType:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Event:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CreateOrganization",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "BIZ::Operations:Channel:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Configuration:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageServiceOperations",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "CMS::Operations:ContentFile:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerUserAccount:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentMetadata:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ShortCode:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceLabel:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Operator:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:Global:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceLabel:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerOrganization:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:Campaign:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "PRM::UserAccount:Update",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Campaigns:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ManageProfileBinding",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "ALL::Subsystems:CMS",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Mood:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceLabel:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:Global:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ServiceProvider:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "PRM::Service:Read",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserGroup:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Task:Delete",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Department:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:SignatureBox:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Troubleshooting:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Assign",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Templates:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:Global:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Tone:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Content:Read",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Mood:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Offer:Create",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "ManageUser",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "CMPF::Operations:Operator:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Diagnostics:AlarmLogs",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:ScreeningKeyword:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Category:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Tone:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::UserAccount:Create",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerUserAccount:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Category:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Configuration:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:Global:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Album:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Mood:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerOrganization:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ShortCode:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:ShortCode:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Offer:Read",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ShortCode:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Charging:Refund",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Agreement:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerUserAccount:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceType:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Offer:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Reports:Scheduled:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:SettlementType:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:ScreeningKeyword:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::ShortCode:Delete",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Reject",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:Campaign:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerUserAccount:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentType:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Team:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetUser",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "CMS::Operations:ContentFile:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Charging:Refund",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Service:Create",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerOrganization:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:InteractiveCampaign:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:Global:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:RoutingTable:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:RoutingTable:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerUserAccount:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:InteractiveCampaign:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:Global:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Reports:Scheduled:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:SettlementType:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentType:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Configuration:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Artist:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Mood:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:Global:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:Campaign:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Offer:Delete",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:Global:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Agreement:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Subsystems:CMPF",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Agreement:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageIdentityOperations",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "CMS::Operations:ContentFile:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Templates:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentCategory:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:Campaign:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ManagePolicy",
                            "resourceName": "Security Management"
                        },
                        {
                            "operationName": "CMS::Operations:ContentFile:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Dashboard:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:SignatureBox:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentFile:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::UserAccount:Delete",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:Campaign:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageSecurityOperations",
                            "resourceName": "Security Management"
                        },
                        {
                            "operationName": "SSM::Operations:Offer:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SSM::Operations:CustomerProfiling:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Diagnostics:AuditLogs",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentMetadata:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceLabel:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:PerService:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Operator:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "PRM::ShortCode:Update",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerUserAccount:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserAccount:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "PRM::Reports:OnDemand:Read",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "ManageProfileDefinition",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "CMPF::Operations:UserAccount:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Service:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Templates:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Department:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Task:Read",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "ManageRule",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "CMS::Operations:ContentType:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:Global:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::FinancialReports:OnDemand:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "Products:CHGW",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Monitoring:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Operator:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Offer:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Agreement:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Reject",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Offer:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceCategory:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Tone:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageOffer",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "MSGW::Operations:ScreeningKeyword:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerUserAccount:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:Global:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ManageProfileOperations",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "BIZ::Operations:SettlementType:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:CustomerProfiling:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Monitoring:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Album:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceType:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Subscriber:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Event:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:SpecialCondition:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceType:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Templates:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentCategory:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SSM::Operations:ShortCode:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ShortCode:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Project:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentMetadata:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "PRM::FinancialReports:OnDemand:Read",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Subsystems:SSM",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:RoutingTable:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Reports:Scheduled:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Channel:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentType:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Operator:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Project:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:PerService:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Project:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:Campaign:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentType:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:RoutingTable:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Charging:Debit",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:BusinessType:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "GetGroup",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "CMPF::Operations:ServiceProvider:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceType:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserGroup:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ShortCode:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Signature:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceLabel:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:Global:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerUserAccount:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Troubleshooting:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Troubleshooting:Peek",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerUserAccount:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Subscriber:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Offer:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Task:Assign",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerOrganization:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Notify",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Offer:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerUserAccount:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "Products:APIM",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:SettlementType:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:SignatureBox:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Subscriber:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerOrganization:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Subscriber:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Diagnostics:AuditLogs",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Client:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:Global:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceCategory:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:Global:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ServiceProvider:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserAccount:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerUserAccount:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Templates:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Album:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceType:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentCategory:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageGroup",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "BIZ::Operations:Project:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Channel:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserAccount:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Profile:Read",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Troubleshooting:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:ServiceLabel:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserAccount:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:Global:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ShortCode:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Subsystems:REP",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageOrganization",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:ScreeningKeyword:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserGroup:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Operator:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:RoutingTable:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Project:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Content:Create",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerOrganization:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Project:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Configuration:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:BlackList:PerOrganization:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:ShortCode:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Signature:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerUserAccount:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SSM::Operations:ShortCode:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Event:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Operations:Task:Create",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Role:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:UserAccount:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "ALL::Templates:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "SSM::Operations:ShortCode:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Agreement:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:Global:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Profile:Update",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "ALL::Configuration:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentCategory:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Service:Update",
                            "resourceName": "MaaP Partner Portal"
                        },
                        {
                            "operationName": "BIZ::Operations:Agreement:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMPF::Operations:Role:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:RoutingTable:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerOrganization:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentCategory:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "CMS::Operations:ContentFile:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SCRM::Operations:PerService:Delete",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "SSM::Operations:Offer:Read",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "GetProfile",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "ALL::Reports:Scheduled:Update",
                            "resourceName": "MaaP Admin Portal"
                        },
                        {
                            "operationName": "BMS::Operations:DistroList:PerOrganization:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "MSGW::Operations:ScreeningKeyword:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:SignatureBox:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Category:Update",
                            "resourceName": "VCP Partner Portal"
                        },

                        {
                            "operationName": "ManageIdentityOperations",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "Operations:Provisioning:Subscriber:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:SMSC:P2A:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageServiceOperations",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "Operations:Provisioning:Operator:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Subscriber:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Operator:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Subscriber:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:USC:A2P:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Services:VM",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Operations:All:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:MMSC:P2A:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:All:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Services:PC",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageRule",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "ManageProfileDefinition",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "Products:USSI",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Subscription:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ScreeningLists:All:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Templates:All:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:All:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Services:CC",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Services:CMB",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Templates:All:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:UserAccount:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageUser",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "Preferences:All:Read",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "ManageGroup",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "Operations:All:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetSubscriber",
                            "resourceName": "Subscription Management"
                        },
                        {
                            "operationName": "Operations:Provisioning:Offer:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Products:USC",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Reports:OnDemand:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:UserAccount:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Subsystems:ReportGeneration",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Charging:All:Refund",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "GetPrice",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "Operations:Provisioning:Operator:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:MMSC:A2P:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ListOrganizations",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "ScreeningLists:All:Read",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Subscription:All:Unsubscribe",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Troubleshooting:AntiSpam:P2A:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Products:SMSC",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Products:SMSF",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Troubleshooting:MMSC:P2A:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Troubleshooting:AntiSpam:A2P:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageOrganization",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "Troubleshooting:SMSC:A2P:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "ManageSecurityOperations",
                            "resourceName": "Security Management"
                        },
                        {
                            "operationName": "Operations:Provisioning:UserGroup:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetProfileDefinition",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "ManagePricing",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "Reports:Scheduled:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetUser",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "ManagePolicy",
                            "resourceName": "Security Management"
                        },
                        {
                            "operationName": "Configuration:All:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetRule",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "Products:AntiSpam",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "ViewOrganizationToCreateUser",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "Troubleshooting:SMSC:P2A:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Reports:Scheduled:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:SMSC:A2P:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Services:VM",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:ServiceProvider:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetProfile",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "GetGroup",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "GetProfileBinding",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "ScreeningLists:All:Create",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:ServiceProvider:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:UserAccount:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:All:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:All:Update",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "ManageService",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "Operations:Provisioning:Service:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Services:CC",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Services:CMB",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Troubleshooting:MMSC:P2P:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:AntiSpam:P2P:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Services:NM",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "GetOrganization",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "Templates:All:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Subsystems:Provisioning",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:USC:P2A:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Subscriber:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Products:AntiSpam",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Subsystems:ScreeningMgmt",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ScreeningLists:All:Delete",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "ScreeningLists:All:Update",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:UserAccount:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageProfileOperations",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "Subscription:All:Subscribe",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Troubleshooting:MMSC:A2P:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Offer:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:UserGroup:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Reports:Scheduled:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetService",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "Products:USC",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Subsystems:LicenseMgmt",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetOffer",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "Troubleshooting:All:Delete",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Services:PC",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Operations:All:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Service:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Reports:Scheduled:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "AdminPageOperation",
                            "resourceName": "AdminPageResource"
                        },
                        {
                            "operationName": "ManageOffer",
                            "resourceName": "Service & Catalog Management"
                        },
                        {
                            "operationName": "Services:RBT",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Services:VSMS",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "ManageProfile",
                            "resourceName": "Profile Management"
                        },
                        {
                            "operationName": "Troubleshooting:All:Read",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Services:NM",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Offer:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Preferences:All:Update",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Subsystems:Diagnostics",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:MMSC:P2P:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "ManageSubscriber",
                            "resourceName": "Subscription Management"
                        },
                        {
                            "operationName": "Products:MMSC",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Charging:All:Refund",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:USC:A2P:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:UserGroup:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ScreeningLists:All:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Products:USSI",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "GetPolicy",
                            "resourceName": "Security Management"
                        },
                        {
                            "operationName": "Troubleshooting:USC:P2A:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:AntiSpam:P2P:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "CreateOrganization",
                            "resourceName": "Identity Management"
                        },
                        {
                            "operationName": "Operations:Provisioning:Service:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Service:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Services:MCN",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:UserGroup:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Products:SMSF",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:AntiSpam:P2A:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Products:SMSC",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:ServiceProvider:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ScreeningLists:All:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:ServiceProvider:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Operator:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Operations:Provisioning:Offer:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ScreeningLists:All:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:SMSC:P2P:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Services:RBT",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Services:VSMS",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Configuration:All:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Products:MMSC",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Troubleshooting:AntiSpam:A2P:Peek",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Services:MCN",
                            "resourceName": "VCP Customer Care Portal"
                        },
                        {
                            "operationName": "Troubleshooting:All:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Troubleshooting:SMSC:P2P:Peek",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Templates:All:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "ManageProfileBinding",
                            "resourceName": "Profile Management"
                        },
                        // Added for MM
                        {
                            "operationName": "MM:Simota:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "MM:DMC:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        // RBT Missing Operations
                        {
                            "operationName": "RBT::Operations:Playlist:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Playlist:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Playlist:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Playlist:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Service:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Service:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Service:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Service:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Diy:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Diy:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Diy:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Diy:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Subcategory:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Subcategory:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Subcategory:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Subcategory:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        // Others
                        {
                            "operationName": "Products:OIVR",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "CMS::Operations:Content:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Subsystems:SSM",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Subsystems:CMS",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Subsystems:BIZ",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Dashboards:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "Services:CBR",
                            "resourceName": "VCP Partner Portal"
                        },
                    ];*!/

                    var combinedRights = [
                        {
                            "operationName": "BPM::Task:Approve",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Task:Assign",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Task:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Task:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Task:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "BPM::Task:Reject",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Profile:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Profile:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Reports:OnDemand:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::FinancialReports:OnDemand:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::UserAccount:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::UserAccount:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::UserAccount:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::UserAccount:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Offer:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Offer:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Offer:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Offer:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Service:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Service:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Service:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Service:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Content:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Content:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Content:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::Content:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Category:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Category:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Category:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Category:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Album:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Album:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Album:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Album:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Artist:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Artist:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Artist:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Artist:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Mood:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Mood:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Mood:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Mood:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Tone:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Tone:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Tone:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "RBT::Operations:Tone:Delete",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::ShortCode:Create",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::ShortCode:Read",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::ShortCode:Update",
                            "resourceName": "VCP Partner Portal"
                        },
                        {
                            "operationName": "PRM::ShortCode:Delete",
                            "resourceName": "VCP Partner Portal"
                        }
                    ]
                    response = combinedRights;

                    if (response) {
                        response = _.filter(response, function (right) {
                            return _.contains(_self.RELATED_RESOURCES, right.resourceName);
                        });
                    }

                    deferred.resolve(response);
                }, function (response) {
                    deferred.reject(response);
                });

                return deferred.promise;*/
            },
            addNewAccountsToUserGroup: function (group, userAccounts) {
                var promise = CMPFRestangular.one('usergroups/' + group.id + '/useraccounts').customPUT(userAccounts);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            removeAccountFromUserGroup: function (group, userAccount) {
                var promise = CMPFRestangular.one('usergroups/' + group.id + '/useraccounts/' + userAccount.id).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Profile operations
            getProfile: function (id, withchildren) {
                var url = 'profiles/' + id + '?withchildren=' + (withchildren ? withchildren : false);

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getOrphanProfilesByProfileDefName: function (profileDefName, withchildren) {
                var url = 'profiles/orphan?profileDefName=' + profileDefName + '&withchildren=' + (withchildren ? withchildren : false);

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            findProfileByName: function (profiles, profileName) {
                return _.findWhere(profiles, {profileDefinitionName: profileName});
            },
            findProfilesByName: function (profiles, profileName) {
                return _.where(profiles, {profileDefinitionName: profileName});
            },
            getProfileAttributes: function (profileList, profileName) {
                var array = [];

                var profiles = _.where(profileList, {name: profileName});
                angular.forEach(profiles, function (profile) {
                    var obj = {};
                    angular.forEach(profile.attributes, function (attribute) {
                        var value;
                        if (attribute.listValues && attribute.listValues.length > 0) {
                            var value = $filter('orderBy')(attribute.listValues, ['value']);
                        } else {
                            value = attribute.value;
                            if (!_.isEmpty(value) && !_.isUndefined(value)) {
                                var numValue = Number(value);
                                if (!isNaN(numValue)) {
                                    if ((value.length > 1 && !value.startsWith('0')) || (value.length === 1) || value.includes(',') || value.includes('.')) {
                                        value = numValue;
                                    }
                                } else if (value === 'true' || value === 'false') {
                                    value = s.toBoolean(value);
                                }
                            }
                        }

                        obj[attribute.name] = value;
                    });

                    obj.profileId = profile.id;

                    array.push(obj);
                });

                return array;
            },
            getProfileTextAttributes: function (profileList, profileName) {
                var array = [];

                var profiles = _.where(profileList, {name: profileName});
                angular.forEach(profiles, function (profile) {
                    var obj = {};
                    angular.forEach(profile.attributes, function (attribute) {
                        var value = attribute.value;
                        obj[attribute.name] = value;
                    });
                    obj.profileId = profile.id;
                    array.push(obj);
                });

                return array;
            },
            getUserProfile: function (userAccount) {
                var userProfileDef = _.findWhere(userAccount.profiles, {profileDefinitionName: this.USER_PROFILE_NAME});

                return userProfileDef;
            },
            getChannels: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_CHANNEL_PROFILE);
            },
            getMainServiceCategories: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_MAIN_SERVICE_CATEGORY_PROFILE);
            },
            getSubServiceCategories: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_SUB_SERVICE_CATEGORY_PROFILE);
            },
            getServiceLabels: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_SERVICE_LABEL_PROFILE);
            },
            getServiceTypes: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_SERVICE_TYPE_PROFILE);
            },
            getSettlementTypes: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_SETTLEMENT_TYPE_PROFILE);
            },
            getAgreements: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_AGREEMENT_PROFILE);
            },
            getBusinessTypes: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_BUSINESS_TYPE_PROFILE);
            },
            getProjects: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_PROJECT_PROFILE);
            },
            getDepartments: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_DEPARTMENT_PROFILE);
            },
            getTeams: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_TEAM_PROFILE);
            },
            getShortCodes: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_SHORT_CODE_PROFILE);
            },
            getRevenueRanges: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_REVENUE_RANGE_PROFILE);
            },
            getCustomerProfilings: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_CUSTOMER_PROFILING_PROFILE);
            },
            extractUserProfile: function (userAccount) {
                var ussdUserProfileDef = this.getUserProfile(userAccount);

                if (!_.isEmpty(ussdUserProfileDef) && !_.isUndefined(ussdUserProfileDef)) {
                    var nameAttr = _.findWhere(ussdUserProfileDef.attributes, {name: "Name"});
                    var surnameAttr = _.findWhere(ussdUserProfileDef.attributes, {name: "Surname"});
                    var mobilePhoneNoAttr = _.findWhere(ussdUserProfileDef.attributes, {name: "MobilePhoneNo"});
                    var emailAttr = _.findWhere(ussdUserProfileDef.attributes, {name: "EMail"});

                    var ussdUserProfile = {
                        Name: nameAttr ? nameAttr.value : '',
                        Surname: surnameAttr ? surnameAttr.value : '',
                        MobilePhoneNo: mobilePhoneNoAttr ? mobilePhoneNoAttr.value : '',
                        EMail: emailAttr ? emailAttr.value : ''
                    };

                    return ussdUserProfile;
                } else {
                    return {};
                }
            },
            getBulkUserProfile: function (userAccount) {
                return this.findProfileByName(userAccount.profiles, this.BULK_USER_PROFILE);
            },
            extractBulkUserProfile: function (userAccount) {
                var bulkUserProfileDef = this.getBulkUserProfile(userAccount);

                if (!_.isEmpty(bulkUserProfileDef) && !_.isUndefined(bulkUserProfileDef)) {
                    var nameAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "Name"});
                    var surnameAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "Surname"});
                    var phoneAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "Phone"});
                    var emailAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "Email"});
                    var addressAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "Address"});
                    var secretQuestionAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "SecretQuestion"});
                    var secretQuestionCorrectAnswerAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "SecretQuestionCorrectAnswer"});
                    var isBulkSmsUserAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "isBulkSmsUser"});
                    var isBulkMmsUserAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "isBulkMmsUser"});
                    var lastLoginAdminPortalAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "LastLoginAdminPortal"});
                    var lastLoginCustomerCarePortalAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "LastLoginCustomerCarePortal"});

                    return {
                        Name: (nameAttr ? nameAttr.value : ''),
                        Surname: (surnameAttr ? surnameAttr.value : ''),
                        Phone: (phoneAttr ? phoneAttr.value : ''),
                        Email: (emailAttr ? emailAttr.value : ''),
                        Address: (addressAttr ? addressAttr.value : ''),
                        SecretQuestion: (secretQuestionAttr ? secretQuestionAttr.value : ''),
                        SecretQuestionCorrectAnswer: (secretQuestionCorrectAnswerAttr ? secretQuestionCorrectAnswerAttr.value : ''),
                        isBulkSmsUser: (isBulkSmsUserAttr && isBulkSmsUserAttr.value === 'true' ? true : false),
                        isBulkMmsUser: (isBulkMmsUserAttr && isBulkMmsUserAttr.value === 'true' ? true : false),
                        LastLoginAdminPortal: (lastLoginAdminPortalAttr ? lastLoginAdminPortalAttr.value : '1970-01-01T00:00:00Z'),
                        LastLoginCustomerCarePortal: (lastLoginCustomerCarePortalAttr ? lastLoginCustomerCarePortalAttr.value : '1970-01-01T00:00:00Z')
                    };
                } else {
                    return {};
                }
            },
            // EntityAuditProfile
            checkEntityAuditProfile: function (profiles) {
                // EntityAuditProfile
                var entityAuditProfiles = this.getProfileAttributes(profiles, this.ENTITY_AUDIT_PROFILE);
                if (!entityAuditProfiles || entityAuditProfiles.length === 0) {
                    var sessionOrganization = SessionService.getSessionOrganization();
                    var username = SessionService.getUsername();
                    var currentTimestamp = $filter('date')(new Date(), 'yyyy-MM-dd\'T\'HH:mm:ss');

                    // EntityAuditProfile
                    var entityAuditProfile = {
                        CreatedBy: username,
                        CreatedOn: currentTimestamp,
                        CreateApprovedBy: username,
                        CreateApprovedOn: currentTimestamp,
                        LastUpdatedBy: username,
                        LastUpdatedOn: currentTimestamp,
                        LastUpdateApprovedBy: username,
                        LastUpdateApprovedOn: currentTimestamp
                    };
                    var entityAuditProfile = this.prepareNewEntityAuditProfile(entityAuditProfile);
                    profiles.push(entityAuditProfile);
                }
            },
            prepareNewEntityAuditProfile: function (entityAuditProfile) {
                var emptyProfile = {
                    "name": this.ENTITY_AUDIT_PROFILE,
                    "profileDefinitionName": this.ENTITY_AUDIT_PROFILE,
                    "attributes": [
                        {
                            "name": "CreatedBy",
                            "value": entityAuditProfile.CreatedBy
                        },
                        {
                            "name": "CreatedOn",
                            "value": entityAuditProfile.CreatedOn
                        },
                        {
                            "name": "CreateApprovedBy",
                            "value": entityAuditProfile.CreateApprovedBy
                        },
                        {
                            "name": "CreateApprovedOn",
                            "value": entityAuditProfile.CreateApprovedOn
                        },
                        {
                            "name": "LastUpdatedBy",
                            "value": entityAuditProfile.LastUpdatedBy
                        },
                        {
                            "name": "LastUpdatedOn",
                            "value": entityAuditProfile.LastUpdatedOn
                        },
                        {
                            "name": "LastUpdateApprovedBy",
                            "value": entityAuditProfile.LastUpdateApprovedBy
                        },
                        {
                            "name": "LastUpdateApprovedOn",
                            "value": entityAuditProfile.LastUpdateApprovedOn
                        }
                    ]
                };

                return emptyProfile;
            },
            // Profile operations
            initializeProviderProfiles: function (provider, categoryList, subCategoryList) {
                // ServiceProviderAllowedCategoryProfile
                var serviceProviderAllowedCategoryProfiles = this.getProfileTextAttributes(provider.profiles, this.SERVICE_PROVIDER_ALLOWED_CATEGORY_PROFILE);

                if (serviceProviderAllowedCategoryProfiles.length > 0) {
                    _.each(serviceProviderAllowedCategoryProfiles, function (categoryProfile) {
                        var category = _.findWhere(categoryList, { id: categoryProfile.MainCategoryID });
                        categoryProfile.categoryName = category ? category.name : 'N/A';
                        categoryProfile.category = category;

                        var subCategory = _.findWhere(subCategoryList, { id: categoryProfile.SubCategoryID });
                        categoryProfile.subCategoryName = subCategory ? subCategory.name : 'N/A';
                        categoryProfile.subcategory = subCategory;
                    });
                    serviceProviderAllowedCategoryProfiles = $filter('orderBy')(serviceProviderAllowedCategoryProfiles, ['categoryName', 'subCategoryName']);
                    provider.serviceProviderAllowedCategoryProfiles = angular.copy(serviceProviderAllowedCategoryProfiles);
                }

                // ServiceProviderCommonProfile
                var serviceProviderCommonProfiles = this.getProfileAttributes(provider.profiles, this.SERVICE_PROVIDER_COMMON_PROFILE);
                if (serviceProviderCommonProfiles.length > 0) {
                    provider.serviceProviderCommonProfile = angular.copy(serviceProviderCommonProfiles[0]);
                    provider.serviceProviderCommonProfile.Logo = { name: undefined };
                }

                // ProviderAddressProfile
                var serviceProviderAddressProfiles = this.getProfileAttributes(provider.profiles, this.SERVICE_PROVIDER_ADDRESS_PROFILE);
                if (serviceProviderAddressProfiles.length > 0) {
                    provider.serviceProviderAddressProfile = angular.copy(serviceProviderAddressProfiles[0]);
                }

                // ProviderLegacyIDProfile
                var serviceProviderLegacyIDProfiles = this.getProfileAttributes(provider.profiles, this.SERVICE_PROVIDER_LEGACY_ID_PROFILE);
                if (serviceProviderLegacyIDProfiles.length > 0) {
                    provider.serviceProviderLegacyIDProfile = angular.copy(serviceProviderLegacyIDProfiles[0]);
                }
            },
            initializeUserProfiles: function (user) {
                var userProfile = this.getProfileAttributes(user.profiles, this.USER_PROFILE_NAME);
                if (userProfile.length > 0) {
                    user.userProfile = userProfile[0];
                }
            }
        };
    });

    // One Time Password (OTP) services
    ApplicationServices.factory('WorkflowsOTPService', function ($log, $translate, notification, WorkflowsOTPRestangular, UtilService) {
        return {
            showApiError: function (response) {
                // Sample response
                // {"code": 200, "description": "OTP Requested", "validityPeriodInSeconds": 120 }
                var type = 'warning', message;

                if (response) {
                    if (response.code !== 200 || (response.data && response.data.code !== 200)) {
                        if (response.detail || (response.data && response.data.detail)) {
                            message = response.detail || response.data.detail;
                        } else {
                            message = response.description || response.data.description;
                        }

                        if (!message) {
                            if (response.data && response.data.status) {
                                type = 'danger';
                                message = $translate.instant('CommonMessages.ApiError', {
                                    errorCode: response.data.status,
                                    errorText: response.data.error
                                });
                            } else {
                                message = $translate.instant('CommonMessages.GenericServerError');
                            }
                        }
                    }
                }

                if (message) {
                    notification({
                        type: type,
                        text: message
                    });
                }
            },
            sendOTP: function (msisdn) {
                var promise = WorkflowsOTPRestangular.one('send/' + msisdn).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            verifyOTP: function (msisdn, verificationCode) {
                var promise = WorkflowsOTPRestangular.one('verify/' + msisdn + '/' + verificationCode).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Workflows Services
    ApplicationServices.factory('WorkflowsService', function ($log, $translate, notification, UtilService, WorkflowsPartnerRegistrationRestangular, WorkflowsRestangular,
                                                              SessionService, CMPFService, WORKFLOWS_STATUSES, DEFAULT_REST_QUERY_LIMIT) {
        var postService = function (service, flowType) {
            var promise = WorkflowsRestangular.all('service/' + flowType).post(service);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var postOffer = function (offer, flowType) {
            var promise = WorkflowsRestangular.all('offer/' + flowType).post(offer);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var postPartner = function (partner, flowType) {
            var promise = WorkflowsRestangular.all('partner/' + flowType).post(partner);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var postContentMetadata = function (contentMetadata, flowType) {
            var promise = WorkflowsRestangular.all('content/metadata/' + flowType).post(contentMetadata);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var postContentFile = function (contentFile, contentFilePayload, flowType) {
            var contentFilePayloadStr = JSON.stringify(contentFilePayload);

            var fd = new FormData();
            fd.append('file', contentFile);
            fd.append('contentFile', contentFilePayloadStr);

            var promise = WorkflowsRestangular.one('/content/file/' + flowType)
                .withHttpConfig({transformRequest: angular.identity})
                .customPOST(fd, '', undefined, {'Content-Type': undefined});

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var postShortCode = function (shortCode, flowType) {
            var promise = WorkflowsRestangular.all('shortcode/' + flowType).post(shortCode);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var getContentRBT = function (contentInstanceId) {
            var promise = WorkflowsRestangular.one('rbt/' + contentInstanceId).get();

            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var postContentCategoryRBT = function (contentCategory, flowType) {
            var promise = WorkflowsRestangular.all('rbt/categories/' + flowType).post(contentCategory);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var postArtistRBT = function (artist, flowType) {
            var promise = WorkflowsRestangular.all('rbt/artists/' + flowType).post(artist);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var postAlbumRBT = function (album, flowType) {
            var promise = WorkflowsRestangular.all('rbt/albums/' + flowType).post(album);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var postToneRBT = function (tone, flowType) {
            var promise = WorkflowsRestangular.all('rbt/tones/' + flowType).post(tone);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var postMoodRBT = function (mood, flowType) {
            var promise = WorkflowsRestangular.all('rbt/moods/' + flowType).post(mood);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var completeTask = function (taskId, response, reason) {
            var payload = {
                "taskId": taskId,
                "response": response
            };

            if (response === 'REJECT') {
                payload.message = reason;
            }
            console.log(payload);


            var promise = WorkflowsRestangular.all('task/complete').post(payload);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            taskCountChecker: undefined,
            // Methods
            showApiError: function (response) {
                var type = 'warning', message;

                if (response.data) {
                    response = angular.copy(response.data);
                }

                if (response) {
                    if (response.message) {
                        message = response.message.split(':')[0] + '...';
                    } else if (response.data) {
                        if (response.data.message) {
                            message = response.data.message.split(':')[0] + '...';
                        } else {
                            type = 'danger';
                            message = $translate.instant('CommonMessages.ApiError');
                        }
                    }
                }

                if (message) {
                    notification({
                        type: type,
                        text: message
                    });
                }
            },
            approveTask: function (taskId, reason) {
                return completeTask(taskId, 'APPROVE', reason);
            },
            rejectTask: function (taskId) {
                return completeTask(taskId, 'REJECT', "Rejected by user");
            },
            // Partner and user account registration
            registerUserAccount: function (userAccount) {
                var promise = WorkflowsPartnerRegistrationRestangular.all('register').post(userAccount);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            activateUserAccount: function (activationCode) {
                var promise = WorkflowsPartnerRegistrationRestangular.one('activate/' + activationCode).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            partnerFirstLoginInformation: function (companyInformation) {
                var promise = WorkflowsPartnerRegistrationRestangular.all('firstLogin').post(companyInformation);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // Services
            getService: function (serviceInstanceId) {
                var promise = WorkflowsRestangular.one('service/' + serviceInstanceId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            cancelService: function (taskId) {
                var promise = WorkflowsRestangular.one('service/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createService: function (service) {
                return postService(service, 'create');
            },
            updateService: function (service) {
                return postService(service, 'update');
            },
            deleteService: function (service) {
                return postService(service, 'delete');
            },
            // Service content methods
            createServiceContent: function (contentFormData) {
                var promise = WorkflowsRestangular.one('/service/content')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(contentFormData, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Offers
            getOffer: function (offerInstanceId) {
                var promise = WorkflowsRestangular.one('offer/' + offerInstanceId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            cancelOffer: function (taskId) {
                var promise = WorkflowsRestangular.one('offer/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createOffer: function (offer) {
                return postOffer(offer, 'create');
            },
            updateOffer: function (offer) {
                return postOffer(offer, 'update');
            },
            deleteOffer: function (offer) {
                return postOffer(offer, 'delete');
            },
            // Partners
            getPartner: function (partnerInstanceId) {
                var promise = WorkflowsRestangular.one('partner/' + partnerInstanceId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            cancelPartner: function (taskId) {
                var promise = WorkflowsRestangular.one('partner/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePartner: function (partner) {
                return postPartner(partner, 'update');
            },
            deletePartner: function (partner) {
                return postPartner(partner, 'delete');
            },
            // Content Metadata
            getContentMetadata: function (contentMetadataInstanceId) {
                var promise = WorkflowsRestangular.one('content/metadata/' + contentMetadataInstanceId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            cancelContentMetadata: function (taskId) {
                var promise = WorkflowsRestangular.one('content/metadata/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentMetadata: function (contentMetadata) {
                return postContentMetadata(contentMetadata, 'create');
            },
            updateContentMetadata: function (contentMetadata) {
                return postContentMetadata(contentMetadata, 'update');
            },
            deleteContentMetadata: function (contentMetadata) {
                return postContentMetadata(contentMetadata, 'delete');
            },
            // Content File
            getContentFile: function (contentFileInstanceId) {
                var promise = WorkflowsRestangular.one('content/file/' + contentFileInstanceId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            cancelContentFile: function (taskId) {
                var promise = WorkflowsRestangular.one('content/file/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentFile: function (contentFile, contentFilePayload) {
                return postContentFile(contentFile, contentFilePayload, 'create');
            },
            updateContentFile: function (contentFile, contentFilePayload) {
                return postContentFile(contentFile, contentFilePayload, 'update');
            },
            deleteContentFile: function (contentFilePayload) {
                var promise = WorkflowsRestangular.all('/content/file/delete').post(contentFilePayload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Short Code
            getShortCode: function (shortCodeInstanceId) {
                var promise = WorkflowsRestangular.one('shortcode/' + shortCodeInstanceId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            cancelShortCode: function (taskId) {
                var promise = WorkflowsRestangular.one('shortcode/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createShortCode: function (shortCode) {
                return postShortCode(shortCode, 'create');
            },
            updateShortCode: function (shortCode) {
                return postShortCode(shortCode, 'update');
            },
            deleteShortCode: function (shortCode) {
                return postShortCode(shortCode, 'delete');
            },
            ////////////////////////
            // RBT
            // Content Categories
            getContentCategoryRBT: function (contentCategoryInstanceId) {
                return getContentRBT(contentCategoryInstanceId);
            },
            cancelContentCategoryRBT: function (taskId) {
                var promise = WorkflowsRestangular.one('rbt/categories/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentCategoryRBT: function (contentCategory) {
                return postContentCategoryRBT(contentCategory, 'create');
            },
            updateContentCategoryRBT: function (contentCategory) {
                return postContentCategoryRBT(contentCategory, 'update');
            },
            deleteContentCategoryRBT: function (contentCategory) {
                return postContentCategoryRBT(contentCategory, 'delete');
            },
            // Content Metadata
            // Artists
            getArtistRBT: function (artistInstanceId) {
                return getContentRBT(artistInstanceId);
            },
            cancelArtistRBT: function (taskId) {
                var promise = WorkflowsRestangular.one('rbt/artists/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createArtistRBT: function (artist) {
                return postArtistRBT(artist, 'create');
            },
            updateArtistRBT: function (artist) {
                return postArtistRBT(artist, 'update');
            },
            deleteArtistRBT: function (artist) {
                return postArtistRBT(artist, 'delete');
            },
            // Albums
            getAlbumRBT: function (albumInstanceId) {
                return getContentRBT(albumInstanceId);
            },
            cancelAlbumRBT: function (taskId) {
                var promise = WorkflowsRestangular.one('rbt/albums/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createAlbumRBT: function (album) {
                return postAlbumRBT(album, 'create');
            },
            updateAlbumRBT: function (album) {
                return postAlbumRBT(album, 'update');
            },
            deleteAlbumRBT: function (album) {
                return postAlbumRBT(album, 'delete');
            },
            // Tones
            getToneRBT: function (toneInstanceId) {
                return getContentRBT(toneInstanceId);
            },
            cancelToneRBT: function (taskId) {
                var promise = WorkflowsRestangular.one('rbt/tones/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createToneRBT: function (tone) {
                return postToneRBT(tone, 'create');
            },
            updateToneRBT: function (tone) {
                return postToneRBT(tone, 'update');
            },
            deleteToneRBT: function (tone) {
                return postToneRBT(tone, 'delete');
            },
            // Moods
            getMoodRBT: function (moodInstanceId) {
                return getContentRBT(moodInstanceId);
            },
            cancelMoodRBT: function (taskId) {
                var promise = WorkflowsRestangular.one('rbt/moods/cancel/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMoodRBT: function (mood) {
                return postMoodRBT(mood, 'create');
            },
            updateMoodRBT: function (mood) {
                return postMoodRBT(mood, 'update');
            },
            deleteMoodRBT: function (mood) {
                return postMoodRBT(mood, 'delete');
            },
            ////////////////////////
            // Password Reset
            requestPasswordReset: function (username) {
                var payload = {
                    "from": {
                        "userId": username
                    }
                };

                var promise = WorkflowsRestangular.all('/partner/password/reset').post(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            confirmPasswordReset: function (newPassword, flowInstanceId) {
                var payload = {
                    "newPassword": newPassword
                };

                var promise = WorkflowsRestangular.all('/partner/password/reset/' + flowInstanceId).customPUT(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Tasks
            getTask: function (taskId) {
                var promise = WorkflowsRestangular.one('task/' + taskId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getTasks: function (page, size, status, type, promiseTracker) {
                var typeArray;
                if (type === 'ALL' || !type) {
                    // typeArray = [
                    //     'SERVICE', 'OFFER', 'PARTNER', 'CONTENT_METADATA', 'CONTENT_FILE', 'SHORT_CODE',
                    //     'RBT_CATEGORY', 'RBT_MOOD', 'RBT_TONE', 'RBT_ARTIST', 'RBT_ALBUM', 'OFFER_CONTRACTED'
                    // ];
                    typeArray = [
                        'PARTNER', 'CONTENT_METADATA', 'CONTENT_FILE',
                        'RBT_CATEGORY', 'RBT_TONE', 'RBT_ARTIST', 'RBT_ALBUM'
                    ];
                } else if (type.startsWith('CONTENT')) {
                    typeArray = ['CONTENT_METADATA', 'CONTENT_FILE'];
                } else if (type.startsWith('RBT')) {
                    //typeArray = ['RBT_CATEGORY', 'RBT_MOOD', 'RBT_TONE', 'RBT_ARTIST', 'RBT_ALBUM'];
                    typeArray = ['RBT_CATEGORY', 'RBT_TONE', 'RBT_ARTIST', 'RBT_ALBUM'];
                } else {
                    typeArray = [type];
                }

                var url = 'task/search?page=' + page + '&size=' + size;
                var payload = {
                    "statuses": status ? [status] : [],
                    "responses": [],
                    "flowTypes": typeArray,
                    "from": {
                        "userId": null,
                        "orgId": SessionService.getSessionOrganization().name,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    }
                };

                if (status === WORKFLOWS_STATUSES.NOTIFICATION) {
                    var from = angular.copy(payload.from);
                    payload.from = angular.copy(payload.to);
                    payload.to = from;
                }

                var promise = WorkflowsRestangular.all(url).post(payload);

                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getPendingTasks: function (page, size, type) {
                var url = 'task?page=' + page + '&size=' + size;
                var payload = {
                    "status": 'PENDING',
                    "type": type,
                    "from": {
                        "userId": null,
                        "orgId": SessionService.getSessionOrganization().name,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    }
                };

                var promise = WorkflowsRestangular.all(url).post(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            searchPendingTasks: function (page, size, type) {
                var url = 'task/search?page=' + page + '&size=' + size;
                var payload = {
                    "statuses": ['PENDING'],
                    "responses": [],
                    "flowTypes": [type],
                    "from": {
                        "userId": null,
                        "orgId": SessionService.getSessionOrganization().name,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    }
                };

                var promise = WorkflowsRestangular.all(url).post(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getTaskCount: function (promiseTracker) {
                var payload = {
                    "status": "COMPLETED",
                    "from": {
                        "userId": null,
                        "orgId": SessionService.getSessionOrganization().name,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    }
                };

                var promise = WorkflowsRestangular.all('task/count?ts=' + new Date().getTime()).withHttpConfig({ignoreLoadingBar: true}).post(payload);

                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getPendingPartnerTasks: function (userId, orgId) {
                var url = 'task?page=0&size=' + DEFAULT_REST_QUERY_LIMIT;
                var payload = {
                    "status": "PENDING",
                    "from": {
                        "userId": userId,
                        "orgId": orgId,
                        "groupId": null
                    },
                    "type": "PARTNER"
                };

                var promise = WorkflowsRestangular.all(url).post(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

    // Content Management Services
    ApplicationServices.factory('ContentManagementService', function ($log, $q, $translate, notification, ContentManagementRestangular, BulkContentManagementRestangular, UtilService) {

        var getRBTContentList = function (baseUrl, page, size, orderBy, orderDirection, statuses, name, isPromoted, accessChannels) {
            var url = baseUrl;

            url += '?page=' + (page ? page : 0);
            url += '&size=' + (size ? size : 10);

            url += orderBy ? '&orderBy=' + orderBy : '';
            url += orderDirection ? '&orderDirection=' + orderDirection : '';

            url += statuses ? '&statuses=' + statuses : '';
            url += accessChannels && accessChannels.length > 0  ? '&accessChannels=' + accessChannels.join('&accessChannels=') : '';

            // TODO: [TONES] CMS Bulk Ops. do not update the ngram list, search by name fails on bulk operations.
            // 'nameKeyword' param is used for search by name, entered value will be searched on both english and arabic names.
            if(baseUrl.toLowerCase().includes('tones') || baseUrl.toLowerCase().includes('playlist')) {
                url += name ? '&nameKeyword=' + name : '';
                url+= '&setSubscriptionCounts=true';
            } else {
                url += name ? (baseUrl.toLowerCase().includes('categories') ? '&nameKeyword=' : '&name=' ) + name : '';
            }

            url += isPromoted ? '&promoted=' + isPromoted : '';

            var promise = ContentManagementRestangular.one(url).get();

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var getRBTContentListByName = function (baseUrl, page, size, name, organizationId) {
            var url = baseUrl;

            url += '?page=' + (page ? page : 0);
            url += '&size=' + (size ? size : 10);

            url += '&orderBy=name&orderDirection=ASC';

            // TODO: [TONES] CMS Bulk Ops. do not update the ngram list, search by name fails on bulk operations.
            // 'nameKeyword' param is used for search by name, entered value will be searched on both english and arabic names.
            if(baseUrl.toLowerCase().includes('tones')) url += name ? '&nameKeyword=' + name : '';
            else url += name ? '&name=' + name : '';

            url += organizationId ? '&organizationId=' + organizationId : '';

            var promise = ContentManagementRestangular.one(url).get();

            UtilService.addPromiseToTracker(promise);

            return promise;
        };


        var getContentListWithRichFilters = function (baseUrl, page, size, orderBy, orderDirection, name, richFilter) {
            var url = baseUrl;

            url += '?page=' + (page ? page : 0);
            url += '&size=' + (size ? size : 10);

            url += orderBy ? '&orderBy=' + orderBy : '';
            url += orderDirection ? '&orderDirection=' + orderDirection : '';

            // TODO: CMS Bulk Ops. do not update the ngram list, search by name fails on records created by bulk operations.
            // 'nameKeyword' param is used for search by name, entered value will be searched on both english and arabic names.
            if(baseUrl.toLowerCase().includes('tones')) url += name ? '&nameKeyword=' + name : '';
            else url += name ? '&name=' + name : '';

            if(richFilter) {
                url += richFilter.statuses && richFilter.statuses.length > 0  ? '&statuses=' + richFilter.statuses.join('&statuses=') : '';
                url += richFilter.alias ? '&alias=' + richFilter.alias : '';
                url += richFilter.organizationId ? '&organizationId=' + richFilter.organizationId : '';
                url += richFilter.artistId ? '&artistId=' + richFilter.artistId : '';
                url += richFilter.categoryId ? '&categoryId=' + richFilter.categoryId : '';
                url += richFilter.subcategory ? '&subcategory=' + richFilter.subcategory : '';
                url += richFilter.promoted === null || richFilter.promoted === undefined ? '': '&promoted=' + richFilter.promoted;
                url += richFilter.subscriptionEnabled === null || richFilter.subscriptionEnabled === undefined ? '': '&subscriptionEnabled=' + richFilter.subscriptionEnabled;
                url += richFilter.blacklisted === null || richFilter.blacklisted === undefined ? '': '&blacklisted=' + richFilter.blacklisted;
                url += richFilter.startDate ? '&fromDateCreated=' + richFilter.startDate : '';
                url += richFilter.endDate ? '&toDateCreated=' + richFilter.endDate : '';
            }

            var promise = ContentManagementRestangular.one(url).get();

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            showApiError: function (response) {
                var type = 'warning', message;

                if (response) {
                    if (response.message) {
                        message = response.message.split(':')[0] + '...';
                    } else if (response.data) {
                        if (response.data.message) {
                            message = response.data.message.split(':')[0] + '...';
                        } else {
                            type = 'danger';
                            message = $translate.instant('CommonMessages.ApiError');
                        }
                    }
                }

                if (message) {
                    notification({
                        type: type,
                        text: message
                    });
                }
            },
            // Content cms file management
            validateAudioFile: function (file) {
                var contentFormData = new FormData();
                contentFormData.append('file', file);

                var promise = ContentManagementRestangular.one('rbt/tones/file/validate')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(contentFormData, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            validateMp3File: function (file) {
                var contentFormData = new FormData();
                contentFormData.append('file', file);

                var promise = ContentManagementRestangular.one('rbt/tones/mp3/validate')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(contentFormData, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            generateFilePath: function (objectId) {
                return '/content-management-rest/cms/file/' + objectId + '?ts=' + new Date().getTime();
            },
            uploadFile: function (file, fileName, fileId) {
                var fd = new FormData();
                fd.append('file', file);
                fd.append('fileName', fileName);
                fd.append('fileId', fileId);

                return this.uploadPartnerContentFile(fd).then(function (response) {
                    if (response && response.code === 2001) {
                        // Do nothing for succeeded content upload.
                    } else {
                        this.showApiError(response);
                    }
                }, function (response) {
                    this.showApiError(response);
                });
            },
            uploadPartnerContentFile: function (contentFormData) {
                var promise = ContentManagementRestangular.one('cms/upload')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(contentFormData, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteFile: function(fileId) {
                var promise = ContentManagementRestangular.one('cms/' + fileId).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Management
            queryAllowedCategorization: function (cmpfAllowedCategoryProfiles) {

                var _self = this;
                var deferred = $q.defer();
                var promises = [];

                // Extract unique categories and subcategories
                var categories = _.uniq(_.map(cmpfAllowedCategoryProfiles, 'MainCategoryID'));
                var subCategories = _.uniq(_.map(cmpfAllowedCategoryProfiles, 'SubCategoryID'));
                _.each(categories, function (categoryId) {  promises.push(_self.getContentCategoryRBT(categoryId)); });
                _.each(subCategories, function (subcategoryId) {  promises.push(_self.getSubcategoryRBT(subcategoryId)); });

                $q.all(promises).then(function (totalResponses) {
                    deferred.resolve(totalResponses);
                }, function (error) {
                    deferred.reject(error);
                });

                return deferred.promise;
            },
            // Content Categories
            getContentCategories: function () {
                var promise = ContentManagementRestangular.one('category?resultStructure=RELATIONAL').get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Types
            getContentTypes: function () {
                var promise = ContentManagementRestangular.one('content/type').get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Metadata
            getContentMetadatas: function (filter) {
                var queryString = angular.element.param(filter);

                var promise = ContentManagementRestangular.one('content/metadata?' + queryString).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getContentMetadata: function (contentMetadataId) {
                var promise = ContentManagementRestangular.one('content/metadata/' + contentMetadataId).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // Content Metadata Files
            generateContentMetadataFilePath: function (contentFileId) {
                return '/content-management-rest/content/file/' + contentFileId + '?ts=' + new Date().getTime();
            },
            getContentMetadataFiles: function (page, size, contentId) {
                var promise = ContentManagementRestangular.one('content/file?page=' + page + '&size=' + size + '&contentId=' + contentId).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getContentMetadataFile: function (contentFileId) {
                var promise = ContentManagementRestangular.one('content/file/' + contentFileId + '?ts=' + new Date().getTime()).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            ////////////////////////
            // RBT
            // Offers
            getContentOffersBySubscriptionCode: function (subscriptionCode) {
                var promise = ContentManagementRestangular.one('rbt/offers?subscriptionCode=' + subscriptionCode).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Categories
            // Content Categories
            getContentCategoriesRBT: function (page, size, orderBy, orderDirection, statuses, name, accessChannels) {
                var url = '/rbt/categories';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name, undefined, accessChannels);
            },
            getContentCategoriesRBTByOrganizationId: function (page, size, orderBy, orderDirection, statuses, name, organizationId) {
                var url = '/rbt/categories';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name, organizationId);
            },
            searchContentCategoriesRBT: function (page, size, name, organizationId) {
                var url = '/rbt/categories';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            getContentCategoryRBT: function (id, expansions) {
                var path = '/rbt/categories/' + id;
                path += expansions && expansions.length > 0 ? '?expansions=' + expansions.join('&expansions=') : '';

                var promise = ContentManagementRestangular.one(path).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentCategoryRBT: function (contentCategory) {
                var promise = ContentManagementRestangular.all('/rbt/categories').post(contentCategory);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateContentCategoryRBT: function (contentCategory) {
                var promise = ContentManagementRestangular.all('/rbt/categories/' + contentCategory.id).customPUT(contentCategory);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            //Subcategories
            //Subcategories
            getSubcategoriesRBT: function (page, size, orderBy, orderDirection, statuses, name, accessChannels) {
                var url = '/rbt/subcategories';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name, undefined, accessChannels);
            },
            searchSubcategoriesRBT: function (page, size, name, organizationId) {
                var url = '/rbt/subcategories';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            searchSubcategoriesRBTFiltered: function (page, size, name, categoryId) {
                var url = '/rbt/subcategories';
                var richFilter = {
                    categoryId: categoryId
                };

                return getContentListWithRichFilters(url, page, size, null, null, name, richFilter);

            },
            getSubcategoryRBT: function (id, expansions) {

                var path = '/rbt/subcategories/' + id;
                path += expansions && expansions.length > 0 ? '?expansions=' + expansions.join('&expansions=') : '';

                var promise = ContentManagementRestangular.one(path).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Metadata
            // Artists
            getArtistsByOrganizationId: function (page, size, orderBy, orderDirection, statuses, name, organizationId) {
                var url = '/rbt/artists';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name, organizationId);
            },
            searchArtists: function (page, size, name, organizationId) {
                var url = '/rbt/artists';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            getArtist: function (artistId, expansions) {

                var path = '/rbt/artists/' + artistId;
                path += expansions && expansions.length > 0 ? '?expansions=' + expansions.join('&expansions=') : '';

                var promise = ContentManagementRestangular.one(path).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createArtist: function (artist) {
                var promise = ContentManagementRestangular.all('/rbt/artists').post(artist);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateArtist: function (artist) {
                var promise = ContentManagementRestangular.all('/rbt/artists/' + artist.id).customPUT(artist);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Albums
            getAlbumsByOrganizationId: function (page, size, orderBy, orderDirection, statuses, name, organizationId) {
                var url = '/rbt/albums';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name, organizationId);
            },
            searchAlbums: function (page, size, name, organizationId) {
                var url = '/rbt/albums';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            getAlbum: function (albumId) {
                var promise = ContentManagementRestangular.one('/rbt/albums/' + albumId).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createAlbum: function (album) {
                var promise = ContentManagementRestangular.all('/rbt/albums').post(album);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateAlbum: function (album) {
                var promise = ContentManagementRestangular.all('/rbt/albums/' + album.id).customPUT(album);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Playlists
            getPlaylists: function (page, size, orderBy, orderDirection, statuses, name) {
                var url = '/rbt/playlists';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name);
            },
            searchPlaylists: function (page, size, name, organizationId) {
                var url = '/rbt/playlists';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            searchPlayListsBySubCategory: function (page, size, name, subCategoryId) {
                var url = '/rbt/playlists?page=' + (page ? page : 0) + '&size=' + (size ? size : 10) + '&orderBy=name&orderDirection=ASC';
                url += name ? '&name=' + name : '';
                url += subCategoryId ? '&subCategoryId=' +subCategoryId : '';

                var promise = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPlaylist: function (playlistId, expansions) {
                var path = '/rbt/playlists/' + playlistId;
                path += expansions && expansions.length > 0 ? '?expansions=' + expansions.join('&expansions=') : '';

                var promise = ContentManagementRestangular.one(path).get();

                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // Tones
            getTones: function (page, size, orderBy, orderDirection, statuses, name) {
                var url = '/rbt/tones';
                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name);
            },
            getTonesByOrganizationId: function (page, size, orderBy, orderDirection, statuses, name, organizationId) {
                var url = '/rbt/tones';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name, organizationId);
            },
            searchTones: function (page, size, name, organizationId) {
                var url = '/rbt/tones';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            searchTonesByAlbum: function (page, size, name, albumId) {
                var url = '/rbt/tones?page=' + (page ? page : 0) + '&size=' + (size ? size : 10) + '&orderBy=name&orderDirection=ASC';
                url += name ? '&name=' + name : '';
                url += albumId ? '&albumId=' + albumId : '';

                var promise = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            searchTonesByArtist: function (page, size, name, artistId) {
                var url = '/rbt/tones?page=' + (page ? page : 0) + '&size=' + (size ? size : 10) + '&orderBy=name&orderDirection=ASC';
                url += name ? '&name=' + name : '';
                url += artistId ? '&artistId=' + artistId : '';

                var promise = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            searchTonesByCategory: function (page, size, name, categoryId) {
                var url = '/rbt/tones?page=' + (page ? page : 0) + '&size=' + (size ? size : 10) + '&orderBy=name&orderDirection=ASC';
                url += name ? '&name=' + name : '';
                url += categoryId ? '&categoryId=' + categoryId : '';

                var promise = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            searchTonesByMood: function (page, size, name, moodId) {
                var url = '/rbt/tones?page=' + (page ? page : 0) + '&size=' + (size ? size : 10) + '&orderBy=name&orderDirection=ASC';
                url += name ? '&name=' + name : '';
                url += moodId ? '&moodId=' + moodId : '';

                var promise = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getTone: function (toneId, expansions) {
                var path = '/rbt/tones/' + toneId;
                path += expansions && expansions.length > 0 ? '?expansions=' + expansions.join('&expansions=') : '';

                var promise = ContentManagementRestangular.one(path).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createTone: function (tone) {
                var promise = BulkContentManagementRestangular.all('/rbt/tones').post(tone);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateTone: function (tone) {
                var promise = BulkContentManagementRestangular.all('/rbt/tones/' + tone.id).customPUT(tone);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Tones - Bulk Operations
            uploadBulkContent: function (templateFile, contentZipFile, organizationId) {
                var fd = new FormData();
                fd.append('details', templateFile);
                fd.append('files', contentZipFile);
                fd.append('orgId', organizationId);

                return this.uploadPartnerBulkContentFile(fd).then(function (response) {
                    // handle response & errors where this function is called
                    return response;
                });
            },
            uploadPartnerBulkContentFile: function (contentFormData) {
                var promise = BulkContentManagementRestangular.one('/rbt/tones/bulkCreate')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(contentFormData, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            searchTonesByRichFilter: function(page, size, orderBy, orderDirection, statuses, name, richFilter){
                var url = '/rbt/tones';

                return getContentListWithRichFilters(url, page, size, orderBy, orderDirection, statuses, name, richFilter);
            },
            // Moods
            getMoodsByOrganizationId: function (page, size, orderBy, orderDirection, statuses, name, organizationId) {
                var url = '/rbt/moods';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name, organizationId);
            },
            searchMoods: function (page, size, name, organizationId) {
                var url = '/rbt/moods';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            getMood: function (moodId) {
                var promise = ContentManagementRestangular.one('/rbt/moods/' + moodId).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createMood: function (mood) {
                var promise = ContentManagementRestangular.all('/rbt/moods').post(mood);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMood: function (mood) {
                var promise = ContentManagementRestangular.all('/rbt/moods/' + mood.id).customPUT(mood);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Get RBT lists
            getAlbumsByContextRBT: function (contextKey, id, page, size) {
                var url = '/rbt/' + contextKey + '/' + id + '/albums?page=' + page + '&size=' + size;

                var promise = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getTonesByContextRBT: function (contextKey, id, page, size) {
                var url = '/rbt/' + contextKey + '/' + id + '/tones?page=' + page + '&size=' + size;

                var promise = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Messaging GW services
    ApplicationServices.factory('MessagingGwProvService', function ($log, MessagingGwProvRestangular, UtilService) {
        var getApplications = function (serviceKey, organizationId) {
            var promise = MessagingGwProvRestangular.all('applications/' + serviceKey + '/byOrganization/' + organizationId).getList();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            // MM7
            getMM7Applications: function (organizationId) {
                return getApplications('mm7', organizationId);
            },
            // SMPP
            getSMPPApplications: function (organizationId) {
                return getApplications('smpp', organizationId);
            },
            // WebService
            getWebServiceApplications: function (organizationId) {
                return getApplications('webservice', organizationId);
            }
        };
    });

    // Charging GW services
    ApplicationServices.factory('ChargingGwProvService', function ($log, ChargingGwProvRestangular, UtilService) {
        return {
            // OpCos
            getOpCoList: function () {
                var promise = ChargingGwProvRestangular.all('opco/list').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Api Manager Services
    ApplicationServices.factory('ApiManagerProvService', function ($log, ApiManagerProvRestangular, UtilService) {
        return {
            getOffers: function () {
                var promise = ApiManagerProvRestangular.all('offers').getList();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getApis: function () {
                var promise = ApiManagerProvRestangular.all('apis').getList();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getApplications: function (devName) {
                var promise = ApiManagerProvRestangular.all('devs/' + devName + '/apps').getList();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getDashboard: function (from, to, promiseTracker) {
                var promise = ApiManagerProvRestangular.one('/stats/summary?from=' + from + '&to=' + to).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // Other special services
            // Service Capability
            getServiceCapabilityList: function () {
                var promise = ApiManagerProvRestangular.all('offers?status=active&labels=capability').getList();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getServiceCapabilityListByLabel: function (label) {
                var promise = ApiManagerProvRestangular.all('offers?status=active&labels=' + label).getList();
                UtilService.addPromiseToTracker(promise);
                return promise;
            }
        };
    });

    ApplicationServices.factory('GeneralESService', function ($log, $filter, ChargingGwESAdapterClient, ESClient, MessagingGwESAdapterClient, SessionService, UtilService,
                                                              RESOURCE_NAME) {
        var requestTimeout = 90000;

        var findHistoryRecords = function (esClient, index, type, filter, payload) {
            // The range filters for using navigation
            var offset = filter.offset,
                limit = filter.limit;

            var esQueryPromise = esClient.search({
                requestTimeout: requestTimeout,
                headers: {
                    'Channel': 'CC',
                    'Username': SessionService.getUsername(),
                    'TransactionId': new Date().getTime(),
                    'ServiceLabel': 'Elastic Search',
                    'ResourceName': RESOURCE_NAME
                },
                index: index,
                type: type,
                from: offset,
                size: limit,
                body: payload
            });

            UtilService.addPromiseToTracker(esQueryPromise);

            return esQueryPromise;
        };

        var getCount = function (esClient, index, type, payload) {
            var esQueryPromise = esClient.count({
                requestTimeout: requestTimeout,
                headers: {
                    'Channel': 'CC',
                    'Username': SessionService.getUsername(),
                    'TransactionId': new Date().getTime(),
                    'ServiceLabel': 'Elastic Search',
                    'ResourceName': RESOURCE_NAME
                },
                index: index,
                type: type,
                body: payload
            });

            UtilService.addPromiseToTracker(esQueryPromise);

            return esQueryPromise;
        };

        return {
            prepareMainEdrQueryPayload: function (filter, timestampFieldName, additionalFilterFields, termFilterJSON) {
                var startDate = filter.startDate,
                    endDate = filter.endDate,
                    queryString = filter.queryString,
                    quickSearchColumns = filter.quickSearchColumns,
                    sortFieldName = filter.sortFieldName,
                    sortOrder = filter.sortOrder;

                // Clean the query string text
                queryString = s.clean(queryString);
                queryString = UtilService.escapeRegExp(queryString);

                // Prepare the payload now.
                var payload = {
                    "query": {
                        "bool": {
                            "must": [],
                            "must_not": [],
                            "should": [],
                        }
                    },
                    "sort": []
                };

                if (!_.isEmpty(queryString)) {
                    var quickSearchShouldFilterJSON = [];
                    _.each(quickSearchColumns, function (columnName) {
                        var pJson = {};
                        try {
                            pJson = JSON.parse('{ "regexp" : { "' + columnName + '" : ".*' + queryString + '.*" } }');
                        } catch (e) {
                            console.log(e.message);
                        }
                        quickSearchShouldFilterJSON.push(pJson);
                    });

                    payload.query.bool.must.push({
                        "bool": {
                            "minimum_should_match": 1,
                            "should": quickSearchShouldFilterJSON
                        }
                    });
                }

                // Prepares queries for additional filter fields.
                if (additionalFilterFields) {
                    _.each(additionalFilterFields, function (columnValue, columnName) {
                        // It should be considered that a field contains multiple should query if additional the field is an object.
                        if (_.isObject(columnValue)) {
                            if (_.isArray(columnValue)) {
                                var termsArrayQuery = JSON.parse('{ "terms": { "' + columnName + '": [' + columnValue.join(', ') + '] } }');

                                payload.query.bool.must.push(termsArrayQuery);
                            } else {
                                _.each(columnValue, function (subColumnValue, subColumnName) {
                                    var query;
                                    if (!_.isUndefined(subColumnValue) && !s.isBlank(subColumnValue)) {
                                        // Consider that the star character in value of fields.
                                        if (s.include(subColumnValue, "*")) {
                                            query = JSON.parse('{ "regexp": { "' + subColumnName + '": "' + subColumnValue.replace(/\*/g, '.*') + '" } }');
                                        } else {
                                            query = JSON.parse('{ "term": { "' + subColumnName + '": "' + subColumnValue + '"} }');
                                        }

                                        payload.query.bool.must.push(query);
                                    }
                                });
                            }
                        } else {
                            if (!_.isUndefined(columnValue) && !s.isBlank(columnValue)) {
                                var query;
                                // Prepare simple prefix or query_string query if only simple fields have sent in the additionalfields parameter.
                                // Consider that the star character in value of fields.
                                if (s.include(columnValue, "*")) {
                                    query = JSON.parse('{ "regexp": { "' + columnName + '": "' + columnValue.replace(/\*/g, '.*') + '" } }');
                                } else {
                                    query = JSON.parse('{ "term": { "' + columnName + '": "' + columnValue + '"} }');
                                }

                                payload.query.bool.must.push(query);
                            }
                        }
                    });
                }

                if (sortFieldName && sortOrder) {
                    // Parsing sort JSON object
                    var sortJSON = JSON.parse('[ { "' + sortFieldName + '": { "order": ' + sortOrder + ' } } ]');
                    payload.sort = sortJSON;
                }

                // Push the date parameters into the filter.
                if (startDate && endDate) {
                    // Date range field matcher
                    var dateRangeJSON = JSON.parse('{ "range": { "' + timestampFieldName + '": { "gt": "' + startDate + '", "lt": "' + endDate + '" } } }');
                    payload.query.bool.must.push(dateRangeJSON);
                }

                // Add passed term filters into into the bool directly since supposing the term json contains any filter (e.g. must or must_not).
                if (termFilterJSON) {
                    _.each(termFilterJSON.must, function (mustItem) {
                        payload.query.bool.must.push(mustItem);
                    });

                    _.each(termFilterJSON.must_not, function (mustNotItem) {
                        payload.query.bool.must_not.push(mustNotItem);
                    });

                    _.each(termFilterJSON.should, function (shouldItem) {
                        payload.query.bool.should.push(shouldItem);
                    });
                }

                // If there is at least one clause in the should, then add minimum_should_match parameter to the bool.
                if (payload.query.bool.should.length > 0) {
                    payload.query.bool.minimum_should_match = 1;
                }

                return payload;
            },
            // Charging Gw
            findChargingGwRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = '';

                var termFilterJSON = {
                    "should": [
                        {
                            "term": {
                                "providerId": filter.providerId.toString()
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ChargingGwESAdapterClient, index, type, filter, bodyPayload);
            },
            // Workflows
            findWorkflowsRecords: function (filter, additionalFilterFields) {
                var index = 'workflow-history-read', type = 'history-edr';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "processStatus": [additionalFilterFields.processStatus ? additionalFilterFields.processStatus : "INITIAL"]
                            }
                        },
                        {
                            "term": {
                                "partnerId": filter.partnerId
                            }
                        }
                    ],
                    "should": []
                };
                delete additionalFilterFields.processStatus;

                if (additionalFilterFields.resourceType === 'CONTENT_METADATA') {
                    termFilterJSON.must.push({
                        "terms": {
                            "resourceType": ['CONTENT_METADATA', 'CONTENT_FILE']
                        }
                    });

                    delete additionalFilterFields.resourceType;
                }

                if (additionalFilterFields.resourceType === 'RBT') {
                    termFilterJSON.must.push({
                        "terms": {
                            //"resourceType": ['RBT_CATEGORY', 'RBT_MOOD', 'RBT_TONE', 'RBT_ARTIST', 'RBT_ALBUM']
                            "resourceType": ['RBT_CATEGORY', 'RBT_TONE', 'RBT_ARTIST', 'RBT_ALBUM']
                        }
                    });

                    delete additionalFilterFields.resourceType;
                }

                if (additionalFilterFields.resourceId) {
                    termFilterJSON.should = [
                        {
                            "term": {
                                "offerId": additionalFilterFields.resourceId
                            }
                        },
                        {
                            "term": {
                                "serviceId": additionalFilterFields.resourceId
                            }
                        },
                        {
                            "term": {
                                "contentMetadataId": additionalFilterFields.resourceId
                            }
                        },
                        {
                            "term": {
                                "contentFileId": additionalFilterFields.resourceId
                            }
                        },
                        {
                            "term": {
                                "shortCodeId": additionalFilterFields.resourceId
                            }
                        },
                        {
                            "term": {
                                "rbtContentId": additionalFilterFields.resourceId
                            }
                        }
                    ];

                    delete additionalFilterFields.resourceId;
                }

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'time', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findWorkflowsHistory: function (flowId) {
                var index = 'workflow-history-read', type = 'history-edr';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "flowId": flowId
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            findWorkflowsPayload: function (flowId) {
                var index = 'workflow-payload-read', type = 'payload-edr';

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "flowId": flowId
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // MessagingGw SMS
            findMessagingGwSMSRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'sms_edr';

                var termFilterJSON = {
                    "should": [
                        {
                            "term": {
                                "origOrganizationId": filter.organizationId.toString()
                            }
                        },
                        {
                            "term": {
                                "destOrganizationId": filter.organizationId.toString()
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(MessagingGwESAdapterClient, index, type, filter, bodyPayload);
            },
            findMessagingGwSMSMessageParts: function (origAddress, destAddress, partRef, timestamp) {
                var index = 'msggw-sms-read', type = 'sms';

                var beginDate = moment(timestamp).subtract(2, 'hours').toISOString();
                var endDate = moment(timestamp).add(2, 'hours').toISOString();

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "origAddress": origAddress
                                    }
                                },
                                {
                                    "term": {
                                        "destAddress": destAddress
                                    }
                                },
                                {
                                    "term": {
                                        "partRef": partRef
                                    }
                                },
                                {
                                    "range": {
                                        "date": {
                                            "gt": beginDate,
                                            "lt": endDate
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findMessagingGwSMSDeliveryReports: function (cdrKey) {
                var index = 'msggw-dr-sms-read', type = 'sms_dr';

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "cdrKey": cdrKey
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // MessagingGw MMS
            findMessagingGwMMSRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'mms_edr';

                var termFilterJSON = {
                    "should": [
                        {
                            "term": {
                                "origOrganizationId": filter.organizationId.toString()
                            }
                        },
                        {
                            "term": {
                                "destOrganizationId": filter.organizationId.toString()
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(MessagingGwESAdapterClient, index, type, filter, bodyPayload);
            },
            findMessagingGwMMSDeliveryReports: function (cdrKey) {
                var index = 'msggw-dr-mms-read', type = 'mms_dr';

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "cdrKey": cdrKey
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            }
        };
    });

})();
