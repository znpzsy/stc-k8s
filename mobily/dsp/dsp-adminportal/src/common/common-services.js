(function () {
    'use strict';

    /* Services */
    angular.module('Application.services', []);

    var ApplicationServices = angular.module('Application.services');

    ApplicationServices.factory('UtilService', function ($window, $log, $translate, notification, $timeout, DURATION_UNITS,
                                                         AdmPortalMainPromiseTracker, cfpLoadingBar) {
        var calculateDaysAgo = function (dayCount) {
            return moment().startOf('day').subtract(dayCount, 'days').toDate();
        };

        return {
            COUNTRY_CODE: "966",
            SESSION_KEY: '_sa_mb_dsp_a_sk',
            USERNAME_KEY: '_sa_mb_dsp_a_un',
            USER_RIGHTS: '_sa_mb_dsp_a_ur',
            // Common keys
            COMMON_SESSION_KEY: '_sa_mb_dsp_common_sk',
            COMMON_USERNAME_KEY: '_sa_mb_dsp_common_un',
            COMMON_USER_RIGHTS: '_sa_mb_dsp_common_ur',
            // ---
            TASK_COUNT_KEY: '_sa_mb_dsp_a_tkk',
            SITE_INFORMATION_KEY: '_sa_mb_dsp_a_si',
            SITE_CONFIGURATION_KEY: '_sa_mb_dsp_a_sc',
            LATEST_STATE: '_sa_mb_dsp_a_lst',
            USER_ORGANIZATION_KEY: '_sa_mb_dsp_a_uok',
            USER_ORGANIZATION_ID_KEY: '_sa_mb_dsp_a_uoik',
            USER_ORGANIZATION_NAME_KEY: '_sa_mb_dsp_a_onk',
            SERVICE_PROVIDER_DETAILS_KEY: '_sa_mb_dsp_a_spdk',
            USER_GROUPS_KEY: '_sa_mb_dsp_a_ugk',
            USER_ADMIN_KEY: '_sa_mb_dsp_a_uak',
            USER_BMS_ADMIN_KEY: '_sa_mb_dsp_a_ubak',
            // Created with this command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
            LOUIS_ARMSTRONG: "22545fa9eef57e2909c6f48bbc07a17a6bd55c0d80899a65dee421e4ef8066b5",
            Validators: {
                Msisdn: /^[0-9]{0,15}$/,
                InternationalPhoneNumber: /^(\+){0,1}[0-9]{0,15}$/,
                ValidPhoneNumber: /^(966){1}[0-9]{0,15}$/,
                ScreeningListValidPhoneNumber: /^[0-9]{1,30}(\*){0,1}$/,
                ScreeningListValidNumericRange: /^([0-9]{1,30}-[0-9]{1,30})?([0-9]{1,30})?$/,
                ScreeningListValidLongNumericRange: /^([0-9]{1,50}-[0-9]{1,50})?([0-9]{1,50})?$/,
                ScreeningListValidAlphanumericRange: /^[a-zA-Z0-9]{1,30}-[a-zA-Z0-9]{1,30}$/,
                ScreeningListValidNumericPrefix: /^[\d]+[*]{0,1}$/,
                UrlSimple: /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/,
                IntegerNumber: /^-?[0-9][^\.]*$/,
                DecimalNumber: /^-?[0-9]\d*(\.\d+)?$/,
                Alphanumeric: /^[a-zA-Z0-9]+$/,
                AlphanumericWithSpace: /^[a-zA-Z0-9\s]+$/,
                PhoneKeypad: /^[0-9\*#\+]+$/,
                UserPassword: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/,
                WordsBetweenOneCharOrSpace: /^([\p\u0600-\u06FFa-zA-Z0-9]+[\w -]?)*\s*$/,
                CheckCommas: /^((?![,]).)*$/,
                EmailAddress: /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/
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
            getDaysAgo: function (days) {
                return calculateDaysAgo(days);
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
            convertToDate: function (year, month, day) {
                return moment([year, month - 1, day]).toDate();
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
                    var bytes = CryptoJS.AES.decrypt(objectCipherText, this.LOUIS_ARMSTRONG);
                    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

                    return decryptedData;
                } catch (error) {
                    return {};
                }
            },
            putToSessionStore: function (key, object) {
                var jsonStringOfObj = JSON.stringify(object);

                // Encrypt
                var objectCipherText = CryptoJS.AES.encrypt(jsonStringOfObj, this.LOUIS_ARMSTRONG);

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
            getDateByHourMinuteString: function (timeStr) {
                var hmTimeArray = timeStr.split(':');

                var d = new Date();
                d.setHours(hmTimeArray[0]);
                d.setMinutes(hmTimeArray[1]);

                return d;
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

                return {duration: 0, unit: DURATION_UNITS[0].key};
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
                    AdmPortalMainPromiseTracker.addPromise(promise);
                else
                    promiseTracker.addPromise(promise);
            },
            dec2bin: function (dec) {
                return (dec >>> 0).toString(2);
            },
            bin2dec: function (bin) {
                return parseInt(bin, 2);
            },
            defineReportsAsH: function (url) {
                return [
                    {name: 'HOURLY', url: url, reportType: 'Hourly'}
                ];
            },
            defineReportsAsD: function (url) {
                return [
                    {name: 'DAILY', url: url, reportType: 'Daily'}
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
                var reports = this.defineReportsAsDH(url);

                reports.push({
                    name: 'MONTHLY', url: url, reportType: 'Monthly'
                });

                return reports;
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
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace('-', '+').replace('_', '/');

                return JSON.parse(atob(base64));
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
            }
        };
    });

    ApplicationServices.factory('PasswordUtilService', function ($window, $log) {
        return {
            hasLowerCase: function (str) {
                return (str ? /[a-z]/.test(str) : false);
            },
            hasUpperCase: function (str) {
                return (str ? /[A-Z]/.test(str) : false);
            },
            hasAlpha: function (str) {
                return (str ? /[a-z]/i.test(str) : false);
            },
            hasNumber: function (str) {
                return (str ? /[0-9]/.test(str) : false);
            },
            hasSymbol: function (str) {
                return (str ? /["@#$%^&+=.-_*']/.test(str) : false);
            }
            /*
            containsUserInformationStr: function (password, stringList) {
                for (var i = 0; i < stringList.length; i++) {
                    if (_.contains(password, stringList[i].toLowerCase())) {
                        return true;
                    }
                }

                return false;
            },
            checkPasswordStrength: function (userPasswordPolicyProfile, password) {
                if (userPasswordPolicyProfile.IncludeAlpha) {
                    if (!this.containsAlpha(password)) throw new Exception("Password should include letters");
                }
                if (userPasswordPolicyProfile.IncludeLowercase) {
                    if (!this.containsLowercase(password)) throw new Exception("Password should include lower case");
                }
                if (userPasswordPolicyProfile.IncludeUppercase) {
                    if (!this.containsUppercase(password)) throw new Exception("Password should include upper case");
                }
                if (userPasswordPolicyProfile.IncludeNumbers) {
                    if (!this.containsNumber(password)) throw new Exception("Password should include numbers");
                }
                if (userPasswordPolicyProfile.IncludeSymbols) {
                    if (!this.containsSymbol(password)) throw new Exception("Password should include symbols");
                }

                if (userPasswordPolicyProfile.ExcludeAlpha) {
                    if (this.containsAlpha(password)) throw new Exception("Password should not contain letters");
                }
                if (userPasswordPolicyProfile.ExcludeLowercase) {
                    if (this.containsLowercase(password)) throw new Exception("Password should not contain lower case");
                }
                if (userPasswordPolicyProfile.ExcludeUppercase) {
                    if (this.containsUppercase(password)) throw new Exception("Password should not contain upper case");
                }
                if (userPasswordPolicyProfile.ExcludeNumbers) {
                    if (this.containsNumber(password)) throw new Exception("Password should not contain numbers");
                }
                if (userPasswordPolicyProfile.ExcludeSymbols) {
                    if (this.containsSymbol(password)) throw new Exception("Password should not contain symbols");
                }
                if (userPasswordPolicyProfile.ExcludeUserInfo) {
                    if (this.containsStr(password, getUserInfoList(user))) throw new Exception("Password should not contain user info like name, surname, phone etc.");
                }
            }
            */
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
                            callback(null, null, this.status);
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
            downloadFileAndGenerateUrl: function (srcUrl, callback, bloblUrlTtl) {
                this.downloadFile(srcUrl, function (blob, fileName) {
                    var _URL = $window.URL || $window.webkitURL || $window.mozURL;
                    var url = _URL.createObjectURL(blob);

                    // Revoke the url after 3 minutes.
                    $timeout(function () {
                        // Add this url to the url revoke queue.
                        _URL.revokeObjectURL(url);
                    }, bloblUrlTtl || 3 * 60 * 1000);

                    callback(url, fileName);
                });
            }
        }
    });

    ApplicationServices.factory('ReportingExportService', function ($log, $window, $timeout, $translate, notification, FileDownloadService, UtilService) {
        return {
            showReport: function (srcUrl, formatName, overridedFileName) {
                UtilService.showDummySpinner();

                var htmlName = 'partials/report.html';
                if (formatName !== 'HTML') {
                    htmlName = 'partials/download.html';
                }

                FileDownloadService.downloadFile(srcUrl, function (blob, fileName, responseStatus) {
                    UtilService.hideDummySpinner();

                    if (responseStatus && responseStatus !== 200) {
                        notification({
                            type: 'warning',
                            text: $translate.instant('CommonMessages.FileNotFound')
                        });

                        return;
                    }

                    if (window.navigator && window.navigator.msSaveOrOpenBlob) {
                        window.navigator.msSaveOrOpenBlob(blob, overridedFileName || fileName);
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
                                        link.download = overridedFileName || fileName;
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

    ApplicationServices.service('SessionService', function ($log, $window, $http, $rootScope, $timeout, $state, UtilService, RESOURCE_NAME) {
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
            getSessionUserId: function () {
                var sessionKey = this.getSessionKey();
                var jwt = UtilService.parseJwt(sessionKey.token);
                var uid = jwt.sub.cmpfToken.uid;

                return uid;
            },
            getUsername: function () {
                var username = UtilService.getFromSessionStore(UtilService.USERNAME_KEY);

                return username;
            },
            getSessionUserRights: function () {
                var userRights = UtilService.getFromSessionStore(UtilService.USER_RIGHTS);

                return userRights;
            },
            setSessionOrganization: function (organization) {
                UtilService.putToSessionStore(UtilService.USER_ORGANIZATION_KEY, organization);
            },
            getSessionOrganization: function () {
                return UtilService.getFromSessionStore(UtilService.USER_ORGANIZATION_KEY);
            },
            getUserGroups: function () {
                var userGroups = UtilService.getFromSessionStore(UtilService.USER_GROUPS_KEY);

                return userGroups;
            },
            setResourceNameHeader: function () {
                $http.defaults.headers.common.ResourceName = RESOURCE_NAME;
            },
            setAuthorizationHeader: function (token) {
                $http.defaults.headers.common.Authorization = 'Bearer ' + token;
            },
            saveUserAttributesInSession: function (username, authenticateResponse) {
                this.setAuthorizationHeader(authenticateResponse.token);

                UtilService.putToSessionStore(UtilService.SESSION_KEY, authenticateResponse);
                UtilService.putToSessionStore(UtilService.USERNAME_KEY, username);
            },
            isSessionValid: function () {
                var sessionUserRights = this.getSessionUserRights();
                if (sessionUserRights && sessionUserRights.resourceName === RESOURCE_NAME) {
                    // Check the session key, username and user rights only to be sure there is a valid session. The portal will be
                    // used the tokens that saved in the session key to be able to go to the restful services.
                    return !_.isEmpty(this.getSessionKey()) && !_.isEmpty(this.getUsername()) && !_.isEmpty(sessionUserRights.rights);
                }

                return false;
            },
            logout: function () {
                angular.element(document.querySelector('body')).addClass('hidden');

                this.sessionInvalidate();

                $timeout(function () {
                    $window.location.href = 'app.html#!/login';
                    $window.location.reload(true);
                }, 0);
            },
            cleanValues: function () {
                UtilService.removeFromSessionStore(UtilService.SESSION_KEY);
                UtilService.removeFromSessionStore(UtilService.USERNAME_KEY);
                UtilService.removeFromSessionStore(UtilService.SITE_INFORMATION_KEY);
                UtilService.removeFromSessionStore(UtilService.SITE_CONFIGURATION_KEY);
                UtilService.removeFromSessionStore(UtilService.TASK_COUNT_KEY);
                UtilService.removeFromSessionStore(UtilService.LATEST_STATE);
                UtilService.removeFromSessionStore(UtilService.USER_RIGHTS);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_ID_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_NAME_KEY);
                UtilService.removeFromSessionStore(UtilService.SERVICE_PROVIDER_DETAILS_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_GROUPS_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ADMIN_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_BMS_ADMIN_KEY);
            },
            sessionInvalidate: function () {
                delete $http.defaults.headers.common.Authorization;

                this.cleanValues();
            }
        };
    });

    // Server Configuration and Information Services
    ApplicationServices.factory('ServerConfigurationService', function ($log, $q, ServerInformationRestangular, ServerConfigurationRestangular, UtilService, Restangular) {
        return {
            // The methods which gets data from the free zone.
            getSiteInformation: function (promiseTracker) {
                var promise = ServerInformationRestangular.one('site.json?' + UtilService.getCurrentNanoTime()).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // The methods which gets data from the forbidden zone.
            getAndUpdateServerConfiguration: function (promiseTracker) {
                var deferred = $q.defer();

                ServerConfigurationRestangular.one('server.json?' + UtilService.getCurrentNanoTime()).get().then(function (response) {
                    var serverConfiguration = Restangular.stripRestangular(response);

                    UtilService.putToSessionStore(UtilService.SITE_CONFIGURATION_KEY, serverConfiguration);

                    deferred.resolve(serverConfiguration)
                });

                UtilService.addPromiseToTracker(deferred.promise, promiseTracker);

                return deferred.promise;
            },
            getServerConfiguration: function () {
                return UtilService.getFromSessionStore(UtilService.SITE_CONFIGURATION_KEY);
            },
            cleanServerConfiguration: function () {
                UtilService.removeFromSessionStore(UtilService.SITE_CONFIGURATION_KEY);
            }
        };
    });

    // SSM Services
    ApplicationServices.factory('SSMSubscribersService', function ($log, UtilService, SSMMobilySubscribersRestangular, SSMMobilyQuerySubscribersRestangular,
                                                                   CSSMSubscriptionsContentRestangular, CSSMSubscriptionsQueryRestangular) {
        return {
            // For Subscribers and Subscriptions
            getCounts: function (promiseTracker) {
                var promise = SSMMobilyQuerySubscribersRestangular.one('/subscriptions/counts').get();

                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Subscriber Operations
            getSubscriberByMsisdn: function (msisdn) {
                var promise = SSMMobilySubscribersRestangular.one('/' + msisdn).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSubscriberBySAN: function (san) {
                var promise = SSMMobilySubscribersRestangular.one('bySan/' + san).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSubscribers: function (page, size, msisdnFilterText, contractIdFilterText, promiseTracker) {
                var uri = '/listPageable?page=' + page + '&size=' + size;
                var restangularService = SSMMobilySubscribersRestangular;

                // Sample MSISDN based filter uri
                // /subscribers/byRegex?msisdnStartsWith=96&page=0&size=4
                if (msisdnFilterText && !_.isEmpty(msisdnFilterText)) {
                    uri = '/subscribers/byRegex?msisdnStartsWith=' + msisdnFilterText + '&page=' + page + '&size=' + size;
                    restangularService = SSMMobilyQuerySubscribersRestangular;
                }

                // Sample Contract ID based filter uri
                // /subscribers/byRegex?contractIdStartsWith=cont&page=0&size=4&
                if (contractIdFilterText && !_.isEmpty(contractIdFilterText)) {
                    uri = '/subscribers/byRegex?contractIdStartsWith=' + contractIdFilterText + '&page=' + page + '&size=' + size;
                    restangularService = SSMMobilyQuerySubscribersRestangular;
                }

                var promise = restangularService.one(uri).get();

                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            createSubscriber: function (subscriber) {
                var promise = SSMMobilySubscribersRestangular.all('').post(subscriber);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubscriber: function (subscriber) {
                var promise = SSMMobilySubscribersRestangular.all('').customPUT(subscriber);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            deleteSubscriber: function (subscriber) {
                var promise = SSMMobilySubscribersRestangular.one('/' + subscriber.msisdn).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Offer subscriptions
            getOfferSubscriptions: function (page, size, sort, offerId) {
                var uri = '/subscribers/subscriptions/' + offerId + '?page=' + page + '&size=' + size;
                if (sort) {
                    uri += '&sort=' + sort
                }

                var promise = SSMMobilyQuerySubscribersRestangular.one(uri).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getOfferSubscriptionsByMsisdn: function (page, size, msisdn) {
                var uri = '/subscriptions/offers?msisdn=' + msisdn + '&page=' + page + '&size=' + size;

                var promise = SSMMobilyQuerySubscribersRestangular.one(uri).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content subscriptions
            getContentSubscriptionsByOfferId: function (page, size, offerId) {
                var uri = '/subscribers/subscriptions/' + offerId + '?pageNumber=' + page + '&pageSize=' + size;

                var promise = CSSMSubscriptionsQueryRestangular.one(uri).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentSubscriptionsByMsisdn: function (msisdn) {
                var uri = msisdn + '?withSubscription=true';

                var promise = CSSMSubscriptionsContentRestangular.one(uri).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

    // CMFP Services
    ApplicationServices.factory('CMPFService', function ($log, $q, $filter, notification, $translate, UtilService, DateTimeConstants, CMPFAuthRestangular,
                                                         SessionService, CMPFRestangular, DEFAULT_REST_QUERY_LIMIT, BATCH_SIZE) {
        return {
            DEFAULT_ORGANIZATION_NAME: "Mobily",
            DEFAULT_RBT_ORGANIZATION_NAME: "MobilyRBT",
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
            DEFAULT_SETTLEMENT_GL_CODES_ORGANIZATION_NAME: "Mobily Settlement GL Codes",
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
            ORGANIZATION_PROVIDER_CLIENT_PROFILE: 'ProviderClientProfile',
            BULK_ORGANIZATION_PROFILE: 'BulkOrganizationProfile',
            MSISDN_PREFIX_PROFILE: 'MSISDNPrefixProfile',
            // Service provider related profiles
            SERVICE_PROVIDER_PROFILE: 'ServiceProviderProfile',
            SERVICE_PROVIDER_I18N_PROFILE: 'Provideri18nProfile',
            SERVICE_PROVIDER_CONTACTS_PROFILE: 'ProviderContactsProfile',
            SERVICE_PROVIDER_AUTH_PROFILE: 'ProviderAuthProfile',
            SERVICE_PROVIDER_REGISTRATION_PROFILE: 'ProviderRegistrationProfile',
            SERVICE_PROVIDER_BANK_ACCOUNT_PROFILE: 'ProviderBankAccountProfile',
            SERVICE_PROVIDER_BUSINESS_TYPE_PROFILE: 'ProviderBusinessTypeProfile',
            SERVICE_PROVIDER_SETTLEMENT_TYPE_PROFILE: 'ProviderSettlementTypeProfile',
            SERVICE_PROVIDER_LEGAL_DOCS_PROFILE: 'ProviderLegalDocsProfile',
            SERVICE_PROVIDER_SETTLEMENT_GL_CODES_PROFILE: "SettlementGLCodesProfile",
            SERVICE_PROVIDER_LEGACY_ID_PROFILE: "ProviderLegacyIDProfile",
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
            // Profile definition or orphan profile names
            SERVICE_UI_CATEGORIES_PROFILE: "ServiceUICategories",
            SERVICE_REPORTING_CATEGORIES_PROFILE: "ServiceReportingCategories",
            OFFER_CATEGORIES_PROFILE: "OfferCategories",
            PACKAGE_LIST_PROFILE: "PackageListProfile",
            // User related profiles and definitions
            USER_PROFILE_NAME: 'UserProfile',
            USER_REPORT_TEMPLATE_PROFILE: 'UserReportTemplateProfile',
            RELATED_RESOURCES: ['DSP Admin Portal', 'DSP Partner Portal', 'DSP Customer Care Portal'],
            CUSTOMER_CARE_PORTAL_RESOURCE: 'DSP Customer Care Portal',
            BULK_USER_PROFILE: 'BulkUserProfile',
            BULK_USER_POLICY_PROFILE: 'BulkUserPolicyProfile',
            BULK_SMS_POLICY_PROFILE: 'BulkSMSPolicyProfile',
            BULK_MMS_POLICY_PROFILE: 'BulkMMSPolicyProfile',
            BULK_IVR_POLICY_PROFILE: 'BulkIVRPolicyProfile',
            // User Group related profiles and definitions
            GROUP_PROFILE_NAME: 'GroupProfile',
            // Generic profile names
            ENTITY_AUDIT_PROFILE: 'EntityAuditProfile',
            // Predefined group and user names
            DSP_ADMIN_GROUP: 'DSP Admin',
            DSP_BUSINESS_ADMIN_GROUP: 'DSP Business Admin',
            DSP_MARKETING_ADMIN_GROUP: 'DSP Marketing Admin',
            DSP_IT_ADMIN_GROUP: 'DSP IT Admin',
            DSP_BMS_ADMIN_GROUP: 'DSP Admin', // It is same with the other admin group because of we no need any other group for administrational operations.
            ERROR_CODES: {
                DUPLICATE_USER_NAME: 5025801
            },
            // Methods
            prepareProfileListValuesJSON: function (array) {
                var objArray = [];
                _.each(array, function (value) {
                    objArray.push({value: (_.isObject(value) ? String(value.value) : value)});
                });

                return objArray;
            },
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
            refreshToken: function (refreshToken) {
                var refreshTokenProm = CMPFAuthRestangular.all('refresh-token').customGET(null, null, {
                    Authorization: 'Bearer ' + refreshToken
                });
                UtilService.addPromiseToTracker(refreshTokenProm);
                return refreshTokenProm;
            },
            // Profile operations
            getProfile: function (id, withchildren) {
                var url = 'profiles/' + id + '?withchildren=' + (withchildren ? withchildren : false);

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            updateProfile: function (profile) {
                var prom = CMPFRestangular.all('profiles/' + profile.profileId).customPUT(profile);

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            // All Organizations without specifying type
            getAllOrganizations: function (withchildren, withprofiles, resultProfileDefNames) {
                var _self = this;
                var mainDeferred = $q.defer();
                var deferred = $q.defer();

                _self.getOrganizations(0, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getOrganizations(offset, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.organizations = firstResponse.organizations.concat(totalResponse.organizations);
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

                // Listen the inner promise and prepare the main deferred response.
                deferred.promise.then(function (response) {
                    var filteredOrganizations = _.filter(response.organizations, function (organization) {
                        // OperatorProfile
                        var operatorProfiles = _self.getProfileAttributes(organization.profiles, _self.OPERATOR_PROFILE);
                        if (operatorProfiles.length > 0) {
                            return !operatorProfiles[0].IsInternal;
                        }

                        return true;
                    });

                    mainDeferred.resolve({
                        metaData: {
                            limit: response.metaData.limit,
                            offset: response.metaData.offset,
                            totalCount: filteredOrganizations.length
                        },
                        organizations: filteredOrganizations
                    });
                }, function (response) {
                    mainDeferred.reject(response);
                });

                UtilService.addPromiseToTracker(mainDeferred.promise);

                return mainDeferred.promise;
            },
            getOrganizations: function (offset, limit, withchildren, withprofiles, resultProfileDefNames, promiseTracker) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                return prom;
            },
            getAllOrganizationsByName: function (offset, limit, name, promiseTracker) {
                var url = 'organizations?withprofiles=true&offset=' + offset + '&limit=' + limit + '&name=%25' + name + '%25';

                var promise = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAllOrganizationsByExactName: function (offset, limit, name, promiseTracker) {
                var url = 'organizations?withprofiles=true&offset=' + offset + '&limit=' + limit + '&name=' + name;

                var promise = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

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
            getOrganizationFile: function (organizationId) {
                var prom = CMPFRestangular.one('organizations/' + organizationId + '/file').get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            deleteOrganizationFile: function (organizationId, organizationFileId) {
                var prom = CMPFRestangular.one('organizations/' + organizationId + '/file/' + organizationFileId).remove();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getOrganizationByShortCode: function (shortCode) {
                var url = 'organizations?offset=0&limit=1&profileDefName=ShortCodeProfile&ShortCode=' + shortCode;

                var promise = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createOrganizationProfile: function (organizationId, profile) {
                var prom = CMPFRestangular.all('organizations/' + organizationId + '/profile').post(profile);

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            deleteOrganizationProfile: function (organizationId, profile) {
                var prom = CMPFRestangular.one('organizations/' + organizationId + '/profile/' + profile.profileId).remove();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            // Only Network Operators
            getAllOperators: function (withchildren, withprofiles, resultProfileDefNames) {
                var _self = this;
                var mainDeferred = $q.defer();
                var deferred = $q.defer();

                _self.getOperators(0, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getOperators(offset, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.networkOperators = firstResponse.networkOperators.concat(totalResponse.networkOperators);
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

                // Listen the inner promise and prepare the main deferred response.
                deferred.promise.then(function (response) {
                    var filteredOrganizations = _.filter(response.networkOperators, function (organization) {
                        // OperatorProfile
                        var operatorProfiles = _self.getProfileAttributes(organization.profiles, _self.OPERATOR_PROFILE);
                        if (operatorProfiles.length > 0) {
                            return !operatorProfiles[0].IsInternal;
                        }

                        return true;
                    });

                    mainDeferred.resolve({
                        metaData: {
                            limit: response.metaData.limit,
                            offset: response.metaData.offset,
                            totalCount: filteredOrganizations.length
                        },
                        networkOperators: filteredOrganizations
                    });
                }, function (response) {
                    mainDeferred.reject(response);
                });

                UtilService.addPromiseToTracker(mainDeferred.promise);

                return mainDeferred.promise;
            },
            getOperators: function (offset, limit, withchildren, withprofiles, resultProfileDefNames, promiseTracker) {
                var url = 'networkoperators?offset=' + offset + '&limit=' + limit + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                return prom;
            },
            getAllOperatorsAndPartners: function (withchildren, withprofiles, resultProfileDefNames) {
                var _self = this;
                var mainDeferred = $q.defer();
                var deferred = $q.defer();

                _self.getOperatorsAndPartners(0, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getOperatorsAndPartners(offset, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.organizations = firstResponse.organizations.concat(totalResponse.organizations);
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

                // Listen the inner promise and prepare the main deferred response.
                deferred.promise.then(function (response) {
                    var filteredOrganizations = _.filter(response.organizations, function (organization) {
                        // OperatorProfile
                        var operatorProfiles = _self.getProfileAttributes(organization.profiles, _self.OPERATOR_PROFILE);
                        if (operatorProfiles.length > 0) {
                            return !operatorProfiles[0].IsInternal;
                        }

                        return true;
                    });

                    mainDeferred.resolve({
                        metaData: {
                            limit: response.metaData.limit,
                            offset: response.metaData.offset,
                            totalCount: filteredOrganizations.length
                        },
                        organizations: filteredOrganizations
                    });
                }, function (response) {
                    mainDeferred.reject(response);
                });

                UtilService.addPromiseToTracker(mainDeferred.promise);

                return mainDeferred.promise;
            },
            getOperatorsAndPartners: function (offset, limit, withchildren, withprofiles, resultProfileDefNames, promiseTracker) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&type=NetworkOperator,Partner' + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getOperator: function (id, withProfile) {
                var url = 'networkoperators/' + id;
                if (withProfile) {
                    url += '?withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            // Partners of Network Operators
            getPartnersOfOrganization: function (id, offset, limit) {
                var prom = CMPFRestangular.one('networkoperators/' + id + '/partners?offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createOperator: function (newOperator) {
                var createOperatorProm = CMPFRestangular.all('networkoperators').post(newOperator);
                UtilService.addPromiseToTracker(createOperatorProm);
                return createOperatorProm;
            },
            updateOperator: function (operator) {
                var prom = CMPFRestangular.all('networkoperators/' + operator.id).customPUT(operator);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteOperator: function (operator) {
                var deleteOperatorProm = CMPFRestangular.one('networkoperators/' + operator.id).remove();
                UtilService.addPromiseToTracker(deleteOperatorProm);
                return deleteOperatorProm;
            },
            // Services
            getAllServicesByOrganizationId: function (organizationId, withchildren, withprofiles, state, resultProfileDefNames) {
                var _self = this;
                var deferred = $q.defer();

                _self.getServicesByOrganizationId(0, BATCH_SIZE, organizationId, withchildren, withprofiles, state, resultProfileDefNames).then(function (firstResponse) {

                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getServicesByOrganizationId(offset, BATCH_SIZE, organizationId, withchildren, withprofiles, state, resultProfileDefNames));
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

                UtilService.addPromiseToTracker(deferred.promise);

                return deferred.promise;
            },
            getServicesByOrganizationId: function (offset, limit, organizationId, withchildren, withprofiles, state, resultProfileDefNames) {
                var url = 'services?offset=' + offset + '&limit=' + limit + '&organizationId=' + organizationId + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);
                if (state) {
                    url += '&state=' + state;
                }

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            // Partners
            getAllPartners: function (withchildren, withprofiles, resultProfileDefNames) {
                var _self = this;
                var deferred = $q.defer();

                _self.getPartners(0, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getPartners(offset, BATCH_SIZE, withchildren, withprofiles, resultProfileDefNames));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.partners = firstResponse.partners.concat(totalResponse.partners);
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

                UtilService.addPromiseToTracker(deferred.promise);

                return deferred.promise;
            },
            getPartners: function (offset, limit, withchildren, withprofiles, resultProfileDefNames, promiseTracker) {
                var url = 'partners?offset=' + offset + '&limit=' + limit + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getPartner: function (id) {
                var prom = CMPFRestangular.one('partners/' + id + '?withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            /*
            getServicesOfPartner: function (id, offset, limit, withchildren, withprofiles, state, resultProfileDefNames) {
                var url = 'partners/' + id + '/services?offset=' + offset + '&limit=' + limit + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);
                if (state) {
                    url += '&state=' + state;
                }

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            */
            createPartner: function (newPartner) {
                var createPartnerProm = CMPFRestangular.all('partners').post(newPartner);
                UtilService.addPromiseToTracker(createPartnerProm);
                return createPartnerProm;
            },
            deletePartner: function (partner) {
                var deletePartnerProm = CMPFRestangular.one('partners/' + partner.id).remove();
                UtilService.addPromiseToTracker(deletePartnerProm);
                return deletePartnerProm;
            },
            updatePartner: function (partner) {
                var prom = CMPFRestangular.all('partners/' + partner.id).customPUT(partner);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // User accounts
            getUserAccounts: function (offset, limit, withchildren, withprofiles) {
                var url = 'useraccounts?offset=' + offset + '&limit=' + limit +
                    '&withchildren=' + (withchildren ? withchildren : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false);

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getUserAccountsByOrganizationId: function (offset, limit, withchildren, withprofiles, organizationId) {
                var url = 'useraccounts?offset=' + offset + '&limit=' + limit + '&organizationId=' + organizationId +
                    '&withchildren=' + (withchildren ? withchildren : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false);

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getUserAccount: function (id, withprofiles) {
                var url = 'useraccounts/' + id + '?withchildren=true&withprofiles=' + (withprofiles ? withprofiles : false);

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserAccountGroups: function (id, offset, limit) {
                var prom = CMPFRestangular.one('useraccounts/' + id + '/usergroups?withchildren=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
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
            },
            updateUserAccount: function (account) {
                var prom = CMPFRestangular.all('useraccounts/' + account.id).customPUT(account);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createUserAccount: function (newItem) {
                var prom = CMPFRestangular.all('useraccounts').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteUserAccount: function (account) {
                var prom = CMPFRestangular.one('useraccounts/' + account.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getResources: function (offset, limit) {
                var _self = this;
                var deferred = $q.defer()

                UtilService.addPromiseToTracker(deferred.promise);

                CMPFRestangular.one('resources?withchildren=true&offset=' + offset + '&limit=' + limit).get().then(function (response) {
                    if (response && response.resources) {
                        response.resources = _.filter(response.resources, function (resource) {
                            return _.contains(_self.RELATED_RESOURCES, resource.name);
                        });
                    }

                    deferred.resolve(response);
                }, function (response) {
                    deferred.reject(response);
                });

                return deferred.promise;
            },
            // User groups
            getUserGroups: function (offset, limit, withchildren, withprofiles) {
                var url = 'usergroups?offset=' + offset + '&limit=' + limit +
                    '&withchildren=' + (withchildren ? withchildren : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false);

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserGroupByName: function (name) {
                var prom = CMPFRestangular.one('usergroups?name=' + name).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserGroup: function (id) {
                var prom = CMPFRestangular.one('usergroups/' + id + '?withprofiles=true&withchildren=false').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            updateUserGroup: function (group) {
                var prom = CMPFRestangular.all('usergroups/' + group.id).customPUT(group);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createUserGroup: function (newItem) {
                var prom = CMPFRestangular.all('usergroups').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteUserGroup: function (group) {
                var prom = CMPFRestangular.one('usergroups/' + group.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addNewAccountsToUserGroup: function (group, userAccounts) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/useraccounts').customPUT(userAccounts);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeAccountFromUserGroup: function (group, userAccount) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/useraccounts/' + userAccount.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserGroupMembers: function (groupId, offset, limit) {
                var prom = CMPFRestangular.one('usergroups/' + groupId + '/useraccounts?withchildren=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addPermissionsToUserGroup: function (group, permissions) {
                var prom = CMPFRestangular.all('usergroups/' + group.id + '/permissions').post(permissions);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeResourcePermissionFromUserGroup: function (group, resourceId) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/permissions/resources/' + resourceId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeOperationPermissionFromUserGroup: function (group, resourceId, operationId) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/permissions/resources/' + resourceId + '/operations/' + operationId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserGroupPermissions: function (groupId) {
                var prom = CMPFRestangular.one('usergroups/' + groupId + '/permissions?limit=200').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getUserGroupConstraints: function (groupId) {
                var prom = CMPFRestangular.one('usergroups/' + groupId + '/constraints?limit=200').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addConstraintsToUserGroup: function (group, constraints) {
                var prom = CMPFRestangular.all('usergroups/' + group.id + '/constraints').post(constraints);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeResourceConstraintFromUserGroup: function (group, resourceId) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/constraints/resources/' + resourceId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeOperationConstraintFromUserGroup: function (group, resourceId, operationId) {
                var prom = CMPFRestangular.one('usergroups/' + group.id + '/constraints/resources/' + resourceId + '/operations/' + operationId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // User roles
            getRoles: function (offset, limit) {
                var prom = CMPFRestangular.one('roles?withchildren=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getRole: function (id) {
                var prom = CMPFRestangular.one('roles/' + id).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            updateRole: function (role) {
                var prom = CMPFRestangular.all('roles/' + role.id).customPUT(role);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createRole: function (newItem) {
                var prom = CMPFRestangular.all('roles').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteRole: function (role) {
                var prom = CMPFRestangular.one('roles/' + role.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addNewAccountsToRole: function (role, userAccounts) {
                var prom = CMPFRestangular.one('roles/' + role.id + '/useraccounts').customPUT(userAccounts);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeAccountFromRole: function (role, userAccount) {
                var prom = CMPFRestangular.one('roles/' + role.id + '/useraccounts/' + userAccount.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getRoleMembers: function (roleId, offset, limit) {
                var prom = CMPFRestangular.one('roles/' + roleId + '/useraccounts?withchildren=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addPermissionsToRole: function (role, permissions) {
                var prom = CMPFRestangular.all('roles/' + role.id + '/permissions').post(permissions);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeResourcePermissionFromRole: function (role, resourceId) {
                var prom = CMPFRestangular.one('roles/' + role.id + '/permissions/resources/' + resourceId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeOperationPermissionFromRole: function (role, resourceId, operationId) {
                var prom = CMPFRestangular.one('roles/' + role.id + '/permissions/resources/' + resourceId + '/operations/' + operationId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getRolePermissions: function (roleId) {
                var prom = CMPFRestangular.one('roles/' + roleId + '/permissions?limit=200').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getRoleConstraints: function (roleId) {
                var prom = CMPFRestangular.one('roles/' + roleId + '/constraints?limit=200').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addConstraintsToRole: function (role, constraints) {
                var prom = CMPFRestangular.all('roles/' + role.id + '/constraints').post(constraints);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeResourceConstraintFromRole: function (role, resourceId) {
                var prom = CMPFRestangular.one('roles/' + role.id + '/constraints/resources/' + resourceId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeOperationConstraintFromRole: function (role, resourceId, operationId) {
                var prom = CMPFRestangular.one('roles/' + role.id + '/constraints/resources/' + resourceId + '/operations/' + operationId).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // Services
            getAllServices: function (withchildren, withprofiles, state, resultProfileDefNames, promiseTracker) {
                var _self = this;
                var deferred = $q.defer();

                _self.getServices(0, BATCH_SIZE, withchildren, withprofiles, state, resultProfileDefNames, promiseTracker).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getServices(offset, BATCH_SIZE, withchildren, withprofiles, state, resultProfileDefNames, promiseTracker));
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
            getServices: function (offset, limit, withchildren, withprofiles, state, resultProfileDefNames, promiseTracker) {
                var url = 'services?offset=' + offset + '&limit=' + limit +
                    '&withchildren=' + (withchildren ? withchildren : false) +
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
            getServiceByProfileDefValue: function (offset, limit, withchildren, withprofiles, profileDefName, profileDefAttrfName, profileDefAttrValue) {
                var url = 'services?offset=' + offset + '&limit=' + limit +
                    '&withchildren=' + (withchildren ? withchildren : false) +
                    '&withchildren=' + (withchildren ? withchildren : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false) +
                    '&profileDefName=' + profileDefName + '&' + profileDefAttrfName + '=' + profileDefAttrValue

                var promise = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getDOBServices: function (offset, limit, withchildren, withprofiles) {
                var url = 'services?serviceType=DOB_%25&offset=' + offset + '&limit=' + limit + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getService: function (id) {
                var prom = CMPFRestangular.one('services/' + id + '?withchildren=true&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getServiceByName: function (name, promiseTracker) {
                var prom = CMPFRestangular.one('services?name=' + name).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getServicesOfPartner: function (id, offset, limit, withchildren, withprofiles, resultProfileDefNames) {
                var url = 'partners/' + id + '/services?offset=' + offset + '&limit=' + limit + '&withchildren=' + withchildren + '&withprofiles=' + withprofiles;

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getServiceByNameWithProfiles: function (name) {
                var prom = CMPFRestangular.one('services?name=' + name + '&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getServiceSubscriptionsSummary: function (id, offset, limit, msisdn, promiseTracker, doNotShowIndicator) {
                var url = 'services/' + id + '/subscriptions/summary?offset=' + offset + '&limit=' + limit;
                if (msisdn) {
                    url += '&msisdn=%25' + msisdn + '%25';
                }

                var prom = CMPFRestangular.one(url).get();

                if (!doNotShowIndicator) {
                    UtilService.addPromiseToTracker(prom, promiseTracker);
                }

                return prom;
            },
            getServiceSubscriptionsByParameters: function (id, offset, limit, queryParams, promiseTracker) {
                var prom = CMPFRestangular.one('services/' + id + '/subscriptions?withchildren=true&withchildrenprofiles=true&withprofiles=true&offset=' + offset + '&limit=' + limit + '&' + queryParams).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getSubscribableServicesByOrganizationId: function (offset, limit, organizationId, withchildren, withprofiles, state) {
                var _self = this;

                var url = 'services?offset=' + offset + '&limit=' + limit + '&organizationId=' + organizationId + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);
                if (state) {
                    url += '&state=' + state;
                }

                var prom = CMPFRestangular.one(url).get();

                var deferred = $q.defer();

                prom.then(function (response) {
                    var filteredServices = _.filter(response.services, function (service) {
                        // ServiceProfile
                        var serviceProfiles = _self.getProfileAttributes(service.profiles, _self.SERVICE_PROFILE);
                        if (serviceProfiles.length > 0) {
                            return serviceProfiles[0].serviceType === 'NORMAL_SUBSCRIPTION' || serviceProfiles[0].serviceType === 'SPECIAL_SUBSCRIPTION' || serviceProfiles[0].serviceType === 'DOB_SUBSCRIPTION';
                        }

                        return false;
                    });

                    deferred.resolve(filteredServices);
                });

                UtilService.addPromiseToTracker(deferred.promise);

                return deferred.promise;
            },
            getServicesSubscriptions: function (state, promiseTracker) {
                var url = 'services/subscriptions';
                if (state && (state === 'ACTIVE' || state === 'INACTIVE' || state === 'SUSPENDED')) {
                    url += '?state=' + state;
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getServicesSubscriptionStats: function (promiseTracker) {
                var prom = CMPFRestangular.one('services/subscriptions').get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            updateService: function (entry) {
                var prom = CMPFRestangular.one('services/' + entry.id).customPUT(entry);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createService: function (newItem) {
                var prom = CMPFRestangular.all('services').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteService: function (item) {
                var prom = CMPFRestangular.one('services/' + item.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // Offers
            getAllOffers: function (withchildren, withorganization, withprofiles, resultProfileDefNames, promiseTracker) {
                var _self = this;
                var deferred = $q.defer();

                _self.getOffers(0, BATCH_SIZE, withchildren, withorganization, withprofiles, resultProfileDefNames, promiseTracker).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getOffers(offset, BATCH_SIZE, withchildren, withorganization, withprofiles, resultProfileDefNames, promiseTracker));
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
            getOffers: function (offset, limit, withchildren, withorganization, withprofiles, resultProfileDefNames, promiseTracker) {
                var url = 'offers?offset=' + offset + '&limit=' + limit +
                    '&withchildren=' + (withchildren ? withchildren : false) +
                    '&withorganization=' + (withorganization ? withorganization : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false);

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getOffersByServiceName: function (offset, limit, serviceName) {
                var prom = CMPFRestangular.one('offers?withchildren=true&offset=' + offset + '&limit=' + limit + '&serviceName=' + serviceName).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getOffersOfPartner: function (id, offset, limit, withchildren, withprofiles, resultProfileDefNames) {
                var url = 'offers?offset=' + offset + '&limit=' + limit + '&organizationId=' + id + '&withchildren=' + withchildren + '&withprofiles=' + withprofiles;

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getAllOffersByOrganizationId: function (organizationId, withchildren, withorganization, withprofiles, state, resultProfileDefNames) {
                var _self = this;
                var deferred = $q.defer();

                _self.getOffersByOrganizationId(0, BATCH_SIZE, organizationId, withchildren, withorganization, withprofiles, state, resultProfileDefNames).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getOffersByOrganizationId(offset, BATCH_SIZE, organizationId, withchildren, withorganization, withprofiles, state, resultProfileDefNames));
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

                UtilService.addPromiseToTracker(deferred.promise);

                return deferred.promise;

            },
            getOffersByOrganizationId: function (offset, limit, organizationId, withchildren, withorganization, withprofiles, state, resultProfileDefNames) {
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

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getOffer: function (id, withchildren, withprofiles) {
                var url = 'offers/' + id +
                    '?withchildren=' + (withchildren ? withchildren : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false);

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getOfferTemplateByName: function (templateName) {
                var prom = CMPFRestangular.one('offertemplates?withprofiles=true&name=' + templateName).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getOfferSubscriptionsSummary: function (id, offset, limit, msisdn, promiseTracker, doNotShowIndicator) {
                var url = 'offers/' + id + '/subscriptions/summary?offset=' + offset + '&limit=' + limit;
                if (msisdn) {
                    url += '&msisdn=%25' + msisdn + '%25';
                }

                var prom = CMPFRestangular.one(url).get();

                if (!doNotShowIndicator) {
                    UtilService.addPromiseToTracker(prom, promiseTracker);
                }

                return prom;
            },
            getOffersSubscriptions: function (state, promiseTracker) {
                var url = 'offers/subscriptions';
                if (state && (state === 'ACTIVE' || state === 'INACTIVE' || state === 'SUSPENDED')) {
                    url += '?state=' + state;
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            updateOffer: function (entry) {
                var prom = CMPFRestangular.all('offers/' + entry.id).customPUT(entry);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createOffer: function (newItem) {
                var prom = CMPFRestangular.all('offers').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteOffer: function (item) {
                var prom = CMPFRestangular.one('offers/' + item.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            addServicesToOffer: function (id, services) {
                var prom = CMPFRestangular.all('offers/' + id + '/services').customPUT(services);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            removeServicesFromOffer: function (id, service) {
                var prom = CMPFRestangular.one('offers/' + id + '/services/' + service.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // Subscribers
            getSubscribers: function (offset, limit, promiseTracker) {
                var url = 'subscribers?withchildren=false&withprofiles=false&offset=' + offset + '&limit=' + limit;

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getSubscriberByMsisdn: function (msisdn) {
                var prom = CMPFRestangular.one('subscribers?withchildren=false&withprofiles=false&msisdn=' + msisdn).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getSubscriberServiceSubscriptions: function (id, offset, limit) {
                var prom = CMPFRestangular.one('subscribers/' + id + '/servicesubscriptions?withchildren=true&withprofiles=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getSubscriberOfferSubscriptions: function (id, offset, limit) {
                var prom = CMPFRestangular.one('subscribers/' + id + '/offersubscriptions?withchildren=true&withprofiles=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // Profile operations
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
            getChannels: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_CHANNEL_PROFILE);
            },
            getClients: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_PROVIDER_CLIENT_PROFILE);
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
            // Bulk Messaging Related methods
            getBulkOrganizationProfile: function (provider) {
                return this.findProfileByName(provider.profiles, this.BULK_ORGANIZATION_PROFILE);
            },
            extractBulkOrganizationProfile: function (provider) {
                var bulkOrganizationProfileDef = this.getBulkOrganizationProfile(provider);

                if (!_.isEmpty(bulkOrganizationProfileDef) && !_.isUndefined(bulkOrganizationProfileDef)) {
                    var contactPersonAttr = _.findWhere(bulkOrganizationProfileDef.attributes, {name: "ContactPerson"});
                    var phoneAttr = _.findWhere(bulkOrganizationProfileDef.attributes, {name: "Phone"});
                    var addressAttr = _.findWhere(bulkOrganizationProfileDef.attributes, {name: "Address"});
                    var faxAttr = _.findWhere(bulkOrganizationProfileDef.attributes, {name: "Fax"});
                    var emailAttr = _.findWhere(bulkOrganizationProfileDef.attributes, {name: "Email"});
                    var webSiteAttr = _.findWhere(bulkOrganizationProfileDef.attributes, {name: "WebSite"});

                    return {
                        ContactPerson: (contactPersonAttr ? contactPersonAttr.value : ''),
                        Phone: (phoneAttr ? phoneAttr.value : ''),
                        Address: (addressAttr ? addressAttr.value : ''),
                        Fax: (faxAttr ? faxAttr.value : ''),
                        Email: (emailAttr ? emailAttr.value : ''),
                        WebSite: (webSiteAttr ? webSiteAttr.value : '')
                    };
                } else {
                    return {};
                }
            },
            getMSISDNPrefixListProfile: function (provider) {
                return this.findProfileByName(provider.profiles, this.MSISDN_PREFIX_PROFILE);
            },
            extractMSISDNPrefixListProfile: function (provider) {
                var msisdnPrefixListProfileDef = this.getMSISDNPrefixListProfile(provider);

                if (!_.isEmpty(msisdnPrefixListProfileDef) && !_.isUndefined(msisdnPrefixListProfileDef)) {
                    var MSISDNPrefixListAttr = _.findWhere(msisdnPrefixListProfileDef.attributes, {name: "PrefixList"});

                    return {
                        MSISDNPrefixList: (MSISDNPrefixListAttr ? MSISDNPrefixListAttr.listValues : [])
                    };
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
                    var isBulkIvrUserAttr = _.findWhere(bulkUserProfileDef.attributes, {name: "isBulkIvrUser"});
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
                        isBulkIvrUser: (isBulkIvrUserAttr && isBulkIvrUserAttr.value === 'true' ? true : false),
                        LastLoginAdminPortal: (lastLoginAdminPortalAttr ? lastLoginAdminPortalAttr.value : '1970-01-01T00:00:00Z'),
                        LastLoginCustomerCarePortal: (lastLoginCustomerCarePortalAttr ? lastLoginCustomerCarePortalAttr.value : '1970-01-01T00:00:00Z')
                    };
                } else {
                    return {};
                }
            },
            getBulkUserPolicyProfile: function (userAccount) {
                return this.findProfileByName(userAccount.profiles, this.BULK_USER_POLICY_PROFILE);
            },
            extractBulkUserPolicyProfile: function (userAccount) {
                var bulkUserPolicyProfileDef = this.getBulkUserPolicyProfile(userAccount);

                if (!_.isEmpty(bulkUserPolicyProfileDef) && !_.isUndefined(bulkUserPolicyProfileDef)) {
                    var isModeratedAttr = _.findWhere(bulkUserPolicyProfileDef.attributes, {name: "isModerated"});
                    var isApiAccessAllowedAttr = _.findWhere(bulkUserPolicyProfileDef.attributes, {name: "isApiAccessAllowed"});
                    var isIpAddressListRestrictedAttr = _.findWhere(bulkUserPolicyProfileDef.attributes, {name: "isIpAddressListRestricted"});
                    var permissibleIpAddressesAttr = _.findWhere(bulkUserPolicyProfileDef.attributes, {name: "PermissibleIpAddresses"});
                    var isTimeConstraintEnforcedAttr = _.findWhere(bulkUserPolicyProfileDef.attributes, {name: "isTimeConstraintEnforced"});
                    var timeConstraintsAttr = _.findWhere(bulkUserPolicyProfileDef.attributes, {name: "TimeConstraints"});
                    return {
                        isModerated: (isModeratedAttr && isModeratedAttr.value === 'true' ? true : false),
                        isApiAccessAllowed: (isApiAccessAllowedAttr && isApiAccessAllowedAttr.value === 'true' ? true : false),
                        isIpAddressListRestricted: (isIpAddressListRestrictedAttr && isIpAddressListRestrictedAttr.value === 'true' ? true : false),
                        PermissibleIpAddresses: (permissibleIpAddressesAttr ? permissibleIpAddressesAttr.listValues : []),
                        isTimeConstraintEnforced: (isTimeConstraintEnforcedAttr && isTimeConstraintEnforcedAttr.value === 'true' ? true : false),
                        TimeConstraints: (timeConstraintsAttr ? timeConstraintsAttr.listValues : [])
                    };
                } else {
                    return {};
                }
            },
            getBulkSMSPolicyProfile: function (userAccount) {
                return this.findProfileByName(userAccount.profiles, this.BULK_SMS_POLICY_PROFILE);
            },
            extractBulkSMSPolicyProfile: function (userAccount) {
                var bulkPolicyProfileDef = this.getBulkSMSPolicyProfile(userAccount);

                if (!_.isEmpty(bulkPolicyProfileDef) && !_.isUndefined(bulkPolicyProfileDef)) {
                    var senderMsisdnAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "SenderMsisdn"});
                    var isAlphanumericSenderListRestrictedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isAlphanumericSenderListRestricted"});
                    var permissibleAlphanumericSendersAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "PermissibleAlphanumericSenders"});
                    var isOffnetSenderListRestrictedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isOffnetSenderListRestricted"});
                    var permissibleOffnetSendersAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "PermissibleOffnetSenders"});
                    var isOffNetDeliveryAllowedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isOffNetDeliveryAllowed"});
                    var isDisableChargingAllowedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isDisableChargingAllowed"});
                    var isQuotaLimitedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isQuotaLimited"});
                    var availableQuotaAmountAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "AvailableQuotaAmount"});
                    var quotaStartDateAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "QuotaStartDate"});
                    var quotaExpiryDateAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "QuotaExpiryDate"});
                    var isQuotaRefundedUponDeliveryFailureAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isQuotaRefundedUponDeliveryFailure"});
                    var isThroughputLimitedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isThroughputLimited"});
                    var throughputLimitAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "ThroughputLimit"});
                    return {
                        SenderMsisdn: (senderMsisdnAttr ? senderMsisdnAttr.value : ''),
                        isAlphanumericSenderListRestricted: (isAlphanumericSenderListRestrictedAttr && isAlphanumericSenderListRestrictedAttr.value === 'true' ? true : false),
                        PermissibleAlphanumericSenders: (permissibleAlphanumericSendersAttr ? permissibleAlphanumericSendersAttr.listValues : []),
                        isOffNetDeliveryAllowed: (isOffNetDeliveryAllowedAttr && isOffNetDeliveryAllowedAttr.value === 'true' ? true : false),
                        isOffnetSenderListRestricted: (isOffnetSenderListRestrictedAttr && isOffnetSenderListRestrictedAttr.value === 'true' ? true : false),
                        PermissibleOffnetSenders: (permissibleOffnetSendersAttr ? permissibleOffnetSendersAttr.listValues : []),
                        isDisableChargingAllowed: (isDisableChargingAllowedAttr && isDisableChargingAllowedAttr.value === 'true' ? true : false),
                        isQuotaLimited: (isQuotaLimitedAttr && isQuotaLimitedAttr.value === 'true' ? true : false),
                        AvailableQuotaAmount: (availableQuotaAmountAttr ? Number(availableQuotaAmountAttr.value) : 0),
                        QuotaStartDate: (quotaStartDateAttr && quotaStartDateAttr.value ? moment(moment(quotaStartDateAttr.value + DateTimeConstants.OFFSET)).toDate() : null),
                        QuotaExpiryDate: (quotaExpiryDateAttr && quotaExpiryDateAttr.value ? moment(moment(quotaExpiryDateAttr.value + DateTimeConstants.OFFSET)).toDate() : null),
                        isQuotaRefundedUponDeliveryFailure: (isQuotaRefundedUponDeliveryFailureAttr && isQuotaRefundedUponDeliveryFailureAttr.value === 'true' ? true : false),
                        isThroughputLimited: (isThroughputLimitedAttr && isThroughputLimitedAttr.value === 'true' ? true : false),
                        ThroughputLimit: (throughputLimitAttr ? Number(throughputLimitAttr.value) : 0)
                    };
                } else {
                    return {};
                }
            },
            getBulkMMSPolicyProfile: function (userAccount) {
                return this.findProfileByName(userAccount.profiles, this.BULK_MMS_POLICY_PROFILE);
            },
            extractBulkMMSPolicyProfile: function (userAccount) {
                var bulkPolicyProfileDef = this.getBulkMMSPolicyProfile(userAccount);

                if (!_.isEmpty(bulkPolicyProfileDef) && !_.isUndefined(bulkPolicyProfileDef)) {
                    var chargingMsisdnAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "ChargingMsisdn"});
                    var isAlphanumericSenderListRestrictedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isAlphanumericSenderListRestricted"});
                    var permissibleAlphanumericSendersAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "PermissibleAlphanumericSenders"});
                    var isOffNetDeliveryAllowedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isOffNetDeliveryAllowed"});
                    var isForwardTrackingAllowedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isForwardTrackingAllowed"});
                    var isDisableChargingAllowedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isDisableChargingAllowed"});
                    var isQuotaLimitedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isQuotaLimited"});
                    var availableQuotaAmountAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "AvailableQuotaAmount"});
                    var quotaStartDateAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "QuotaStartDate"});
                    var quotaExpiryDateAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "QuotaExpiryDate"});
                    var isQuotaRefundedUponDeliveryFailureAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isQuotaRefundedUponDeliveryFailure"});
                    var isThroughputLimitedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isThroughputLimited"});
                    var throughputLimitAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "ThroughputLimit"});
                    return {
                        ChargingMsisdn: (chargingMsisdnAttr ? chargingMsisdnAttr.value : ''),
                        isAlphanumericSenderListRestricted: (isAlphanumericSenderListRestrictedAttr && isAlphanumericSenderListRestrictedAttr.value === 'true' ? true : false),
                        PermissibleAlphanumericSenders: (permissibleAlphanumericSendersAttr ? permissibleAlphanumericSendersAttr.listValues : []),
                        isOffNetDeliveryAllowed: (isOffNetDeliveryAllowedAttr && isOffNetDeliveryAllowedAttr.value === 'true' ? true : false),
                        isForwardTrackingAllowed: (isForwardTrackingAllowedAttr && isForwardTrackingAllowedAttr.value === 'true' ? true : false),
                        isDisableChargingAllowed: (isDisableChargingAllowedAttr && isDisableChargingAllowedAttr.value === 'true' ? true : false),
                        isQuotaLimited: (isQuotaLimitedAttr && isQuotaLimitedAttr.value === 'true' ? true : false),
                        AvailableQuotaAmount: (availableQuotaAmountAttr ? Number(availableQuotaAmountAttr.value) : 0),
                        QuotaStartDate: (quotaStartDateAttr && quotaStartDateAttr.value ? moment(moment(quotaStartDateAttr.value + DateTimeConstants.OFFSET)).toDate() : null),
                        QuotaExpiryDate: (quotaExpiryDateAttr && quotaExpiryDateAttr.value ? moment(moment(quotaExpiryDateAttr.value + DateTimeConstants.OFFSET)).toDate() : null),
                        isQuotaRefundedUponDeliveryFailure: (isQuotaRefundedUponDeliveryFailureAttr && isQuotaRefundedUponDeliveryFailureAttr.value === 'true' ? true : false),
                        isThroughputLimited: (isThroughputLimitedAttr && isThroughputLimitedAttr.value === 'true' ? true : false),
                        ThroughputLimit: (throughputLimitAttr ? Number(throughputLimitAttr.value) : 0)
                    };
                } else {
                    return {};
                }
            },
            getBulkIVRPolicyProfile: function (userAccount) {
                return this.findProfileByName(userAccount.profiles, this.BULK_IVR_POLICY_PROFILE);
            },
            extractBulkIVRPolicyProfile: function (userAccount) {
                var bulkPolicyProfileDef = this.getBulkIVRPolicyProfile(userAccount);

                if (!_.isEmpty(bulkPolicyProfileDef) && !_.isUndefined(bulkPolicyProfileDef)) {
                    var senderMsisdnAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "SenderMsisdn"});
                    var isAlphanumericSenderListRestrictedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isAlphanumericSenderListRestricted"});
                    var permissibleAlphanumericSendersAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "PermissibleAlphanumericSenders"});
                    var isOffnetSenderListRestrictedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isOffnetSenderListRestricted"});
                    var permissibleOffnetSendersAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "PermissibleOffnetSenders"});
                    var isOffNetDeliveryAllowedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isOffNetDeliveryAllowed"});
                    var isDisableChargingAllowedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isDisableChargingAllowed"});
                    var isQuotaLimitedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isQuotaLimited"});
                    var availableQuotaAmountAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "AvailableQuotaAmount"});
                    var quotaStartDateAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "QuotaStartDate"});
                    var quotaExpiryDateAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "QuotaExpiryDate"});
                    var isQuotaRefundedUponDeliveryFailureAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isQuotaRefundedUponDeliveryFailure"});
                    var isThroughputLimitedAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "isThroughputLimited"});
                    var throughputLimitAttr = _.findWhere(bulkPolicyProfileDef.attributes, {name: "ThroughputLimit"});
                    return {
                        SenderMsisdn: (senderMsisdnAttr ? senderMsisdnAttr.value : ''),
                        isAlphanumericSenderListRestricted: (isAlphanumericSenderListRestrictedAttr && isAlphanumericSenderListRestrictedAttr.value === 'true' ? true : false),
                        PermissibleAlphanumericSenders: (permissibleAlphanumericSendersAttr ? permissibleAlphanumericSendersAttr.listValues : []),
                        isOffNetDeliveryAllowed: (isOffNetDeliveryAllowedAttr && isOffNetDeliveryAllowedAttr.value === 'true' ? true : false),
                        isOffnetSenderListRestricted: (isOffnetSenderListRestrictedAttr && isOffnetSenderListRestrictedAttr.value === 'true' ? true : false),
                        PermissibleOffnetSenders: (permissibleOffnetSendersAttr ? permissibleOffnetSendersAttr.listValues : []),
                        isDisableChargingAllowed: (isDisableChargingAllowedAttr && isDisableChargingAllowedAttr.value === 'true' ? true : false),
                        isQuotaLimited: (isQuotaLimitedAttr && isQuotaLimitedAttr.value === 'true' ? true : false),
                        AvailableQuotaAmount: (availableQuotaAmountAttr ? Number(availableQuotaAmountAttr.value) : 0),
                        QuotaStartDate: (quotaStartDateAttr && quotaStartDateAttr.value ? moment(moment(quotaStartDateAttr.value + DateTimeConstants.OFFSET)).toDate() : null),
                        QuotaExpiryDate: (quotaExpiryDateAttr && quotaExpiryDateAttr.value ? moment(moment(quotaExpiryDateAttr.value + DateTimeConstants.OFFSET)).toDate() : null),
                        isQuotaRefundedUponDeliveryFailure: (isQuotaRefundedUponDeliveryFailureAttr && isQuotaRefundedUponDeliveryFailureAttr.value === 'true' ? true : false),
                        isThroughputLimited: (isThroughputLimitedAttr && isThroughputLimitedAttr.value === 'true' ? true : false),
                        ThroughputLimit: (throughputLimitAttr ? Number(throughputLimitAttr.value) : 0)
                    };
                } else {
                    return {};
                }
            }
        };
    });

    // Diagnostic Services
    ApplicationServices.factory('DiagnosticsService', function ($log, DiagnosticsRestangular, UtilService) {
        return {
            getAlarmsByQuery: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('alarm-read/_search').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getAlarmCountByQuery: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('alarm-read/_count').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            queryCPUStats: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('hoststats-read/cpustat/_search').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            queryRAMStats: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('hoststats-read/memstat/_search').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    // Api Manager Services
    ApplicationServices.factory('ApiManagerService', function ($log, ApiManagerRestangular, UtilService) {
        return {
            // Checking for is service alive
            checkStatus: function (promiseTracker) {
                var promise = ApiManagerRestangular.one('/_ping').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });

    ApplicationServices.factory('ApiManagerProvService', function ($log, ApiManagerProvRestangular, UtilService) {
        return {
            getDevelopers: function () {
                var promise = ApiManagerProvRestangular.all('devs').getList();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getEndpoints: function () {
                var promise = ApiManagerProvRestangular.all('endpoints').getList();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
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

    // Bulk Messaging Services
    ApplicationServices.factory('BulkMessagingDashboardService', function ($log, BulkMessagingDashboardRestangular, BulkMessagingCampaignsDashboardRestangular, UtilService) {
        var getDashboard = function (key, promiseTracker) {
            var promise = BulkMessagingDashboardRestangular.one(key).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };

        return {
            // Checking for is service alive
            checkStatus: function (promiseTracker) {
                var promise = BulkMessagingDashboardRestangular.one('/status').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getSMSDashboard: function (promiseTracker) {
                return getDashboard('sms', promiseTracker);
            },
            getMM1Dashboard: function (promiseTracker) {
                return getDashboard('mms', promiseTracker);
            },
            getMM7Dashboard: function (promiseTracker) {
                return getDashboard('mm7', promiseTracker);
            },
            getIVRDashboard: function (promiseTracker) {
                return getDashboard('ivr', promiseTracker);
            },
            // Campaigns
            getCampaignsDashboard: function (promiseTracker) {
                var promise = BulkMessagingCampaignsDashboardRestangular.one('/status').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        }
    });

    ApplicationServices.factory('BulkMessagingConfService', function ($log, BulkMessagingConfGrRestangular, UtilService) {
        var getConfig = function (key) {
            var promise = BulkMessagingConfGrRestangular.one(key).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var updateConfig = function (key, config) {
            var promise = BulkMessagingConfGrRestangular.one(key).customPUT(config);
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            getMMSConfig: function () {
                return getConfig('mms');
            },
            updateMMSConfig: function (config) {
                return updateConfig('mms', config);
            },
            getSMSConfig: function () {
                return getConfig('sms');
            },
            updateSMSConfig: function (config) {
                return updateConfig('sms', config);
            },
            getIVRConfig: function () {
                return getConfig('ivr');
            },
            updateIVRConfig: function (config) {
                return updateConfig('ivr', config);
            },
            getCommonConfig: function () {
                return getConfig('common');
            },
            updateCommonConfig: function (config) {
                return updateConfig('common', config);
            }
        };
    });

    ApplicationServices.factory('BulkMessagingOperationsService', function ($log, $q, BulkMessagingOperationsGrRestangular, BulkMessagingOperationsCampaignsRestangular, UtilService) {
        // Distribution lists
        var getDistributionLists = function (key, organizationId, listType) {
            var promise = BulkMessagingOperationsGrRestangular.one('dlists/' + key + '/' + organizationId + '?listtype=' + listType).get();
            UtilService.addPromiseToTracker(promise);
            return promise;
        };
        var createDistributionList = function (key, organizationId, distributionList) {
            var promise = BulkMessagingOperationsGrRestangular.all('dlists/' + key + (organizationId ? '/' + organizationId : '')).post(distributionList);
            UtilService.addPromiseToTracker(promise);
            return promise;
        };

        var getGlobalBlackLists = function (key) {
            var promise = BulkMessagingOperationsGrRestangular.one('dlists/gbl/' + key).get();
            UtilService.addPromiseToTracker(promise);
            return promise;
        };

        // Campaigns
        var getCampaigns = function (campaignType, key, startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker) {
            var period = moment().diff(moment(startDateTime), "hours"); // Calculate the hours since the specified start date.
            var url = campaignType + '/' + key + '?period=' + period + '&status=' + campaignStatus;
            if (userId) {
                url += '&userId=' + userId;
            } else if (orgId) {
                url += '&orgId=' + orgId;
            }

            var promise = BulkMessagingOperationsCampaignsRestangular.one(url).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };
        var createCampaign = function (campaignType, key, campaignPayload) {
            var url = campaignType + '/' + key;

            var promise = BulkMessagingOperationsCampaignsRestangular.all(url).post(campaignPayload);
            UtilService.addPromiseToTracker(promise);
            return promise;
        };

        return {
            // Distribution lists
            // Global lists
            // Black lists
            getGlobalSMSBlackLists: function () {
                return getGlobalBlackLists('sms');
            },
            getGlobalMMSBlackLists: function () {
                return getGlobalBlackLists('mms');
            },
            getGlobalIVRBlackLists: function () {
                return getGlobalBlackLists('ivr');
            },
            // White lists
            getGlobalWhiteLists: function () {
                var promise = BulkMessagingOperationsGrRestangular.one('dlists/gwl').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createGlobalWhiteList: function (identifier, distributionList) {
                return createDistributionList('gwl', identifier, distributionList);
            },
            // Specific lists
            getDistributionList: function (name) {
                var promise = BulkMessagingOperationsGrRestangular.one('dlists/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteDistributionList: function (name) {
                var promise = BulkMessagingOperationsGrRestangular.one('dlists/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteDistributionListAllContent: function (name) {
                var promise = BulkMessagingOperationsGrRestangular.one('dlists/removeallcontent/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Per Organizations
            getDistributionListsPerOrganization: function (organizationId, listType) {
                return getDistributionLists('organizations', organizationId, listType);
            },
            createDistributionListPerOrganization: function (organizationId, distributionList) {
                return createDistributionList('organizations', organizationId, distributionList);
            },
            // Per Users
            getDistributionListsPerUser: function (userId, listType) {
                return getDistributionLists('users', userId, listType);
            },
            createDistributionListPerUser: function (userId, distributionList) {
                return createDistributionList('users', userId, distributionList);
            },
            // Campaigns
            cancelCampaign: function (campaignId) {
                var promise = BulkMessagingOperationsCampaignsRestangular.one('campaigns/' + campaignId).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Change state of the campaign (specified with the campaign id) to suspended if running or resume if suspended
            // automatically at the service side.
            changeStateOfCampaign: function (campaignId) {
                var promise = BulkMessagingOperationsCampaignsRestangular.all('campaigns/' + campaignId).customPUT();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAllBulkSMSCampaigns: function (startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker) {
                var _self = this;
                var deferred = $q.defer();

                _self.getBulkSMSCampaigns(startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker).then(function (bulkSMSCampaignsResponse) {
                    _self.getInteractiveBulkSMSCampaigns(startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker).then(function (interactiveBulkSMSCampaignsResponse) {
                        if (interactiveBulkSMSCampaignsResponse) {
                            _.each(interactiveBulkSMSCampaignsResponse.smsCampaigns, function (interactiveSMSCampaign) {
                                interactiveSMSCampaign.type = 'bulk-interactive-sms';
                            });
                        }

                        var smsCampaigns = (bulkSMSCampaignsResponse ? bulkSMSCampaignsResponse.smsCampaigns : []);
                        var interactiveSMSCampaigns = (interactiveBulkSMSCampaignsResponse ? interactiveBulkSMSCampaignsResponse.smsCampaigns : []);

                        bulkSMSCampaignsResponse.smsCampaigns = [].concat(smsCampaigns).concat(interactiveSMSCampaigns);

                        deferred.resolve(bulkSMSCampaignsResponse);
                    });
                });

                return deferred.promise;
            },
            // SMS
            getBulkSMSCampaigns: function (startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker) {
                return getCampaigns('campaigns', 'sms', startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker);
            },
            createBulkSMSCampaign: function (campaignPayload) {
                return createCampaign('campaigns', 'sms', campaignPayload);
            },
            // MMS
            getBulkMMSCampaigns: function (startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker) {
                return getCampaigns('campaigns', 'mms', startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker);
            },
            createBulkMMSCampaign: function (campaignFormData) {
                var promise = BulkMessagingOperationsCampaignsRestangular.one('campaigns/mms')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(campaignFormData, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // IVR
            getBulkIVRCampaigns: function (startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker) {
                return getCampaigns('interactivecampaigns', 'ivr', startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker);
            },
            createBulkIVRCampaign: function (campaignPayload) {
                return createCampaign('interactivecampaigns', 'ivr', campaignPayload);
            },
            // Interactive Campaigns
            // SMS
            getInteractiveBulkSMSCampaigns: function (startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker) {
                return getCampaigns('interactivecampaigns', 'sms', startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker);
            },
            createInteractiveBulkSMSCampaign: function (campaignPayload) {
                return createCampaign('interactivecampaigns', 'sms', campaignPayload);
            },
            // IVR
            getAllInteractiveBulkIVRCampaigns: function (startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker) {
                var _self = this;
                var deferred = $q.defer();

                _self.getInteractiveBulkIVRCampaigns(startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker).then(function (interactiveBulkIVRCampaignsResponse) {
                    _self.getInteractiveBulkFastKeyCampaigns(startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker).then(function (interactiveBulkFastKeyCampaignsResponse) {
                        if (interactiveBulkFastKeyCampaignsResponse) {
                            _.each(interactiveBulkFastKeyCampaignsResponse.ivrCampaigns, function (interactiveIVRCampaign) {
                                interactiveIVRCampaign.type = 'bulk-interactive-fastkey';
                            });
                        }

                        var interactiveIVRCampaigns = (interactiveBulkIVRCampaignsResponse ? interactiveBulkIVRCampaignsResponse.ivrCampaigns : []);
                        var interactiveFastKeyCampaigns = (interactiveBulkFastKeyCampaignsResponse ? interactiveBulkFastKeyCampaignsResponse.ivrCampaigns : []);

                        interactiveBulkIVRCampaignsResponse.ivrCampaigns = [].concat(interactiveIVRCampaigns).concat(interactiveFastKeyCampaigns);

                        deferred.resolve(interactiveBulkIVRCampaignsResponse);
                    });
                });

                return deferred.promise;
            },
            getInteractiveBulkIVRCampaigns: function (startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker) {
                return getCampaigns('interactivecampaigns', 'ivr', startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker);
            },
            createInteractiveBulkIVRCampaign: function (campaignPayload) {
                return createCampaign('interactivecampaigns', 'ivr', campaignPayload);
            },
            // FastKey
            getInteractiveBulkFastKeyCampaigns: function (startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker) {
                return getCampaigns('interactivecampaigns', 'fastkey', startDateTime, endDateTime, campaignStatus, orgId, userId, promiseTracker);
            },
            createInteractiveBulkFastKeyCampaign: function (campaignPayload) {
                return createCampaign('interactivecampaigns', 'fastkey', campaignPayload);
            }
        }
    });

    // Workflows Services
    ApplicationServices.factory('WorkflowsService', function ($rootScope, $q, $log, $translate, notification, UtilService, WorkflowsRestangular, SessionService,
                                                              CMPFService, Restangular, DEFAULT_REST_QUERY_LIMIT) {

        var concatAndPrepareTaskResult = function (deferred, results) {
            var resultItems = [];
            _.each(results, function (result) {
                if (result && result.detail) {
                    resultItems = resultItems.concat(result.detail.items)
                }
            });

            if (resultItems && resultItems.length > 0) {
                deferred.resolve({
                    code: 2000,
                    description: 'OK',
                    detail: {
                        page: 0,
                        size: resultItems.length > 10000 ? resultItems.length : 10000,
                        total: resultItems.length,
                        items: resultItems
                    }
                });
            } else {
                deferred.resolve({
                    code: 2000,
                    description: 'OK',
                    detail: {
                        page: 0,
                        size: 10000,
                        total: 0,
                        items: []
                    }
                });
            }
        };

        var completeTask = function (taskId, response, reason) {
            var payload = {
                "taskId": taskId,
                "response": response
            };

            if (response === 'REJECT') {
                payload.message = reason;
            }

            var promise = WorkflowsRestangular.all('task/complete').post(payload);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

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

        var getCampaignFlowInstance = function (campaignInstanceId) {
            var promise = WorkflowsRestangular.one('campaign/' + campaignInstanceId).get();

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var cancelCampaignFlowInstance = function (campaignInstanceId) {
            var promise = WorkflowsRestangular.one('campaign/cancel/' + campaignInstanceId).get();

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var postCampaign = function (campaign, campaignType, flowType) {
            var promise = WorkflowsRestangular.all('campaign/' + campaignType + '/' + flowType).post(campaign);

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var postInteractiveCampaign = function (campaign, campaignType, flowType) {
            var promise = WorkflowsRestangular.all('campaign/interactive/' + campaignType + '/' + flowType).post(campaign);

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

        return {
            taskCountChecker: undefined,
            // Methods
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
            //Dashboard
            getDashboard: function (promiseTracker) {
                var promise = WorkflowsRestangular.one('report/dashboard').get();

                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Services
            getService: function (serviceInstanceId) {
                var promise = WorkflowsRestangular.one('service/' + serviceInstanceId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getServices: function (status) {
                var url = 'service' + (status ? '/status=' + status : '');

                var prom = WorkflowsRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            cancelService: function (serviceId) {
                var promise = WorkflowsRestangular.one('service/cancel/' + serviceId).get();

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
            // Offers
            getOffer: function (offerInstanceId) {
                var promise = WorkflowsRestangular.one('offer/' + offerInstanceId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getOffers: function (status) {
                var url = 'offer' + (status ? '/status=' + status : '');

                var prom = WorkflowsRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            cancelOffer: function (offerId) {
                var promise = WorkflowsRestangular.one('offer/cancel/' + offerId).get();

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
            getPartners: function (status) {
                var url = 'partner' + (status ? '/status=' + status : '');

                var prom = WorkflowsRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            cancelPartner: function (partnerId) {
                var promise = WorkflowsRestangular.one('partner/cancel/' + partnerId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPartner: function (partner) {
                return postPartner(partner, 'create');
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
            // Campaign
            // SMS
            getCampaignSms: function (campaignInstanceId) {
                return getCampaignFlowInstance(campaignInstanceId);
            },
            cancelCampaignSms: function (campaignInstanceId) {
                return cancelCampaignFlowInstance(campaignInstanceId);
            },
            createCampaignSms: function (campaign) {
                return postCampaign(campaign, 'sms', 'create');
            },
            updateCampaignSms: function (campaign) {
                return postCampaign(campaign, 'sms', 'update');
            },
            deleteCampaignSms: function (campaign) {
                return postCampaign(campaign, 'sms', 'delete');
            },
            // MMS
            getCampaignMms: function (campaignInstanceId) {
                return getCampaignFlowInstance(campaignInstanceId);
            },
            cancelCampaignMms: function (campaignInstanceId) {
                return cancelCampaignFlowInstance(campaignInstanceId);
            },
            createCampaignMms: function (campaignFormData) {
                var promise = WorkflowsRestangular.one('campaign/mms/create')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(campaignFormData, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCampaignMms: function (campaign) {
                return postCampaign(campaign, 'mms', 'update');
            },
            deleteCampaignMms: function (campaign) {
                return postCampaign(campaign, 'mms', 'delete');
            },
            // IVR
            getCampaignIvr: function (campaignInstanceId) {
                return this.getInteractiveCampaignIvr(campaignInstanceId);
            },
            cancelCampaignIvr: function (campaignInstanceId) {
                return this.cancelInteractiveCampaignIvr(campaignInstanceId);
            },
            createCampaignIvr: function (campaign) {
                return this.createInteractiveCampaignIvr(campaign);
            },
            updateCampaignIvr: function (campaign) {
                return this.updateInteractiveCampaignIvr(campaign);
            },
            deleteCampaignIvr: function (campaign) {
                return this.deleteInteractiveCampaignIvr(campaign);
            },
            // Interactive Campaign
            // SMS
            getInteractiveCampaignSms: function (campaignInstanceId) {
                return getCampaignFlowInstance(campaignInstanceId);
            },
            cancelInteractiveCampaignSms: function (campaignInstanceId) {
                return cancelCampaignFlowInstance(campaignInstanceId);
            },
            createInteractiveCampaignSms: function (campaign) {
                return postInteractiveCampaign(campaign, 'sms', 'create');
            },
            updateInteractiveCampaignSms: function (campaign) {
                return postInteractiveCampaign(campaign, 'sms', 'update');
            },
            deleteInteractiveCampaignSms: function (campaign) {
                return postInteractiveCampaign(campaign, 'sms', 'delete');
            },
            // IVR
            getInteractiveCampaignIvr: function (campaignInstanceId) {
                return getCampaignFlowInstance(campaignInstanceId);
            },
            cancelInteractiveCampaignIvr: function (campaignInstanceId) {
                return cancelCampaignFlowInstance(campaignInstanceId);
            },
            createInteractiveCampaignIvr: function (campaign) {
                return postInteractiveCampaign(campaign, 'ivr', 'create');
            },
            updateInteractiveCampaignIvr: function (campaign) {
                return postInteractiveCampaign(campaign, 'ivr', 'update');
            },
            deleteInteractiveCampaignIvr: function (campaign) {
                return postInteractiveCampaign(campaign, 'ivr', 'delete');
            },
            // FastKey
            getInteractiveCampaignFastKey: function (campaignInstanceId) {
                return getCampaignFlowInstance(campaignInstanceId);
            },
            cancelInteractiveCampaignFastKey: function (campaignInstanceId) {
                return cancelCampaignFlowInstance(campaignInstanceId);
            },
            createInteractiveCampaignFastKey: function (campaign) {
                return postInteractiveCampaign(campaign, 'fastkey', 'create');
            },
            updateInteractiveCampaignFastKey: function (campaign) {
                return postInteractiveCampaign(campaign, 'fastkey', 'update');
            },
            deleteInteractiveCampaignFastKey: function (campaign) {
                return postInteractiveCampaign(campaign, 'fastkey', 'delete');
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
            getTasksByGroupId: function (page, size, status, type, groupId, promiseTracker) {
                var typeArray;
                if (type === 'ALL' || !type) {
                    typeArray = [
                        'SERVICE', 'OFFER', 'PARTNER', 'SHORT_CODE',
                        'CONTENT_METADATA', 'CONTENT_FILE',
                        'CAMPAIGN_SMS', 'CAMPAIGN_MMS', 'CAMPAIGN_IVR',
                        'INTERACTIVE_CAMPAIGN_SMS', 'INTERACTIVE_CAMPAIGN_IVR', 'INTERACTIVE_CAMPAIGN_FAST_KEY',
                        'RBT_CATEGORY', 'RBT_MOOD', 'RBT_TONE', 'RBT_ARTIST', 'RBT_ALBUM'
                    ];
                } else if (type.startsWith('CONTENT')) {
                    typeArray = ['CONTENT_METADATA', 'CONTENT_FILE'];
                } else if (type.startsWith('CAMPAIGN') || type.startsWith('INTERACTIVE')) {
                    typeArray = ['CAMPAIGN_SMS', 'CAMPAIGN_MMS', 'CAMPAIGN_IVR', 'INTERACTIVE_CAMPAIGN_SMS', 'INTERACTIVE_CAMPAIGN_IVR', 'INTERACTIVE_CAMPAIGN_FAST_KEY'];
                } else if (type.startsWith('RBT')) {
                    typeArray = ['RBT_CATEGORY', 'RBT_MOOD', 'RBT_TONE', 'RBT_ARTIST', 'RBT_ALBUM'];
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
                        "orgId": null,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    }
                };

                payload.to.groupId = groupId;

                var promise = WorkflowsRestangular.all(url).post(payload);

                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getTasks: function (page, size, status, type, groupId, promiseTracker) {
                var deferred = $q.defer();

                var promises = [];

                if ($rootScope.isAdminUser) {
                    promises.push(this.getTasksByGroupId(page, size, status, type, CMPFService.DSP_ADMIN_GROUP, promiseTracker));
                }
                if ($rootScope.isBusinessAdminUser) {
                    promises.push(this.getTasksByGroupId(page, size, status, type, CMPFService.DSP_BUSINESS_ADMIN_GROUP, promiseTracker));
                }
                if ($rootScope.isMarketingAdminUser) {
                    promises.push(this.getTasksByGroupId(page, size, status, type, CMPFService.DSP_MARKETING_ADMIN_GROUP, promiseTracker));
                }
                if ($rootScope.isITAdminUser) {
                    promises.push(this.getTasksByGroupId(page, size, status, type, CMPFService.DSP_IT_ADMIN_GROUP, promiseTracker));
                }

                $q.all(promises).then(function (results) {
                    concatAndPrepareTaskResult(deferred, results);
                });

                return deferred.promise;
            },
            approveTask: function (taskId, reason) {
                return completeTask(taskId, 'APPROVE', reason);
            },
            rejectTask: function (taskId, reason) {
                return completeTask(taskId, 'REJECT', reason);
            },
            assignTask: function (taskId, userId) {
                var payload = {
                    "taskId": taskId,
                    "userId": userId
                };

                var promise = WorkflowsRestangular.all('task/assign').post(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPendingTasksByGroupId: function (page, size, type, groupId) {
                var url = 'task?page=' + page + '&size=' + size;
                var payload = {
                    "status": 'PENDING',
                    "type": type,
                    "from": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    }
                };

                payload.to.groupId = groupId;

                var promise = WorkflowsRestangular.all(url).post(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPendingTasks: function (page, size, type) {
                var deferred = $q.defer();

                var promises = [];

                if ($rootScope.isAdminUser) {
                    promises.push(this.getPendingTasksByGroupId(page, size, type, CMPFService.DSP_ADMIN_GROUP));
                }
                if ($rootScope.isBusinessAdminUser) {
                    promises.push(this.getPendingTasksByGroupId(page, size, type, CMPFService.DSP_BUSINESS_ADMIN_GROUP));
                }
                if ($rootScope.isMarketingAdminUser) {
                    promises.push(this.getPendingTasksByGroupId(page, size, type, CMPFService.DSP_MARKETING_ADMIN_GROUP));
                }
                if ($rootScope.isITAdminUser) {
                    promises.push(this.getPendingTasksByGroupId(page, size, type, CMPFService.DSP_IT_ADMIN_GROUP));
                }

                $q.all(promises).then(function (results) {
                    concatAndPrepareTaskResult(deferred, results);
                });

                return deferred.promise;
            },
            searchPendingTasksByGroupId: function (page, size, type, groupId) {
                var url = 'task/search?page=' + page + '&size=' + size;
                var payload = {
                    "statuses": ['PENDING'],
                    "responses": [],
                    "flowTypes": [type],
                    "from": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    }
                };

                payload.to.groupId = groupId;

                var promise = WorkflowsRestangular.all(url).post(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            searchPendingTasks: function (page, size, type) {
                var deferred = $q.defer();

                var promises = [];

                if ($rootScope.isAdminUser) {
                    promises.push(this.searchPendingTasksByGroupId(page, size, type, CMPFService.DSP_ADMIN_GROUP));
                }
                if ($rootScope.isBusinessAdminUser) {
                    promises.push(this.searchPendingTasksByGroupId(page, size, type, CMPFService.DSP_BUSINESS_ADMIN_GROUP));
                }
                if ($rootScope.isMarketingAdminUser) {
                    promises.push(this.searchPendingTasksByGroupId(page, size, type, CMPFService.DSP_MARKETING_ADMIN_GROUP));
                }
                if ($rootScope.isITAdminUser) {
                    promises.push(this.searchPendingTasksByGroupId(page, size, type, CMPFService.DSP_IT_ADMIN_GROUP));
                }

                $q.all(promises).then(function (results) {
                    concatAndPrepareTaskResult(deferred, results);
                });

                return deferred.promise;
            },
            getTaskCountByGroupId: function (groupId, promiseTracker) {
                var payload = {
                    "status": "PENDING",
                    "from": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    },
                    "to": {
                        "userId": null,
                        "orgId": null,
                        "groupId": null
                    }
                };

                payload.to.groupId = groupId;

                var promise = WorkflowsRestangular.all('task/count?ts=' + new Date().getTime()).withHttpConfig({ignoreLoadingBar: true}).post(payload);

                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getTaskCount: function (promiseTracker) {
                var deferred = $q.defer();

                var promises = [];

                if ($rootScope.isAdminUser) {
                    promises.push(this.getTaskCountByGroupId(CMPFService.DSP_ADMIN_GROUP, promiseTracker));
                }
                if ($rootScope.isBusinessAdminUser) {
                    promises.push(this.getTaskCountByGroupId(CMPFService.DSP_BUSINESS_ADMIN_GROUP, promiseTracker));
                }
                if ($rootScope.isMarketingAdminUser) {
                    promises.push(this.getTaskCountByGroupId(CMPFService.DSP_MARKETING_ADMIN_GROUP, promiseTracker));
                }
                if ($rootScope.isITAdminUser) {
                    promises.push(this.getTaskCountByGroupId(CMPFService.DSP_IT_ADMIN_GROUP, promiseTracker));
                }

                $q.all(promises).then(function (results) {
                    var totalCount = 0;
                    _.each(results, function (result) {
                        totalCount += Number(result);
                    });

                    deferred.resolve(totalCount);
                });

                return deferred.promise;
            }
        }
    });

    // OTP Services
    ApplicationServices.factory('OTPService', function ($log, UtilService, OTPRestangular) {
        return {
            createOTP: function (promiseTracker) {
                var promise = OTPRestangular.all('client').post({
                    "validityPeriodInSeconds": 1
                });
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        }
    });

    // DCB Services
    ApplicationServices.factory('DcbService', function ($log, UtilService, DCBRestangular) {
        return {
            checkSystemHealth: function (promiseTracker) {
                var promise = DCBRestangular.one('Ping').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getDashboard: function (promiseTracker) {
                var promise = DCBRestangular.one('Dashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Subscriber api methods
            getSubscriberStatistics: function (msisdn, accountNumber) {
                var url = 'Statistics?msisdn=' + msisdn + '&account_number=' + accountNumber;

                var promise = DCBRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSubscriberSettings: function (msisdn, accountNumber) {
                var url = 'Subscriber?msisdn=' + msisdn + '&account_number=' + accountNumber;

                var promise = DCBRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubscriberSettings: function (msisdn, accountNumber, settings) {
                var url = 'Subscriber?msisdn=' + msisdn + '&account_number=' + accountNumber;

                var promise = DCBRestangular.all(url).customPUT(settings);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

    ApplicationServices.factory('DCBConfigService', function ($log, UtilService, DCBConfigRestangular) {
        return {
            getLimit: function () {
                var promise = DCBConfigRestangular.one('limit').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

    // Subscription Management Service
    ApplicationServices.factory('SubscriptionManagementService', function ($log, SubscriptionManagementRestangular, UtilService) {
        return {
            // Price Groups Methods
            getPriceGroups: function (getPriceQuotes) {
                var url = 'bre/price-groups' + (getPriceQuotes ? '?getPriceQuotes=true' : '');

                var promise = SubscriptionManagementRestangular.all(url).getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPriceGroup: function (id) {
                var promise = SubscriptionManagementRestangular.one('bre/price-groups/' + id).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPriceGroup: function (priceGroup) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups').post(priceGroup);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePriceGroup: function (priceGroup) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups').customPUT(priceGroup);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePriceGroup: function (id) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups/' + id).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Price Quotes of price groups
            getPriceQuotes: function (priceGroupId) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups/' + priceGroupId + '/price-quotes').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPriceQuoteByPriority: function (priceGroupId, priority) {
                var promise = SubscriptionManagementRestangular.one('bre/price-groups/' + priceGroupId + '/price-quotes/' + priority).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPriceQuote: function (priceGroupId, priceQuote) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups/' + priceGroupId + '/price-quotes').post(priceQuote);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePriceQuoteByPriority: function (priceGroupId, priority, priceQuote) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups/' + priceGroupId + '/price-quotes/' + priority).customPUT(priceQuote);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePriceQuoteByPriority: function (priceGroupId, priority) {
                var promise = SubscriptionManagementRestangular.all('bre/price-groups/' + priceGroupId + '/price-quotes/' + priority).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Price Rules Methods
            getPriceRules: function () {
                var promise = SubscriptionManagementRestangular.all('bre/scripts').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPriceRule: function (id) {
                var promise = SubscriptionManagementRestangular.one('bre/scripts/' + id).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPriceRule: function (priceRule) {
                var promise = SubscriptionManagementRestangular.all('bre/scripts').post(priceRule);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePriceRule: function (priceRule) {
                var promise = SubscriptionManagementRestangular.all('bre/scripts').customPUT(priceRule);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePriceRule: function (id) {
                var promise = SubscriptionManagementRestangular.all('bre/scripts/' + id).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Screening Manager Services
    ApplicationServices.factory('ScreeningManagerV2Service', function ($log, ScreeningManagerV2Restangular, Restangular, notification, $translate, UtilService) {
        var CHANNEL_TYPE = 'CC';

        return {
            serviceNames: {
                SSM: "ssmservice"
            },
            scopes: {
                // Main service scopes
                GLOBAL_SCOPE_KEY: 'global',
                MSISDN_SCOPE_KEY: 'msisdn',
                SAN_SCOPE_KEY: 'san'
            },
            errorCodes: {
                AUTHORIZATION_FAILED: 3001,
                API_NOT_SUPPORTED: 3011,
                STORAGE_ERROR: 3021,
                QUOTA_ERROR: 3031,
                WRONG_REQUEST_ERROR: 3041,
                SUBSCRIBER_NOT_FOUND: 3051,
                SCOPE_NOT_FOUND: 3061
            },
            getScreeningListsByScopeAndService: function (serviceName, scopeSubscriberKey, scopeKey, promiseTracker) {
                var promise = ScreeningManagerV2Restangular.one(CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteListItem: function (serviceName, scopeSubscriberKey, scopeKey, listKey, screenableEntryId) {
                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey + '/' + listKey + '/' + screenableEntryId;
                var promise = ScreeningManagerV2Restangular.one(requestUri).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewListItem: function (serviceName, scopeSubscriberKey, scopeKey, listKey, screenableEntry) {
                var screeningRequest = {
                    "screeningRequest": {
                        "screenableEntry": [screenableEntry],
                        "requestCorrelator": new Date().getTime()
                    }
                };

                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey + '/' + listKey;
                var promise = ScreeningManagerV2Restangular.all(requestUri).post(screeningRequest);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateScreeningRule: function (serviceName, scopeSubscriberKey, scopeKey, screeningRule) {
                var screeningModeRequest = {
                    screeningScopeRequest: {
                        selectedScreeningModeType: screeningRule
                    }
                };

                $log.debug('Screening rule update request body: ', screeningModeRequest);

                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey;
                var promise = ScreeningManagerV2Restangular.all(requestUri).customPUT(screeningModeRequest);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });
    ApplicationServices.factory('ScreeningManagerV3Service', function ($log, ScreeningManagerV3Restangular, ScreeningManagerStatsRestangular, Restangular, notification, $translate, UtilService) {
        return {
            lists: {
                // Service
                SERVICE_MSISDN_LIST_KEY: 'msisdn'
            },
            scopes: {
                // Main service scopes
                GLOBAL_SCOPE_KEY: 'global'
            },
            errorCodes: {
                AUTHORIZATION_FAILED: 3001,
                API_NOT_SUPPORTED: 3011,
                STORAGE_ERROR: 3021,
                QUOTA_ERROR: 3031,
                WRONG_REQUEST_ERROR: 3041,
                SERVICE_NOT_FOUND: 3051,
                SCOPE_NOT_FOUND: 3061
            },
            // Screening Manager Stats services
            getScreenings: function (promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('screenings').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getSubscribers: function (promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('subscribers').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getConstraints: function (promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('constraints').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScopes: function (promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('scopes').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // Screening Manager configuration services
            getLimitConfiguration: function (promiseTracker) {
                ScreeningManagerV3Restangular.setDefaultHeaders({'Service': 'screeningmanager'});

                var promise = ScreeningManagerV3Restangular.one('limits/lists').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            setLimitConfiguration: function (limitConf, promiseTracker) {
                ScreeningManagerV3Restangular.setDefaultHeaders({'Service': 'screeningmanager'});

                var promise = ScreeningManagerV3Restangular.all('limits/lists').customPUT(limitConf);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // Subscriber black lists operations
            getGlobalBlackListExistence: function (msisdn) {
                var requestUri = '/screenings/subscription_msisdn/global/blacklist?existence=' + msisdn;

                var promise = ScreeningManagerV3Restangular.one(requestUri).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addSubscriberToGlobalBlackList: function (screenableEntry) {
                var screeningRequest = {
                    "screeningRequest": {
                        "screenableEntry": [screenableEntry],
                        "requestCorrelator": new Date().getTime()
                    }
                };

                var requestUri = '/screenings/subscription_msisdn/global/blacklist';

                var promise = ScreeningManagerV3Restangular.all(requestUri).post(screeningRequest);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            removeSubscriberFromGlobalBlackList: function (msisdn) {
                var requestUri = '/screenings/subscription_msisdn/global/blacklist/' + msisdn;

                var promise = ScreeningManagerV3Restangular.one(requestUri).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Service specific screening lists operations
            // Msisdn specific methods
            getServiceListExistenceByMsisdn: function (serviceName, msisdn, listType) {
                var requestUri = '/screenings/__SERVICE_' + serviceName + '_msisdn/global/' + listType + '?existence=' + msisdn;

                var promise = ScreeningManagerV3Restangular.one(requestUri).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addSubscriberToServiceListByMsisdn: function (serviceName, screenableEntry, listType) {
                var screeningRequest = {
                    "screeningRequest": {
                        "screenableEntry": [screenableEntry],
                        "requestCorrelator": new Date().getTime()
                    }
                };

                var requestUri = '/screenings/__SERVICE_' + serviceName + '_msisdn/global/' + listType;

                var promise = ScreeningManagerV3Restangular.all(requestUri).post(screeningRequest);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            removeSubscriberFromServiceListByMsisdn: function (serviceName, msisdn, listType) {
                var requestUri = '/screenings/__SERVICE_' + serviceName + '_msisdn/global/' + listType + '/' + msisdn;

                var promise = ScreeningManagerV3Restangular.one(requestUri).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Screening lists
            getServiceScreeningLists: function (serviceName, screeningIdentifier, screeningScope) {
                var requestUri = '/screenings/__SERVICE_' + serviceName + '_' + screeningIdentifier + '/' + screeningScope;

                var promise = ScreeningManagerV3Restangular.one(requestUri).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteServiceScreeningListItem: function (serviceName, screeningIdentifier, screeningScope, listKey, screenableEntryId) {
                var requestUri = '/screenings/__SERVICE_' + serviceName + '_' + screeningIdentifier + '/' + screeningScope + '/' + listKey + '/' + screenableEntryId;

                var promise = ScreeningManagerV3Restangular.one(requestUri).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewServiceScreeningListItem: function (serviceName, screeningIdentifier, screeningScope, listKey, screenableEntry) {
                var screeningRequest = {
                    "screeningRequest": {
                        "screenableEntry": [screenableEntry],
                        "requestCorrelator": new Date().getTime()
                    }
                };

                var requestUri = '/screenings/__SERVICE_' + serviceName + '_' + screeningIdentifier + '/' + screeningScope + '/' + listKey;
                var promise = ScreeningManagerV3Restangular.all(requestUri).post(screeningRequest);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Screening rule update method
            updateServiceScreeningRule: function (serviceName, screeningIdentifier, screeningScope, screeningRule) {
                var screeningModeRequest = {
                    "screeningMode": {
                        "screeningModeType": screeningRule
                    }
                };

                var requestUri = '/screenings/__SERVICE_' + serviceName + '_' + screeningIdentifier + '/' + screeningScope + '/modes';
                var promise = ScreeningManagerV3Restangular.all(requestUri).post(screeningModeRequest);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // License Manager Services
    ApplicationServices.factory('LicenseManagerService', function ($log, LicenseManagerRestangular, UtilService) {
        return {
            getAllLicenses: function (promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getLicense: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses/' + name).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            setLicense: function (license, promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses/' + name).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getLicenseProducts: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses/' + name + '/products').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // License special days
            getLicenseSpecialDays: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses/' + name + '/specialdays').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addNewLicenseSpecialDay: function (name, dayStr, promiseTracker) {
                var dayJson = {
                    "day": dayStr
                };

                var promise = LicenseManagerRestangular.all('licenses/' + name + '/specialdays').post(dayJson);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateLicenseSpecialDay: function (name, oldDayStr, newDayStr, promiseTracker) {
                var newDayJson = {
                    "day": newDayStr
                };

                var promise = LicenseManagerRestangular.one('licenses/' + name + '/specialdays/' + oldDayStr).customPUT(newDayJson);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteLicenseSpecialDay: function (name, dayStr, promiseTracker) {
                var promise = LicenseManagerRestangular.all('licenses/' + name + '/specialdays/' + dayStr).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // License thresholds
            setLicenseThresholds: function (name, thresholds, promiseTracker) {
                var promise = LicenseManagerRestangular.one('licenses/' + name + '/threshold').customPUT(thresholds);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            setLicenseProductThresholds: function (name, thresholds, promiseTracker) {
                var promise = LicenseManagerRestangular.all('licenses/' + name + '/productlimits').post(thresholds);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getConsumptions: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('consumptions/' + name + '/summary').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getConsumptionsByQuery: function (name, query, promiseTracker) {
                var promise = LicenseManagerRestangular.one('consumptions/' + name + '/simple?' + query).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getCurrentConsumption: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('consumptions/' + name + '/current').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    // Messaging Gateway Services
    ApplicationServices.factory('MessagingGwDashboardService', function ($log, MessagingGwDashboardRestangular, UtilService) {
        var getDashboard = function (promiseTracker, key) {
            var promise = MessagingGwDashboardRestangular.one('/' + key).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };

        return {
            getLastHourDashboard: function (promiseTracker) {
                return getDashboard(promiseTracker, 'hour');
            },
            getLastDayDashboard: function (promiseTracker) {
                return getDashboard(promiseTracker, 'day');
            }
        }
    });

    ApplicationServices.factory('MessagingGwService', function ($log, MessagingGwRestangular, UtilService) {
        return {
            // Checking for is service alive
            checkStatus: function (promiseTracker) {
                var promise = MessagingGwRestangular.one('/ping').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });

    ApplicationServices.factory('MessagingGwProvService', function ($log, MessagingGwProvRestangular, UtilService) {
        var getApplications = function (serviceKey) {
            var promise = MessagingGwProvRestangular.all('applications/' + serviceKey).getList();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var getApplication = function (serviceKey, serviceId) {
            var promise = MessagingGwProvRestangular.one('applications/' + serviceKey + '/' + serviceId).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var createApplication = function (serviceKey, service) {
            var promise = MessagingGwProvRestangular.all('applications/' + serviceKey).post(service);
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var updateApplication = function (serviceKey, service) {
            var promise = MessagingGwProvRestangular.all('applications/' + serviceKey).customPUT(service);
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var deleteApplication = function (serviceKey, serviceId) {
            var promise = MessagingGwProvRestangular.all('applications/' + serviceKey + '/' + serviceId).remove();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            getServicesEligibleToCreate: function () {
                var promise = MessagingGwProvRestangular.all('applications/eligible-to-create').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SMPP
            getSMPPApplications: function () {
                return getApplications('smpp');
            },
            getSMPPApplication: function (serviceId) {
                return getApplication('smpp', serviceId);
            },
            createSMPPApplication: function (service) {
                return createApplication('smpp', service);
            },
            updateSMPPApplication: function (service) {
                return updateApplication('smpp', service);
            },
            deleteSMPPApplication: function (serviceId) {
                return deleteApplication('smpp', serviceId);
            },
            getLiveConnectionsByApplication: function (serviceId) {
                var promise = MessagingGwProvRestangular.all('applications/smpp/connections/' + serviceId).getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // WebService
            getWebServiceApplications: function () {
                return getApplications('webservice');
            },
            getWebServiceApplication: function (serviceId) {
                return getApplication('webservice', serviceId);
            },
            createWebServiceApplication: function (service) {
                return createApplication('webservice', service);
            },
            updateWebServiceApplication: function (service) {
                return updateApplication('webservice', service);
            },
            deleteWebServiceApplication: function (serviceId) {
                return deleteApplication('webservice', serviceId);
            },
            // Application Charging
            getApplicationChargingConf: function (serviceId) {
                var promise = MessagingGwProvRestangular.one('applications/' + serviceId + '/nawras_charging').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateApplicationChargingConf: function (serviceId, conf) {
                var promise = MessagingGwProvRestangular.all('applications/' + serviceId + '/nawras_charging').customPUT(conf);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Routings
            getSMPPApplicationRoutingByRange: function (serviceId, rangeStart, rangeEnd) {
                var getCallUrl = 'routing/application/' + serviceId + '/' + encodeURIComponent(rangeStart) + '/' + encodeURIComponent(rangeEnd);

                var promise = MessagingGwProvRestangular.one(getCallUrl).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSMPPApplicationRoutings: function () {
                var promise = MessagingGwProvRestangular.all('routing/application').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSMPPApplicationRouting: function (serviceId, rangeStart, rangeEnd) {
                var deleteCallUrl = 'routing/application/' + serviceId + '/' + encodeURIComponent(rangeStart) + '/' + encodeURIComponent(rangeEnd);

                var promise = MessagingGwProvRestangular.all(deleteCallUrl).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSMPPApplicationRouting: function (rangeItem) {
                var promise = MessagingGwProvRestangular.all('routing/application').post(rangeItem);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addSMPPApplicationRoutingPattern: function (serviceId, rangeStart, rangeEnd, patternItem) {
                var addUrl = 'routing/application/pattern/' + serviceId + '/' + encodeURIComponent(rangeStart) + '/' + encodeURIComponent(rangeEnd);

                var promise = MessagingGwProvRestangular.all(addUrl).post(patternItem);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSMPPApplicationRoutingPattern: function (serviceId, rangeStart, rangeEnd, pattern) {
                var deleteCallUrl = 'routing/application/pattern/' + serviceId + '/' + encodeURIComponent(rangeStart) + '/' + encodeURIComponent(rangeEnd) + '?pattern=' + encodeURIComponent(pattern);

                var promise = MessagingGwProvRestangular.all(deleteCallUrl).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Routing test methods
            getSMPPApplicationRoutingTest: function (address, text) {
                var promise = MessagingGwProvRestangular.one('routing/application/test?address=' + encodeURIComponent(address) + '&text=' + encodeURIComponent(text)).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    ApplicationServices.factory('MessagingGwConfService', function ($q, $log, MessagingGwConfRestangular, MessagingGwProvRestangular, UtilService) {
        var prepareUrl = function (slaItemKey, serviceId) {
            var url = serviceId ? 'applications/' + serviceId + '/sla-items/' : 'sla-templates/toygun_apps/';
            url += slaItemKey;

            return url;
        };
        var getSLAItem = function (slaItemKey, serviceId) {
            var restangularService = serviceId ? MessagingGwProvRestangular : MessagingGwConfRestangular;

            var deferred = $q.defer();

            restangularService.one(prepareUrl(slaItemKey, serviceId)).get().then(function (response) {
                deferred.resolve(response ? response : {});
            }, function (response) {
                deferred.reject(response);
            });

            UtilService.addPromiseToTracker(deferred.promise);

            return deferred.promise;
        };
        var createSLAItem = function (slaItem, slaItemKey, serviceId) {
            var restangularService = serviceId ? MessagingGwProvRestangular : MessagingGwConfRestangular;
            var promise = restangularService.all(prepareUrl(slaItemKey, serviceId)).post(slaItem);
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var deleteSLAItem = function (slaItemKey, serviceId) {
            var restangularService = serviceId ? MessagingGwProvRestangular : MessagingGwConfRestangular;
            var promise = restangularService.all(prepareUrl(slaItemKey, serviceId)).remove();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            // SLA Items
            getAllSLAItems: function (serviceId) {
                var promise = MessagingGwProvRestangular.one('applications/' + serviceId + '/sla-items').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Black Hour
            getBlackHour: function (serviceId) {
                return getSLAItem('blackhour', serviceId);
            },
            createBlackHour: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'blackhour', serviceId);
            },
            deleteBlackHour: function (serviceId) {
                return deleteSLAItem('blackhour', serviceId);
            },
            // Duplicate Message
            getDuplicateMessage: function (serviceId) {
                return getSLAItem('duplicate-sm', serviceId);
            },
            createDuplicateMessage: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'duplicate-sm', serviceId);
            },
            deleteDuplicateMessage: function (serviceId) {
                return deleteSLAItem('duplicate-sm', serviceId);
            },
            // Input Rate
            getInputRate: function (serviceId) {
                return getSLAItem('input-rate', serviceId);
            },
            createInputRate: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'input-rate', serviceId);
            },
            deleteInputRate: function (serviceId) {
                return deleteSLAItem('input-rate', serviceId);
            },
            // Message Length
            getMessageLength: function (serviceId) {
                return getSLAItem('message-length', serviceId);
            },
            createMessageLength: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'message-length', serviceId);
            },
            deleteMessageLength: function (serviceId) {
                return deleteSLAItem('message-length', serviceId);
            },
            // Quota
            getQuota: function (serviceId) {
                return getSLAItem('quota', serviceId);
            },
            createQuota: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'quota', serviceId);
            },
            deleteQuota: function (serviceId) {
                return deleteSLAItem('quota', serviceId);
            },
            // Sender Address
            getSenderAddress: function (serviceId) {
                return getSLAItem('sender-address', serviceId);
            },
            createSenderAddress: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'sender-address', serviceId);
            },
            deleteSenderAddress: function (serviceId) {
                return deleteSLAItem('sender-address', serviceId);
            },
            // Throttler
            getThrottler: function (serviceId) {
                return getSLAItem('throttler', serviceId);
            },
            createThrottler: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'throttler', serviceId);
            },
            deleteThrottler: function (serviceId) {
                return deleteSLAItem('throttler', serviceId);
            },
            // Keyword Screening
            getKeywordScreening: function (serviceId) {
                return getSLAItem('keyword-screening', serviceId);
            },
            createKeywordScreening: function (slaItem, serviceId) {
                return createSLAItem(slaItem, 'keyword-screening', serviceId);
            },
            deleteKeywordScreening: function (serviceId) {
                return deleteSLAItem('keyword-screening', serviceId);
            },
            // Keyword Screening Lists
            getKeywordScreeningLists: function () {
                var promise = MessagingGwConfRestangular.all('keyword-screening').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createKeywordScreeningList: function (keywordScreeningList) {
                var promise = MessagingGwConfRestangular.all('keyword-screening').post(keywordScreeningList);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteKeywordScreeningList: function (keywordScreeningList) {
                var promise = MessagingGwConfRestangular.one('keyword-screening').customOperation('remove', null, {}, {'Content-Type': 'application/json'}, keywordScreeningList);

                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Charging Gateway Services
    ApplicationServices.factory('ChargingGwService', function ($log, ChargingGwRestangular, UtilService) {
        return {
            // Checking for is service alive
            checkStatus: function (promiseTracker) {
                var promise = ChargingGwRestangular.one('/dashboard/ping').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getDashboard: function (promiseTracker) {
                var promise = ChargingGwRestangular.one('/dashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Refund methods
            getRefundRecords: function (transactionId) {
                var promise = ChargingGwRestangular.all('refund-records/' + transactionId).getList();
                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            refund: function (serviceId, refundItem) {
                var promise = ChargingGwRestangular.all('direct-debit/refund/' + serviceId).customPUT(refundItem, undefined, undefined, {'Channel': 'CC'});
                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            }
        };
    });

    // SMS Portal Services
    ApplicationServices.factory('SMSPortalProvisioningService', function ($log, SMSPortalProvisioningRestangular, SMSPortalRestangular, UtilService) {
        var prepareUrl = function (languageCode, scenarioName, name) {
            var url = 'template/global';
            if (scenarioName) {
                url = 'template/subscription-scenario/by-name/' + scenarioName
            }

            url += '/' + languageCode + (name ? '/' + name : '');

            return url;
        };

        return {
            getLanguages: function () {
                var promise = SMSPortalProvisioningRestangular.all('language').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAvailableMessageTemplates: function () {
                var promise = SMSPortalProvisioningRestangular.all('template/global').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSubscriptionScenarios: function () {
                var promise = SMSPortalProvisioningRestangular.all('subscription-scenario-collective').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Message Templates
            getMessageTemplates: function (languageCode, scenarioName) {
                var url = prepareUrl(languageCode, scenarioName);

                var promise = SMSPortalProvisioningRestangular.all(url).getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getMessageTemplate: function (languageCode, scenarioName, name) {
                var url = prepareUrl(languageCode, scenarioName, name);

                var promise = SMSPortalProvisioningRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMessageTemplate: function (languageCode, scenarioName, template) {
                var url = prepareUrl(languageCode, scenarioName);

                var promise = SMSPortalProvisioningRestangular.all(url).post(template);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMessageTemplate: function (languageCode, scenarioName, template) {
                var url = prepareUrl(languageCode, scenarioName);

                var promise = SMSPortalProvisioningRestangular.all(url).customPUT(template);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMessageTemplate: function (languageCode, scenarioName, name) {
                var url = prepareUrl(languageCode, scenarioName, name);

                var promise = SMSPortalProvisioningRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Subscription Scenario methods (using in the offer controllers)
            getSubscriptionScenarioByOfferId: function (offerId) {
                var promise = SMSPortalProvisioningRestangular.one('subscription-scenario-collective/by-offer-id/' + offerId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSubscriptionScenario: function (subscriptionScenario) {
                var promise = SMSPortalProvisioningRestangular.all('subscription-scenario-collective').post(subscriptionScenario);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubscriptionScenario: function (subscriptionScenario) {
                var promise = SMSPortalProvisioningRestangular.all('subscription-scenario-collective').customPUT(subscriptionScenario);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSubscriptionScenarioByOfferId: function (offerId) {
                var promise = SMSPortalProvisioningRestangular.all('subscription-scenario-collective/by-offer-id/' + offerId).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Short Codes
            getShortCodes: function (withoutCache) {
                var url = 'shortcode-keyword/subscription?noCache=' + (withoutCache ? withoutCache : false);

                var promise = SMSPortalProvisioningRestangular.all(url).getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createShortCode: function (offerId, shortCode) {
                var url = 'shortcode-keyword/subscription/by-offer-id/' + offerId;

                var promise = SMSPortalProvisioningRestangular.all(url).post(shortCode);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateShortCode: function (offerId, shortCode) {
                var url = 'shortcode-keyword/subscription/by-offer-id/' + offerId;

                var promise = SMSPortalProvisioningRestangular.all(url).customPUT(shortCode);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteShortCode: function (offerId, name) {
                var url = 'shortcode-keyword/subscription/by-offer-id/' + offerId + '?name=' + name;

                var promise = SMSPortalProvisioningRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getShortCodeTest: function (shortCode, text) {
                var url = 'test?shortCode=' + shortCode + '&text=' + encodeURIComponent(text);

                var promise = SMSPortalRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Content Management Services
    ApplicationServices.factory('ContentManagementService', function ($q, $log, $translate, notification, ContentManagementRestangular, UtilService, SessionService, BATCH_SIZE) {
        var getRBTContentList = function (baseUrl, page, size, orderBy, orderDirection, statuses, name) {
            var url = baseUrl;

            url += '?page=' + (page ? page : 0);
            url += '&size=' + (size ? size : 10);

            url += orderBy ? '&orderBy=' + orderBy : '';
            url += orderDirection ? '&orderDirection=' + orderDirection : '';

            url += statuses ? '&statuses=' + statuses.join('') : '';

            url += name ? '&name=' + name : '';

            var promise = ContentManagementRestangular.one(url).get();

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var getRBTContentListByName = function (baseUrl, page, size, name, organizationId, isPromoted) {
            var url = baseUrl;

            url += '?page=' + (page ? page : 0);
            url += '&size=' + (size ? size : 10);

            url += '&orderBy=name&orderDirection=ASC';

            url += name ? '&name=' + name : '';

            url += organizationId ? '&organizationId=' + organizationId : '';

            url += isPromoted ? '&promoted=' + isPromoted : '';

            var promise = ContentManagementRestangular.one(url).get();

            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            showApiError: function (response) {
                var type = 'warning', message;

                if (response) {
                    if (response.message) {
                        message = response.message;
                    } else if (response.detail) {
                        message = response.detail;
                    } else if (response.data) {
                        if (response.data.message) {
                            message = response.data.message;
                        } else if (response.data.detail) {
                            message = response.data.detail;
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
            checkSystemHealth: function (promiseTracker) {
                var promise = ContentManagementRestangular.one('/system/health').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getDashboard: function (promiseTracker) {
                var promise = ContentManagementRestangular.one('dashboard').get();

                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
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
            getContentFileMetadata: function (contentId) {
                var promise = ContentManagementRestangular.one('cms/metadata/' + contentId + '?ts=' + new Date().getTime()).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getContentFile: function (contentId) {
                var promise = ContentManagementRestangular.one('cms/file/' + contentId + '?ts=' + new Date().getTime()).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            deleteContent: function (content) {
                var promise = ContentManagementRestangular.one('content/' + content.id).customDELETE(undefined, undefined, {
                    'userId': SessionService.getUsername(),
                    'orgId': SessionService.getSessionOrganization().name
                });

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Categories
            getContentCategories: function (type) {
                var url = '/category?resultStructure=RELATIONAL';

                var promise = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentCategory: function (id) {
                var promise = ContentManagementRestangular.one('/category/' + id + '?resultStructure=RELATIONAL').get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentCategory: function (contentCategory) {
                var promise = ContentManagementRestangular.all('/category').post(contentCategory);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateContentCategory: function (contentCategory) {
                var promise = ContentManagementRestangular.all('/category/' + contentCategory.id).customPUT(contentCategory);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            deleteContentCategory: function (contentCategory) {
                var promise = ContentManagementRestangular.one('/category/' + contentCategory.id).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Types
            getContentTypes: function () {
                var promise = ContentManagementRestangular.one('content/type').get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentType: function (id) {
                var promise = ContentManagementRestangular.one('/content/type/' + id).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentType: function (contentType) {
                var promise = ContentManagementRestangular.all('content/type').post(contentType);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateContentType: function (contentType) {
                var promise = ContentManagementRestangular.all('content/type/' + contentType.id).customPUT(contentType);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            deleteContentType: function (contentType) {
                var promise = ContentManagementRestangular.one('content/type/' + contentType.id).customDELETE(undefined, undefined, {
                    'userId': SessionService.getUsername(),
                    'orgId': SessionService.getSessionOrganization().name
                });

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
            createContentMetadata: function (contentMetadata) {
                var promise = ContentManagementRestangular.all('content/metadata').post(contentMetadata);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateContentMetadata: function (contentMetadata) {
                var promise = ContentManagementRestangular.all('content/metadata/' + contentMetadata.id).customPUT(contentMetadata);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentMetadata: function (contentMetadata) {
                var promise = ContentManagementRestangular.one('content/metadata/' + contentMetadata.id).customDELETE(undefined, undefined, {
                    'userId': SessionService.getUsername(),
                    'orgId': SessionService.getSessionOrganization().name
                });

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
            createContentMetadataFile: function (contentFile) {
                var fd = new FormData();
                fd.append('file', contentFile.file);
                fd.append('fileName', contentFile.fileName);
                fd.append('fileType', contentFile.fileType);
                fd.append('contentId', contentFile.contentMetadataId);

                var promise = ContentManagementRestangular.one('content/file')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(fd, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise
            },
            updateContentMetadataFile: function (contentFile) {
                var fd = new FormData();
                fd.append('id', contentFile.id);
                fd.append('file', contentFile.file);

                var promise = ContentManagementRestangular.one('content/file/' + contentFile.id)
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPUT(fd, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise
            },
            deleteContentMetadataFile: function (contentFile) {
                var promise = ContentManagementRestangular.one('content/file/' + contentFile.id).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            ////////////////////////
            // RBT
            // Dashboard
            getDashboardRBT: function (promiseTracker) {
                var promise = ContentManagementRestangular.one('rbt/dashboard').get();

                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Offers
            getContentOffersBySubscriptionCode: function (subscriptionCode) {
                var promise = ContentManagementRestangular.one('rbt/offers?subscriptionCode=' + subscriptionCode).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAllContentOffers: function (expand, promiseTracker) {
                var _self = this;
                var deferred = $q.defer();

                _self.getContentOffers(0, BATCH_SIZE, expand, promiseTracker).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var page = 1; (page * BATCH_SIZE) < firstResponse.totalCount; page++) {
                                promises.push(_self.getContentOffers(page, BATCH_SIZE, expand, promiseTracker));
                            }

                            $q.all(promises).then(function (totalResponses) {
                                totalResponses.forEach(function (totalResponse) {
                                    firstResponse.items = firstResponse.items.concat(totalResponse.items);
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
            getContentOffers: function (page, size, expand, promiseTracker) {
                var url = 'rbt/offers?page=' + page + '&size=' + size +
                    '&expand=' + (expand ? expand : false);

                var prom = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            // Content Categories
            getContentCategoriesRBT: function (page, size, orderBy, orderDirection, statuses, name) {
                var url = '/rbt/categories';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name);
            },
            searchContentCategoriesRBT: function (page, size, name, organizationId) {
                var url = '/rbt/categories';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            getContentCategoryRBT: function (id) {
                var promise = ContentManagementRestangular.one('/rbt/categories/' + id).get();

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
            deleteContentCategoryRBT: function (contentCategory) {
                var promise = ContentManagementRestangular.one('/rbt/categories/' + contentCategory.id).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Metadata
            // Artists
            getArtists: function (page, size, orderBy, orderDirection, statuses, name) {
                var url = '/rbt/artists';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name);
            },
            searchArtists: function (page, size, name, organizationId) {
                var url = '/rbt/artists';

                return getRBTContentListByName(url, page, size, name, organizationId);
            },
            getArtist: function (artistId) {
                var promise = ContentManagementRestangular.one('/rbt/artists/' + artistId).get();
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
            deleteArtist: function (artist) {
                var promise = ContentManagementRestangular.one('/rbt/artists/' + artist.id).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Albums
            getAlbums: function (page, size, orderBy, orderDirection, statuses, name) {
                var url = '/rbt/albums';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name);
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
            deleteAlbum: function (album) {
                var promise = ContentManagementRestangular.one('/rbt/albums/' + album.id).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Tones
            getTones: function (page, size, orderBy, orderDirection, statuses, name) {
                var url = '/rbt/tones';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name);
            },
            searchTones: function (page, size, name, organizationId, isPromoted) {
                var url = '/rbt/tones';

                return getRBTContentListByName(url, page, size, name, organizationId, isPromoted);
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
            getTone: function (toneId) {
                var promise = ContentManagementRestangular.one('/rbt/tones/' + toneId).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createTone: function (tone) {
                var promise = ContentManagementRestangular.all('/rbt/tones').post(tone);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateTone: function (tone) {
                var promise = ContentManagementRestangular.all('/rbt/tones/' + tone.id).customPUT(tone);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteTone: function (tone) {
                var promise = ContentManagementRestangular.one('/rbt/tones/' + tone.id).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Moods
            getMoods: function (page, size, orderBy, orderDirection, statuses, name) {
                var url = '/rbt/moods';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name);
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
            deleteMood: function (mood) {
                var promise = ContentManagementRestangular.one('/rbt/moods/' + mood.id).remove();

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

    ApplicationServices.factory('RBTContentManagementService', function ($q, $log, $translate, notification, RBTContentManagementRestangular, UtilService, SessionService) {
        var username = SessionService.getUsername();
        var headers = {
            'X-Channel': 'DSPAdminPortal',
            'X-Username': username
        };

        return {
            showApiError: function (response) {
                var type = 'warning', message = $translate.instant('CommonMessages.GenericServerError');

                if (response) {
                    if (response.message) {
                        message = response.message;
                    } else if (response.data) {
                        if (response.data.message) {
                            message = response.data.message;
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
            // Events
            getEvents: function () {
                var promise = RBTContentManagementRestangular.all('rbt/events').getList(null, headers);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getEvent: function (id) {
                var promise = RBTContentManagementRestangular.one('rbt/events/' + id).get(null, headers);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createEvent: function (event) {
                var promise = RBTContentManagementRestangular.all('rbt/events').post(event, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateEvent: function (event) {
                var promise = RBTContentManagementRestangular.all('rbt/events/' + event.id).customPUT(event, null, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            deleteEvent: function (event) {
                var promise = RBTContentManagementRestangular.one('rbt/events/' + event.id).remove(null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Predefined Signatures
            // Signatures
            getPredefinedSignatures: function () {
                var promise = RBTContentManagementRestangular.one('rbt/predefinedsignatures').get(null, headers);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPredefinedSignature: function (id) {
                var promise = RBTContentManagementRestangular.one('rbt/predefinedsignatures/' + id).get(null, headers);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPredefinedSignature: function (predefinedSignature) {
                var promise = RBTContentManagementRestangular.all('rbt/predefinedsignatures').post(predefinedSignature, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePredefinedSignature: function (predefinedSignature) {
                var id = predefinedSignature.id;
                delete predefinedSignature.id;
                var promise = RBTContentManagementRestangular.all('rbt/predefinedsignatures/' + id).customPUT(predefinedSignature, null, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            deletePredefinedSignature: function (predefinedSignature) {
                var promise = RBTContentManagementRestangular.one('rbt/predefinedsignatures/' + predefinedSignature.id).remove(null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Boxes
            getPredefinedSignatureBoxes: function () {
                var promise = RBTContentManagementRestangular.one('rbt/predefinedsignatures/box').get(null, headers);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPredefinedSignatureBox: function (id) {
                var promise = RBTContentManagementRestangular.one('rbt/predefinedsignatures/box/' + id).get(null, headers);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPredefinedSignatureBox: function (predefinedSignature) {
                var promise = RBTContentManagementRestangular.all('rbt/predefinedsignatures/box').post(predefinedSignature, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePredefinedSignatureBox: function (predefinedSignature) {
                var id = predefinedSignature.id;
                delete predefinedSignature.id;
                var promise = RBTContentManagementRestangular.all('rbt/predefinedsignatures/box/' + id).customPUT(predefinedSignature, null, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            deletePredefinedSignatureBox: function (predefinedSignature) {
                var promise = RBTContentManagementRestangular.one('rbt/predefinedsignatures/box/' + predefinedSignature.id).remove(null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Special Conditions
            getSpecialConditions: function () {
                var promise = RBTContentManagementRestangular.one('rbt/specialconditions').get(null, headers);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSpecialCondition: function (id) {
                var promise = RBTContentManagementRestangular.one('rbt/specialconditions/' + id).get(null, headers);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSpecialCondition: function (specialCondition) {
                var promise = RBTContentManagementRestangular.all('rbt/specialconditions').post(specialCondition, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSpecialCondition: function (specialCondition) {
                var id = specialCondition.id;
                delete specialCondition.id;
                var promise = RBTContentManagementRestangular.all('rbt/specialconditions/' + id).customPUT(specialCondition, null, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            deleteSpecialCondition: function (specialCondition) {
                var promise = RBTContentManagementRestangular.one('rbt/specialconditions/' + specialCondition.id).remove(null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Prayer Times
            getPrayerTimes: function () {
                var deferred = $q.defer();

                var promise = RBTContentManagementRestangular.one('rbt/prayertimetones').get(null, headers);
                promise.then(function (response) {
                    deferred.resolve(response);
                }, function (response) {
                    deferred.resolve({
                        "morningToneId": null,
                        "noonToneId": null,
                        "afternoonToneId": null,
                        "eveningToneId": null,
                        "nightToneId": null
                    });
                });

                UtilService.addPromiseToTracker(deferred.promise);

                return deferred.promise;
            },
            updatePrayerTime: function (tonePayload, prayerTimeType) {
                var promise = RBTContentManagementRestangular.all('rbt/prayertimetones/' + prayerTimeType).customPUT(tonePayload, null, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            }
        }
    });

    ApplicationServices.factory('RBTSCGatewayService', function ($q, $log, $translate, notification, RBTSCGatewayRestangular, UtilService, SessionService) {
        var username = SessionService.getUsername();
        var headers = {
            'X-Channel': 'OTHER',
            'X-Username': username
        };

        return {
            showApiError: function (response) {
                var type = 'warning', message = $translate.instant('CommonMessages.GenericServerError');

                if (response) {
                    if (response.message) {
                        message = response.message;
                    } else if (response.data) {
                        if (response.data.message) {
                            message = response.data.message;
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
            getPrayerTimes: function () {
                var deferred = $q.defer();

                var promise = RBTSCGatewayRestangular.one('prayertimes/tones').get(null, headers);
                promise.then(function (response) {
                    deferred.resolve(response);
                }, function (response) {
                    deferred.resolve({
                        "morningToneId": null,
                        "noonToneId": null,
                        "afternoonToneId": null,
                        "eveningToneId": null,
                        "nightToneId": null
                    });
                });

                UtilService.addPromiseToTracker(deferred.promise);

                return deferred.promise;
            },
            updatePrayerTime: function (tonePayload, prayerTimeType) {
                var promise = RBTSCGatewayRestangular.all('prayertimes/tones/' + prayerTimeType).customPUT(tonePayload, null, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            }
        }
    });

    // Chart Drawing Services
    ApplicationServices.factory('PlotService', function ($log, $filter, UtilService) {
        return {
            getLargeDataGroupByValue: function (dataArray, mainCount) {
                dataArray = $filter('orderBy')(dataArray, ['data'], true);

                var mainArray = [];
                if (dataArray) {
                    mainArray = dataArray.slice(0, mainCount);
                    if (dataArray.length > mainCount) {
                        var othersArray = dataArray.slice(mainCount, dataArray.length + 1);
                        var otherObject = {
                            label: 'Other',
                            data: 0
                        };
                        othersArray.forEach(function (item) {
                            otherObject.data += item.data;
                        });

                        if (otherObject.data > 0) {
                            mainArray.push(otherObject);
                        }
                    }
                }

                return mainArray;
            },
            drawPie: function (holderName, data, showAll, thresholdValue, labelThresholdValue) {
                if (!labelThresholdValue) {
                    labelThresholdValue = thresholdValue;
                }

                var options = {
                    series: {
                        pie: {
                            show: true,
                            innerRadius: 0,
                            stroke: {
                                width: 1
                            },
                            offset: {
                                top: 0,
                                left: 25
                            },
                            radius: 0.9,
                            label: {
                                show: true,
                                radius: 2 / 4,
                                threshold: (!_.isUndefined(labelThresholdValue) ? labelThresholdValue : 0.10),
                                formatter: function (label, series) {
                                    return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">' + Math.round(series.percent) + '%</div>';
                                },
                                background: {
                                    opacity: 0.8
                                }
                            }
                        }
                    },
                    legend: {
                        show: true,
                        position: 'nw',
                        threshold: (!_.isUndefined(thresholdValue) ? thresholdValue : 0.10),
                        labelFormatter: function (label, series) {
                            var labelToView = $filter('limitTo')(label, 15) + (label.length > 15 ? '...' : '');
                            var labelElmId = 'legendLabel' + _.uniqueId();
                            var labelElm = $('<span>', {'id': labelElmId}).html(labelToView);

                            var title = '<span>' + label + ': ' + Math.round(series.percent) + '%</span> <span>(' + $filter('number')(series.data[0][1]) + ')</span>'

                            $(holderName).delegate('#' + labelElmId, "mouseover", function () {
                                $('.flotTip').css({
                                    'left': $(this).offset().left,
                                    'top': $(this).offset().top + 18,
                                    'background-color': series.color,
                                    'color': '#FFF',
                                    'border': '1px solid #777777'
                                }).show().html(title)
                            });

                            $(holderName).delegate('#' + labelElmId, "mouseout", function () {
                                $('.flotTip').hide().html();
                            });

                            var labelHolderElm = $('<div>').append(labelElm);

                            return labelHolderElm.html();
                        }
                    },
                    tooltip: true,
                    tooltipOpts: {
                        onHover: function (flotItem, $tooltipEl) {
                            var percent = parseFloat(flotItem.series.percent).toFixed(0);
                            var rawvalue = $filter('number')(flotItem.series.data[0][1]);
                            var label = flotItem.series.label;

                            $tooltipEl.css('background-color', flotItem.series.color);
                            $tooltipEl.css('border', '1px solid #777777');
                            $tooltipEl.css('color', '#FFF');
                            $tooltipEl.html('<span>' + label + ': ' + percent + '%</span> <span>(' + rawvalue + ')</span>');
                        }
                    },
                    grid: {
                        hoverable: true
                    },
                    colors: mvpready_core.layoutColors,
                    hooks: {
                        bindEvents: function (plot, eventHolder) {
                            eventHolder.mouseleave(function (e) {
                                plot.unhighlight();

                                $('.flotTip').hide().html();
                            });
                        }
                    }
                };

                if (!showAll) {
                    options.series.pie.combine = {
                        color: '#999',
                        threshold: (!_.isUndefined(thresholdValue) ? thresholdValue : 0.10)
                    };
                }

                var holder = $(holderName);

                // Set colors to the data sets manually to avoid to see the default white color on the pie slices.
                _.each(data, function (dataEntry, index) {
                    dataEntry.color = mvpready_core.layoutColors[index % mvpready_core.layoutColors.length];
                });

                var plot;
                if (holder.length && data.length) {
                    plot = $.plot(holder, data, options);
                }
            },
            drawDonut: function (holderName, data, showAll) {
                var options = {
                    series: {
                        pie: {
                            show: true,
                            innerRadius: .4,
                            stroke: {
                                width: 4
                            },
                            radius: 0.85
                        }
                    },
                    legend: {
                        show: false
                    },
                    tooltip: true,
                    tooltipOpts: {
                        onHover: function (flotItem, $tooltipEl) {
                            var percent = parseFloat(flotItem.series.percent).toFixed(0);
                            var rawvalue = $filter('number')(flotItem.series.data[0][1]);
                            var label = flotItem.series.label;

                            $tooltipEl.css('background-color', flotItem.series.color);
                            $tooltipEl.css('border', '1px solid #777777');
                            $tooltipEl.css('color', '#FFF');
                            $tooltipEl.html('<span>' + label + ': ' + percent + '%</span> <span>(' + rawvalue + ')</span>');
                        }
                    },
                    grid: {
                        hoverable: true
                    },
                    colors: mvpready_core.layoutColors
                };

                if (!showAll) {
                    options.series.pie.combine = {
                        color: '#999',
                        threshold: (!_.isUndefined(thresholdValue) ? thresholdValue : 0.10)
                    };
                }

                // Set colors to the data sets manually to avoid to see the default white color on the pie slices.
                _.each(data, function (dataEntry, index) {
                    dataEntry.color = mvpready_core.layoutColors[index % mvpready_core.layoutColors.length];
                });

                var holder = $(holderName);

                var plot;
                if (holder.length && data.length) {
                    plot = $.plot(holder, data, options);
                }
            }
        };
    });

    // General Elastic Search Services
    ApplicationServices.factory('GeneralESService', function ($log, $filter, ChargingGwESAdapterClient, MessagingGwESAdapterClient, ESClient, ApiManagerESClient, SessionService,
                                                              UtilService, RESOURCE_NAME) {
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
            // Service and product methods.
            // Service Subscription Manager
            findSSMHistory: function (filter, additionalFilterFields) {
                var index = 'ssm-main-read', type = 'ssm';

                // Filter these events:
                // SUBSCRIBE_TO_OFFER_SUCCESS(2), SUBSCRIBE_TO_OFFER_FAIL(3), UNSUBSCRIBE_FROM_OFFER_SUCCESS(5), UNSUBSCRIBE_FROM_OFFER_FAIL(6)
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "event": [
                                    2, 3, 5, 6
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findSSMDetailedHistory: function (subscriptionId, eventType) {
                var index = 'ssm-detail-read', type = 'ssm';
                eventType = Number(eventType); // Convert event type to number.

                // Make a decision for event types according to the main event type.
                //
                // For SUBSCRIBE_TO_OFFER_SUCCESS(2)
                // Query: CHARGING_SUCCESS(8), CHARGING_FAIL(9), RENEW_SUBSCRIPTION_SUCCESS(32), RENEW_SUBSCRIPTION_FAIL(33), PROCESS_CONFIRMATION_SUCCESS(41),
                // PROCESS_CONFIRMATION_FAIL(42), SETTING_HLR_FLAG_SUCCESS(54), SETTING_HLR_FLAG_FAILED(55), SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_SUCCESS(57),
                // SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_FAIL(58), TERMINATE_TRIAL_SUBSCRIPTION_SUCCESS(60), TERMINATE_TRIAL_SUBSCRIPTION_FAIL(61),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_GRACE(70), OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_SUSPEND(71), OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_INACTIVE(72),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_SUSPEND(73), OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_ACTIVE(74), OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_INACTIVE(75),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_ACTIVE(76), OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_INACTIVE(77), OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_GRACE(78),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_ACTIVE(79), OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_SUSPEND(80), OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_GRACE(81),
                // CLEAR_HLR_FLAG_SUCCESS(94), CLEAR_HLR_FLAG_FAIL(95)
                // PAUSE_OFFER_SUBS_SUCCESS(107), PAUSE_OFFER_SUBS_FAIL(108)
                // UNPAUSE_OFFER_SUBS_SUCCESS(110), UNPAUSE_OFFER_SUBS_FAIL(111)
                // RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129)
                //
                // For SUBSCRIBE_TO_OFFER_FAIL(3)
                // Query: CHARGING_FAIL(9), SETTING_HLR_FLAG_FAILED(55)
                //
                // For UNSUBSCRIBE_FROM_OFFER_SUCCESS(5)
                // Query: CLEAR_HLR_FLAG_SUCCESS(94), CLEAR_HLR_FLAG_FAIL(95)
                // RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129)
                //
                // For UNSUBSCRIBE_FROM_OFFER_FAIL(6)
                // Query: CLEAR_HLR_FLAG_FAIL(95)
                // RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129)
                var eventTypeTerms = {
                    "terms": {
                        "event": []
                    }
                };
                if (eventType === 2) {
                    eventTypeTerms.terms.event = [2, 8, 9, 32, 33, 41, 42, 54, 55, 57, 58, 60, 61, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 94, 95, 107, 108, 110, 111, 128, 129];
                } else if (eventType === 3) {
                    eventTypeTerms.terms.event = [3, 9, 55];
                } else if (eventType === 5) {
                    eventTypeTerms.terms.event = [5, 94, 95, 128, 129];
                } else if (eventType === 6) {
                    eventTypeTerms.terms.event = [6, 95, 128, 129];
                }

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "subscriptionId": subscriptionId
                                    }
                                },
                                eventTypeTerms
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // Content Subscription Manager
            findCSMHistory: function (filter, additionalFilterFields) {
                var index = 'ssm-main-read', type = 'ssm';

                // Filter these events:
                // SUBSCRIBE_TO_CONTENT_SUCCESS(104), SUBSCRIBE_TO_CONTENT_FAIL(105), UNSUBSCRIBE_FROM_CONTENT_SUCCESS(116), UNSUBSCRIBE_FROM_CONTENT_FAIL(117)
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "event": [
                                    104, 105, 116, 117
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findCSMDetailedHistory: function (subscriptionId, eventType) {
                var index = 'ssm-detail-read', type = 'ssm';
                eventType = Number(eventType); // Convert event type to number.

                // Make a decision for event types according to the main event type.
                //
                // For SUBSCRIBE_TO_CONTENT_SUCCESS(104)
                // Query: CHARGING_SUCCESS(8), CHARGING_FAIL(9), RENEW_SUBSCRIPTION_SUCCESS(32), RENEW_SUBSCRIPTION_FAIL(33), PROCESS_CONFIRMATION_SUCCESS(41),
                // PROCESS_CONFIRMATION_FAIL(42), SETTING_HLR_FLAG_SUCCESS(54), SETTING_HLR_FLAG_FAILED(55), SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_SUCCESS(57),
                // SUBSCRIBE_TO_OFFER_AFTER_TRIAL_PERIOD_FAIL(58), TERMINATE_TRIAL_SUBSCRIPTION_SUCCESS(60), TERMINATE_TRIAL_SUBSCRIPTION_FAIL(61),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_GRACE(70), OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_SUSPEND(71), OFFER_SUBSCRIPTION_STATE_CHANGE_ACTIVE_TO_INACTIVE(72),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_SUSPEND(73), OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_ACTIVE(74), OFFER_SUBSCRIPTION_STATE_CHANGE_GRACE_TO_INACTIVE(75),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_ACTIVE(76), OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_INACTIVE(77), OFFER_SUBSCRIPTION_STATE_CHANGE_SUSPEND_TO_GRACE(78),
                // OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_ACTIVE(79), OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_SUSPEND(80), OFFER_SUBSCRIPTION_STATE_CHANGE_INACTIVE_TO_GRACE(81),
                // CLEAR_HLR_FLAG_SUCCESS(94), CLEAR_HLR_FLAG_FAIL(95), FORCE_RENEWAL_SUCCES(96),
                // PAUSE_CONTENT_SUBS_SUCCESS(119), PAUSE_CONTENT_SUBS_FAIL(120),
                // UNPAUSE_CONTENT_SUBS_SUCCESS(122), UNPAUSE_CONTENT_SUBS_FAIL(123),
                // ACTIVATE_CONTENT_SUBS_SUCCESS(125), ACTIVATE_CONTENT_SUBS_FAIL(126),
                // RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129),
                // CONTENT_GIFT_SUCCESS(131), CONTENT_GIFT_FAIL(132),
                // RENEW_CONTENT_SUBSCRIPTION_SUCCESS(134), RENEW_CONTENT_SUBSCRIPTION_FAIL(135)
                //
                // For SUBSCRIBE_TO_CONTENT_FAIL(105)
                // Query: CHARGING_FAIL(9), SETTING_HLR_FLAG_FAILED(55)
                //
                // For UNSUBSCRIBE_FROM_CONTENT_SUCCESS(116)
                // Query: CLEAR_HLR_FLAG_SUCCESS(94), CLEAR_HLR_FLAG_FAIL(95), RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129)
                //
                // For UNSUBSCRIBE_FROM_CONTENT_FAIL(117)
                // Query: SETTING_HLR_FLAG_FAILED(95), RECEIVE_HLR_FLAG_SUCCESS(128), RECEIVE_HLR_FLAG_FAIL(129)
                var eventTypeTerms = {
                    "terms": {
                        "event": []
                    }
                };
                if (eventType === 104) {
                    eventTypeTerms.terms.event = [104, 8, 9, 32, 33, 41, 42, 54, 55, 57, 58, 60, 61, 70, 71, 72, 73, 74,
                        75, 76, 77, 78, 79, 80, 81, 94, 95, 96, 119, 120, 122, 123, 125, 126, 128, 129, 131, 132, 134, 135];
                } else if (eventType === 105) {
                    eventTypeTerms.terms.event = [105, 9, 55];
                } else if (eventType === 116) {
                    eventTypeTerms.terms.event = [116, 94, 95, 128, 129];
                } else if (eventType === 117) {
                    eventTypeTerms.terms.event = [117, 95, 128, 129];
                }

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "subscriptionId": subscriptionId
                                    }
                                },
                                eventTypeTerms
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // API Manager
            findAPIManagerHistory: function (filter, additionalFilterFields) {
                var index = 'apigw-edr-main-read', type = 'trx';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'trxTimestamp', additionalFilterFields);

                return findHistoryRecords(ApiManagerESClient, index, type, filter, bodyPayload);
            },
            findAPIManagerDetailedHistory: function (transactionId) {
                var index = 'apigw-edr-detail-read', type = 'trx';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "transactionId": transactionId
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ApiManagerESClient, index, type, filter, payload);
            },
            // Bulk Messaging Service
            findBMSHistory: function (filter, additionalFilterFields) {
                var index = 'smartads-jobdetail-read', type = 'jobdetail';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "jobStatus": [9] // INITIAL(9)
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'transactionTimestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findBMSDetailedHistory: function (jobId) {
                var index = 'smartads-jobdetail-read', type = 'jobdetail';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "jobId": jobId
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // Charging Gw
            findChargingGwRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = '';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields);

                return findHistoryRecords(ChargingGwESAdapterClient, index, type, filter, bodyPayload);
            },
            // Dcb
            findDcbRecords: function (filter, additionalFilterFields) {
                var index = 'dcb-charge-read', type = 'dcb-charge';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'chargeDate', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findDcbRefundHistory: function (chargeUuid) {
                var index = 'dcb-refund-read', type = 'dcb-refund';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "chargeUuid": chargeUuid
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
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

                if (additionalFilterFields.resourceType === 'CAMPAIGN') {
                    termFilterJSON.must.push({
                        "terms": {
                            "resourceType": ['CAMPAIGN_SMS', 'CAMPAIGN_MMS', 'CAMPAIGN_IVR', 'INTERACTIVE_CAMPAIGN_SMS', 'INTERACTIVE_CAMPAIGN_IVR', 'INTERACTIVE_CAMPAIGN_FAST_KEY']
                        }
                    });

                    delete additionalFilterFields.resourceType;
                }

                if (additionalFilterFields.resourceType === 'RBT') {
                    termFilterJSON.must.push({
                        "terms": {
                            "resourceType": ['RBT_CATEGORY', 'RBT_MOOD', 'RBT_TONE', 'RBT_ARTIST', 'RBT_ALBUM']
                        }
                    });

                    delete additionalFilterFields.resourceType;
                }

                if (additionalFilterFields.resourceId) {
                    termFilterJSON.should = [
                        {
                            "term": {
                                "partnerId": additionalFilterFields.resourceId
                            }
                        },
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
                                "campaignId": additionalFilterFields.resourceId
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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields);

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

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields);

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
            },
            // Screening Manager
            findScreeningManagerHistory: function (filter, additionalFilterFields) {
                var index = 'screeningmanager-read', type = 'rest';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Alarm Logs
            findAlarmLogs: function (filter, additionalFilterFields) {
                var index = 'alarm-read', type = 'alarm';

                var termFilterJSON = {
                    "must": []
                };

                var filterType = filter.type;
                var filterSeverity = filter.severity;

                if (filterType !== 'ALL') {
                    termFilterJSON.must.push({
                        "term": {
                            "type": filterType
                        }
                    });
                }

                if (filterSeverity !== 'ALL') {
                    termFilterJSON.must.push({
                        "term": {
                            "severity": filterSeverity
                        }
                    });
                }

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Audit Logs
            findAuditLogs: function (filter, additionalFilterFields) {
                var index = 'a3gw-read', type = 'auditlog';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "method": ["PUT", "POST", "DELETE"]
                            }
                        }
                    ],
                    "must_not": [
                        {
                            "exists": {
                                "field": "status"
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findAuditLogsDetailedHistory: function (transactionId) {
                var index = 'a3gw-read', type = 'auditlog';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "transactionId": transactionId
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            }
        };
    });

    ApplicationServices.factory('PentahoApiService', function ($q, $log, $filter, $locale, $translate, PentahoApiRestangular, UtilService, DateTimeConstants, DAYS_OF_WEEK) {
        var simplePostToJob = function (jobId, operationKey) {
            var bodyPayload = {
                "jobId": jobId
            };

            var promise = PentahoApiRestangular.all('scheduler/' + operationKey).post(bodyPayload);
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var isAuthenticated = function () {
            var promise = PentahoApiRestangular.one('mantle/isAuthenticated').get();
            UtilService.addPromiseToTracker(promise);

            var deferred = $q.defer();
            promise.then(function (response) {
                deferred.resolve();
            }, function (response) {
                deferred.resolve();
            });

            UtilService.addPromiseToTracker(deferred.promise);

            return deferred.promise;
        };

        return {
            USERNAME: 'csp',
            OUTPUT_FILE: '/home/scheduled',
            jobTriggerHumanReadable: function (jobTrigger) {
                var triggerHumanReadable;

                var startDateStr = $filter('date')(jobTrigger.startTime, 'HH:mm:ss', DateTimeConstants.OFFSET);

                if (jobTrigger['@type'] === 'complexJobTrigger') {
                    if (jobTrigger.uiPassParam === 'CRON') {
                        triggerHumanReadable = 'CRON: ' + jobTrigger.cronString;
                    } else {
                        // Prepare common qualifiers and recurrences
                        var dayOfWeekStr, qualifier;
                        if (jobTrigger.dayOfWeekRecurrences) {
                            if (jobTrigger.dayOfWeekRecurrences.qualifiedDayOfWeek) {
                                var dayOfWeek = jobTrigger.dayOfWeekRecurrences.qualifiedDayOfWeek.dayOfWeek;
                                var day = _.findWhere(DAYS_OF_WEEK, {shortKey: dayOfWeek});
                                dayOfWeekStr = day.text;

                                qualifier = jobTrigger.dayOfWeekRecurrences.qualifiedDayOfWeek.qualifier.toLowerCase();
                            } else if (jobTrigger.dayOfWeekRecurrences.recurrenceList) {
                                var dayStrArr = [];
                                _.each(jobTrigger.dayOfWeekRecurrences.recurrenceList.values, function (value) {
                                    var day = _.findWhere(DAYS_OF_WEEK, {id: Number(value)});
                                    var dayText = $translate.instant(day.text);
                                    dayStrArr.push(dayText);
                                });

                                dayOfWeekStr = dayStrArr.join(', ');
                            }
                        }
                        var dayNumberStr;
                        if (jobTrigger.dayOfMonthRecurrences) {
                            dayNumberStr = jobTrigger.dayOfMonthRecurrences.recurrenceList.values[0];
                        }
                        var monthOfYearStr;
                        if (jobTrigger.monthlyRecurrences) {
                            var monthId = jobTrigger.monthlyRecurrences.recurrenceList.values[0];
                            monthOfYearStr = $locale.DATETIME_FORMATS.MONTH[Number(monthId) - 1];
                        }

                        // Check job types and compile the words.
                        if (jobTrigger.uiPassParam === 'DAILY') {
                            if (jobTrigger.dayOfWeekRecurrences) {
                                triggerHumanReadable = 'Every weekday at ' + startDateStr;
                            }
                        } else if (jobTrigger.uiPassParam === 'WEEKLY') {
                            if (jobTrigger.dayOfWeekRecurrences) {
                                triggerHumanReadable = 'Every ' + dayOfWeekStr + ' at ' + startDateStr;
                            }
                        } else if (jobTrigger.uiPassParam === 'MONTHLY') {
                            if (jobTrigger.dayOfMonthRecurrences) {
                                triggerHumanReadable = 'Day ' + dayNumberStr + ' of every month at ' + startDateStr;
                            } else {
                                triggerHumanReadable = 'The ' + qualifier + ' ' + dayOfWeekStr + ' of every month at ' + startDateStr;
                            }
                        } else if (jobTrigger.uiPassParam === 'YEARLY') {
                            if (jobTrigger.dayOfMonthRecurrences) {
                                triggerHumanReadable = 'Every ' + monthOfYearStr + ' ' + dayNumberStr + ' at ' + startDateStr;
                            } else {
                                triggerHumanReadable = 'The ' + qualifier + ' ' + dayOfWeekStr + ' of ' + monthOfYearStr + ' at ' + startDateStr;
                            }
                        }
                    }
                } else {
                    // jobTrigger.repeatInterval value is a second value.
                    if (jobTrigger.uiPassParam === 'RUN_ONCE') {
                        triggerHumanReadable = 'Run Once';
                    } else if (jobTrigger.uiPassParam === 'SECONDS') {
                        triggerHumanReadable = 'Every ' + jobTrigger.repeatInterval + ' seconds'
                    } else if (jobTrigger.uiPassParam === 'MINUTES') {
                        var minutes = (Number(jobTrigger.repeatInterval) / 60);
                        triggerHumanReadable = 'Every ' + minutes + ' minutes'
                    } else if (jobTrigger.uiPassParam === 'HOURS') {
                        var hours = (Number(jobTrigger.repeatInterval) / 60 / 60);
                        triggerHumanReadable = 'Every ' + hours + ' hours'
                    } else if (jobTrigger.uiPassParam === 'DAILY') {
                        var days = (Number(jobTrigger.repeatInterval) / 24 / 60 / 60);
                        triggerHumanReadable = 'Every ' + days + ' days'
                    }

                    triggerHumanReadable = triggerHumanReadable + ' at ' + startDateStr;
                }

                if (_.isEmpty(triggerHumanReadable)) {
                    return '-';
                } else {
                    return triggerHumanReadable;
                }
            },
            // Restful API Methods
            getJobs: function () {
                return isAuthenticated().then(function (response) {
                    var promise = PentahoApiRestangular.one('scheduler/getJobs').get();
                    UtilService.addPromiseToTracker(promise);

                    return promise;
                });
            },
            pauseJob: function (jobId) {
                return isAuthenticated().then(function (response) {
                    return simplePostToJob(jobId, 'pauseJob');
                });
            },
            resumeJob: function (jobId) {
                return isAuthenticated().then(function (response) {
                    return simplePostToJob(jobId, 'resumeJob');
                });
            },
            removeJob: function (jobId) {
                var bodyPayload = {
                    "jobId": jobId
                };

                return isAuthenticated().then(function (response) {
                    var promise = PentahoApiRestangular.one('scheduler/removeJob').customOperation('remove', null, {}, {'Content-Type': 'application/json'}, bodyPayload);
                    UtilService.addPromiseToTracker(promise);

                    return promise;
                });
            },
            createJob: function (payload) {
                return isAuthenticated().then(function (response) {
                    var promise = PentahoApiRestangular.all('scheduler/job').post(payload);
                    UtilService.addPromiseToTracker(promise);

                    return promise;
                });
            }
        };
    });

    // Reporting related services.
    ApplicationServices.factory('ReportsService', function ($log, ReportsRestangular, UtilService) {
        return {
            // Invoicing Methods
            getInvoices: function (reportingWindow) {
                var promise = ReportsRestangular.one('invoices/v1/' + reportingWindow).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getInvoice: function (reportingWindow, id) {
                var promise = ReportsRestangular.one('invoices/v1/' + reportingWindow + '/' + id + '?invoice-state=All').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateInvoice: function (reportingWindow, id, invoice) {
                var promise = ReportsRestangular.all('invoices/v1/' + reportingWindow + '/' + id).customPUT(invoice);
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });

})();
