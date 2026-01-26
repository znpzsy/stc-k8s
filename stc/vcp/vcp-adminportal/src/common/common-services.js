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
            SESSION_KEY: '_sa_stc_vcp_a_sk',
            USERNAME_KEY: '_sa_stc_vcp_a_un',
            SITE_INFORMATION_KEY: '_sa_stc_vcp_a_si',
            SITE_CONFIGURATION_KEY: '_sa_stc_vcp_a_sc',
            LATEST_STATE: '_sa_stc_vcp_a_lst',
            USER_RIGHTS: '_sa_stc_vcp_a_ur',
            RBT_STC_ORGANIZATION_KEY: '_sa_stc_vcp_a_rbtok',
            USER_ORGANIZATION_KEY: '_sa_stc_vcp_a_uok',
            USER_ORGANIZATION_ID_KEY: '_sa_stc_vcp_a_uoik',
            USER_ORGANIZATION_NAME_KEY: '_sa_stc_vcp_a_onk',
            USER_GROUPS_KEY: '_sa_stc_vcp_a_ugk',
            USER_ACCOUNT_KEY: '_sa_stc_vcp_a_uak',
            USER_ADMIN_KEY: '_sa_stc_vcp_a_ua',
            USER_BMS_ADMIN_KEY: '_sa_stc_vcp_a_uba',
            USER_MM_SIMOTA_ID_KEY: '_sa_stc_vcp_a_mm_sri',
            USER_MM_DMC_ID_KEY: '_sa_stc_vcp_a_mm_dri',
            // Created with this command: node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
            // Key for app data
            FREDERIC_CHOPIN: "c18e5b1d6987464f18a5e5c8e29ff14cc37ce8eb7d8f34f4793a9e24169b16d3",
            // Keys for 3rd party apps (Metamorfoz DMC & SIMOTA) // Shared, do not change
            JOHANN_SEBASTIAN_BACH: "c18e5b1d6987464f18a5e5c8e29ff14cc37ce8eb7d8f34f4793a9e24169b16d3",
            RICHARD_GEORG_STRAUSS: "2ad622f367ff5d4535ef065a35f7760c", // randomBytes(16), AES-128 enc
            Validators: {
                Msisdn: /^[0-9]{0,15}$/,
                ValidSubscriberMsisdn: /^(966){1}[0-9]{8,15}$/,
                InternationalPhoneNumber: /^(\+){0,1}[0-9]{0,15}$/,
                ValidPhoneNumber: /^(966){1}[0-9]{0,15}$/,
                ScreeningListValidPhoneNumber: /^[0-9]{1,30}(\*){0,1}$/,
                ScreeningListValidNumericRange: /^[0-9]{1,30}-[0-9]{1,30}$/,
                ScreeningListValidAlphanumericRange: /^[a-zA-Z0-9]{1,30}-[a-zA-Z0-9]{1,30}$/,
                UrlSimple: /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/,
                IntegerNumber: /^[0-9]+$/,
                Alphanumeric: /^[a-zA-Z0-9]+$/,
                AlphanumericWithSpace: /^[a-zA-Z0-9\s]+$/,
                UserPassword: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.\-_*])([a-zA-Z0-9@#$%^&+=*.\-_]){8,}$/
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
            getTomorrow:function() {
                return moment().add(1, 'days');
            },
            calculateDate: function (date, hour, minute) {
                var dateObj = new Date(date);
                dateObj.setHours(hour, minute, 0, 0);
                return dateObj;
            },
            showDummySpinner: function () {
                cfpLoadingBar.start();
                cfpLoadingBar.inc();
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
                    var bytes = CryptoJS.AES.decrypt(objectCipherText, this.FREDERIC_CHOPIN);
                    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

                    return decryptedData;
                } catch (error) {
                    return {};
                }
            },
            putToSessionStore: function (key, object) {
                var jsonStringOfObj = JSON.stringify(object);

                // Encrypt
                var objectCipherText = CryptoJS.AES.encrypt(jsonStringOfObj, this.FREDERIC_CHOPIN);

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
            generateRandomHex: function (len) {
                var random = CryptoJS.lib.WordArray.random(len);
                return CryptoJS.enc.Hex.stringify(random);
            },
            getRandomString: function (len) {
                var allowed = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~!@#$%^&*()_+";
                return allowed.split("").sort(function () { return Math.random() - Math.random(); }).join("").substr(0, len || 16);
            },
            // Secret Key Derivation for AES-256
            deriveKey: function (secretKey, salt) {
                return CryptoJS.PBKDF2(secretKey, salt, {
                    keySize: 256 / 32, // keySize is in words, 1 word = 4 bytes, so divide by 32 to get keySize in bytes
                    iterations: 1000
                });
            },
            encryptAES128: function (plainText, secretKey, iv) {
                // parse as UTF-8
                secretKey = CryptoJS.enc.Utf8.parse(secretKey);
                iv = CryptoJS.enc.Utf8.parse(iv);

                var ciphertext = CryptoJS.AES.encrypt(plainText, secretKey, {
                    iv: iv,
                    padding: CryptoJS.pad.Pkcs7,
                    mode: CryptoJS.mode.CBC
                }).toString();
                return ciphertext;
            },
            decryptAES128: function (encryptedText, secretKey, iv) {
                // parse as UTF-8 !!!
                secretKey = CryptoJS.enc.Utf8.parse(secretKey);
                iv = CryptoJS.enc.Utf8.parse(iv);

                var bytes = CryptoJS.AES.decrypt(encryptedText, secretKey, {
                    iv: iv,
                    padding: CryptoJS.pad.Pkcs7,
                    mode: CryptoJS.mode.CBC,
                });
                var originalText = bytes.toString(CryptoJS.enc.Utf8);
                return originalText;
            },
            encryptAES256: function (plainText, secretKey, salt, iv) {

                iv = CryptoJS.enc.Utf8.parse(iv);
                secretKey = CryptoJS.enc.Utf8.parse(secretKey);

                var key = CryptoJS.PBKDF2(secretKey, salt, { keySize: 256 / 32, iterations: 1000 });
                var encryptedText = CryptoJS.AES.encrypt(plainText, key, { iv: iv });

                return (encryptedText.ciphertext).toString(CryptoJS.enc.Base64);
            },
            decryptAES256: function (encryptedText, secretKey, salt, iv) {

                iv = CryptoJS.enc.Utf8.parse(iv);
                secretKey = CryptoJS.enc.Utf8.parse(secretKey);

                var key = CryptoJS.PBKDF2(secretKey, salt, { keySize: 256 / 32, iterations: 1000 });
                var rawData = CryptoJS.enc.Base64.parse(encryptedText);
                var decryptedText = CryptoJS.AES.decrypt({ ciphertext: rawData }, key, { iv: iv });
                return decryptedText.toString(CryptoJS.enc.Utf8);
            },
            // METAMORFOZ APPS
            getDataObject: function (mmApp) {
                var mmToken = {
                    credentials: this.getFromSessionStore(this.USERNAME_KEY) + ':constantValue',
                    roleId: (mmApp === 'SIMOTA') ? this.getFromSessionStore(this.USER_MM_SIMOTA_ID_KEY) : this.getFromSessionStore(this.USER_MM_DMC_ID_KEY),
                    timestamp: new Date().getTime()
                };
                //$log.debug('MM Token: ', mmToken, 'MM App: ', mmApp);
                return mmToken;

            },
            // Encrypts in AES-256
            getRedirectUrl: function(mmApp){

                // prepare data object & stringify
                var sensitiveData = this.getDataObject(mmApp);
                var appData = JSON.stringify(sensitiveData);

                // secret, salt and initVector generation
                var secretKey = this.JOHANN_SEBASTIAN_BACH; // Shared secret, do not change, must be same in the 3rdParty App.
                var salt = this.generateRandomHex(16);
                var iv = this.generateRandomHex(8);
                // $log.debug('initVector:', iv, 'Salt:', salt, 'Secret:', secretKey);

                // Encrypt sensitive data using AES-256 with derived key.
                var encryptedData = this.encryptAES256(appData, secretKey, salt, iv);

                // Pass salt & IV separately in addition to encrypted app data, in base64 encoding
                var base64params = (salt + ":" + encryptedData + ":" + iv).toString(CryptoJS.enc.Base64);

                // URL encoding
                var urlParams = encodeURIComponent(base64params);

                // Construct the URL with encrypted data
                var url = '';
                var serverConfiguration = this.getFromSessionStore(this.SITE_CONFIGURATION_KEY);

                if(mmApp === 'SIMOTA'){
                    url = serverConfiguration.SIMOTARedirectUri + 'appData?data=' + urlParams;
                } else {
                    url = serverConfiguration.DMCRedirectUri + '?data=' + urlParams;
                }
                //var url = 'http://www.metamorfoz.com.tr/appData?data=' + urlParams;
                // $log.debug('Encoded & AES-256 Encrypted URL:', url);

                // /!* Decryption Steps *!/
                // // Decode Uri component to get base64encoded, encrypted app data & decryption params.
                // var decodedUriComponent = decodeURIComponent(urlParams);
                // $log.debug('Decoded URI Component:', decodedUriComponent);
                //
                // // Split the string into an array using ":" as the delimiter
                // var paramsArray = decodedUriComponent.split(":");
                //
                // // paramsArray will now be an array containing the individual parameters
                // var saltParam = paramsArray[0];
                // var encryptedDataParam = paramsArray[1];
                // var ivParam = paramsArray[2];
                //
                // // Decrypt the data using the secret key, salt and iv
                // var decryptedData = this.decryptAES256(encryptedDataParam, secretKey, saltParam, ivParam);
                // $log.debug("UtilService Decrypts App Data: " + decryptedData);
                //
                // // Parse the decrypted JSON data
                // var decryptedObject = JSON.parse(decryptedData);
                //
                // // Extract user credentials, role, and timestamp from the decrypted data
                // var userCredentials = decryptedObject.credentials;
                // var role = decryptedObject.roleId;
                // var timestamp = decryptedObject.timestamp;
                //
                // $log.debug('Decrypted User Credentials:', userCredentials);
                // $log.debug('Decrypted Role:', role);
                // $log.debug('Timestamp:', timestamp);

                return url;
            },
            generateObjectId: function () {
                return (new ObjectId()).toString();
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
                UtilService.showDummySpinner();

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

    ApplicationServices.factory('NgTableService', function ($log, $translate) {
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
            getUserAccount: function () {
                var userAccount = UtilService.getFromSessionStore(UtilService.USER_ACCOUNT_KEY);

                return userAccount;
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
            setDefaultRBTOrganization: function (organization) {
                UtilService.putToSessionStore(UtilService.RBT_STC_ORGANIZATION_KEY, organization);
            },
            getDefaultRBTOrganization: function () {
                return UtilService.getFromSessionStore(UtilService.RBT_STC_ORGANIZATION_KEY);
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
            getSiteInformation: function () {
                var siteInformation = UtilService.getFromSessionStore(UtilService.SITE_INFORMATION_KEY);

                return siteInformation;
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
                    $window.location.href = 'app.html#!/login';
                    $window.location.reload(true);
                }, 0);
            },
            cleanValues: function () {
                UtilService.removeFromSessionStore(UtilService.SESSION_KEY);
                UtilService.removeFromSessionStore(UtilService.USERNAME_KEY);
                UtilService.removeFromSessionStore(UtilService.SITE_INFORMATION_KEY);
                UtilService.removeFromSessionStore(UtilService.SITE_CONFIGURATION_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_RIGHTS);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_ID_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ORGANIZATION_NAME_KEY);

                UtilService.removeFromSessionStore(UtilService.USER_GROUPS_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ACCOUNT_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_ADMIN_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_BMS_ADMIN_KEY);

                UtilService.removeFromSessionStore(UtilService.USER_MM_SIMOTA_ID_KEY);
                UtilService.removeFromSessionStore(UtilService.USER_MM_DMC_ID_KEY);

                UtilService.removeFromSessionStore(UtilService.RBT_STC_ORGANIZATION_KEY);
            },
            sessionInvalidate: function () {
                delete $http.defaults.headers.common.Authorization;

                this.cleanValues();
            },
            // DSP

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
            requestServerConfiguration: function (promiseTracker) {
                var promise = ServerConfigurationRestangular.one('server.json?' + UtilService.getCurrentNanoTime()).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
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
    ApplicationServices.factory('SSMSubscribersService', function ($log, UtilService, SSMSubscriptionsRestangular, SSMCampaignsRestangular, SSMMobilySubscribersRestangular, SSMMobilyQuerySubscribersRestangular,
                                                                   CSSMSubscriptionsContentRestangular, CSSMSubscriptionsQueryRestangular) {
        var headers = {
            'Channel': 'ADMINPORTAL'
        };

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
            getSubscriber: function (msisdn) {
                var promise = SSMSubscriptionsRestangular.one('/subscribers/' + msisdn).get();
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
                var promise = SSMSubscriptionsRestangular.all('/subscribers/').customPUT(subscriber);

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
            getOfferSubscriptionsForSubscriber: function (msisdn) {
                // Retrieve Data over 9092 - apis/v1/subscribers/{msisdn}?filterInactive=false&returnSubscriptionType=OFFER
                var uri = '/subscribers/' + msisdn + '?filterInactive=false&returnSubscriptionType=OFFER';
                var promise = SSMSubscriptionsRestangular.one(uri).get();

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
            },
            getContentSubscriptionsForSubscriber: function (msisdn) {
                var uri = '/subscribers/' + msisdn + '?filterInactive=false&returnSubscriptionType=CONTENT';
                var promise = SSMSubscriptionsRestangular.one(uri).get();

                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // Subscription Details - (Primarily used by MCN)
            getMCNSubscriptionDetailByMsisdn: function (msisdn) {
                var promise = SSMSubscriptionsRestangular.one('/subscriptions/offer/' + msisdn + '?filterInactive=true&offerName=MawjoodExtra').get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMCNSubscriptionDetailByMsisdn: function (msisdn, subscription) {
                var promise = SSMSubscriptionsRestangular.one('/subscriptions/offer/').customPUT(subscription);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // Campaigns
            getCampaignContentList: function (campaignId) {
                var promise = SSMCampaignsRestangular.one('/xDaysFree/' + campaignId).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createCampaignContentList: function (payload) {
                var promise = SSMCampaignsRestangular.all('/xDaysFree/').post(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            updateCampaignContentList: function (payload) {
                var promise = SSMCampaignsRestangular.all('/xDaysFree/').customPUT(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            deleteCampaignContentList: function (campaignId) {
                var promise = SSMCampaignsRestangular.one('/xDaysFree/' + campaignId).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
        }
    });

    // CMFP Services
    ApplicationServices.factory('CMPFService', function ($log, $q, $filter, notification, $translate, DateTimeConstants, UtilService, SessionService, CMPFAuthRestangular,
                                                         CMPFRestangular, BATCH_SIZE, DEFAULT_REST_QUERY_LIMIT) {
        return {
            DEFAULT_ORGANIZATION_NAME: "Operator",
            // Subscriber related profiles
            SUBSCRIBER_PROFILE_NAME: 'SubscriberProfile',
            // User related profiles
            USER_PROFILE_NAME: 'UserProfile',
            USER_ACTIVITY_PROFILE_NAME : 'UserActivityPolicy',
            RELATED_RESOURCES: ['VCP Admin Portal', 'VCP Customer Care Portal', 'VCP Partner Portal'],
            // Service related profiles
            SERVICE_PROFILE_NAME: 'ServiceProfile',
            // Offer related profiles
            OFFER_TEMPLATE_NAME: "OfferTemplate",
            ENTITY_I18N_PROFILE: "Entityi18nProfile",
            XSM_CHARGING_PROFILE: "XsmChargingProfile",
            XSM_OFFER_PROFILE: "XsmOfferProfile",
            XSM_RENEWAL_PROFILE: "XsmRenewalProfile",
            XSM_TRIAL_PROFILE: "XsmTrialProfile",
            PRICE_GROUP_PROFILE: "PriceGroupProfile",
            OFFER_PROFILE: "OfferProfile",
            // Organization related profiles
            USSD_CODE_PROFILE_NAME: 'USSDCorporateCode',

            // -------------- DSP RELATED CONSTANTS - START --------------
            //DEFAULT_ORGANIZATION_NAME: "STC",
            DEFAULT_RBT_ORGANIZATION_NAME: "STC",
            // Organization names
            DEFAULT_CHANNELS_ORGANIZATION_NAME: "STC Channels",
            DEFAULT_SERVICE_CATEGORIES_ORGANIZATION_NAME: "STC Service Categories",
            DEFAULT_SERVICE_LABELS_ORGANIZATION_NAME: "STC Service Labels",
            DEFAULT_SERVICE_TYPES_ORGANIZATION_NAME: "STC Service Types",
            DEFAULT_SETTLEMENT_TYPES_ORGANIZATION_NAME: "STC Settlement Types",
            DEFAULT_AGREEMENTS_ORGANIZATION_NAME: "STC Agreements",
            DEFAULT_BUSINESS_TYPES_ORGANIZATION_NAME: "STC Business Types",
            DEFAULT_PROJECTS_ORGANIZATION_NAME: "STC Projects",
            DEFAULT_DEPARTMENTS_ORGANIZATION_NAME: "STC Departments",
            DEFAULT_TEAMS_ORGANIZATION_NAME: "STC Teams",
            DEFAULT_SHORT_CODES_ORGANIZATION_NAME: "STC Short Codes",
            DEFAULT_REVENUE_RANGES_ORGANIZATION_NAME: "STC Revenue Ranges",
            DEFAULT_DCB_SETTINGS_ORGANIZATION_NAME: "STC DCB Settings",
            DEFAULT_SETTLEMENT_GL_CODES_ORGANIZATION_NAME: "STC Settlement GL Codes",
            DEFAULT_CUSTOMER_PROFILES_ORGANIZATION_NAME: "STC Customer Profiles",
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
            ORGANIZATION_CUSTOMER_PROFILING_PROFILE: 'CustomerProfilingProfile',

            // Service provider related profiles
            SERVICE_PROVIDER_ADDRESS_PROFILE: 'ProviderAddressProfile',
            SERVICE_PROVIDER_ALLOWED_CATEGORY_PROFILE: "ProviderAllowedCategoryProfile",
            SERVICE_PROVIDER_COMMON_PROFILE: 'ProviderCommonProfile',
            SERVICE_PROVIDER_CONTACTS_PROFILE: 'ProviderContactsProfile',
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
            // RBT
            SERVICE_RBT_CONTENT_OFFER_ID : 101,
            // Offer related profiles
            OFFER_I18N_PROFILE: "Offeri18nProfile",

            SMS_PORTAL_I18N_PROFILE: "SMSPortali18nProfile",
            OFFER_ELIGIBILITY_PROFILE: "OfferEligibilityProfile",
            SUBSCRIPTION_RENEWAL_NOTIFICATION_PROFILE: "SubscriptionRenewalNotificationProfile",
            BUNDLE_OFFER_PROFILE: "BundleOfferProfile",
            REVSHARE_BUNDLE_NAME: "STC",
            OTHER_BUNDLE_NAME: "FTTH",
            OFFER_BUNDLING_PROFILE: "OfferBundlingProfile",
            OFFER_BUNDLING_REVSHARE_PROFILE: "OfferBundlingRevshareProfile",
            // Profile definition or orphan profile names
            SERVICE_UI_CATEGORIES_PROFILE: "ServiceUICategories",
            SERVICE_REPORTING_CATEGORIES_PROFILE: "ServiceReportingCategories",
            OFFER_CATEGORIES_PROFILE: "OfferCategories",
            OFFER_HAPPY_HOUR_CAMPAIGN_PROFILE: "HappyHourCampaignProfile",
            OFFER_BOGOF_CAMPAIGN_PROFILE: "BuyOneGetOneFreeCampaignProfile",
            OFFER_CONTENT_SUBSCRIPTION_POLICY_PROFILE:"ContentSubscriptionPolicyProfile",
            PACKAGE_LIST_PROFILE: "PackageListProfile",
            // User related profiles and definitions
            //USER_PROFILE_NAME: 'UserProfile',
            USER_REPORT_TEMPLATE_PROFILE: 'UserReportTemplateProfile',
            // RELATED_RESOURCES: ['DSP Admin Portal', 'DSP Partner Portal', 'DSP Customer Care Portal'],
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
            VCP_ADMIN_GROUP: 'VCP Admin',

            ERROR_CODES: {
                DUPLICATE_USER_NAME: 5025801
            },
            // -------------- DSP RELATED CONSTANTS - END --------------
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
                        attrArray = originalProfile.attributes ? originalProfile.attributes : [];
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
            getAllOrganizations: function (offset, limit, withProfile) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit;
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getAllOrganizationsCustom: function (withchildren, withprofiles, resultProfileDefNames, offset, limit) {
                var _self = this;
                var mainDeferred = $q.defer();
                var deferred = $q.defer();
                offset = offset || 0;
                limit = (limit === null || limit === undefined) ? BATCH_SIZE : limit;


                _self.getOrganizations(offset, limit, withchildren, withprofiles, resultProfileDefNames).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < limit) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = limit; offset < firstResponse.metaData.totalCount; offset = offset + limit) {
                                promises.push(_self.getOrganizations(offset, limit, withchildren, withprofiles, resultProfileDefNames));
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
                }, function (response) {
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
            getAllOrganizationsByType: function (offset, limit, types, withProfile, promiseTracker) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&type=' + types;
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getAllOrganizationsByName: function (offset, limit, name, withprofile) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&name=%25' + name + '%25';
                if (withprofile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getAllOrganizationsByExactName: function (offset, limit, name, promiseTracker) {
                var url = 'organizations?withprofiles=true&offset=' + offset + '&limit=' + limit + '&name=' + name;

                var promise = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
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

            // DSP checks for batchsize, if total count exceeds batchsize, queries whole records in batches.
            getOrganizations: function (offset, limit, withchildren, withprofiles, resultProfileDefNames, promiseTracker) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&withchildren=' + (withchildren ? withchildren : false) + '&withprofiles=' + (withprofiles ? withprofiles : false);

                // Add the profile names as comma separated string to get the response only with the specified profile names.
                if (resultProfileDefNames && resultProfileDefNames.length > 0) {
                    url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
                }

                var prom = CMPFRestangular.one(url).get();

                return prom;
            },

            getAllOperatorsAndVirtualOperators: function (offset, limit, withProfile) {
                var url = 'organizations?offset=' + offset + '&limit=' + limit + '&type=NetworkOperator,VirtualOperator';
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
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

            getOperator: function (id, withProfile) {
                var url = 'networkoperators/' + id + '?withprofiles=true&withchildren=true';
                if (withProfile) {
                    url += '?withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },

            // DSP Only Network Operators
            getAllOperators: function (offset, limit, withchildren, withprofiles, resultProfileDefNames) {
                var _self = this;
                var mainDeferred = $q.defer();
                var deferred = $q.defer();

                _self.getOperators(offset, limit, withchildren, withprofiles, resultProfileDefNames).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < limit) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = limit; offset < firstResponse.metaData.totalCount; offset = offset + limit) {
                                promises.push(_self.getOperators(offset, limit, withchildren, withprofiles, resultProfileDefNames));
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
            getAllOperatorsCustom: function (withchildren,withprofiles,resultProfileDefNames) {
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
                }, function (response) {
                    deferred.reject(response);
                });

                // Listen the inner promise and prepare the main deferred response.
                deferred.promise.then(function (response) {
                    var filteredOrganizations = _.filter(response.networkOperators, function (organization) {
                        // OperatorProfile
                        var operatorProfiles = _self.getProfileAttributes(organization.profiles, _self.OPERATOR_PROFILE);
                        if (operatorProfiles.length > 0) {
                            $log.debug("isIternal:",operatorProfiles[0].IsInternal );
                            console.log("isIternal:",operatorProfiles[0].IsInternal);
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
            getOperatorsCustom: function (offset, limit, withchildren, withprofiles, resultProfileDefNames, promiseTracker) {
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
            getOperatorCustom: function (id, withProfile) {
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
            // Partners
            getAllPartners: function (offset, limit, withProfile, promiseTracker) {
                var url = 'partners?offset=' + offset + '&limit=' + limit;
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getPartners: function (offset, limit, promiseTracker) {
                return this.getAllPartners(offset, limit, true, promiseTracker);
            },
            getPartner: function (id) {
                var prom = CMPFRestangular.one('partners/' + id + '?withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getServicesOfPartner: function (id, offset, limit) {
                var prom = CMPFRestangular.one('partners/' + id + '/services?offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
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
            getUserAccounts: function (offset, limit, withProfile, promiseTracker) {
                var url = 'useraccounts?withchildren=true&offset=' + offset + '&limit=' + limit;
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getUserAccountsCustom: function (offset, limit, withchildren, withprofiles) {
                var url = 'useraccounts?offset=' + offset + '&limit=' + limit +
                    '&withchildren=' + (withchildren ? withchildren : false) +
                    '&withprofiles=' + (withprofiles ? withprofiles : false);

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom);

                return prom;
            },
            getUserAccountsByName: function (offset, limit, name, promiseTracker) {
                var prom = CMPFRestangular.one('useraccounts?withchildren=true&offset=' + offset + '&limit=' + limit + '&name=%25' + name + '%25').get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getUserAccount: function (id, withProfile, promiseTracker) {
                var url = 'useraccounts/' + id + '?withchildren=true';
                if (withProfile) {
                    url += '&withprofiles=true';
                }

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getUserAccountRights: function (id) {
                var promise = CMPFRestangular.one('useraccounts/' + id + '/rights').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getUserAccountGroups: function (userId, withchildren, withprofiles) {
                var promise = CMPFRestangular.one('useraccounts/' + userId + '/usergroups?withchildren=' + withchildren + '&withprofiles=' + withprofiles).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // DSP differs, gets with children by default and specifies offset & limit
            getUserAccountGroupsCustom: function (id, offset, limit) {
                var prom = CMPFRestangular.one('useraccounts/' + id + '/usergroups?withchildren=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
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
            getUserGroups: function (offset, limit, promiseTracker) {
                var prom = CMPFRestangular.one('usergroups?withchildren=true&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getUserGroup: function (id) {
                var prom = CMPFRestangular.one('usergroups/' + id).get();
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
            // Services
            getServices: function (offset, limit, withchildren, withprofiles, promiseTracker) {
                var prom = CMPFRestangular.one('services?withchildren=' + withchildren + '&withprofiles=' + withprofiles + '&offset=' + offset + '&limit=' + limit).get();

                UtilService.addPromiseToTracker(prom, promiseTracker);

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
            // Services - Methods taken from DSP
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
            getAllServices: function (withchildren, withprofiles, state, resultProfileDefNames, promiseTracker) {
                var _self = this;
                var deferred = $q.defer();

                _self.getServicesCustom(0, BATCH_SIZE, withchildren, withprofiles, state, resultProfileDefNames, promiseTracker).then(function (firstResponse) {
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
            getServicesCustom: function (offset, limit, withchildren, withprofiles, state, resultProfileDefNames, promiseTracker) {
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
            // getServices: function (offset, limit, withchildren, withprofiles, state, resultProfileDefNames, promiseTracker) {
            //     var url = 'services?offset=' + offset + '&limit=' + limit +
            //         '&withchildren=' + (withchildren ? withchildren : false) +
            //         '&withprofiles=' + (withprofiles ? withprofiles : false);

            //     if (state) {
            //         url += '&state=' + state;
            //     }

            //     // Add the profile names as comma separated string to get the response only with the specified profile names.
            //     if (resultProfileDefNames && resultProfileDefNames.length > 0) {
            //         url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
            //     }

            //     var prom = CMPFRestangular.one(url).get();

            //     UtilService.addPromiseToTracker(prom, promiseTracker);

            //     return prom;
            // },
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
            // getServicesOfPartner: function (id, offset, limit, withchildren, withprofiles, resultProfileDefNames) {
            //     var url = 'partners/' + id + '/services?offset=' + offset + '&limit=' + limit + '&withchildren=' + withchildren + '&withprofiles=' + withprofiles;

            //     // Add the profile names as comma separated string to get the response only with the specified profile names.
            //     if (resultProfileDefNames && resultProfileDefNames.length > 0) {
            //         url += '&resultProfileDefNames=' + resultProfileDefNames.join(',');
            //     }

            //     var prom = CMPFRestangular.one(url).get();
            //     UtilService.addPromiseToTracker(prom);
            //     return prom;
            // },
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
            // Offers
            getOffers: function (offset, limit, withchildren, withprofiles, promiseTracker) {
                var prom = CMPFRestangular.one('offers?withchildren=' + withchildren + '&withprofiles=' + withprofiles + '&offset=' + offset + '&limit=' + limit).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getOffersByServiceName: function (offset, limit, serviceName) {
                var prom = CMPFRestangular.one('offers?withchildren=true&offset=' + offset + '&limit=' + limit + '&serviceName=' + serviceName).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getOffer: function (id) {
                var prom = CMPFRestangular.one('offers/' + id + '?withchildren=true&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            findOfferByName: function (offerName) {
                var promise = CMPFRestangular.one('offers?withchildren=false&withprofiles=true&name=' + offerName).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
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
            getOffersSubscriptions: function (promiseTracker) {
                var prom = CMPFRestangular.one('offers/subscriptions').get();
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
            // Offer HappyHour , BOGOF Campaigns and PolicyProfile
            getRbtContentOffer : function(){
                return this.getOffer(this.SERVICE_RBT_CONTENT_OFFER_ID);
            },
            createOfferCampaign: function (newItem) {
                var prom = CMPFRestangular.all('offers/' + this.SERVICE_RBT_CONTENT_OFFER_ID + '/profiles').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            updateOfferCampaign: function (entry, campaignId) {
                return this.updateRbtContentOfferProfile(entry,campaignId);
            },
            updateRbtContentOfferProfile: function (entry, profileId) {
                var prom = CMPFRestangular.all('offers/' + this.SERVICE_RBT_CONTENT_OFFER_ID + '/profiles/' + profileId).customPUT(entry);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteOfferCampaign: function(campaignId){
                var promise = CMPFRestangular.one('offers/' + this.SERVICE_RBT_CONTENT_OFFER_ID + '/profiles/' + campaignId).remove();
                UtilService.addPromiseToTracker(promise);
                return promise;
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
            // DSP Related - Offers
            getOffersByProfileDefs: function (offset, limit, withchildren, withorganization, withprofiles, resultProfileDefNames, promiseTracker) {
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
            getAllOffers: function (withchildren, withorganization, withprofiles, resultProfileDefNames, promiseTracker) {
                var _self = this;
                var deferred = $q.defer();

                _self.getOffersByProfileDefs(0, BATCH_SIZE, withchildren, withorganization, withprofiles, resultProfileDefNames, promiseTracker).then(function (firstResponse) {
                    if (firstResponse) {
                        if (firstResponse.metaData.totalCount < BATCH_SIZE) {
                            deferred.resolve(firstResponse);
                        } else {
                            var promises = [];

                            for (var offset = BATCH_SIZE; offset < firstResponse.metaData.totalCount; offset = offset + BATCH_SIZE) {
                                promises.push(_self.getOffersByProfileDefs(offset, BATCH_SIZE, withchildren, withorganization, withprofiles, resultProfileDefNames, promiseTracker));
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
            getOffersCustom: function (offset, limit, withchildren, withorganization, withprofiles, resultProfileDefNames, promiseTracker) {
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
            // Subscribers
            getSubscribersByFilter: function (offset, limit, msisdn, promiseTracker) {
                var url = 'subscribers?withchildren=true&withprofiles=true&offset=' + offset + '&limit=' + limit;
                url += (msisdn !== undefined && !s.isBlank(msisdn) ? '&msisdn=' + msisdn + '%25' : '');

                var prom = CMPFRestangular.one(url).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);

                return prom;
            },
            getSubscribers: function (offset, limit, promiseTracker) {
                return this.getSubscribersByFilter(offset, limit, undefined, undefined, promiseTracker);
            },
            getSubscriber: function (id) {
                var prom = CMPFRestangular.one('subscribers/' + id + '?withchildren=true&withprofiles=true').get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            getSubscriberByMsisdn: function (msisdn) {
                var prom = CMPFRestangular.one('subscribers?withchildren=false&withprofiles=false&msisdn=' + msisdn).get();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            updateSubscriber: function (entry) {
                var prom = CMPFRestangular.all('subscribers/' + entry.id).customPUT(entry);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            createSubscriber: function (newItem) {
                var prom = CMPFRestangular.all('subscribers/msisdn').post(newItem);
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            deleteSubscriber: function (item) {
                var prom = CMPFRestangular.one('subscribers/' + item.id).remove();
                UtilService.addPromiseToTracker(prom);
                return prom;
            },
            // Profile operations
            getOrphanProfilesByProfileDefName: function (profileDefName, withchildren) {
                var url = 'profiles/orphan?profileDefName=' + profileDefName;
                if (withchildren) {
                    url += '&withchildren=true';
                }

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
            findProfileById: function (profiles, profileId) {
                return _.findWhere(profiles, {id:  Number(profileId)});
            },
            deleteProfileByName: function (profiles, profileName) {

                if (!_.isArray(profiles) || !profileName) {
                    return profiles;
                }
                var index = _.findIndex(profiles, { profileDefinitionName: profileName });

                if (index > -1) {
                    profiles.splice(index, 1); // mutate array
                }

                return profiles;
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
            getProfileAttributesArray: function (profile) {
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

                return obj;
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
            extractUserProfile: function (userAccount) {
                var userProfileDefn = this.getUserProfile(userAccount);

                if (!_.isEmpty(userProfileDefn) && !_.isUndefined(userProfileDefn)) {
                    var nameAttr = _.findWhere(userProfileDefn.attributes, {name: "Name"});
                    var surnameAttr = _.findWhere(userProfileDefn.attributes, {name: "Surname"});
                    var mobilePhoneNoAttr = _.findWhere(userProfileDefn.attributes, {name: "MobilePhone"});
                    var emailAttr = _.findWhere(userProfileDefn.attributes, {name: "Email"});
                    var activeDirectoryAuthAttr = _.findWhere(userProfileDefn.attributes, {name: "ActiveDirectoryAuthentication"});
                    var remotepasswordcontrolAttr = _.findWhere(userProfileDefn.attributes, {name: "RemotePasswordControl"});
                    var simotaRoleIdAttr = _.findWhere(userProfileDefn.attributes, {name: "SimotaRoleId"});
                    var dmcRoleIdAttr = _.findWhere(userProfileDefn.attributes, {name: "DmcRoleId"});

                    var userProfile = {
                        Name: nameAttr ? nameAttr.value : '',
                        Surname: surnameAttr ? surnameAttr.value : '',
                        MobilePhone: mobilePhoneNoAttr ? mobilePhoneNoAttr.value : '',
                        Email: emailAttr ? emailAttr.value : '',
                        ActiveDirectoryAuthentication: activeDirectoryAuthAttr ? activeDirectoryAuthAttr.value == 'true' : false,
                        RemotePasswordControl: remotepasswordcontrolAttr ? remotepasswordcontrolAttr.value == 'true' : null
                    };
                    if(Number(simotaRoleIdAttr && simotaRoleIdAttr.value) > 0)
                        userProfile.SimotaRoleId = simotaRoleIdAttr.value;
                    if(Number(dmcRoleIdAttr && dmcRoleIdAttr.value) > 0)
                        userProfile.DmcRoleId = dmcRoleIdAttr.value;

                    return userProfile;
                } else {
                    return {};
                }
            },
            getSubscriberProfile: function (subscriberAccount) {
                return this.findProfileByName(subscriberAccount.profiles, this.SUBSCRIBER_PROFILE_NAME);
            },
            extractSubscriberProfile: function (subscriberAccount) {
                var subscriberProfileDef = this.getSubscriberProfile(subscriberAccount);

                if (!_.isEmpty(subscriberProfileDef) && !_.isUndefined(subscriberProfileDef)) {
                    // And searches necessary attributes in the subscriber profile.
                    var msisdnAttr = _.findWhere(subscriberProfileDef.attributes, {name: "MSISDN"});
                    var paymentTypeAttr = _.findWhere(subscriberProfileDef.attributes, {name: "PaymentType"});
                    var languageAttr = _.findWhere(subscriberProfileDef.attributes, {name: "Language"});
                    var statusAttr = _.findWhere(subscriberProfileDef.attributes, {name: "Status"});

                    return {
                        MSISDN: !_.isUndefined(msisdnAttr) ? msisdnAttr.value : '',
                        PaymentType: !_.isUndefined(paymentTypeAttr) ? (!isNaN(paymentTypeAttr.value) ? Number(paymentTypeAttr.value) : paymentTypeAttr.value) : '',
                        Language: !_.isUndefined(languageAttr) ? languageAttr.value : '',
                        Status: !_.isUndefined(statusAttr) ? statusAttr.value : ''
                    };
                } else {
                    return {};
                }
            },
            getServiceProfile: function (service) {
                return this.findProfileByName(service.profiles, this.SERVICE_PROFILE_NAME);
            },
            extractServiceProfile: function (service) {
                var serviceProfileDef = this.getServiceProfile(service);
                var serviceProfile = {
                    startDate: UtilService.getTodayBegin(),
                    endDate: UtilService.getTodayEnd(),
                    description: '',
                    category: []
                };

                if (!_.isEmpty(serviceProfileDef) && !_.isUndefined(serviceProfileDef)) {
                    var startDateAttr = _.findWhere(serviceProfileDef.attributes, {name: "startDate"});
                    if (startDateAttr) {
                        serviceProfile.startDate = new Date(startDateAttr.value);
                    }

                    var endDateAttr = _.findWhere(serviceProfileDef.attributes, {name: "endDate"});
                    if (endDateAttr) {
                        serviceProfile.endDate = new Date(endDateAttr.value);
                    }

                    var descriptionAttr = _.findWhere(serviceProfileDef.attributes, {name: "description"});
                    if (descriptionAttr) {
                        serviceProfile.description = descriptionAttr.value;
                    }

                    var categoryAttr = _.findWhere(serviceProfileDef.attributes, {name: "Category"});
                    if (categoryAttr) {
                        serviceProfile.category = categoryAttr.value;
                    }
                }

                return serviceProfile;
            },
            extractUssdCorporateCodeListProfile: function (organization) {
                var ussdCorporateCodeProfileDefList = _.where(organization.profiles, {profileDefinitionName: this.USSD_CODE_PROFILE_NAME});

                var ussdCorporateCodeListValues = [];
                if (!_.isUndefined(ussdCorporateCodeProfileDefList)) {
                    _.each(ussdCorporateCodeProfileDefList, function (ussdCorporateCodeProfileDef) {
                        var stateAttr = _.findWhere(ussdCorporateCodeProfileDef.attributes, {name: "State"});
                        var ussdCodeAttr = _.findWhere(ussdCorporateCodeProfileDef.attributes, {name: "UssdCode"});

                        ussdCorporateCodeListValues.push({
                            ussdCode: s.toNumber(ussdCodeAttr.value),
                            state: s.toNumber(stateAttr.value)
                        });
                    });
                }
                ussdCorporateCodeListValues = $filter('orderBy')(ussdCorporateCodeListValues, ['state', 'ussdCode']);

                return ussdCorporateCodeListValues;
            },

            prepareProviderAllowedCategoryProfiles: function (provider, categoryList, subCategoryList) {
                if(provider.name.toLowerCase() == 'stc'){
                    var serviceProviderAllowedCategoryProfiles = [];
                    _.each(subCategoryList, function (subCategory) {
                        var categoryProfile = {};
                        var category = _.findWhere(categoryList, { id: subCategory.categoryId });
                        categoryProfile.MainCategoryID = category ? category.id : 'N/A';
                        categoryProfile.categoryName = category ? category.name : 'N/A';
                        categoryProfile.category = category;

                        categoryProfile.SubCategoryID = subCategory ? subCategory.id : 'N/A';
                        categoryProfile.subCategoryName = subCategory ? subCategory.name : 'N/A';
                        categoryProfile.subcategory = subCategory;
                        serviceProviderAllowedCategoryProfiles.push(categoryProfile);
                    });
                    serviceProviderAllowedCategoryProfiles = $filter('orderBy')(serviceProviderAllowedCategoryProfiles, ['categoryName', 'subCategoryName']);

                    return angular.copy(serviceProviderAllowedCategoryProfiles);

                } else {
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
                        return angular.copy(serviceProviderAllowedCategoryProfiles);
                    } else {
                        return [];
                    }
                }
            },

            // TODO: Reduce these methods - Taken from DSP
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
            getCustomerProfilings: function (organization) {
                return this.getProfileAttributes(organization.profiles, this.ORGANIZATION_CUSTOMER_PROFILING_PROFILE);
            },

            // Bulk Messaging Related methods - DSP
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

    // SMSC Services
    var SmscConfService = ['$log', 'SmscConfigRestangular', 'UtilService', function ($log, SmscConfigRestangular, UtilService) {
        var getInputRates = function (key, promiseTracker) {
            var promise = SmscConfigRestangular.all('inputrates/' + key).getList();
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };

        // Generic retry policy operations
        var getRetryPolicies = function (key, promiseTracker) {
            var promise = SmscConfigRestangular.one('retry-policy/' + key).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };
        var addRetryPolicy = function (key, retryPolicy, promiseTracker) {
            var promise = SmscConfigRestangular.all('retry-policy/' + key).post(retryPolicy);
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };
        var updateRetryPolicy = function (key, retryPolicy, promiseTracker) {
            var promise = SmscConfigRestangular.all('retry-policy/' + key).customPUT(retryPolicy);
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };
        var deleteRetryPolicyByPreference = function (key, preference, promiseTracker) {
            var promise = SmscConfigRestangular.all('retry-policy/' + key + '/' + preference).remove();
            UtilService.addPromiseToTracker(promise, promiseTracker);

            return promise;
        };

        return {
            getSS7Gateway: function (promiseTracker) {
                var promise = SmscConfigRestangular.one('ss7gw').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateSS7Gateway: function (config, promiseTracker) {
                var promise = SmscConfigRestangular.all('ss7gw').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getApplicationRouting: function (appId, promiseTracker) {
                var promise = SmscConfigRestangular.one('routing/ussd-application/' + appId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addApplicationRouting: function (newRange, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/ussd-application').post(newRange);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteApplicationRouting: function (appId, routing, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/ussd-application/' + appId + '/' + routing.addRangeStart + '/' + routing.addRangeEnd).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getSFEStorage: function (promiseTracker) {
                var promise = SmscConfigRestangular.one('sfestorage').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateSFEStorage: function (config, promiseTracker) {
                var promise = SmscConfigRestangular.all('sfestorage').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Input rates and throttling related services
            getSS7InputRates: function (promiseTracker) {
                return getInputRates('SS7', promiseTracker);
            },
            getSMPPApplicationThrottler: function (appId) {
                var promise = SmscConfigRestangular.one('applications/' + appId + '/throttler').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSMPPApplicationThrottler: function (appId, throttlerConf) {
                var promise = SmscConfigRestangular.all('applications/' + appId + '/throttler').post(throttlerConf);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSMPPApplicationThrottler: function (appId, throttlerConf) {
                var promise = SmscConfigRestangular.all('applications/' + appId + '/throttler').customPUT(throttlerConf);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            //--
            getAllSMPPApplicationRoutings: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/application').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getSmppApplicationRouting: function (appId, promiseTracker) {
                var promise = SmscConfigRestangular.one('routing/application/' + appId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addSmppApplicationRouting: function (rangeItem, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/application').post(rangeItem);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteSmppApplicationRouting: function (appId, rangeStart, rangeEnd, promiseTracker) {
                var deleteCallUrl = 'routing/application/' + appId + '?addRangeStart=' + rangeStart + '&addRangeEnd=' + rangeEnd;

                var promise = SmscConfigRestangular.all(deleteCallUrl).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Alert Retry Policy
            getRetryPoliciesAlert: function (appId, promiseTracker) {
                return getRetryPolicies((appId ? 'alert/orig-application/' + appId : 'alert/global'), promiseTracker);
            },
            addRetryPolicyAlert: function (retryPolicy, appId, promiseTracker) {
                return addRetryPolicy((appId ? 'alert/orig-application/' + appId : 'alert/global'), retryPolicy, promiseTracker);
            },
            updateRetryPolicyAlert: function (retryPolicy, appId, promiseTracker) {
                return updateRetryPolicy((appId ? 'alert/orig-application/' + appId : 'alert/global'), retryPolicy, promiseTracker);
            },
            deleteRetryPolicyAlertByPreference: function (preference, appId, promiseTracker) {
                return deleteRetryPolicyByPreference((appId ? 'alert/orig-application/' + appId : 'alert/global'), preference, promiseTracker);
            },
            // Destination Application Retry Policy
            getRetryPoliciesDestinationApplication: function (appId, promiseTracker) {
                return getRetryPolicies((appId ? 'destination-application/per-application/' + appId : 'destination-application/default'), promiseTracker);
            },
            addRetryPolicyDestinationApplication: function (retryPolicy, appId, promiseTracker) {
                return addRetryPolicy((appId ? 'destination-application/per-application/' + appId : 'destination-application/default'), retryPolicy, promiseTracker);
            },
            updateRetryPolicyDestinationApplication: function (retryPolicy, appId, promiseTracker) {
                return updateRetryPolicy((appId ? 'destination-application/per-application/' + appId : 'destination-application/default'), retryPolicy, promiseTracker);
            },
            deleteRetryPolicyDestinationApplicationByPreference: function (preference, appId, promiseTracker) {
                return deleteRetryPolicyByPreference((appId ? 'destination-application/per-application/' + appId : 'destination-application/default'), preference, promiseTracker);
            },
            // SS7 Retry Policy
            getRetryPoliciesSS7: function (promiseTracker) {
                return getRetryPolicies('ss7', promiseTracker);
            },
            addRetryPolicySS7: function (retryPolicy, promiseTracker) {
                return addRetryPolicy('ss7', retryPolicy, promiseTracker);
            },
            updateRetryPolicySS7: function (retryPolicy, promiseTracker) {
                return updateRetryPolicy('ss7', retryPolicy, promiseTracker);
            },
            deleteRetryPolicySS7ByPreference: function (preference, promiseTracker) {
                return deleteRetryPolicyByPreference('ss7', preference, promiseTracker);
            },
            // Error Based Retry Policy
            getRetryPoliciesErrorBased: function (appId) {
                return getRetryPolicies((appId ? 'error/orig-application/' + appId : 'error/global'));
            },
            getRetryPolicyErrorBasedByErrorCode: function (contextName, errorCode, appId) {
                var key = (appId ? 'error/orig-application/' + appId : 'error/global');

                var promise = SmscConfigRestangular.one('retry-policy/' + key + '/' + contextName + '/' + errorCode).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addRetryPolicyErrorBased: function (retryPolicyContent, appId) {
                return addRetryPolicy((appId ? 'error/orig-application/' + appId : 'error/global'), retryPolicyContent);
            },
            updateRetryPolicyErrorBased: function (retryPolicyContent, appId) {
                return updateRetryPolicy((appId ? 'error/orig-application/' + appId : 'error/global'), retryPolicyContent);
            },
            deleteRetryPolicyErrorBasedByErrorCode: function (contextName, errorCode, appId) {
                var key = (appId ? 'error/orig-application/' + appId : 'error/global');

                var promise = SmscConfigRestangular.all('retry-policy/' + key + '/' + contextName + '/' + errorCode).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteRetryPolicyErrorBasedPolicyByPreference: function (contextName, errorCode, preference, appId) {
                var key = (appId ? 'error/orig-application/' + appId : 'error/global');

                var promise = SmscConfigRestangular.all('retry-policy/' + key + '/' + contextName + '/' + errorCode + '/' + preference).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Error Based Sub Errors Retry Policy
            getRetryPoliciesErrorBasedSubErrors: function (errorCode, appId) {
                return getRetryPolicies('sub-error/' + (appId ? appId : 'global') + '/' + errorCode);
            },
            addRetryPolicyErrorBasedSubError: function (errorCode, retryPolicyContent, appId) {
                // Calling update method so there is no POST method implemented on the restful service and PUT makes same thing.
                return updateRetryPolicy('sub-error/' + (appId ? appId : 'global') + '/' + errorCode, retryPolicyContent);
            },
            updateRetryPolicyErrorBasedSubError: function (errorCode, retryPolicyContent, appId) {
                return updateRetryPolicy('sub-error/' + (appId ? appId : 'global') + '/' + errorCode, retryPolicyContent);
            },
            getRetryPolicyErrorBasedBySubErrorCode: function (errorCode, subErrorCode, appId) {
                var key = ('sub-error/' + (appId ? appId : 'global') + '/' + errorCode);

                var promise = SmscConfigRestangular.one('retry-policy/' + key + '/' + subErrorCode).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteRetryPolicyErrorBasedBySubErrorCode: function (errorCode, subErrorCode, appId) {
                var key = ('sub-error/' + (appId ? appId : 'global') + '/' + errorCode);

                var promise = SmscConfigRestangular.all('retry-policy/' + key + '/' + subErrorCode).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteRetryPolicyErrorBasedBySubErrorCodeByPreference: function (errorCode, subErrorCode, preference, appId) {
                var key = ('sub-error/' + (appId ? appId : 'global') + '/' + errorCode);

                var promise = SmscConfigRestangular.all('retry-policy/' + key + '/' + subErrorCode + '/' + preference).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addRetryPolicyErrorBasedSubErrorPolicy: function (errorCode, subErrorCode, retryPolicyItem, appId) {
                // Calling update method so there is no POST method implemented on the restful service and PUT makes same thing.
                return updateRetryPolicy('sub-error/' + (appId ? appId : 'global') + '/' + errorCode + '/' + subErrorCode, retryPolicyItem);
            },
            updateRetryPolicyErrorBasedSubErrorPolicy: function (errorCode, subErrorCode, retryPolicyItem, appId) {
                return updateRetryPolicy('sub-error/' + (appId ? appId : 'global') + '/' + errorCode + '/' + subErrorCode, retryPolicyItem);
            },
            // Priority Based Retry Policy
            getRetryPoliciesPriorityLevelBased: function (promiseTracker) {
                return getRetryPolicies('priority', promiseTracker);
            },
            getRetryPoliciesPriorityLevelBasedByPolicyName: function (policyName, promiseTracker) {
                return getRetryPolicies('priority/' + policyName, promiseTracker);
            },
            addRetryPolicyPriorityLevelBased: function (retryPolicy, promiseTracker) {
                return addRetryPolicy('priority', retryPolicy, promiseTracker);
            },
            updateRetryPolicyPriorityLevelBased: function (retryPolicy, promiseTracker) {
                return updateRetryPolicy('priority', retryPolicy, promiseTracker);
            },
            deleteRetryPolicyPriorityLevelBasedByPolicyName: function (policyName, promiseTracker) {
                var promise = SmscConfigRestangular.all('retry-policy/priority/' + policyName).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteRetryPolicyPriorityLevelBasedByPreference: function (policyName, preference, promiseTracker) {
                var promise = SmscConfigRestangular.all('retry-policy/priority/' + policyName + '/' + preference).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Application Gateway
            getApplicationGateway: function (promiseTracker) {
                var promise = SmscConfigRestangular.one('appgw').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updateApplicationGateway: function (config, promiseTracker) {
                var promise = SmscConfigRestangular.all('appgw').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // Interconnect Smpp Agent
            getInterconnectSmppAgents: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            createOrUpdateInterconnectSmppAgent: function (config, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteInterconnectSmppAgent: function (agentName, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent/' + agentName).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getInterconnectSmppAgentConnectionDefinitions: function (agentName, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent/' + agentName + '/connection-definition').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            createOrUpdateInterconnectSmppAgentConnectionDefinition: function (agentName, config, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent/' + agentName + '/connection-definition').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteInterconnectSmppAgentConnectionDefinition: function (agentName, connectionDefinitionName, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent/' + agentName + '/connection-definition/' + connectionDefinitionName).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getInterconnectSmppAgentEstablishedConnections: function (agentName, promiseTracker) {
                var promise = SmscConfigRestangular.all('interconnect-smpp-agent/' + agentName + '/established-connection').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAllInterconnectSmppAgentRoutings: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/interconnect-agent').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAllInterconnectSmppAgentRoutingByAgent: function (agentName, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/interconnect-agent/' + agentName).getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addInterconnectSmppAgentRouting: function (rangeItem, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/interconnect-agent').post(rangeItem);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteInterconnectSmppAgentRouting: function (agentName, rangeStart, rangeEnd, promiseTracker) {
                var deleteCallUrl = 'routing/interconnect-agent/' + agentName + '/' + rangeStart + '/' + rangeEnd;

                var promise = SmscConfigRestangular.all(deleteCallUrl).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getSS7SubsystemRoutings: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/ss7subsystem/range').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addSS7SubsystemRouting: function (rangeItem, promiseTracker) {
                var promise = SmscConfigRestangular.all('routing/ss7subsystem/range').customPUT(rangeItem);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteSS7SubsystemRouting: function (rangeStart, rangeEnd, promiseTracker) {
                var deleteCallUrl = 'routing/ss7subsystem/range/' + rangeStart + '/' + rangeEnd;

                var promise = SmscConfigRestangular.all(deleteCallUrl).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Languages and Message Templates
            getLanguages: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('language').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addLanguage: function (language, promiseTracker) {
                var promise = SmscConfigRestangular.all('language').post(language);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteLanguage: function (languageCode, promiseTracker) {
                var promise = SmscConfigRestangular.all('language/' + languageCode).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getMessageTemplates: function (promiseTracker) {
                var promise = SmscConfigRestangular.all('message-template').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getMessageTemplatesByLanguageCode: function (languageCode, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all((appId ? 'applications/' + appId + '/' : '') + 'message-template/' + languageCode).getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addMessageTemplate: function (messageTemplate, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all((appId ? 'applications/' + appId + '/' : '') + 'message-template').post(messageTemplate);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updateMessageTemplate: function (messageTemplate, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all((appId ? 'applications/' + appId + '/' : '') + 'message-template').customPUT(messageTemplate);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteMessageTemplate: function (languageCode, id, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all((appId ? 'applications/' + appId + '/' : '') + 'message-template/' + languageCode + '/' + id).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Address Translation Tables
            getAddressTranslations: function (key, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all('address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '')).getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAddressTranslation: function (key, name, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name);
                var promise = SmscConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addAddressTranslation: function (key, addressTranslation, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all('address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '')).post(addressTranslation);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updateAddressTranslation: function (key, addressTranslation, appId, promiseTracker) {
                var promise = SmscConfigRestangular.all('address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '')).customPUT(addressTranslation);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteAddressTranslation: function (key, name, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name);
                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Content filtering criteria
            addAddressTranslationMessageContentPatternCriteria: function (key, name, pattern, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name) + '/pattern';
                var promise = SmscConfigRestangular.all(url).post(pattern);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteAddressTranslationMessageContentPatternCriteria: function (key, name, regex, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name);
                url += '/pattern?regex=' + encodeURIComponent(regex);

                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Other address filtering criteria
            addAddressTranslationMessageContentOtherAddressPatternCriteria: function (key, name, pattern, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name) + '/otherAddress';
                var promise = SmscConfigRestangular.all(url).post(pattern);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteAddressTranslationMessageContentOtherAddressPatternCriteria: function (key, name, regex, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name);
                url += '/otherAddress?otherAddress=' + encodeURIComponent(regex);

                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // TON/NPI filtering criteria
            addAddressTranslationMessageContentTonNpiCriteria: function (key, name, tonNpi, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name) + '/ton-npi';
                var promise = SmscConfigRestangular.all(url).post(tonNpi);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteAddressTranslationMessageContentTonNpiCriteria: function (key, name, ton, tonEquality, npi, npiEquality, appId, promiseTracker) {
                var url = 'address-translation-matcher/' + key + (appId ? '/orig-app/' + appId : '') + '/' + encodeURIComponent(name);
                url += '/ton-npi?ton=' + ton + '&tonEquality=' + tonEquality;
                url += '&npi=' + npi + '&npiEquality=' + npiEquality;

                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addressTranslationTest: function (key, address, ton, npi, content, otherAddress, appId) {
                var url = 'address-translation-matcher/' + key + '/test';
                url += '?address=' + encodeURIComponent(address) + '&ton=' + ton + '&npi=' + npi;
                url += content ? '&content=' + encodeURIComponent(content) : '';
                url += otherAddress ? '&otherAddress=' + encodeURIComponent(otherAddress) : '';
                url += ((appId && appId > 0) ? '&orig-app=' + appId : '');

                var promise = SmscConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAddressTranslationNextPrecedence: function (key) {
                var promise = SmscConfigRestangular.one('address-translation-matcher/' + key + '/next-precedence').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Modifiers
            getContentModifiers: function () {
                var promise = SmscConfigRestangular.all('content-modifier').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addContentModifier: function (contentModifier) {
                var promise = SmscConfigRestangular.all('content-modifier').customPUT(contentModifier);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentModifier: function (adressRangeStart, adressRangeEnd) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd);
                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentModifierPatternList: function (adressRangeStart, adressRangeEnd) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd) + '/pattern';
                var promise = SmscConfigRestangular.all(url).getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addContentModifierPattern: function (adressRangeStart, adressRangeEnd, pattern) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd) + '/pattern';
                var promise = SmscConfigRestangular.all(url).customPUT(pattern);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentModifierPattern: function (adressRangeStart, adressRangeEnd, regex) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd);
                url += '/pattern/' + encodeURIComponent(regex);

                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentModifierTonNpiList: function (adressRangeStart, adressRangeEnd) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd) + '/ton-npi';
                var promise = SmscConfigRestangular.all(url).getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addContentModifierTonNpi: function (adressRangeStart, adressRangeEnd, tonNpi) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd) + '/ton-npi';
                var promise = SmscConfigRestangular.all(url).customPUT(tonNpi);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentModifierTonNpi: function (adressRangeStart, adressRangeEnd, ton, npi) {
                var url = 'content-modifier/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd);
                url += '/ton-npi/' + ton + '/' + npi;

                var promise = SmscConfigRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Black Hours Rule
            getBlackHourRulesConfigurations: function (appId) {
                var promise = SmscConfigRestangular.one('applications/' + appId + '/blackhour-config').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getBlackHourRulesConfiguration: function (appId, configurationName) {
                var promise = SmscConfigRestangular.one('applications/' + appId + '/blackhour-config/' + encodeURIComponent(configurationName)).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createBlackHourRulesConfiguration: function (appId, configuration) {
                var promise = SmscConfigRestangular.all('applications/' + appId + '/blackhour-config').post(configuration);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateBlackHourRulesConfiguration: function (appId, configuration) {
                var promise = SmscConfigRestangular.all('applications/' + appId + '/blackhour-config').customPUT(configuration);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteBlackHourRulesConfiguration: function (appId, configurationName) {
                var promise = SmscConfigRestangular.all('applications/' + appId + '/blackhour-config/' + encodeURIComponent(configurationName)).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Keyword screening
            // Global
            getGlobalKeywordScreeningList: function () {
                var promise = SmscConfigRestangular.all('keyword-screening/global-black-keyword').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createGlobalKeywordScreening: function (keywordScreeningList) {
                var promise = SmscConfigRestangular.all('keyword-screening/global-black-keyword').post(keywordScreeningList);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteGlobalKeywordScreening: function (pattern) {
                var promise = SmscConfigRestangular.one('keyword-screening/global-black-keyword/' + encodeURIComponent(pattern)).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Per Sender Keyword black list
            getPerSenderKeywordScreeningBlackList: function () {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-black-keyword-all').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPerSenderKeywordScreeningBlackList: function (sender, keywordScreeningList) {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-black-keyword/' + sender).post(keywordScreeningList);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePerSenderKeywordScreeningBlackList: function (sender, pattern) {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-black-keyword/' + sender + '/' + encodeURIComponent(pattern)).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Per Sender Keyword white list
            getPerSenderKeywordScreeningWhiteList: function () {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-white-keyword-all').getList();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPerSenderKeywordScreeningWhiteList: function (sender, keywordScreeningList) {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-white-keyword/' + sender).post(keywordScreeningList);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePerSenderKeywordScreeningWhiteList: function (sender, pattern) {
                var promise = SmscConfigRestangular.all('keyword-screening/per-sender-address-white-keyword/' + sender + '/' + encodeURIComponent(pattern)).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    }];
    var SmscOperationService = ['$log', 'SmscConfigRestangular', 'SmscConfService', 'SmscOperationRestangular', 'SmscRemoteOperationRestangular', 'SmscSenderApplicationRestangular', 'SmscRemoteSenderApplicationRestangular', 'UtilService',
        function ($log, SmscConfigRestangular, SmscConfService, SmscOperationRestangular, SmscRemoteOperationRestangular, SmscSenderApplicationRestangular, SmscRemoteSenderApplicationRestangular, UtilService) {
            return {
                getSS7InputRates: function (promiseTracker) {
                    return SmscConfService.getSS7InputRates(promiseTracker);
                },
                updateSS7InputRates: function (ss7InputRate, promiseTracker) {
                    var promise = SmscConfigRestangular.all('inputrates/SS7').customPUT(ss7InputRate);
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                removeSS7InputRates: function (agentName, promiseTracker) {
                    var promise = SmscConfigRestangular.all('inputrates/SS7/' + agentName).remove();
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                resendMessage: function (message, promiseTracker) {
                    var promise = SmscSenderApplicationRestangular.all('').customPUT(message);
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                deleteBySMSTicket: function (messageId, promiseTracker) {
                    var promise = SmscOperationRestangular.all('sfe/delete-by-sms-ticket?smsTicket=' + messageId).remove();
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                sendNowBySMSTicket: function (messageId, promiseTracker) {
                    var promise = SmscOperationRestangular.all('sfe/send-now-by-sms-ticket?smsTicket=' + messageId).customPUT({});
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                // Remote
                resendMessageRemote: function (message, promiseTracker) {
                    var promise = SmscRemoteSenderApplicationRestangular.all('').customPUT(message);
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                deleteBySMSTicketRemote: function (messageId, promiseTracker) {
                    var promise = SmscRemoteOperationRestangular.all('sfe/delete-by-sms-ticket?smsTicket=' + messageId).remove();
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                },
                sendNowBySMSTicketRemote: function (messageId, promiseTracker) {
                    var promise = SmscRemoteOperationRestangular.all('sfe/send-now-by-sms-ticket?smsTicket=' + messageId).customPUT({});
                    UtilService.addPromiseToTracker(promise, promiseTracker);

                    return promise;
                }
            };
    }];
    var SmscProvService = ['$log', '$q', '$filter', 'SmscProvRestangular', 'SmppProxyRestangular', 'CMPFService', 'DEFAULT_REST_QUERY_LIMIT', 'Restangular', 'UtilService', function ($log, $q, $filter, SmscProvRestangular, SmppProxyRestangular, CMPFService, DEFAULT_REST_QUERY_LIMIT, Restangular, UtilService) {
        return {
            getAllSMPPApplications: function (promiseTracker) {
                var promise = SmscProvRestangular.all('applications/smpp').getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getSmppApplication: function (appId) {
                var promise = SmscProvRestangular.one('applications/smpp/' + appId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addSmppApplication: function (app) {
                var promise = SmscProvRestangular.all('applications/smpp').post(app);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSmppApplication: function (app) {
                var promise = SmscProvRestangular.all('applications/smpp').customPUT(app);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSmppApplication: function (app) {
                var promise = SmscProvRestangular.all('applications/smpp/' + app.id).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SMPP Connections
            getLiveSmppConnections: function (appId) {
                // smpp-session/connections/101
                var promise = SmppProxyRestangular.one('smpp-session/connections?appId=' + appId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SMPP Application Quota
            getSmppApplicationQuota: function (appId) {
                var promise = SmscProvRestangular.one('applications/smpp/' + appId + '/quota').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSmppApplicationQuota: function (appId, quota) {
                var promise = SmscProvRestangular.all('applications/smpp/' + appId + '/quota').post(quota);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSmppApplicationQuota: function (appId, quota) {
                var promise = SmscProvRestangular.all('applications/smpp/' + appId + '/quota').customPUT(quota);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSmppApplicationQuota: function (appId) {
                var promise = SmscProvRestangular.all('applications/smpp/' + appId + '/quota').remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    }];
    var SmscDashboardService = ['$log', 'SmscDashboardRestangular', 'SfeDashboardRestangular', 'UtilService', function ($log, SmscDashboardRestangular, SfeDashboardRestangular, UtilService) {
        return {
            getSmscDashboard: function (promiseTracker) {
                var promise = SmscDashboardRestangular.one('').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getSfeDashboard: function (promiseTracker) {
                var promise = SfeDashboardRestangular.one('').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    }];

    // SMSC Service Definitions
    ApplicationServices.factory('SmscConfService', function ($injector) {
        return $injector.instantiate(SmscConfService);
    });
    ApplicationServices.factory('SmscOperationService', function ($injector) {
        return $injector.instantiate(SmscOperationService);
    });
    ApplicationServices.factory('SmscProvService', function ($injector) {
        return $injector.instantiate(SmscProvService);
    });
    ApplicationServices.factory('SmscDashboardService', function ($injector) {
        return $injector.instantiate(SmscDashboardService);
    });

    // SMSC SFE Services
    ApplicationServices.factory('SfeReportingService', function ($log, SfeReportingRestangular, SfeRemoteReportingRestangular, UtilService) {
        var getEDRs = function (restangular, url) {
            var promise = restangular.one(url).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var deleteAllPendingMessages = function (restangular, url) {
            var promise = restangular.one(url).remove();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var findSmscTransientMessageParts = function (restangular, origAddress, destAddress, partRef) {
            var url = '?orig-address=' + origAddress;
            url += '&dest-address=' + destAddress;
            url += '&part-ref=' + partRef;

            var promise = restangular.one(url).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };
        var getTransientCount = function (restangular, url) {
            var promise = restangular.one(url).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {
            prepareUrl: function (filter, additionalFilter) {
                var url = '?date-from=' + filter.startDate.replace(/\+/g, '%2B');
                url += '&date-to=' + filter.endDate.replace(/\+/g, '%2B');

                url += filter.orderBy ? '&order-by=' + filter.orderBy : '';

                url += !_.isUndefined(filter.offset) ? '&paging-from=' + filter.offset : '';
                url += !_.isUndefined(filter.limit) ? '&page-count=' + filter.limit : '';

                url += additionalFilter.origAddress ? '&orig-address=' + additionalFilter.origAddress : '';
                url += additionalFilter.origAgentType ? '&orig-agent-type=' + additionalFilter.origAgentType : '';
                url += additionalFilter.origAgentId ? '&orig-agent-id=' + additionalFilter.origAgentId : '';

                url += additionalFilter.destAddress ? '&dest-address=' + additionalFilter.destAddress : '';
                url += additionalFilter.destAgentType ? '&dest-agent-type=' + additionalFilter.destAgentType : '';
                url += additionalFilter.destAgentId ? '&dest-agent-id=' + additionalFilter.destAgentId : '';

                url += filter.quickSearchText ? '&inner-search-address=' + filter.quickSearchText : '';

                url += additionalFilter.partRef ? '&part-ref=' + additionalFilter.partRef : '';

                return url;
            },
            // Main site
            getEDRs: function (filter, additionalFilter) {
                var url = this.prepareUrl(filter, additionalFilter);

                return getEDRs(SfeReportingRestangular, url);
            },
            deleteAllPendingMessages: function (filter, additionalFilter) {
                var url = this.prepareUrl(filter, additionalFilter);

                return deleteAllPendingMessages(SfeReportingRestangular, url);
            },
            findSmscTransientMessageParts: function (origAddress, destAddress, partRef) {
                return findSmscTransientMessageParts(SfeReportingRestangular, origAddress, destAddress, partRef);
            },
            getTransientCount: function (filter, additionalFilter) {
                filter.limit = 0;
                delete filter.offset;
                delete filter.orderBy;

                var url = this.prepareUrl(filter, additionalFilter);

                return getTransientCount(SfeReportingRestangular, url);
            },
            // Remote site
            getEDRsRemote: function (filter, additionalFilter) {
                var url = this.prepareUrl(filter, additionalFilter);

                return getEDRs(SfeRemoteReportingRestangular, url);
            },
            deleteAllPendingMessagesRemote: function (filter, additionalFilter) {
                var url = this.prepareUrl(filter, additionalFilter);

                return deleteAllPendingMessages(SfeRemoteReportingRestangular, url);
            },
            findSmscTransientMessagePartsRemote: function (origAddress, destAddress, partRef) {
                return findSmscTransientMessageParts(SfeRemoteReportingRestangular, origAddress, destAddress, partRef);
            },
            getTransientCountRemote: function (filter, additionalFilter) {
                filter.limit = 0;
                delete filter.offset;
                delete filter.orderBy;

                var url = this.prepareUrl(filter, additionalFilter);

                return getTransientCount(SfeRemoteReportingRestangular, url);
            }
        };
    });

    // MMSC Services
    ApplicationServices.factory('MmscConfService', function ($log, MmscConfigRestangular, UtilService) {
        return {
            getMm1Agent: function (promiseTracker) {
                var agentPromise = MmscConfigRestangular.one('mm1agent').get();
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, setMm1Agent: function (mm1Agent, promiseTracker) {
                var agentPromise = MmscConfigRestangular.all('mm1agent').customPUT(mm1Agent);
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, getMm3Agent: function (promiseTracker) {
                var agentPromise = MmscConfigRestangular.one('mm3agent').get();
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, setMm3Agent: function (mm1Agent, promiseTracker) {
                var agentPromise = MmscConfigRestangular.all('mm3agent').customPUT(mm1Agent);
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, getMm4Agent: function (promiseTracker) {
                var agentPromise = MmscConfigRestangular.one('mm4agent').get();
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, setMm4Agent: function (mm1Agent, promiseTracker) {
                var agentPromise = MmscConfigRestangular.all('mm4agent').customPUT(mm1Agent);
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, getMm7Agent: function (promiseTracker) {
                var agentPromise = MmscConfigRestangular.one('mm7agent').get();
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, setMm7Agent: function (agent, promiseTracker) {
                var agentPromise = MmscConfigRestangular.all('mm7agent').customPUT(agent);
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, getRelayServer: function (promiseTracker) {
                var agentPromise = MmscConfigRestangular.one('relayserver').get();
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }, setRelayServer: function (agent, promiseTracker) {
                var agentPromise = MmscConfigRestangular.all('relayserver').customPUT(agent);
                UtilService.addPromiseToTracker(agentPromise, promiseTracker);
                return agentPromise;
            }
        };
    });

    ApplicationServices.factory('MmscContentFilteringService', function ($log, MmscOperationRestangular, UtilService) {
        return {
            getRestrictedMediaTypes: function (promiseTracker) {
                var promise = MmscOperationRestangular.one('restrictedmediatypes').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addRestrictedMediaType: function (newRestrictedMediaType, promiseTracker) {
                var promise = MmscOperationRestangular.all('restrictedmediatypes').post(newRestrictedMediaType);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteRestrictedMediaType: function (mainType, subType, promiseTracker) {
                var promise = MmscOperationRestangular.all('restrictedmediatypes/' + mainType + '/' + subType).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    ApplicationServices.factory('MmscOperationService', function ($log, $q, $filter, MmscOperationRestangular, CMPFService, DEFAULT_REST_QUERY_LIMIT, Restangular, UtilService) {
        var getTrafficControlThresholdsByInterface = function (iface, promiseTracker) {
            var promise = MmscOperationRestangular.one('trafficcontrol/' + iface).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var getTrafficControlThresholdsByInterfaceAndId = function (iface, id, promiseTracker) {
            var promise = MmscOperationRestangular.one('trafficcontrol/' + iface + '/' + id).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var updateTrafficControlThresholdsByInterface = function (iface, thresholds, promiseTracker) {
            var promise = MmscOperationRestangular.all('trafficcontrol/' + iface).customPUT(thresholds);
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var updateTrafficControlThresholdsByInterfaceAndId = function (iface, id, thresholds, promiseTracker) {
            var promise = MmscOperationRestangular.all('trafficcontrol/' + iface + '/' + id).customPUT(thresholds);
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var getRetryPolicies = function (agentName, promiseTracker) {
            var promise = MmscOperationRestangular.one('retrypolicies/' + agentName).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var getRetryPolicy = function (agentName, preference, promiseTracker) {
            var promise = MmscOperationRestangular.one('retrypolicies/' + agentName + '/' + preference).get();
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var createRetryPolicy = function (agentName, policy, promiseTracker) {
            var promise = MmscOperationRestangular.all('retrypolicies/' + agentName).post(policy);
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var updateRetryPolicy = function (agentName, policy, promiseTracker) {
            var promise = MmscOperationRestangular.one('retrypolicies/' + agentName + '/' + policy.preference).customPUT(policy);
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        var deleteRetryPolicy = function (agentName, preference, promiseTracker) {
            var promise = MmscOperationRestangular.one('retrypolicies/' + agentName + '/' + preference).remove();
            UtilService.addPromiseToTracker(promise, promiseTracker);
            return promise;
        };
        return {
            getTrafficControlMm1Threshold: function (promiseTracker) {
                return getTrafficControlThresholdsByInterface('mm1', promiseTracker);
            },
            updateTrafficControlMm1: function (thresholds, promiseTracker) {
                return updateTrafficControlThresholdsByInterface('mm1', thresholds, promiseTracker);
            },
            getTrafficControlMm3Threshold: function (promiseTracker) {
                return getTrafficControlThresholdsByInterface('mm3', promiseTracker);
            },
            updateTrafficControlMm3: function (thresholds, promiseTracker) {
                return updateTrafficControlThresholdsByInterface('mm3', thresholds, promiseTracker);
            },
            getAllTrafficControlMm4Thresholds: function (promiseTracker) {
                return getTrafficControlThresholdsByInterface('mm4', promiseTracker);
            },
            getTrafficControlMm4Threshold: function (id, promiseTracker) {
                return getTrafficControlThresholdsByInterfaceAndId('mm4', id, promiseTracker);
            },
            updateTrafficControlMm4: function (id, thresholds, promiseTracker) {
                return updateTrafficControlThresholdsByInterfaceAndId('mm4', id, thresholds, promiseTracker);
            },
            getAllTrafficControlMm7Thresholds: function (promiseTracker) {
                return getTrafficControlThresholdsByInterface('mm7', promiseTracker);
            },
            getTrafficControlMm7Threshold: function (id, promiseTracker) {
                return getTrafficControlThresholdsByInterfaceAndId('mm7', id, promiseTracker);
            },
            updateTrafficControlMm7: function (id, thresholds, promiseTracker) {
                return updateTrafficControlThresholdsByInterfaceAndId('mm7', id, thresholds, promiseTracker);
            },
            getVasList: function (promiseTracker) {
                var promise = MmscOperationRestangular.one('services').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            createVas: function (app, promiseTracker) {
                var prom = MmscOperationRestangular.all('/services').post(app);
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            createVasTariff: function (vasId, tariff, promiseTracker) {
                var prom = MmscOperationRestangular.all('/services/' + vasId + '/tariffs').post(tariff);
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getVas: function (vasId, promiseTracker) {
                var prom = MmscOperationRestangular.one('/services/' + vasId).get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getVasTariffs: function (vasId, promiseTracker) {
                var prom = MmscOperationRestangular.one('/services/' + vasId + '/tariffs').get();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            updateVas: function (vasId, app, promiseTracker) {
                var prom = MmscOperationRestangular.one('/services/' + vasId).customPUT(app);
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            deleteVas: function (vasId, promiseTracker) {
                var prom = MmscOperationRestangular.one('/services/' + vasId).remove();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            deleteVasTariff: function (vasId, tariffId, promiseTracker) {
                var prom = MmscOperationRestangular.one('/services/' + vasId + '/tariffs/' + tariffId).remove();
                UtilService.addPromiseToTracker(prom, promiseTracker);
                return prom;
            },
            getAllOperatorList: function (promiseTracker) {
                var promise = MmscOperationRestangular.one('operators').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getOperator: function (opId, promiseTracker) {
                var promise = MmscOperationRestangular.one('operators/' + opId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateOperator: function (opId, operator, promiseTracker) {
                var promise = MmscOperationRestangular.one('operators/' + opId).customPUT(operator);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            createOperator: function (operator, promiseTracker) {
                var promise = MmscOperationRestangular.all('operators').post(operator);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteOperator: function (opId, promiseTracker) {
                var promise = MmscOperationRestangular.all('operators/' + opId).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            // Operator routings
            getOperatorRouting: function (key, opId) {
                var url = '/operators/' + opId + ((key === 'imsi') ? '/imsiranges' : '/ranges');

                var promise = MmscOperationRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            addOperatorRouting: function (key, opId, rangePattern) {
                var url = '/operators/' + opId + ((key === 'imsi') ? '/imsiranges' : '/ranges') + '/' + rangePattern;

                var promise = MmscOperationRestangular.one(url).post();

                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            deleteOperatorRouting: function (key, opId, rangePattern) {
                var url = '/operators/' + opId + ((key === 'imsi') ? '/imsiranges' : '/ranges') + '/' + rangePattern;

                var promise = MmscOperationRestangular.one(url).remove();

                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // Retry policies
            getMM1AgentRetryPolicies: function (promiseTracker) {
                return getRetryPolicies('mm1agent', promiseTracker);
            },
            getMM1AgentRetryPolicy: function (preference, promiseTracker) {
                return getRetryPolicy('mm1agent', preference, promiseTracker);
            },
            createMM1AgentRetryPolicy: function (policy, promiseTracker) {
                return createRetryPolicy('mm1agent', policy, promiseTracker);
            },
            updateMM1AgentRetryPolicy: function (policy, promiseTracker) {
                return updateRetryPolicy('mm1agent', policy, promiseTracker);
            },
            deleteMM1AgentRetryPolicy: function (preference, promiseTracker) {
                return deleteRetryPolicy('mm1agent', preference, promiseTracker);
            },
            getMM3AgentRetryPolicies: function (promiseTracker) {
                return getRetryPolicies('mm3agent', promiseTracker);
            },
            getMM3AgentRetryPolicy: function (preference, promiseTracker) {
                return getRetryPolicy('mm3agent', preference, promiseTracker);
            },
            createMM3AgentRetryPolicy: function (policy, promiseTracker) {
                return createRetryPolicy('mm3agent', policy, promiseTracker);
            },
            updateMM3AgentRetryPolicy: function (policy, promiseTracker) {
                return updateRetryPolicy('mm3agent', policy, promiseTracker);
            },
            deleteMM3AgentRetryPolicy: function (preference, promiseTracker) {
                return deleteRetryPolicy('mm3agent', preference, promiseTracker);
            },
            getMM4AgentRetryPolicies: function (promiseTracker) {
                return getRetryPolicies('mm4agent', promiseTracker);
            },
            getMM4AgentRetryPolicy: function (preference, promiseTracker) {
                return getRetryPolicy('mm4agent', preference, promiseTracker);
            },
            createMM4AgentRetryPolicy: function (policy, promiseTracker) {
                return createRetryPolicy('mm4agent', policy, promiseTracker);
            },
            updateMM4AgentRetryPolicy: function (policy, promiseTracker) {
                return updateRetryPolicy('mm4agent', policy, promiseTracker);
            },
            deleteMM4AgentRetryPolicy: function (preference, promiseTracker) {
                return deleteRetryPolicy('mm4agent', preference, promiseTracker);
            },
            getMM7AgentRetryPolicies: function (promiseTracker) {
                return getRetryPolicies('mm7agent', promiseTracker);
            },
            getMM7AgentRetryPolicy: function (preference, promiseTracker) {
                return getRetryPolicy('mm7agent', preference, promiseTracker);
            },
            createMM7AgentRetryPolicy: function (policy, promiseTracker) {
                return createRetryPolicy('mm7agent', policy, promiseTracker);
            },
            updateMM7AgentRetryPolicy: function (policy, promiseTracker) {
                return updateRetryPolicy('mm7agent', policy, promiseTracker);
            },
            deleteMM7AgentRetryPolicy: function (preference, promiseTracker) {
                return deleteRetryPolicy('mm7agent', preference, promiseTracker);
            },
            getErrorCodePolicies: function (promiseTracker) {
                return getRetryPolicies('errors', promiseTracker);
            },
            createErrorCodePolicy: function (policy, promiseTracker) {
                return createRetryPolicy('errors', policy, promiseTracker);
            },
            getErrorCodePolicy: function (context, code, promiseTracker) {
                return getRetryPolicy('errors', context + '/' + code, promiseTracker);
            },
            updateErrorCodePolicy: function (context, code, policy, promiseTracker) {
                var promise = MmscOperationRestangular.one('retrypolicies/errors/' + context + '/' + code).customPUT(policy);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteErrorCodePolicy: function (context, code, promiseTracker) {
                return deleteRetryPolicy('errors', context + '/' + code, promiseTracker);
            },
            createErrorCodeRetryPolicy: function (context, code, policy, promiseTracker) {
                return createRetryPolicy('errors/' + context + '/' + code, policy, promiseTracker);
            },
            updateErrorCodeRetryPolicy: function (context, code, policy, promiseTracker) {
                return updateRetryPolicy('errors/' + context + '/' + code, policy, promiseTracker);
            },
            getErrorCodeRetryPolicy: function (context, code, policy, promiseTracker) {
                return getRetryPolicy('errors/' + context + '/' + code, policy, promiseTracker);
            },
            deleteErrorCodeRetryPolicy: function (context, code, promiseTracker) {
                return deleteRetryPolicy('errors/' + context + '/' + code, promiseTracker);
            },
            getAddressTranslations: function (key, promiseTracker) {
                var promise = MmscOperationRestangular.all('address-translation/' + key).getList();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAddressTranslation: function (key, adressRangeStart, adressRangeEnd, promiseTracker) {
                var url = 'address-translation/' + key + '/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd);
                var promise = MmscOperationRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addAddressTranslation: function (key, addressTranslation, promiseTracker) {
                var promise = MmscOperationRestangular.all('address-translation/' + key).post(addressTranslation);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updateAddressTranslation: function (key, addressTranslation, promiseTracker) {
                var promise = MmscOperationRestangular.all('address-translation/' + key).customPUT(addressTranslation);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteAddressTranslation: function (key, adressRangeStart, adressRangeEnd, promiseTracker) {
                var url = 'address-translation/' + key + '/' + encodeURIComponent(adressRangeStart) + '/' + encodeURIComponent(adressRangeEnd);
                var promise = MmscOperationRestangular.all(url).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            addressTranslationTest: function (key, msisdn) {
                var url = 'address-translation/' + key + '/test?address=' + encodeURIComponent(msisdn);

                var promise = MmscOperationRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getOrderedVasApplicationList: function () {
                var deferred = $q.defer();

                this.getVasList().then(function (vasApplications) {
                    // Initialize application list by application names.
                    vasApplications.vasList = _.filter(vasApplications.vasList, function (vasApplication) {
                        // Preparing the dropdown list as "<provider id> - <application name>"
                        vasApplication.label = (vasApplication.vaspId ? vasApplication.vaspId + ' - ' : '') + vasApplication.vasId;

                        $log.debug("Found VAS Application: ", vasApplication);

                        return true;
                    });
                    vasApplications.vasList = $filter('orderBy')(vasApplications.vasList, ['vaspId', 'vasId']);

                    deferred.resolve(vasApplications);
                }, function (response) {
                    deferred.reject(response);
                });

                return deferred.promise;
            },
            // Black Hours Rule
            getBlackHourRulesConfigurations: function (appId) {
                var promise = MmscOperationRestangular.one('services/' + appId + '/blackhour-config').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getBlackHourRulesConfiguration: function (appId, configurationName) {
                var promise = MmscOperationRestangular.one('services/' + appId + '/blackhour-config/' + encodeURIComponent(configurationName)).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createBlackHourRulesConfiguration: function (appId, configuration) {
                var promise = MmscOperationRestangular.all('services/' + appId + '/blackhour-config').post(configuration);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateBlackHourRulesConfiguration: function (appId, configuration) {
                var promise = MmscOperationRestangular.all('services/' + appId + '/blackhour-config').customPUT(configuration);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteBlackHourRulesConfiguration: function (appId, configurationName) {
                var promise = MmscOperationRestangular.all('services/' + appId + '/blackhour-config/' + encodeURIComponent(configurationName)).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
        };
    });

    ApplicationServices.factory('MmscDashboardService', function ($log, MmscDashboardRestangular, UtilService) {
        return {
            getMmscDashboard: function (promiseTracker) {
                var promise = MmscDashboardRestangular.one('').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getMmscDashboardIncomingTraffic: function (promiseTracker) {
                var promise = MmscDashboardRestangular.one('incoming_traffic').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getMmscDashboardOutgoingTraffic: function (promiseTracker) {
                var promise = MmscDashboardRestangular.one('outgoing_traffic').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });

    ApplicationServices.factory('MmscTroubleshootingService', function (MmscTroubleshootingRestangular, UtilService) {
        return {
            getContentIdList: function (msgId, promiseTracker) {
                var promise = MmscTroubleshootingRestangular.one(msgId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getContentById: function (msgId, contentId, promiseTracker) {
                var promise = MmscTroubleshootingRestangular.one(msgId + '/' + contentId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            retryMessage: function (msgId, recipientAddress, promiseTracker) {
                var promise = MmscTroubleshootingRestangular.one(msgId + '?recipient=' + recipientAddress).post();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            cancelMessage: function (msgId, recipientAddress, promiseTracker) {
                var promise = MmscTroubleshootingRestangular.all(msgId + '?recipient=' + recipientAddress).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    // USSD Browser Services
    ApplicationServices.factory('UssdBrowserService', function ($log, UssdBrowserRestangular, UssdBrowserStatsRestangular, UtilService) {
        return {
            getApplications: function (promiseTracker) {
                var promise = UssdBrowserRestangular.one('web-service-application').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getApplication: function (appName, promiseTracker) {
                var promise = UssdBrowserRestangular.one('web-service-application/' + appName).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addApplication: function (app, promiseTracker) {
                var promise = UssdBrowserRestangular.all('web-service-application').post(app);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateApplication: function (app, promiseTracker) {
                var promise = UssdBrowserRestangular.all('web-service-application').customPUT(app);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteApplication: function (app, promiseTracker) {
                var promise = UssdBrowserRestangular.all('web-service-application/' + app.name).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getTextReplacements: function (promiseTracker) {
                var promise = UssdBrowserRestangular.one('routing-configuration-text-replacement').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getTextReplacement: function (name, promiseTracker) {
                var promise = UssdBrowserRestangular.one('routing-configuration-text-replacement/' + name).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addTextReplacement: function (text, promiseTracker) {
                var promise = UssdBrowserRestangular.all('routing-configuration-text-replacement').post(text);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateTextReplacement: function (text, promiseTracker) {
                var promise = UssdBrowserRestangular.all('/routing-configuration-text-replacement').customPUT(text);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteTextReplacement: function (text, promiseTracker) {
                var promise = UssdBrowserRestangular.all('routing-configuration-text-replacement/' + text.name).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getConfiguration: function (promiseTracker) {
                var promise = UssdBrowserRestangular.one('ussd-browser-configuration').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            setConfiguration: function (conf, promiseTracker) {
                var promise = UssdBrowserRestangular.all('ussd-browser-configuration').customPUT(conf);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getSmppGw: function (promiseTracker) {
                var promise = UssdBrowserRestangular.one('smpp-gw-provider').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getUssdSessions: function (promiseTracker) {
                var promise = UssdBrowserStatsRestangular.one('ussd-browser-application-sessions').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    ApplicationServices.factory('UssdGwConfService', function ($log, UssdGwConfigRestangular, UtilService) {
        return {
            getApplicationGateway: function (promiseTracker) {
                var promise = UssdGwConfigRestangular.one('appgw').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateApplicationGateway: function (config, promiseTracker) {
                var promise = UssdGwConfigRestangular.all('appgw').customPUT(config);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getApplicationRouting: function (appId, promiseTracker) {
                var promise = UssdGwConfigRestangular.one('routing/ussd-application/' + appId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addApplicationRouting: function (newRange, promiseTracker) {
                var promise = UssdGwConfigRestangular.all('routing/ussd-application').post(newRange);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteApplicationRouting: function (appId, routing, promiseTracker) {
                var promise = UssdGwConfigRestangular.all('routing/ussd-application/' + appId + '/' + routing.addRangeStart + '/' + routing.addRangeEnd).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    ApplicationServices.factory('UssdGwProvService', function ($log, UssdGwProvRestangular, UssdGwStatsRestangular, UssdGwSmppStatsRestangular, UtilService) {
        return {
            getAllUssdApplications: function (promiseTracker) {
                var promise = UssdGwProvRestangular.one('applications/ussd').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getUssdApplication: function (appId, promiseTracker) {
                var promise = UssdGwProvRestangular.one('applications/ussd/' + appId).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addUssdApplication: function (app, promiseTracker) {
                var promise = UssdGwProvRestangular.all('applications/ussd').post(app);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateUssdApplication: function (app, promiseTracker) {
                var promise = UssdGwProvRestangular.all('applications/ussd').customPUT(app);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            deleteUssdApplication: function (app, promiseTracker) {
                var promise = UssdGwProvRestangular.all('applications/ussd/' + app.id).remove();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getAllSessionsSummary: function (promiseTracker) {
                var promise = UssdGwStatsRestangular.one('get-all-sessions-summary').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getSmppConnections: function (promiseTracker) {
                var promise = UssdGwSmppStatsRestangular.one('get-smpp-connections').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getTPS: function (promiseTracker) {
                var promise = UssdGwStatsRestangular.one('tps').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getSessionDuration: function (promiseTracker) {
                var promise = UssdGwStatsRestangular.one('get-session-duration').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }

        };
    });

    // SMSF Services
    ApplicationServices.factory('SmsfConfigService', function($log, SmsfConfigRestangular, UtilService){
        return {
            getCoreConfig: function () {

                var promise = SmsfConfigRestangular.one('/master').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCoreConfig: function (config) {
                var promise = SmsfConfigRestangular.all('/master').customPUT(config);
                UtilService.addPromiseToTracker(promise);
                return promise;
            }
        };
    });

    ApplicationServices.factory('SmsfDashboardService', function($log, SmsfDashboardRestangular, UtilService){
        return {
            getDashboardData: function () {

                var promise = SmsfDashboardRestangular.one('/data').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getDashboardMOFailure: function () {

                var promise = SmsfDashboardRestangular.one('/moFailureReasons').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getDashboardMTFailure: function () {

                var promise = SmsfDashboardRestangular.one('/mtFailureReasons').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // USSI Services
    // TODO: Edit these with provided Api endpoints
    ApplicationServices.factory('UssiCoreConfService', function($log, UssiGwConfigRestangular, UtilService){
        return {
            getCoreConfig: function () {

                var promise = UssiGwConfigRestangular.one('/').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCoreConfig: function (config) {
                var promise = UssiGwConfigRestangular.all('/').customPUT(config);
                UtilService.addPromiseToTracker(promise);
                return promise;
            }
        };
    });

    ApplicationServices.factory('UssiDashboardService', function($log, UssiGwDashboardRestangular, UtilService){
        return {
            getDashboardData: function () {

                var promise = UssiGwDashboardRestangular.one('/data').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getDashboardTps: function () {

                var promise = UssiGwDashboardRestangular.one('/tps').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // SMS AntiSpam Services
    ApplicationServices.factory('SMSAntiSpamService', function ($log, SMSAntiSpamRestangular, UtilService) {
        return {
            getHeartBeat: function (promiseTracker) {
                var promise = SMSAntiSpamRestangular.one('/micro/services/heartbeat').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });

    ApplicationServices.factory('SMSAntiSpamConfigService', function ($log, $q, $timeout, SMSAntiSpamConfigRestangular, UtilService) {
        return {
            FRAUD_DETECTION_KEYS: {
                MO_IB: 'MO_IB',
                MO_OB: 'MO_OB',
                MT_FRAUD: 'MT_FRAUD',
                MO_AS: 'MO_AS'
            },
            getDashboard: function (promiseTracker) {
                var promise = SMSAntiSpamConfigRestangular.one('/dashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getDecryptedMessageContent: function (encryptedList) {
                var promise = SMSAntiSpamConfigRestangular.all('/content-decryption/decode').post(encryptedList);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Content Filters
            getContentFiltersList: function (direction, participant) {
                var promise = SMSAntiSpamConfigRestangular.one('/content-filter/' + direction + '/' + participant).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentFiltersEntry: function (direction, participant, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/content-filter/' + direction + '/' + participant + '/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentFiltersEntry: function (direction, participant, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/content-filter/' + direction + '/' + participant).post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateContentFiltersEntry: function (direction, participant, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/content-filter/' + direction + '/' + participant + '/' + entry.name).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentFiltersEntry: function (direction, participant, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/content-filter/' + direction + '/' + participant + '/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentFiltersEntryRangeList: function (direction, participant, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/content-filter/' + direction + '/' + participant + '/' + name + '/range').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentFiltersEntryRange: function (direction, participant, name, range) {
                var promise = SMSAntiSpamConfigRestangular.all('/content-filter/' + direction + '/' + participant + '/' + name + '/range').post(range);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentFiltersEntryRange: function (direction, participant, name, rangeName) {
                var promise = SMSAntiSpamConfigRestangular.one('/content-filter/' + direction + '/' + participant + '/' + name + '/range/' + rangeName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Substitutions
            getSubstitutionsList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/substitutions/getall/').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSubstitutionsListByContentFilter: function (contentFilterName) {
                var promise = SMSAntiSpamConfigRestangular.one('/substitutions/getall/' + contentFilterName).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSubstitutionsEntry: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/substitutions/get/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSubstitutionsEntryByContentFilter: function (contentFilterName, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/substitutions/get/' + contentFilterName + '/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSubstitutionsEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/substitutions/insert/').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSubstitutionsEntryForContentFilter: function (contentFilterName, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/substitutions/insert/' + contentFilterName).post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubstitutionsEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/substitutions/update/').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubstitutionsEntryForContentFilter: function (contentFilterName, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/substitutions/update/' + contentFilterName).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSubstitutionsEntry: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/substitutions/delete/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSubstitutionsEntryForContentFilter: function (contentFilterName, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/substitutions/delete/' + contentFilterName + '/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Antispam Fingerprints
            getFingerprintsList: function (pattern) {
                var promise = SMSAntiSpamConfigRestangular.one('/fingerprint/' + pattern).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createFingerprintEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/fingerprint/insert/').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteFingerprintEntry: function (name) {

                var promise = SMSAntiSpamConfigRestangular.one('/fingerprint/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Counters
            getCountersList: function (direction, participant, type) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + direction + '/' + participant + '/' + type).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getCountersEntry: function (direction, participant, type, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + direction + '/' + participant + '/' + type + '/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createCountersEntry: function (direction, participant, type, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/counter/' + direction + '/' + participant + '/' + type).post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCountersEntry: function (direction, participant, type, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/counter/' + direction + '/' + participant + '/' + type + '/' + entry.name).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteCountersEntry: function (direction, participant, type, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + direction + '/' + participant + '/' + type + '/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getCountersEntryRangeList: function (direction, participant, type, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + direction + '/' + participant + '/' + type + '/' + name + '/range').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createCountersEntryRange: function (direction, participant, type, name, range) {
                var promise = SMSAntiSpamConfigRestangular.all('/counter/' + direction + '/' + participant + '/' + type + '/' + name + '/range').post(range);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteCountersEntryRange: function (direction, participant, type, name, rangeName) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + direction + '/' + participant + '/' + type + '/' + name + '/range/' + rangeName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentCountersList: function(){
                var promise = SMSAntiSpamConfigRestangular.one('/counter/contentall').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentCountersEntry: function(parentName, name){
                // TODO: Something might be wrong on the api side, this endpoint only works if the parentName is set as `content`
                // parentName is set as `content` by default for now, the line below will be removed when this issue is fixed.
                parentName = 'content';
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + parentName + '/' + name ).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentCountersEntry: function(parentName, entry){
                var promise = SMSAntiSpamConfigRestangular.all('/counter/' + parentName).post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            updateContentCountersEntry: function (parentName, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/counter/' + parentName + '/' + entry.name).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentCountersEntry: function (parentName, name) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + parentName + '/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getContentCounterRangeList: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + name + '/range').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentCountersEntryRange: function (name, range) {
                var promise = SMSAntiSpamConfigRestangular.all('/counter/' + name + '/range').post(range);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentCountersEntryRange: function (name, rangeName) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/' + name + '/range/' + rangeName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            //Containers
            getContentCounterContainersList: function(){
                var promise = SMSAntiSpamConfigRestangular.one('/counter/containersall').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // TODO: This returns error
            getContentCounterContainerEntry: function(parentName){

                var promise = SMSAntiSpamConfigRestangular.one('/counter/container/' + parentName).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createContentCounterContainersEntry: function(entry){
                var promise = SMSAntiSpamConfigRestangular.all('/counter/container').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            updateContentCounterContainerEntry: function (parentName, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/counter/container/' + parentName).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteContentCounterContainerEntry: function (parentName) {
                var promise = SMSAntiSpamConfigRestangular.one('/counter/container/' + parentName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SMS Body Modification
            getSMFieldList: function(){
                var promise = SMSAntiSpamConfigRestangular.one('/updatesmfield').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSMFieldEntry: function(parentName){;
                var promise = SMSAntiSpamConfigRestangular.one('/updatesmfield/' + parentName).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSMFieldEntry: function(parentName, entry){
                var promise = SMSAntiSpamConfigRestangular.all('/updatesmfield/' + parentName + '/smfield').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            createSMFieldEntryWithContainer: function(parentName, entry){
                var entryItem = {
                    name: parentName,
                    status: 0,
                    updateSmFieldList: []
                };
                entryItem.updateSmFieldList.push(entry);

                var promise = SMSAntiSpamConfigRestangular.all('/updatesmfield/').post(entryItem);
                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            updateSMFieldEntry: function (parentName, smField, updateFunction, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/updatesmfield/' + parentName + '/' + smField+ '/' + updateFunction).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSMFieldEntry: function (parentName, name, updateFunction) {
                var promise = SMSAntiSpamConfigRestangular.one('/updatesmfield/' + parentName + '/' + name + '/' + updateFunction).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Black Lists
            getBlackLists: function (list, key) {
                var promise = SMSAntiSpamConfigRestangular.one('/' + list + 'list/pattern/' + key).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getBlackListEntry: function (list, key) {
                var promise = SMSAntiSpamConfigRestangular.one('/' + list + 'list/' + list + '/' + key).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createBlackListEntry: function (list, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/' + list + 'list/insert').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateBlackListEntry: function (list, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/' + list + 'list/update').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteBlackListEntry: function (list, key) {
                var path = list.startsWith('url') ? 'url' : 'phonenumber'; // url-anomaly will also delete from url path
                var promise = SMSAntiSpamConfigRestangular.one('/' + list + 'list/' + path + '/' + key).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Antispam Lists
            getAntispamLists: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/aslist/getall').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAntispamListEntry: function (listId) {
                var promise = SMSAntiSpamConfigRestangular.one('/aslist/get/' + listId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAntispamListEntryListCount: function (listId) {
                var promise = SMSAntiSpamConfigRestangular.one('/aslist/getcount/' + listId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAntispamListEntryWithPagination: function (listId, recordCount, firstIndex) {
                var promise = SMSAntiSpamConfigRestangular.one('/aslist/get/' + listId + '/' + recordCount + '/' + firstIndex).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createAntispamListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/aslist/insert').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateAntispamListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/aslist/update').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateAntispamListEntryWithPagination: function (entry, recordCount, firstIndex) {
                var promise = SMSAntiSpamConfigRestangular.all('/aslist/update/'+ recordCount+ '/' + firstIndex).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteAntispamListEntry: function (listId) {
                var promise = SMSAntiSpamConfigRestangular.one('/aslist/delete/' + listId).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Grey Lists
            getGreyList: function (key) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/list/entry/' + key).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getGreyListEntry: function (key, prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/list/entry/' + key + '/' + prefix).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createGreyListEntry: function (key, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/list/entry/' + key).post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateGreyListEntry: function (key, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/list/entry/' + key).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteGreyListEntry: function (key, prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/list/entry/' + key + '/' + prefix).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Msisdn Range Lists
            getMsisdnRangeList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/msisdn-range').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getMsisdnRangeListEntry: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/msisdn-range/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMsisdnRangeListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/msisdn-range').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMsisdnRangeListEntry: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/msisdn-range/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMsisdnRangeListEntryRange: function (name, range) {
                var promise = SMSAntiSpamConfigRestangular.all('/msisdn-range/' + name + '/range').post(range);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMsisdnRangeListEntryRange: function (name, start, end) {
                var promise = SMSAntiSpamConfigRestangular.one('/msisdn-range/' + name + '/range/' + start + '/' + end).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Application MT Filtering
            getApplicationMTFilteringList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/entry').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getApplicationMTFilteringListEntry: function (start, end) {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/entry/' + start + '/' + end).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createApplicationMTFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/applicationfiltering/exclusion/entry').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateApplicationMTFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/applicationfiltering/exclusion/entry').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteApplicationMTFilteringListEntry: function (start, end) {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/entry/' + start + '/' + end).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Application MT Filtering SMSC GT
            getApplicationMTFilteringSMSCGTList: function (start, end) {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/smsgt/' + start + '/' + end).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createApplicationMTFilteringSMSCGT: function (start, end, smscGT) {
                var promise = SMSAntiSpamConfigRestangular.all('/applicationfiltering/exclusion/smsgt/' + start + '/' + end).post(smscGT);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteApplicationMTFilteringSMSCGTList: function (start, end, smscGTNumber) {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/smsgt/' + start + '/' + end + '/' + smscGTNumber).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // International to Inbound
            getIntToInboundList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/inttoinbound/exclusion').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getIntToInboundListEntry: function (number, type) {
                var promise = SMSAntiSpamConfigRestangular.one('/inttoinbound/exclusion/' + number + '/' + type).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createIntToInboundListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/inttoinbound/exclusion').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateIntToInboundListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/inttoinbound/exclusion').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteIntToInboundListEntry: function (number, type) {
                var promise = SMSAntiSpamConfigRestangular.one('/inttoinbound/exclusion/' + number + '/' + type).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MT SMS Hub Filtering
            getMTSMSHubFilteringList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/trustedsmscgt/list').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getMTSMSHubFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/trustedsmscgt/list/entry/' + prefix).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMTSMSHubFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/trustedsmscgt/list/entry').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMTSMSHubFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/trustedsmscgt/list/entry').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMTSMSHubFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/trustedsmscgt/list/entry/' + prefix).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MO Inbound or Outbound Roamer Filtering
            getMOInboundOutboundRoamerFilteringList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/exclusionlist').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getMOInboundOutboundRoamerFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/exclusionlist/' + prefix).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMOInboundOutboundRoamerFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/exclusionlist').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMOInboundOutboundRoamerFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/exclusionlist').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMOInboundOutboundRoamerFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/exclusionlist/' + prefix).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MO Inbound or Outbound Roamer Filtering SMSC GT
            getMOInboundOutboundRoamerFilteringSMSCGTList: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/exclusionlist/smsgt/' + prefix).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createMOInboundOutboundRoamerFilteringSMSCGT: function (prefix, smscGT) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/exclusionlist/smsgt/' + prefix).post(smscGT);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMOInboundOutboundRoamerFilteringSMSCGTList: function (prefix, smscGTNumber) {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/exclusionlist/smsgt/' + prefix + '/' + smscGTNumber).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MO Inbound or Outbound Roamer Filtering
            getLocalIncomingMOList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/localincominglist').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createLocalIncomingMOListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/screeninglists/localincominglist/' + entry.msc).post();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteLocalIncomingMOListEntry: function (msc) {
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/localincominglist/' + msc).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Parameter Filtering
            getParameterFilteringList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/screening').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getParameterFilteringListEntry: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/screening/' + name).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createParameterFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/screening').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateParameterFilteringListEntry: function (name, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/screening/' + name).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteParameterFilteringListEntry: function (name) {
                var promise = SMSAntiSpamConfigRestangular.one('/screening/' + name).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SRI-SM Filtering
            getSRISMFilteringList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/srifsmfiltering/entry').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSRISMFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/srifsmfiltering/entry/' + prefix).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSRISMFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/srifsmfiltering/entry').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSRISMFilteringListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/srifsmfiltering/entry').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSRISMFilteringListEntry: function (prefix) {
                var promise = SMSAntiSpamConfigRestangular.one('/srifsmfiltering/entry/' + prefix).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SRI-FSM Counter
            getSRIFSMCounterConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/srifsmcounter/conf').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSRIFSMCounterConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/srifsmcounter/conf').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Switch MVNO
            getMVNOList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/switchmvno/all').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getMVNO: function () {

                var promise = SMSAntiSpamConfigRestangular.one('/switchmvno').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCurrentMVNO: function (mvno) {
                var promise = SMSAntiSpamConfigRestangular.all('/switchmvno/' + mvno).customPUT();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Filtering
            getMainFilteringConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/configuration').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMainFilteringConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/configuration').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getApplicationMTFilteringConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/applicationfiltering/exclusion/conf').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateApplicationMTFilteringConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/applicationfiltering/exclusion/conf').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getIntlToInboundFilteringConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/inttoinbound/config').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateIntlToInboundFilteringConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/inttoinbound/config').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSRISMFilteringConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/srifsmfiltering/config').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSRISMFilteringConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/srifsmfiltering/config').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getLocalIncomingMOFilteringConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/localincominglist/conf').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateLocalIncomingMOFilteringConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/screeninglists/localincominglist/conf').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Global Content Whitelist Screening
            getGlobalContentWhitelistScreeningConfiguration: function(){
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/contentscreeninglist/conf').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateGlobalContentWhitelistScreeningConfiguration: function(config){

                var promise = SMSAntiSpamConfigRestangular.all('/screeninglists/contentscreeninglist/conf').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getGlobalContentWhitelistScreeningList: function(){
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/contentscreeninglist/contentscreenings').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createGlobalContentWhitelistScreeningListEntry: function(entry){
                var promise = SMSAntiSpamConfigRestangular.all('/screeninglists/contentscreeninglist/contentscreening').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateGlobalContentWhitelistScreeningListEntry: function(entry){

                var promise = SMSAntiSpamConfigRestangular.all('/screeninglists/contentscreeninglist/contentscreening').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteGlobalContentWhitelistScreeningListEntry: function(entry){
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/contentscreeninglist/contentscreening').customOperation('remove', null, {}, {'Content-Type': 'application/json'}, entry);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // Global Source Screening
            getGlobalSourceScreening: function(){
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/sourcescreeninglist/conf').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateGlobalSourceScreening: function(config){

                var promise = SMSAntiSpamConfigRestangular.all('/screeninglists/sourcescreeninglist/conf').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getGlobalSourceScreeningMscRange: function(){
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/sourcescreeninglist/mscRange').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createGlobalSourceScreeningMscRange: function(entry){
                var promise = SMSAntiSpamConfigRestangular.all('/screeninglists/sourcescreeninglist/mscRange').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteGlobalSourceScreeningMscRange: function(entry){
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/sourcescreeninglist/mscRange').customOperation('remove', null, {}, {'Content-Type': 'application/json'}, entry);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getGlobalSourceScreeningMsisdnRange: function(){
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/sourcescreeninglist/msisdnRange').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createGlobalSourceScreeningMsisdnRange: function(entry){
                var promise = SMSAntiSpamConfigRestangular.all('/screeninglists/sourcescreeninglist/msisdnRange').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteGlobalSourceScreeningMsisdnRange: function(entry){
                var promise = SMSAntiSpamConfigRestangular.one('/screeninglists/sourcescreeninglist/msisdnRange').customOperation('remove', null, {}, {'Content-Type': 'application/json'}, entry);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // Fraud detection
            getFraudDetectionConfiguration: function (key) {
                var url = '/frauddetection' + (key ? '/list/conf/' + key : '/conf');

                var promise = SMSAntiSpamConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateFraudDetectionConfiguration: function (config, key) {
                var url = '/frauddetection' + (key ? '/list/conf/' + key : '/conf');

                var promise = SMSAntiSpamConfigRestangular.all(url).customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MO Anti-Spoofing
            getMOAntiSpoofingConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/frauddetection/antispoofing').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateMOAntiSpoofingConfiguration: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/antispoofing').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // IMSI masking
            getIMSIMaskingConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/imsimasking').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateIMSIMaskingConfiguration: function (name, config) {
                var promise = SMSAntiSpamConfigRestangular.all('/imsimasking/' + name).customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SCA modification
            getSCAModificationConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/scamodifier/config').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSCAModificationConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/scamodifier/config').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSCAModifierList: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/scamodifier/entry').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getSCAModifierListEntry: function (callingGt, mscGt) {
                var promise = SMSAntiSpamConfigRestangular.one('/scamodifier/entry/' + callingGt + '/' + mscGt).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSCAModifierListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/scamodifier/entry').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSCAModifierListEntry: function (entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/scamodifier/entry').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteSCAModifierListEntry: function (callingGt, mscGt) {
                var promise = SMSAntiSpamConfigRestangular.one('/scamodifier/entry/' + callingGt + '/' + mscGt).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // SMSC GT
            getSMSCGTConfiguration: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/smscgtcorrection/conf').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSMSCGTConfiguration: function (config) {
                var promise = SMSAntiSpamConfigRestangular.all('/smscgtcorrection/conf').customPUT(config);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Alarm Notifications. Possible key values are: all, new, old
            getAlarmStatistics: function () {
                var promise = SMSAntiSpamConfigRestangular.one('/alarms/stats').get();
                // Do not set promise tracker so does not need to show indicator for statistic data.

                return promise;
            },
            getAlarmNotifications: function (key, pageSize, offset, promiseTracker) {
                if (offset === 0) {
                    offset = 1;
                }

                var promise = SMSAntiSpamConfigRestangular.one('/alarms/' + key + '?pageSize=' + pageSize + '&offset=' + offset).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getAllAlarmNotifications: function (pageSize, offset, promiseTracker) {
                return this.getAlarmNotifications('all', pageSize, offset, promiseTracker);
            },
            getNewAlarmNotifications: function (pageSize, offset, promiseTracker) {
                return this.getAlarmNotifications('new', pageSize, offset, promiseTracker);
            },
            getOldAlarmNotifications: function (pageSize, offset, promiseTracker) {
                return this.getAlarmNotifications('old', pageSize, offset, promiseTracker);
            },
            getAlarmNotification: function (entryId) {
                var promise = SMSAntiSpamConfigRestangular.one('/alarms/detailed/' + entryId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteAlarmNotification: function (entryId) {
                var promise = SMSAntiSpamConfigRestangular.one('/alarms/detailed/' + entryId).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateAlarmNotification: function (alarmNotification) {
                var promise = SMSAntiSpamConfigRestangular.all('/alarms/detailed/' + alarmNotification.alarmEntry.entryId).customPUT(alarmNotification);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Suspicious Messages
            getFraudDetectionLogAndAccept: function (rejectMethod) {
                var url = '/frauddetection' + (rejectMethod ? '/list/conf/all/' + rejectMethod : '/list/conf/all/3');

                var promise = SMSAntiSpamConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            getFraudDetectionByType: function (listtype) {
                var url = '/frauddetection/list/conf/' + listtype;

                var promise = SMSAntiSpamConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            updateFraudDetectionByType: function (listtype, entry) {
                var promise = SMSAntiSpamConfigRestangular.all('/frauddetection/list/conf/' + listtype).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getCountersLogAndAccept: function (rejectMethod) {
                var url = '/counter/' + (rejectMethod ? + rejectMethod : '3');

                var promise = SMSAntiSpamConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            getContentCountersLogAndAccept: function (rejectMethod) {
                var url = '/counter/contentall/' + (rejectMethod ? + rejectMethod : '3');

                var promise = SMSAntiSpamConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            getContentFiltersLogAndAccept: function (rejectMethod) {
                var url = '/content-filter/' + (rejectMethod ? + rejectMethod : '3');

                var promise = SMSAntiSpamConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;

            },
            getScreeningsLogAndAccept: function (rejectMethod) {
                var url = '/screening/all/' + (rejectMethod ? + rejectMethod : '3');

                var promise = SMSAntiSpamConfigRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;

            }
        };
    });

    ApplicationServices.factory('SMSAntiSpamAlarmService', function ($log, $q, Restangular, SMSAntiSpamConfigService) {
        return {
            stats: {
                newAlarmsCount: 0,
                totalAlarmsCount: 0
            },
            updateNewAlarmsCount: function () {
                var _self = this;

                var deferred = $q.defer();

                SMSAntiSpamConfigService.getAlarmStatistics().then(function (response) {
                    var apiResponse = Restangular.stripRestangular(response);

                    $log.debug('Anti-Spam SMS alarm notifiation stats: ', apiResponse);

                    _self.stats = apiResponse.alarmStats;

                    deferred.resolve(response);
                });

                return deferred.promise;
            }
        };
    });

    // MCA Services
    ApplicationServices.factory('MCAConfService', function ($log, $filter, MCAConfigRestangular, Restangular, notification, $translate, UtilService,
                                                            P4M_MVNO_NAME) {
        var getMessageTemplates = function (serviceKey) {
            var promise = MCAConfigRestangular.one(serviceKey + '/' + P4M_MVNO_NAME + '/MCN').get();
            UtilService.addPromiseToTracker(promise);
            return promise.then(function (response) {
                var apiResponse = Restangular.stripRestangular(response);
                $log.debug('MCA get messages. Response: ', apiResponse);

                if (apiResponse && apiResponse.errorCode) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: apiResponse.errorCode,
                            errorText: apiResponse.message
                        })
                    });
                } else {
                    return $filter('orderBy')(apiResponse, 'name');
                }
            }, function (response) {
                if (response.data) {
                    notification({
                        type: 'warning',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.data.errorCode,
                            errorText: response.data.message
                        })
                    });
                }

                return [];
            });
        };

        var getMessageTemplateByTemplateName = function (serviceKey, templateName) {
            var promise = MCAConfigRestangular.one(serviceKey + '/' + P4M_MVNO_NAME + '/MCN/' + templateName).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };


        var showError = function (response) {
            if(response) {
                if (response.statusCode) {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.statusCode,
                            errorText: response.statusExplanation
                        })
                    });
                }
                if (response.errorCode || (response.data && response.data.errorCode)) {
                    notification({
                        type: 'danger',
                        text: $translate.instant('CommonMessages.ApiError', {
                            errorCode: response.errorCode || response.data.errorCode,
                            errorText: response.message || response.data.message
                        })
                    });
                }
            }
        }

        var getMessageFormatByLanguage = function (serviceKey, langCode) {
            var promise = MCAConfigRestangular.one(serviceKey + '/' + langCode).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        return {

            getMcaConfiguration: function (promiseTracker) {
                var promise = MCAConfigRestangular.one('serviceConfig/' + P4M_MVNO_NAME + '/MCN').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateMcaConfiguration: function (conf) {
                var promise = MCAConfigRestangular.one('serviceConfig/' + P4M_MVNO_NAME + '/MCN').customPUT(conf);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // updateMcaConfiguration: function (conf, promiseTracker) {
            //     var promise = MCAConfigRestangular.one('allowedRedirectionReasons/' + P4M_MVNO_NAME + '/MCN').customPUT(conf);
            //     UtilService.addPromiseToTracker(promise);
            //     return promise.then(function (response){
            //         $log.debug('Update MCA configuration. Response: ', response);
            //         showError(response);
            //         return response;
            //     });
            // },
            // getMcaRedirectionReasonsConfiguration: function (promiseTracker) {
            //     var promise = MCAConfigRestangular.one('allowedRedirectionReasons/' + P4M_MVNO_NAME + '/MCN').get();
            //     UtilService.addPromiseToTracker(promise, promiseTracker);
            //     return promise.then(function (response) {
            //         $log.debug('MCA Redirection Reasons configuration. Response: ', response);
            //
            //         showError(response);
            //
            //         return response;
            //     });
            // },
            // updateMcaRedirectionReasonsConfiguration: function (conf, promiseTracker) {
            //     var promise = MCAConfigRestangular.one('allowedRedirectionReasons/' + P4M_MVNO_NAME + '/MCN').customPUT(conf);
            //     UtilService.addPromiseToTracker(promise, promiseTracker);
            //     return promise.then(function (response) {
            //         $log.debug('MCA Redirection reasons configuration response: ', response);
            //
            //         showError(response);
            //
            //         return response;
            //     });
            // },
            // Message Templates
            // MCA (This will serve as MCA Extra
            getMcaMessageTemplates: function () {
                return getMessageTemplates('messageFormats/mca');
            },
            getMcaMessageTemplateByTemplateName: function (templateName) {
                return getMessageTemplateByTemplateName('messageFormats/mca', templateName);
            },
            updateMcaMessageTemplateByTemplateName: function (templateName, format) {
                var promise = MCAConfigRestangular.all('messageFormats/mca/' + P4M_MVNO_NAME + '/MCN/' + templateName).customPUT(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewMcaMessageTemplateByTemplateName: function (format) {
                var promise = MCAConfigRestangular.all('messageFormats/mca/' + P4M_MVNO_NAME + '/MCN').post(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMcaMessageTemplateByTemplateName: function (templateName) {
                var promise = MCAConfigRestangular.all('messageFormats/mca/' + P4M_MVNO_NAME + '/MCN/' + templateName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // MCA Basic
            getMcaBasicMessageTemplates: function () {
                return getMessageTemplates('messageFormats/basicmca');
            },
            getMcaBasicMessageTemplateByTemplateName: function (templateName) {
                return getMessageTemplateByTemplateName('messageFormats/basicmca', templateName);
            },
            updateMcaBasicMessageTemplateByTemplateName: function (templateName, format) {
                var promise = MCAConfigRestangular.all('messageFormats/basicmca/' + P4M_MVNO_NAME + '/MCN/' + templateName).customPUT(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewMcaBasicMessageTemplateByTemplateName: function (format) {
                var promise = MCAConfigRestangular.all('messageFormats/basicmca/' + P4M_MVNO_NAME + '/MCN').post(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteMcaBasicMessageTemplateByTemplateName: function (templateName) {
                var promise = MCAConfigRestangular.all('messageFormats/basicmca/' + P4M_MVNO_NAME + '/MCN/' + templateName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Notify Me
            getNotifyMeMessageTemplates: function () {
                return getMessageTemplates('messageFormats/notifyMe');
            },
            getNotifyMeMessageTemplateByTemplateName: function (templateName) {
                return getMessageTemplateByTemplateName('messageFormats/notifyMe', templateName);
            },
            updateNotifyMeMessageTemplateByTemplateName: function (templateName, format) {
                var promise = MCAConfigRestangular.all('messageFormats/notifyMe/' + P4M_MVNO_NAME + '/MCN/' + templateName).customPUT(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewNotifyMeMessageTemplateByTemplateName: function (format) {
                var promise = MCAConfigRestangular.all('messageFormats/notifyMe/' + P4M_MVNO_NAME + '/MCN').post(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteNotifyMeMessageTemplateByTemplateName: function (templateName) {
                var promise = MCAConfigRestangular.all('messageFormats/notifyMe/' + P4M_MVNO_NAME + '/MCN/' + templateName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // ANN ?
            getAnnMessageTemplates: function () {
                return getMessageTemplates('messageFormats/ann');
            },
            getAnnMessageTemplateByTemplateName: function (templateName) {
                return getMessageTemplateByTemplateName('messageFormats/ann', templateName);
            },
            updateAnnMessageTemplateByTemplateName: function (templateName, format) {
                var promise = MCAConfigRestangular.all('messageFormats/ann/' + P4M_MVNO_NAME + '/MCN/' + templateName).customPUT(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewAnnMessageTemplateByTemplateName: function (format) {
                var promise = MCAConfigRestangular.all('messageFormats/ann/' + P4M_MVNO_NAME + '/MCN').post(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteAnnMessageTemplateByTemplateName: function (templateName) {
                var promise = MCAConfigRestangular.all('messageFormats/ann/' + P4M_MVNO_NAME + '/MCN/' + templateName).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Notify Me
            getNotifyMeMessageFormat: function () {
                return getMessageFormat('notifyMe', 'MCN');
            },
            getNotifyMeMessageFormatByLanguage: function (langCode) {
                return getMessageFormatByLanguage('notifyMe', 'MCN', langCode);
            },
            updateNotifyMeMessageFormatByLanguage: function (format) {
                var promise = MCAConfigRestangular.all('messageFormats/notifyMe/' + P4M_MVNO_NAME + '/MCN/' + format.name).customPUT(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewNotifyMeMessageFormat: function (format) {
                var promise = MCAConfigRestangular.all('messageFormats/notifyMe/' + P4M_MVNO_NAME + '/MCN/' + format.name).post(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getNotifyMeConfiguration: function () {
                var promise = MCAConfigRestangular.one('notifyMeConfig/' + P4M_MVNO_NAME + '/MCN').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateNotifyMeConfiguration: function (conf) {
                var promise = MCAConfigRestangular.one('notifyMeConfig/' + P4M_MVNO_NAME + '/MCN').customPUT(conf);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            // ANN
            getAnnMessageFormat: function () {
                return getMessageFormat('ann', 'MCN');
            },
            getAnnMessageFormatByLanguage: function (langCode) {
                return getMessageFormatByLanguage('ann', 'MCN', langCode);
            },
            updateAnnMessageFormatByLanguage: function (format) {
                format.singleCallSmsTemplate = format.multipleCallSmsBodyTemplate;
                var promise = MCAConfigRestangular.all('messageFormats/ann/' + P4M_MVNO_NAME + '/MCN/' + format.name).customPUT(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewAnnMessageFormat: function (format) {
                format.singleCallSmsTemplate = format.multipleCallSmsBodyTemplate;
                var promise = MCAConfigRestangular.all('messageFormats/ann/' + P4M_MVNO_NAME + '/MCN/' + format.name).post(format);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getANNConfiguration: function () {
                var promise = MCAConfigRestangular.one('annConfig/' + P4M_MVNO_NAME + '/MCN').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateANNConfiguration: function (conf) {
                var promise = MCAConfigRestangular.one('annConfig/' + P4M_MVNO_NAME + '/MCN').customPUT(conf);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
        };
    });


    ApplicationServices.factory('MCAProvService', function ($log, MCAProvRestangular, UtilService, P4M_MVNO_NAME) {
        return {
            getSubscription: function (msisdn) {
                var promise = MCAProvRestangular.one('subscriptions/' + P4M_MVNO_NAME + '/MCN/' + msisdn).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    ApplicationServices.factory('MCADashboardService', function ($log, MCADashboardRestangular, CMPFService, UtilService,
                                                                 P4M_MVNO_NAME) {
        return {
            getStatistics: function (promiseTracker) {
                var promise = MCADashboardRestangular.one('statistics/' + P4M_MVNO_NAME + '/MCN').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    // Voice Mail Services
    ApplicationServices.factory('VMDashboardService', function ($log, VMDashboardRestangular, UtilService) {
        return {
            getVMDashboard: function (promiseTracker) {
                var promise = VMDashboardRestangular.one('voicemail').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });
    ApplicationServices.factory('VMConfigurationService', function ($log, $q, VMConfigurationRestangular, VMSelfCareRestangular, UtilService) {
        return {
            // Class of Service Profiles
            getCoSProfiles: function (promiseTracker) {
                var deferred = $q.defer();

                VMConfigurationRestangular.one('/cos-profiles').get().then(function (response) {
                    var classOfServiceProfiles = response;

                    classOfServiceProfiles = _.filter(classOfServiceProfiles, function (classOfServiceProfile) {
                        return (classOfServiceProfile.cosName !== 'Temporary' && classOfServiceProfile.cosName !== 'VoiceSMS');
                    });

                    deferred.resolve(classOfServiceProfiles);
                }, function (response) {
                    deferred.resolve(response);
                });

                UtilService.addPromiseToTracker(deferred.promise, promiseTracker);

                return deferred.promise;
            },
            getCoSProfileEntry: function (profileId) {
                var promise = VMConfigurationRestangular.one('/cos-profiles/' + profileId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateCoSProfileEntry: function (profileId, entry) {
                var promise = VMConfigurationRestangular.all('/cos-profiles/' + profileId).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Retrieve Service Profile
            getServiceProfile: function () {
                var promise = VMConfigurationRestangular.one('/service-profiles/vm').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateServiceProfile: function (entry) {
                var promise = VMConfigurationRestangular.all('/service-profiles/vm').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getLanguages: function () {
                var promise = VMSelfCareRestangular.one('languages').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Retrieve Notification Text
            getNotificationText: function (languageCode, type) {
                var url = '/texts/static/' + languageCode + '/notification';
                if (type) {
                    url += '?type=' + type;
                }

                var promise = VMConfigurationRestangular.one(url).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateNotificationText: function (languageCode, entry, type) {
                var url = '/texts/static/' + languageCode + '/notification';
                if (type) {
                    url += '?type=' + type;
                }

                var promise = VMConfigurationRestangular.all(url).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Prompt List
            getPromptList: function (contentType) {
                var contentList = [];

                contentList['common'] = {
                    "contentList": [
                        "VM_BEEP",
                        "VM_FIRST_MSG",
                        "VM_LANGUAGE_MENU",
                        "VM_LAST_MSG",
                        "VM_MSG_DELETED",
                        "VM_MSG_SAVED",
                        "VM_NEW_MSG_PROMPT",
                        "VM_NEW_MSGS_PROMPT",
                        "VM_NEXT_MSG",
                        "VM_NO_MATCH",
                        "VM_NO_MSG_EXISTS",
                        "VM_NO_NEW_MSG_EXISTS",
                        "VM_NO_RESPONSE",
                        "VM_NUMBEROF_PROMPT",
                        "VM_OLD_MSG_PROMPT",
                        "VM_OLD_MSGS_PROMPT",
                        "VM_WRONG_SELECTION"
                    ]
                };
                contentList['deposit'] = {
                    "contentList": [
                        "VM_DESTINATION_MSGBOX_FULL",
                        "VM_MESSAGE_SENT",
                        "VM_RECORD_MSG"
                    ]
                };
                contentList['retrieval'] = {
                    "contentList": [
                        "VM_ALL_FWD_DISABLED",
                        "VM_ALL_MAILBOX_MENU_2",
                        "VM_BUSY_FWD_DISABLED",
                        "VM_BUSY_FWD_ENABLED",
                        "VM_DATE_INFO_PROMPT",
                        "VM_DISABLE_FWD_OPTIONS_MENU",
                        "VM_DISABLE_PASSWORD_MENU",
                        "VM_ENABLE_FWD_OPTIONS_MENU",
                        "VM_ENABLE_PASSWORD_MENU",
                        "VM_ENTER_NEW_PASSWORD",
                        "VM_ENTER_PASSWORD",
                        "VM_ENTER_STC_NUMBER",
                        "VM_FORWARDING_MENU",
                        "VM_GREETING_ACTIVATED",
                        "VM_GREETING_DELETED",
                        "VM_GREETING_EXISTING_MENU",
                        "VM_GREETING_MENU",
                        "VM_GREETING_OPTIONS_MENU",
                        "VM_NA_FWD_DISABLED",
                        "VM_NA_FWD_ENABLED",
                        "VM_NEW_MAILBOX_MENU_2",
                        "VM_OLD_MAILBOX_MENU_2",
                        "VM_PASSWORD",
                        "VM_PASSWORD_ACTIVATED",
                        "VM_PASSWORD_CHANGED",
                        "VM_PASSWORD_CONFIRM_MENU",
                        "VM_PASSWORD_DEACTIVATED",
                        "VM_PASSWORD_INVALID",
                        "VM_PERSONAL_MENU",
                        "VM_PHONE_FAILURE_PROMPT",
                        "VM_RECORD_GREETING",
                        "VM_SENDER_INFO_PROMPT",
                        "VM_SINGLE_MSG_MENU",
                        "VM_START_INFO_PROMPT",
                        "VM_SUBSCRIBER_MSGBOX_FULL",
                        "VM_UNCOND_FWD_DISABLED",
                        "VM_UNCOND_FWD_ENABLED",
                        "VM_UNKNOWN_SENDER_PROMPT",
                        "VM_UNREACHABLE_FWD_DISABLED",
                        "VM_UNREACHABLE_FWD_ENABLED",
                        "VM_YOUR_GREETING",
                        "VM_WELCOME"
                    ]
                };

                return contentList[contentType].contentList;
            }
        };
    });
    ApplicationServices.factory('VMProvisioningService', function ($log, VMProvisioningRestangular, UtilService) {
        return {
            SERVICE_NAME: 'VoiceMail',
            getServicePreferences: function (msisdn) {
                var promise = VMProvisioningRestangular.one('messageBoxes/' + msisdn + '?type=vm').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // PM4 Services
    ApplicationServices.factory('P4MService', function ($log, P4MRestangular, P4M_MVNO_NAME, P4M_MVNO_NAME_UPPER, UtilService) {
        return {
            // Collect Call
            getCcDashboard: function (promiseTracker) {
                var promise = P4MRestangular.one('ccDashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getCcConfigAll: function () {
                var promise = P4MRestangular.one('ccServiceConfig/' + P4M_MVNO_NAME_UPPER + '/ccCosConfig').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getCcConfig: function (cosName) {
                var promise = P4MRestangular.one('ccServiceConfig/' + P4M_MVNO_NAME_UPPER + '/ccCosConfig/' + cosName).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateCcConfig: function (cosName, profile) {
                var promise = P4MRestangular.all('ccServiceConfig/' + P4M_MVNO_NAME_UPPER + '/ccCosConfig/' + cosName).customPUT(profile);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getCcServiceConfig: function (promiseTracker) {
                var promise = P4MRestangular.one('ccServiceConfig/' + P4M_MVNO_NAME_UPPER + '/ccLimitConfig').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updateCcServiceConfig: function (serviceConfig) {
                var promise = P4MRestangular.all('ccServiceConfig/' + P4M_MVNO_NAME_UPPER + '/ccLimitConfig').customPUT(serviceConfig);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Poke Call
            getPokeCallServiceDashboard: function (promiseTracker) {
                var promise = P4MRestangular.one('pokeDashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            getPokeCallServiceConfiguration: function (promiseTracker) {
                var promise = P4MRestangular.one('pokeServiceConfig/' + P4M_MVNO_NAME + '/pokeLimitConfig').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            updatePokeCallServiceConfiguration: function (profile, promiseTracker) {
                var promise = P4MRestangular.all('pokeServiceConfig/' + P4M_MVNO_NAME + '/pokeLimitConfig').customPUT(profile);
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            // Call Me Back
            getPcmDashboard: function (promiseTracker) {
                var promise = P4MRestangular.one('cmbDashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getCmbServiceProfile: function (promiseTracker) {
                var promise = P4MRestangular.one('cmbServiceConfig/' + P4M_MVNO_NAME_UPPER + '/cmbLimitConfig ').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateCmbServiceProfile: function (profile, promiseTracker) {
                var promise = P4MRestangular.all('cmbServiceConfig/' + P4M_MVNO_NAME_UPPER + '/cmbLimitConfig').customPUT(profile);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getCmbAdvertisements: function (promiseTracker) {
                // /v3/cmbServiceConfig/STC/cmbAdvertisementConfig/
                var promise = P4MRestangular.one('cmbServiceConfig/' + P4M_MVNO_NAME_UPPER + '/cmbAdvertisementConfig').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;

            },
            getCmbAdvertisement: function (advertLanguage, promiseTracker) {
                // /v3/cmbServiceConfig/STC/cmbAdvertisementConfig/EN
                var promise = P4MRestangular.one('cmbServiceConfig/' + P4M_MVNO_NAME_UPPER + '/cmbAdvertisementConfig/' + advertLanguage).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateCmbAdvertisement: function (advertLanguage, entry, promiseTracker) {

                var promise = P4MRestangular.all('cmbServiceConfig/' + P4M_MVNO_NAME_UPPER + '/cmbAdvertisementConfig/' + advertLanguage).customPUT(entry);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getCmbAdvertisementConfig: function (promiseTracker) {
                var promise = P4MRestangular.one('cmbServiceConfig').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateCmbAdvertisementConfig: function ( entry, promiseTracker) {

                var promise = P4MRestangular.all('cmbServiceConfig/' + P4M_MVNO_NAME_UPPER ).customPUT(entry);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }

        };
    });

    // RBT Services
    ApplicationServices.factory('RBTDashboardService', function ($log, RBTConfigurationRestangular, UtilService) {
        return {
            getRBTDashboard: function (promiseTracker) {
                var promise = RBTConfigurationRestangular.one('/rbt-dashboard').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });
    ApplicationServices.factory('RBTConfService', function ($log, RBTConfigurationRestangular, CRBTConfigurationRestangular, UtilService) {
        return {

            getRBTServiceProfiles: function (promiseTracker) {
                var promise = RBTConfigurationRestangular.one('/rbt-service-profiles').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            updateRBTServiceProfiles: function (config) {
                var promise = RBTConfigurationRestangular.all('/rbt-service-profiles').customPUT(config);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getPTServiceProfiles: function () {

                var promise = RBTConfigurationRestangular.one('/pt-service-profiles').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updatePTServiceProfiles: function (config) {
                var promise = RBTConfigurationRestangular.all('/pt-service-profiles').customPUT(config);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getLanguages: function () {
                var promise = RBTConfigurationRestangular.one('/hangup-profiles/languages').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getHangupServiceProfiles: function () {

                var promise = RBTConfigurationRestangular.one('/hangup-profiles').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateHangupServiceProfiles: function (config) {
                var promise = RBTConfigurationRestangular.all('/hangup-profiles').customPUT(config);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getMessageTemplates:function(languageCode){
                var promise = RBTConfigurationRestangular.one('/hangup-profiles/texts/'+ languageCode ).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateMessageTemplates: function (languageCode, entry) {
                var promise = RBTConfigurationRestangular.all('/hangup-profiles/texts/'+ languageCode).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Enhanced Press One
            getPressKeyConfiguration: function () {

                var promise = CRBTConfigurationRestangular.one('/enhancedPressOne').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updatePressKeyConfiguration: function (entry) {
                var promise = CRBTConfigurationRestangular.all('/enhancedPressOne').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPromotions: function () {
                var promise = CRBTConfigurationRestangular.one('/enhancedPressOne/promotions').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getTonePromotions: function (dtmfKey) {
                var promise = CRBTConfigurationRestangular.one('/enhancedPressOne/promotions/tone/' + dtmfKey).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            deletePromotion: function (dtmfKey, promotionType, serviceOfferName) {

                var svcPath = '/enhancedPressOne/promotions/' + promotionType.toLowerCase() + '/' + encodeURIComponent(dtmfKey);
                if(promotionType == 'SERVICE'){
                    svcPath += '/' + serviceOfferName;
                }

                var promise = CRBTConfigurationRestangular.all(svcPath).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteTonePromotion: function (dtmfKey, promotionType, subscriptionCode) {
                var svcPath = '/enhancedPressOne/promotions/' + promotionType.toLowerCase() + '/' + encodeURIComponent(dtmfKey)+ '/' + subscriptionCode;

                var promise = CRBTConfigurationRestangular.all(svcPath).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            //Prompts
            uploadPrompt: function (contentFormData, svcpath) {
                var promise = CRBTConfigurationRestangular.one(svcpath)
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPOST(contentFormData, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    ApplicationServices.factory('RBTHotCodeService', function ($log, RBTHotCodeRestangular, UtilService) {
        return{
            //HotCodes
            getHotCodes:function(){
                var promise = RBTHotCodeRestangular.one('/hot-code' ).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getHotCode:function(hotCode){
                var promise = RBTHotCodeRestangular.one('/hot-code/' + hotCode ).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createHotCode: function (entry) {
                var promise = RBTHotCodeRestangular.all('/hot-code').post(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateHotCode: function (hotCode, entry) {
                var promise = RBTHotCodeRestangular.all('/hot-code/' + hotCode).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteHotCode:  function (hotCode) {
                var promise = RBTHotCodeRestangular.all('/hot-code/'+ hotCode).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    ApplicationServices.factory('RBTSMSAutomationService', function ($log, RBTSMSAutomationRestangular, UtilService) {
        return {
            //SMS Automation Service
            getSMSAutomationService: function () {
                var promise = RBTSMSAutomationRestangular.one('/service-settings').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateSMSAutomationService: function (entry) {
                var promise = RBTSMSAutomationRestangular.one('/service-settings').customPUT(entry);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getMessageTemplates:function(languageCode){
                var promise = RBTSMSAutomationRestangular.one('/advertisement-configs/'+ languageCode ).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateMessageTemplates: function (languageCode, entry) {
                var promise = RBTSMSAutomationRestangular.all('/advertisement-configs/'+ languageCode).customPUT(entry);
                UtilService.addPromiseToTracker(promise);
                return promise;
            }

        };
    });
    // Voice SMS Services (These are taken from Jawwal)
    ApplicationServices.factory('VSMSDashboardService', function ($log, VSMSDashboardRestangular, UtilService) {
        return {
            getVSMSDashboard: function (promiseTracker) {
                var promise = VSMSDashboardRestangular.one('voicesms').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        };
    });
    ApplicationServices.factory('VSMSConfigurationService', function ($log, $q, VSMSConfigurationRestangular, VSMSSelfCareRestangular, UtilService) {
        return {
            // Subscriber Profiles
            getSubscriberProfiles: function (promiseTracker) {
                var deferred = $q.defer();

                VSMSConfigurationRestangular.one('/cos-profiles').get().then(function (response) {
                    var subscriberProfiles = response;

                    subscriberProfiles = _.filter(subscriberProfiles, function (subscriberProfile) {
                        return (subscriberProfile.cosName === 'VoiceSMS');
                    });

                    deferred.resolve(subscriberProfiles);
                }, function (response) {
                    deferred.reject(response);
                });

                UtilService.addPromiseToTracker(deferred.promise, promiseTracker);

                return deferred.promise;
            },
            getSubscriberProfileEntry: function (profileId) {
                var promise = VSMSConfigurationRestangular.one('/cos-profiles/' + profileId).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubscriberProfileEntry: function (profileId, entry) {
                var promise = VSMSConfigurationRestangular.all('/cos-profiles/' + profileId).customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Retrieve Service Profile
            getServiceProfile: function () {
                var promise = VSMSConfigurationRestangular.one('/service-profiles/vsms').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateServiceProfile: function (entry) {
                var promise = VSMSConfigurationRestangular.all('/service-profiles/vsms').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getLanguages: function () {
                var promise = VSMSSelfCareRestangular.one('languages').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Retrieve Notification Text
            getNotificationText: function (languageCode) {
                var promise = VSMSConfigurationRestangular.one('/texts/static/' + languageCode + '/notification?type=vsms').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateNotificationText: function (languageCode, entry) {
                var promise = VSMSConfigurationRestangular.all('/texts/static/' + languageCode + '/notification?type=vsms').customPUT(entry);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Prompt List
            getPromptList: function (contentType) {
                var contentList = [];

                contentList['common'] = {
                    "contentList": [
                        "VSMS_BACK_TO_MAIN_MENU_PROMPT",
                        "VSMS_BACK_TO_PREV_MENU_PROMPT",
                        "VSMS_BEEP",
                        "VSMS_END_CALL",
                        "VSMS_END_OF_LIST",
                        "VSMS_INVALID_SUBSCRIBER",
                        "VSMS_LANGUAGE_OPTIONS_MENU",
                        "VSMS_LANGUAGE_OPTIONS_MENU_AR",
                        "VSMS_LANGUAGE_OPTIONS_MENU_EN",
                        "VSMS_MESSAGE_SENT",
                        "VSMS_MSG_DELETED",
                        "VSMS_NEW_MSG_PROMPT",
                        "VSMS_NEW_MSGS_PROMPT",
                        "VSMS_NO_MATCH",
                        "VSMS_NO_MSG_EXISTS",
                        "VSMS_NO_NEW_MSG_EXISTS",
                        "VSMS_NO_OLD_MSG_EXISTS",
                        "VSMS_NO_RESPONSE",
                        "VSMS_NO_SELECTION",
                        "VSMS_NUMBEROF_PROMPT",
                        "VSMS_OLD_MSG_PROMPT",
                        "VSMS_OLD_MSGS_PROMPT",
                        "VSMS_OPERATION_SUCCESS",
                        "VSMS_ORIGINATOR_MSGBOX_FULL",
                        "VSMS_PLEASE",
                        "VSMS_PRESS",
                        "VSMS_THANK_YOU",
                        "VSMS_WRONG_SELECTION"
                    ]
                };
                contentList['deposit'] = {
                    "contentList": [
                        "VSMS_DEPOSIT_MENU",
                        "VSMS_DESTINATION_MSGBOX_FULL",
                        "VSMS_RECORD_MSG"
                    ]
                };
                contentList['retrieval'] = {
                    "contentList": [
                        "VSMS_MAIN_MENU",
                        "VSMS_SINGLE_MSG_MENU"
                    ]
                };

                return contentList[contentType].contentList;
            }
        };
    });
    ApplicationServices.factory('VSMSProvisioningService', function ($log, VSMSProvisioningRestangular, UtilService) {
        return {
            getServicePreferences: function (msisdn) {
                var promise = VSMSProvisioningRestangular.one('messageBoxes/' + msisdn + '?type=vsms').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        };
    });

    // Screening Manager Services
    ApplicationServices.factory('ScreeningManagerService', function ($log, ScreeningManagerRestangularV2, ScreeningManagerRestangularV3, ScreeningManagerStatsRestangular, Restangular, notification, $translate, UtilService) {
        var CHANNEL_TYPE = 'CC';

        return {
            lists: {
                // SMSC
                SMSC_GLOBAL_KEY: 'MSISDN',
                SMSC_PER_APPLICATION_PREFIX_KEY: 'smpp'
            },
            serviceNames: {
                SSM: "ssmservice"
            },
            scopes: {
                // Main service scopes
                GLOBAL_SCOPE_KEY: 'global',
                COC_SCOPE_KEY: 'cc', // collect call
                MMSC_SCOPE_KEY: 'mmsc', // mms center
                SMSC_SCOPE_KEY: 'smsc', // sms center
                ICS_SCOPE_KEY: 'ics', // intelligent call screening
                CMB_SCOPE_KEY: 'cmb', // call me back
                POKE_CALL_SCOPE_KEY: 'poke', // poke call
                RBT_SCOPE_KEY: 'rbt', // ring back tone
                COLLECTSMS_SCOPE_KEY: 'collectsms', // collect sms
                MCA_SCOPE_KEY: 'mca', // missed call alert
                PSMS_SCOPE_KEY: 'psms', // personalized sms
                PMMS_SCOPE_KEY: 'pmms', // personalized mms
                VM_SCOPE_KEY: 'vm', // voice mail
                // DSP scopes
                MSISDN_SCOPE_KEY: 'msisdn',
                SAN_SCOPE_KEY: 'san',
                // SMSC
                SMSC_INCOMING_MSISDN_SCOPE_KEY: 'incoming_msisdn',
                SMSC_INCOMING_IMSI_SCOPE_KEY: 'incoming_imsi',
                SMSC_INCOMING_MSC_SCOPE_KEY: 'incoming_msc',
                SMSC_OUTGOING_MSISDN_SCOPE_KEY: 'outgoing_msisdn',
                SMSC_OUTGOING_IMSI_SCOPE_KEY: 'outgoing_imsi',
                SMSC_OUTGOING_MSC_SCOPE_KEY: 'outgoing_msc',
                SMSC_OUTGOING_HLR_SCOPE_KEY: 'outgoing_hlr'
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
            getScreenings: function (promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('screenings').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScreeningsByServiceName: function (name, promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('screenings/' + name).get();
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
            getConstraintsByServiceName: function (name, promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('constraints/' + name).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScopes: function (promiseTracker) {
                var promise = ScreeningManagerStatsRestangular.one('scopes').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScopeOrderings: function (promiseTracker) {
                var promise = ScreeningManagerRestangularV2.one(CHANNEL_TYPE + '/screeningmanager/ordering/scopes').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            addScopeOrdering: function (newOrdering, promiseTracker) {
                var promise = ScreeningManagerRestangularV2.all(CHANNEL_TYPE + '/screeningmanager/ordering/scopes').post(newOrdering);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScopeOrdering: function (scope, promiseTracker) {
                var promise = ScreeningManagerRestangularV2.one(CHANNEL_TYPE + '/' + scope + '/ordering/scopes/' + scope).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise.then(function (response) {
                    var apiResponse = Restangular.stripRestangular(response);
                    $log.debug('Get Scope ordering. Response: ', apiResponse);
                    return apiResponse;
                });
            },
            getLimitConfiguration: function (promiseTracker) {
                var promise = ScreeningManagerRestangularV2.one(CHANNEL_TYPE + '/screeningmanager/limits/lists').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            setLimitConfiguration: function (limitConf, promiseTracker) {
                var promise = ScreeningManagerRestangularV2.all(CHANNEL_TYPE + '/screeningmanager/limits/lists').customPUT(limitConf);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScreeningLists: function (msisdn, promiseTracker) {
                var promise = ScreeningManagerRestangularV2.one(CHANNEL_TYPE + '/screeningmanager/screenings/' + msisdn).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getScreeningListsByScope: function (msisdn, scopeKey, promiseTracker) {
                return this.getScreeningListsByScopeAndService(scopeKey, msisdn, scopeKey, promiseTracker);
            },
            getScreeningListsByScopeAndService: function (serviceName, scopeSubscriberKey, scopeKey, promiseTracker) {
                var promise = ScreeningManagerRestangularV2.one(CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            },
            deleteListItem: function (serviceName, scopeSubscriberKey, scopeKey, listKey, screenableEntryId) {
                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey + '/' + listKey + '/' + screenableEntryId;
                var promise = ScreeningManagerRestangularV2.one(requestUri).remove();
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
                var promise = ScreeningManagerRestangularV2.all(requestUri).post(screeningRequest);
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
                var promise = ScreeningManagerRestangularV2.all(requestUri).customPUT(screeningModeRequest);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAllowance: function (serviceName, scopeSubscriberKey, scopeKey, listKey) {
                var requestUri = CHANNEL_TYPE + '/' + serviceName + '/screenings/' + scopeSubscriberKey + '/' + scopeKey + '/allowance/' + listKey;

                var promise = ScreeningManagerRestangularV2.one(requestUri).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Added for RBT under V3
            // TODO: Clarify if any data will be managed over V2
            getScreeningListsByServiceName: function (name, promiseTracker) {
                var promise = ScreeningManagerRestangularV3.one('screenings/' + name).get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            checkAllowance: function (scope, subScope, msisdn) {
                ///v3/screenings/rbt/rbt-promotion-vip-outgoing/allowance/96680001316
                var promise = ScreeningManagerRestangularV3.one('screenings/' + scope + '/' + subScope + '/allowance/' + msisdn).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            deleteListItemV3: function(scope, subScope, listKey, msisdn) {
                ///v3/screenings/rbt/rbt-promotion-vip-outgoing/blacklist/96680001316
                var requestUri = 'screenings/' + scope + '/' + subScope + '/' + listKey + '/' + msisdn;
                var promise = ScreeningManagerRestangularV3.one(requestUri).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            addNewListItemV3: function(scope, subScope, listKey, screenableEntry) {
                var screeningRequest = {
                    "screeningRequest": {
                        "screenableEntry": [screenableEntry]
                    }
                };
                var requestUri = 'screenings/' + scope + '/' + subScope + '/' + listKey;
                var promise = ScreeningManagerRestangularV3.all(requestUri).post(screeningRequest);
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
            },
            getViolations: function (name, promiseTracker) {
                var promise = LicenseManagerRestangular.one('consumptions/' + name + '/softlimitviolation').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
    });

    // Diagnostic Services
    ApplicationServices.factory('DiagnosticsService', function ($log, DiagnosticsRestangular, UtilService) {
        return {
            getAlarmsByQuery: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('alarm/_search').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            getAlarmCountByQuery: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('alarm/_count').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            queryCPUStats: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('hoststats/_search?size=200&pretty=true').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            },
            queryRAMStats: function (query, promiseTracker) {
                var promise = DiagnosticsRestangular.all('hoststats/_search?size=200&pretty=true').post(query);
                UtilService.addPromiseToTracker(promise, promiseTracker);
                return promise;
            }
        };
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

    // Advertisement Configuration Service
    ApplicationServices.factory('AdvertisementConfigurationService', function ($log, AdvertisementConfigurationRestangular, UtilService) {
        return {
            // Ad Insertion methods
            getAdvertisements: function () {
                var promise = AdvertisementConfigurationRestangular.one('ad').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getAdvertisement: function (name) {
                var promise = AdvertisementConfigurationRestangular.one('ad/' + encodeURIComponent(name)).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createAdvertisement: function (advertisement) {
                var promise = AdvertisementConfigurationRestangular.all('ad').post(advertisement);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateAdvertisement: function (advertisement) {
                var promise = AdvertisementConfigurationRestangular.all('ad/' + encodeURIComponent(advertisement.name)).customPUT(advertisement);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteAdvertisement: function (name) {
                var promise = AdvertisementConfigurationRestangular.all('ad/' + encodeURIComponent(name)).remove();
                UtilService.addPromiseToTracker(promise);

                return promise;
            }
        }
    });


    ////// DSP Services - Start

    // // Api Manager Services
    // ApplicationServices.factory('ApiManagerService', function ($log, ApiManagerRestangular, UtilService) {
    //     return {
    //         // Checking for is service alive
    //         checkStatus: function (promiseTracker) {
    //             var promise = ApiManagerRestangular.one('/_ping').get();
    //             UtilService.addPromiseToTracker(promise, promiseTracker);
    //
    //             return promise;
    //         }
    //     };
    // });
    //
    // ApplicationServices.factory('ApiManagerProvService', function ($log, ApiManagerProvRestangular, UtilService) {
    //     return {
    //         getDevelopers: function () {
    //             var promise = ApiManagerProvRestangular.all('devs').getList();
    //             UtilService.addPromiseToTracker(promise);
    //             return promise;
    //         },
    //         getEndpoints: function () {
    //             var promise = ApiManagerProvRestangular.all('endpoints').getList();
    //             UtilService.addPromiseToTracker(promise);
    //             return promise;
    //         },
    //         getOffers: function () {
    //             var promise = ApiManagerProvRestangular.all('offers').getList();
    //             UtilService.addPromiseToTracker(promise);
    //             return promise;
    //         },
    //         getApis: function () {
    //             var promise = ApiManagerProvRestangular.all('apis').getList();
    //             UtilService.addPromiseToTracker(promise);
    //             return promise;
    //         },
    //         getApplications: function (devName) {
    //             var promise = ApiManagerProvRestangular.all('devs/' + devName + '/apps').getList();
    //             UtilService.addPromiseToTracker(promise);
    //             return promise;
    //         },
    //         getDashboard: function (from, to, promiseTracker) {
    //             var promise = ApiManagerProvRestangular.one('/stats/summary?from=' + from + '&to=' + to).get();
    //             UtilService.addPromiseToTracker(promise, promiseTracker);
    //             return promise;
    //         },
    //         // Other special services
    //         // Service Capability
    //         getServiceCapabilityList: function () {
    //             var promise = ApiManagerProvRestangular.all('offers?status=active&labels=capability').getList();
    //             UtilService.addPromiseToTracker(promise);
    //             return promise;
    //         },
    //         getServiceCapabilityListByLabel: function (label) {
    //             var promise = ApiManagerProvRestangular.all('offers?status=active&labels=' + label).getList();
    //             UtilService.addPromiseToTracker(promise);
    //             return promise;
    //         }
    //     };
    // });


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

    // Outbound IVR Services
    ApplicationServices.factory('OIVRDashboardService', function ($log, OIVRDashboardRestangular, UtilService) {

        return {
            // Also used to check for heartbeat over the main dashboard
            getDashboardRates: function (promiseTracker) {
                var promise = OIVRDashboardRestangular.one('/statistics/getDashboardRates').get();
                UtilService.addPromiseToTracker(promise, promiseTracker);

                return promise;
            }
        }
    });

    ApplicationServices.factory('OIVRConfService', function ($log, OIVRConfigRestangular, UtilService) {
        var getConfig = function (key) {
            var promise = OIVRConfigRestangular.one(key).get();
            UtilService.addPromiseToTracker(promise);

            return promise;
        };

        var updateConfig = function (key, config) {
            var promise = OIVRConfigRestangular.one(key).customPUT(config);
            UtilService.addPromiseToTracker(promise);
        }

        return {
            getServiceCallerAddresses: function () {
                var promise = OIVRConfigRestangular.one('/serviceCallerAddresses').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateServiceCallerAddress: function (serviceCaller, address) {
                var promise = OIVRConfigRestangular.one(serviceCaller, address).customPUT(null);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getSmsTextLists: function () {
                var promise = OIVRConfigRestangular.one('/smsTexts').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateSmsText: function (smsText) {
                var promise = OIVRConfigRestangular.one('/smsTexts').customPUT(smsText);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getSmsSenderAddress: function () {
                var promise = OIVRConfigRestangular.one('/smsSenderAddress').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateSmsSenderAddress: function (smsSenderAddress) {
                var promise = OIVRConfigRestangular.one('/smsSenderAddress', smsSenderAddress).customPUT(null);
            },
            // Reporting
            getAllClients: function () {
                var promise = OIVRConfigRestangular.one('clients').get();
                UtilService.addPromiseToTracker(promise);
                return promise;
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
            var aggregateTotal = 0;
            _.each(results, function (result) {
                if (result && result.detail) {
                    resultItems = resultItems.concat(result.detail.items);
                    aggregateTotal += result.detail.total;
                }
            });

            if (resultItems && resultItems.length > 0) {
                deferred.resolve({
                    code: 2000,
                    description: 'OK',
                    detail: {
                        page: 0,
                        size: resultItems.length,
                        total: aggregateTotal,
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
                    // typeArray = [
                    //     'SERVICE', 'OFFER', 'PARTNER', 'SHORT_CODE',
                    //     'CONTENT_METADATA', 'CONTENT_FILE',
                    //     'CAMPAIGN_SMS', 'CAMPAIGN_MMS', 'CAMPAIGN_IVR',
                    //     'INTERACTIVE_CAMPAIGN_SMS', 'INTERACTIVE_CAMPAIGN_IVR', 'INTERACTIVE_CAMPAIGN_FAST_KEY',
                    //     'RBT_CATEGORY', 'RBT_MOOD', 'RBT_TONE', 'RBT_ARTIST', 'RBT_ALBUM'
                    // ];
                    // TODO: Removed Service, Offer, Shortcode
                    typeArray = [
                        'PARTNER',
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

                $log.debug("getTasks in Workflows Service", $rootScope);
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

        var getRBTContentListByName = function (baseUrl, page, size, name, organizationId, statuses) {
            var url = baseUrl;

            url += '?page=' + (page ? page : 0);
            url += '&size=' + (size ? size : 10);

            url += '&orderBy=name&orderDirection=ASC';

            // TODO: [TONES] CMS Bulk Ops. do not update the ngram list, search by name fails on bulk operations.
            // 'nameKeyword' param is used for search by name, entered value will be searched on both english and arabic names.
            if(baseUrl.toLowerCase().includes('tones') || baseUrl.toLowerCase().includes('playlist')) {
                url += name ? '&nameKeyword=' + name : '';
                url+= '&setSubscriptionCounts=true';
            } else {
                url += name ? (baseUrl.toLowerCase().includes('categories') ? '&nameKeyword=' : '&name=' ) + name : '';
            }

            url += organizationId ? '&organizationId=' + organizationId : '';

            //url += isPromoted ? '&promoted=' + isPromoted : '';
            url += statuses && statuses.length > 0 ? '&statuses=' + statuses.join('&statuses=') : '';

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

            // TODO: [TONES] CMS Bulk Ops. do not update the ngram list, search by name fails on bulk operations.
            // 'nameKeyword' param is used for search by name, entered value will be searched on both english and arabic names.
            if(baseUrl.toLowerCase().includes('tones') || baseUrl.toLowerCase().includes('playlist')) {
                url += name ? '&nameKeyword=' + name : '';
                url+= '&setSubscriptionCounts=true';
            } else {
                url += name ? (baseUrl.toLowerCase().includes('categories') ? '&nameKeyword=' : '&name=' ) + name : '';
            }

            if(richFilter) {
                url += richFilter.statuses && richFilter.statuses.length > 0  ? '&statuses=' + richFilter.statuses.join('&statuses=') : '';
                url += richFilter.accessChannels && richFilter.accessChannels.length > 0  ? '&accessChannels=' + richFilter.accessChannels.join('&accessChannels=') : '';
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
                    $log.debug("uploadPartnerContentFile:", response);
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
                var promise = ContentManagementRestangular.one('/cms/upload')
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
            getContentFileMetadata: function (contentId) {
                var promise = ContentManagementRestangular.one('cms/metadata/' + contentId + '?ts=' + new Date().getTime()).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getContentFile: function (contentId) {
                var promise = ContentManagementRestangular.one('/cms/file/' + contentId + '?ts=' + new Date().getTime()).get();
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
            getContentOffers: function (page, size, expand, attributeName, attributeValue) {
                var url = 'rbt/offers?page=' + page + '&size=' + size +
                    '&expand=' + (expand ? expand : false);

                if(attributeName && attributeValue){
                    url = url + '&'+ attributeName + "=" + attributeValue;
                }
                return ContentManagementRestangular.one(url).get();
            },
            getSubsEnabledContentOffers: function (page, size) {
                var url = 'rbt/offers?page=' + page + '&size=' + size +
                    '&content.status=ACTIVE&content.subscriptionEnabled=true';

                return ContentManagementRestangular.one(url).get();
            },
            // Content Categories
            getContentCategoriesRBT: function (page, size, orderBy, orderDirection, statuses, name, accessChannels) {
                var url = '/rbt/categories';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name, undefined, accessChannels);
            },
            searchContentCategoriesRBT: function (page, size, name, organizationId, statuses, accessChannels) {
                var url = '/rbt/categories';
                return getRBTContentList(url, page, size, undefined, undefined, statuses, name, undefined, accessChannels);

                //return getRBTContentListByName(url, page, size, name, organizationId, statuses);
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
            deleteContentCategoryRBT: function (contentCategory) {
                var promise = ContentManagementRestangular.one('/rbt/categories/' + contentCategory.id).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            //Subcategories
            getSubcategoriesRBT: function (page, size, orderBy, orderDirection, statuses, name, accessChannels) {
                var url = '/rbt/subcategories';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name, undefined, accessChannels);
            },
            searchSubcategoriesRBT: function (page, size, name, organizationId, statuses, accessChannels) {
                var url = '/rbt/subcategories';

                return getRBTContentList(url, page, size, undefined, undefined, statuses, name, undefined, accessChannels);
                //return getRBTContentListByName(url, page, size, name, organizationId, statuses);
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
            createSubcategoryRBT: function (contentCategory) {
                var promise = ContentManagementRestangular.all('/rbt/subcategories').post(contentCategory);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSubcategoryRBT: function (contentCategory) {
                var promise = ContentManagementRestangular.all('/rbt/subcategories/' + contentCategory.id).customPUT(contentCategory);

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            deleteSubcategoryRBT: function (contentCategory) {
                var promise = ContentManagementRestangular.one('/rbt/subcategories/' + contentCategory.id).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Artists
            getArtists: function (page, size, orderBy, orderDirection, statuses, name) {
                var url = '/rbt/artists';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name);
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
                url += subCategoryId ? '&subcategoryId=' +subCategoryId : '';

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
            createPlaylist: function (playlist) {
                var promise = ContentManagementRestangular.all('/rbt/playlists').post(playlist);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePlaylist: function (playlist) {
                var promise = ContentManagementRestangular.all('/rbt/playlists/' + playlist.id).customPUT(playlist);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deletePlaylist: function (playlist) {
                var promise = ContentManagementRestangular.one('/rbt/playlists/' + playlist.id).remove();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Tones
            getTones: function (page, size, orderBy, orderDirection, statuses, name) {
                var url = '/rbt/tones';

                return getRBTContentList(url, page, size, orderBy, orderDirection, statuses, name);
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
            searchTonesByPlaylist: function (page, size, name, playlistId) {
                var url = '/rbt/tones?page=' + (page ? page : 0) + '&size=' + (size ? size : 10) + '&orderBy=name&orderDirection=ASC';
                url += name ? '&name=' + name : '';
                url += playlistId ? '&playlistId=' + playlistId : '';

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
            searchTonesBySubCategory: function (page, size, name, subCategoryId) {
                var url = '/rbt/tones?page=' + (page ? page : 0) + '&size=' + (size ? size : 10) + '&orderBy=name&orderDirection=ASC';
                url += name ? '&name=' + name : '';
                url += subCategoryId ? '&subcategory=' +subCategoryId : '';

                var promise = ContentManagementRestangular.one(url).get();

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            searchTonesBySubCategoryAndOrganization:  function (organizationId, subcategoryId) {
                var url = '/rbt/tones?'
                url += organizationId ? '&organizationId=' + organizationId : '';
                url += subcategoryId ? '&subcategory=' + subcategoryId : '';
                url += '&orderBy=name&orderDirection=ASC';

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
            searchTonesByRichFilter: function(page, size, orderBy, orderDirection, statuses, name, richFilter){
                var url = '/rbt/tones';

                return getContentListWithRichFilters(url, page, size, orderBy, orderDirection, statuses, name, richFilter);
            },
            getTone: function (toneId, expansions) {
                var path = '/rbt/tones/' + toneId;
                path += expansions && expansions.length > 0 ? '?expansions=' + expansions.join('&expansions=') : '';

                var promise = ContentManagementRestangular.one(path).get();
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getTonesWithIdList: function (toneIds, organizationId) {
                var payload = toneIds;

                var pathParams = '/rbt/tones/list'
                if(organizationId) {
                    pathParams = pathParams + '?organizationId=' + organizationId;
                }

                var promise = ContentManagementRestangular.all(pathParams).post(payload);

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
            // Bulk Operations for Tones
            bulkActivate: function (toneIds) {
                var requestBody = {
                    "toneIds": toneIds
                }
                var promise = ContentManagementRestangular.all('/rbt/tones/activate').post(requestBody);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            bulkApprove: function (toneIds) {
                var requestBody = {
                    "toneIds": toneIds
                }
                var promise = ContentManagementRestangular.all('/rbt/tones/approve').post(requestBody);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            bulkReject: function (toneIds, rejectReason) {
                var requestBody = {
                    "toneIds": toneIds,
                    "rejectReason": rejectReason
                }
                var promise = ContentManagementRestangular.all('/rbt/tones/reject').post(requestBody);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            bulkSuspend: function (toneIds) {
                var requestBody = {
                    "toneIds": toneIds
                }
                var promise = ContentManagementRestangular.all('/rbt/tones/suspend').post(requestBody);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            bulkHide: function (toneIds) {
                var requestBody = {
                    "toneIds": toneIds
                }
                var promise = ContentManagementRestangular.all('/rbt/tones/hide').post(requestBody);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            bulkMove: function (toneIds, orgId) {
                var requestBody = {
                    "toneIds": toneIds,
                    "orgId": orgId
                }
                var promise = ContentManagementRestangular.all('/rbt/tones/moveToOtherCP').post(requestBody);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Signatures ?
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
            getPlaylistsByContextRBT: function (contextKey, id, page, size) {
                var url = '/rbt/' + contextKey + '/' + id + '/playlists?page=' + page + '&size=' + size;

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

    ApplicationServices.factory('RBTContentManagementService', function ($q, $log, $translate, notification, RBTContentManagementRestangular, RBTBackendRestangular, UtilService, SessionService) {
        var username = SessionService.getUsername();
        var headers = {
            'X-Channel': 'VCPAdminPortal',
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
            // Predefined Signatures
            // Signatures
            getPredefinedSignatures: function (lang) {
                headers['Accept-Language'] = lang ? lang : 'EN';
                var promise = RBTContentManagementRestangular.one('/predefinedSignatures').get(null, headers);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getPredefinedSignature: function (id, lang) {
                headers['Accept-Language'] = lang ? lang : 'EN';
                var promise = RBTContentManagementRestangular.one('/predefinedSignatures/' + id).get(null, headers);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            searchPredefinedSignatureByType: function(type) {
                var promise = RBTContentManagementRestangular.one('/predefinedSignatures?type=' + type).get(null, headers);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createPredefinedSignature: function (predefinedSignature) {
                var promise = RBTContentManagementRestangular.all('/predefinedSignatures').post(predefinedSignature, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePredefinedSignature: function (predefinedSignature) {
                var id = predefinedSignature.id;
                delete predefinedSignature.id;
                var promise = RBTContentManagementRestangular.all('/predefinedSignatures/' + id).customPUT(predefinedSignature, null, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            deletePredefinedSignature: function (predefinedSignature) {
                var promise = RBTContentManagementRestangular.one('/predefinedSignatures/' + predefinedSignature.id).remove(null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Statuses
            getStatuses: function (lang) {
                headers['Accept-Language'] = lang ? lang : 'EN';
                var promise = RBTContentManagementRestangular.one('/statuses').get(null, headers);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getStatus: function (id, lang) {
                headers['Accept-Language'] = lang ? lang : 'EN';
                var promise = RBTContentManagementRestangular.one('/statuses/' + id).get(null, headers);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createStatus: function (specialCondition) {
                var promise = RBTContentManagementRestangular.all('/statuses').post(specialCondition, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateStatus: function (specialCondition) {
                var id = specialCondition.id;
                delete specialCondition.id;
                var promise = RBTContentManagementRestangular.all('/statuses/' + id).customPUT(specialCondition, null, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise, undefined);

                return promise;
            },
            deleteStatus: function (specialCondition) {
                var promise = RBTContentManagementRestangular.one('/statuses/' + specialCondition.id).remove(null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Services
            getServices: function () {
                var promise = RBTContentManagementRestangular.one('/services').get(null, headers);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getService: function (id) {
                var promise = RBTContentManagementRestangular.one('/services/' + id).get(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createService: function (service) {
                var promise = RBTContentManagementRestangular.all('/services').post(service, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateService: function (service) {
                var promise = RBTContentManagementRestangular.all('/services/' + service.id).customPUT(service, null, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteService: function (service) {
                var promise = RBTContentManagementRestangular.one('/services/' + service.id).remove(null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Config
            getConfig: function(){
                var promise = RBTContentManagementRestangular.one('/config').get(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateConfig: function(config){
                var promise = RBTContentManagementRestangular.all('/config').post(config, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));
                UtilService.addPromiseToTracker(promise);
                return promise;

            },
            // DIY
            getDIYTones: function () {
                var promise = RBTContentManagementRestangular.one('/diyTones').get(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getDIYTone: function(id){
                var promise = RBTContentManagementRestangular.one('/diyTones/' + id).get(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateDIYToneStatus: function(diyTone){
                var promise = RBTContentManagementRestangular.all('/diyTones').customPUT(diyTone);

                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updateDIYTone: function(id, diyTone){
                var promise = RBTContentManagementRestangular.all('/diyTones/' + id).customPUT(diyTone, null, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createDIYTone: function (diyTone) {
                var promise = RBTContentManagementRestangular.all('/diyTones').post(diyTone, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            deleteDIYTone: function (diyTone) {
                var promise = RBTContentManagementRestangular.one('/diyTones/' + diyTone.id).remove(null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            getDIYTonesConfig: function () {
                var promise = RBTContentManagementRestangular.one('/config/diy').get(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            postDIYTonesConfig: function (config) {
                var promise = RBTContentManagementRestangular.all('/config/diy').post(config, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // WBP (White-labeled / White branded Portal) Config
            getWBPortalConfigList: function () {
                var promise = RBTContentManagementRestangular.one('/config/wbp').get(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getWBPortalConfig: function (id) {
                var promise = RBTContentManagementRestangular.one('/config/wbp/id/' + id).get(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            postWBPortalConfig: function (config) {
                var promise = RBTContentManagementRestangular.all('/config/wbp').post(config, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));

                UtilService.addPromiseToTracker(promise);

                return promise;
            },

            // Prayer Times - Tones
            getPrayerTimesTones: function () {
                var promise = RBTContentManagementRestangular.one('/prayerTimeTones').get(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getPrayerTimesTonesGrouped: function () {
                var promise = RBTContentManagementRestangular.one('/prayerTimeTones/byPerson?showdefault=false').get(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            getPrayerTimesTonesByPersonName: function (personName) {
                var promise = RBTContentManagementRestangular.one('/prayerTimeTones/byPerson/'+ personName).get(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            deletePrayerTimesTonesByPersonName: function (personName) {
                var promise = RBTContentManagementRestangular.one('/prayerTimeTones/byPerson/'+ personName).remove(null, headers);
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            updatePrayerTimeTones: function (id, payload) {
                var promise = RBTContentManagementRestangular.all('/prayerTimeTones/' + id).customPUT(payload);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            changePrayerTimeTonesByPersonName: function (payload) {
                var promise = RBTContentManagementRestangular.all('/prayerTimeTones/forPerson').post(payload, null, _.extend({'X-TransactionId': new Date().getTime()}, headers));
                UtilService.addPromiseToTracker(promise);
                return promise;
            },
            createPrayerTimeTonesByPersonName: function (payload) {
                return this.changePrayerTimeTonesByPersonName(payload);
            },
            updatePrayerTimeTonesByPersonName: function (payload) {
                return this.changePrayerTimeTonesByPersonName(payload);
            },
            // Prayer Times - Signatures
            getPrayerTimesSignatures: function (lang) {

                headers['Accept-Language'] = lang ? lang : 'EN';
                var promise = RBTContentManagementRestangular.one('/predefinedSignatures?type=prayer').get(null, headers);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updatePrayerTimeSignatures: function (id, signature) {

                var promise = RBTContentManagementRestangular.all('/predefinedSignatures/' + id).customPUT(signature);

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // System Default
            getSystemDefaultTone: function () {
                var promise = RBTContentManagementRestangular.one('/systemWideDefaultTone').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createSystemDefaultTone: function (payload) {
                var promise = RBTContentManagementRestangular.all('/systemWideDefaultTone').post(payload);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateSystemDefaultTone: function (toneFile) {
                var fd = new FormData();
                fd.append('tone', toneFile);

                var promise = RBTContentManagementRestangular.one('/systemWideDefaultTone')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPUT(fd, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            // Grace Period Tone
            getGracePeriodTone: function () {
                var promise = RBTContentManagementRestangular.one('/gracePeriodTone').get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            createGracePeriodTone: function (payload) {
                var promise = RBTContentManagementRestangular.all('/gracePeriodTone').post(payload);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            updateGracePeriodTone: function (toneFile) {
                var fd = new FormData();
                fd.append('tone', toneFile);

                var promise = RBTContentManagementRestangular.one('/gracePeriodTone')
                    .withHttpConfig({transformRequest: angular.identity})
                    .customPUT(fd, '', undefined, {'Content-Type': undefined});

                UtilService.addPromiseToTracker(promise);

                return promise;
            },
        }
    });

    ////// DSP Services - End

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
    ApplicationServices.factory('GeneralESService', function ($log, $filter, UtilService, SessionService, ESClient, SmscESClient, SmscESAdapterClient, DateTimeConstants,
                                                              SMSAntiSpamESClient, SMSAntiSpamESAdapterClient, SmsfESClient, RbtESClient, WorkflowsESClient, SsmESClient, BulkSmscESClient,
                                                              ChargingGwESAdapterClient, MessagingGwESAdapterClient, ServerConfigurationService) {
        var requestTimeout = 60000;


        var findESRemoteEndPoint = function (){
            var serverConfiguration = ServerConfigurationService.getServerConfiguration();
            return  angular.copy(serverConfiguration.ESRemoteEndPoint);
        }
        var findHistoryRecords = function (esClient, index, type, filter, payload, isAdapterClient) {
            // The range filters for using navigation
            var offset = filter.offset,
                limit = filter.limit;

            var url = '/' + index;

            if (type) {
                // Do NOT remove type in this method, adapter clients require this.
                url = url + '/' + type;
            }

            if(!isAdapterClient){

                var ESRemoteEndPoint = findESRemoteEndPoint();
                if (!_.isUndefined(ESRemoteEndPoint)) {
                    // ES8 Cross Cluster Search
                    url = url + ',' + ESRemoteEndPoint + ':' + index
                }

            }

            url = url +  '/_search?from=' + offset + '&size=' + limit;

            var esQueryPromise = esClient.all(url).post(payload);

            UtilService.addPromiseToTracker(esQueryPromise);

            return esQueryPromise;
        };

        var getCount = function (esClient, index, type, payload) {
            var url = '/' + index;
            if (type) {
                // Remove the type parameter because the new version of ES does not need it.
                //url = url + '/' + type;
            }
            url = url + '/_count';

            var esQueryPromise = esClient.all(url).post(payload);

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

                var mustFilterJSON = [];
                var shouldFilterJSON = [];

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

                // Main filter query puts in the main payload.
                payload.query.bool.must = payload.query.bool.must.concat(mustFilterJSON);
                payload.query.bool.should = shouldFilterJSON;
                // If there is at least one clause in the should, then add minimum_should_match parameter to the bool.
                if (payload.query.bool.should.length > 0) {
                    payload.query.bool.minimum_should_match = 1;
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

                return payload;
            },
            // SMSC
            findSmscPermanentEdrs: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields);

                return findHistoryRecords(SmscESAdapterClient, index, type, filter, bodyPayload, true);
            },
            findSmscHistoryEdrs: function (cdrKey) {
                var index = 'smsc-history', type = null; // type = 'history_edr';

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

                return findHistoryRecords(SmscESClient, index, type, filter, bodyPayload);
            },
            findSmscPermanentMessageParts: function (origAddress, destAddress, partRef, scTimestamp) {
                var index = 'smsc-main', type = null; // type = 'main_edr';

                var beginDate = moment(scTimestamp).subtract(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
                var endDate = moment(scTimestamp).add(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

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
                                        "scTimestamp": {
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

                return findHistoryRecords(SmscESClient, index, type, filter, bodyPayload);
            },
            getSmscPermanentCountByFilter: function (filter, additionalFilterFields, termFilterJSON) {
                var index = 'smsc-main', type = null; // type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields, termFilterJSON);

                // sort clause is deleting from the query that it is unnecessary for count queries.
                delete bodyPayload.sort;

                return getCount(SmscESClient, index, type, bodyPayload);
            },
            getSmscPermanentDeliveredCount: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must": [
                        {
                            "term": {
                                "result": 0
                            }
                        }
                    ]
                };

                return this.getSmscPermanentCountByFilter(filter, additionalFilterFields, termFilterJSON);
            },
            getSmscPermanentCount: function (filter, additionalFilterFields) {
                return this.getSmscPermanentCountByFilter(filter, additionalFilterFields);
            },
            // SMS AntiSpam
            findSMSAntiSpamEdrs: function (filter, additionalFilterFields, termFilterJSON) {
                var index = 'elastic-search-adapter', type = 'sms-as';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(SMSAntiSpamESAdapterClient, index, type, filter, bodyPayload, true);
            },
            findSMSAntiSpamMainEdrs: function (filter, additionalFilterFields) {
                // CDR types filter to differenciate records as main or historical.
                // Main CDR key criteria put into the term filter json.
                // Check the SMS_ANTISPAM_EDR_TYPE constant array for all CDR Types.
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "cdrType": [
                                    101, 102,
                                    121, 122,
                                    131, 132, 133,
                                    151, 152,
                                    201
                                ]
                            }
                        }
                    ]
                };

                if (additionalFilterFields.opContentFilter && !_.isEmpty(additionalFilterFields.opContentFilter)) {
                    termFilterJSON.must[0].terms.cdrType = [162];
                }

                return this.findSMSAntiSpamEdrs(filter, additionalFilterFields, termFilterJSON);
            },
            findSMSAntiSpamEdrsWithIdFilters: function(bodyPayload){
                var index = 'sms-as', type = null; // type = 'sms-as';

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(SMSAntiSpamESClient, index, type, filter, bodyPayload);

            },
            findSMSAntiSpamHistoricalEdrs: function (cdrKey) {
                var index = 'sms-as', type = null; // type = 'sms-as';

                var filter = {offset: 0, limit: 1000};
                var payload = {
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
                    },
                    "sort": [{"date": {"order": "desc"}}]
                };

                return findHistoryRecords(SMSAntiSpamESClient, index, type, filter, payload);
            },
            findSMSAntiSpamMessageParts: function (origMsisdn, destMsisdn, opPartRef, timestamp) {
                var index = 'sms-as', type = null; // type = 'sms-as';

                var beginDate = moment(timestamp).subtract(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
                var endDate = moment(timestamp).add(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "origMsisdn": origMsisdn
                                    }
                                },
                                {
                                    "term": {
                                        "destMsisdn": destMsisdn
                                    }
                                },
                                {
                                    "term": {
                                        "opPartRef": opPartRef
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

                return findHistoryRecords(SMSAntiSpamESClient, index, type, filter, bodyPayload);
            },
            findSMSAntiSpamSinglePartMessageContentEdrs: function (cdrKey) {
                var promise = SMSAntiSpamESAdapterClient.one('/elastic-search-adapter/sms-as/getMessageContent/' + cdrKey).get();
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            findSMSAntiSpamMultiPartMessageContentEdrs: function (origMsisdn, destMsisdn, opPartRef, timestamp) {
                var payload = {
                    "origMsisdn": origMsisdn,
                    "destMsisdn": destMsisdn,
                    "opPartRef": opPartRef,
                    "date": timestamp
                };
                var promise = SMSAntiSpamESAdapterClient.all('/elastic-search-adapter/sms-as/getMessageContentsWithConcatInfo').post(payload);
                UtilService.addPromiseToTracker(promise);

                return promise;
            },
            findSMSAntiSpamSuspiciousMessageEdrs: function (filter, additionalFilterFields, cdrType, entityName, filterFieldName) {
                var index = 'sms-as', type = null;

                $log.debug('filter', filter);
                $log.debug('additionalFilterFields', additionalFilterFields);
                $log.debug('cdrType', cdrType);
                $log.debug('entityName', entityName);
                $log.debug('filterFieldName', filterFieldName);

                var termFilterJSON= {
                    "must": [
                        {
                            "terms": {
                                "cdrType": [cdrType]
                            }
                        },
                        {
                            "term": {
                                "opRejectMethod": "4"
                            }
                        }
                    ]
                };
                var additionalFilter = '{ "term": { "' + filterFieldName + '": "' + entityName + '" } }';
                termFilterJSON.must.push(JSON.parse(additionalFilter));

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(SMSAntiSpamESClient, index, type, filter, bodyPayload);
            },
            // MMSC
            findMmscPermanentEdrs: function (filter, additionalFilterFields) {
                var index = 'mmsc-main', type = null; // type = 'main_edr';

                // var termFilterJSON = {
                //     "must_not": [
                //         {
                //             "terms": {
                //                 "finalStatus": [0, 7]
                //             }
                //         }
                //     ]
                // };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findMmscTransientEdrs: function (filter, additionalFilterFields) {
                var index = 'mmsc-buffered', type = null; // type = 'main_edr';

                // var termFilterJSON = {
                //     "must": [
                //         {
                //             "terms": {
                //                 "finalStatus": [0, 7]
                //             }
                //         }
                //     ]
                // };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findMmscHistoryEdrs: function (messageId, destAddress) {
                var index = 'mmsc-history', type = null; // type = 'history_edr';

                var bodyPayload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "messageID": messageId
                                    }
                                },
                                {
                                    "match_phrase": {
                                        "recipient.address": destAddress
                                    }
                                }
                            ]
                        }
                    }
                };

                var filter = {offset: 0, limit: 1000};

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            getMmscRecordCountByFilter: function (filter, additionalFilterFields, isPermanent, termFilterJSON) {
                var index = (isPermanent) ? 'mmsc-main' : 'mmsc-buffered', type = null; // type = 'main_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'eventTime', additionalFilterFields, termFilterJSON);

                // sort clause is deleting from the query that it is unnecessary for count queries.
                delete bodyPayload.sort;

                return getCount(ESClient, index, type, bodyPayload);
            },
            getMmscDeliveredCount: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must": [
                        {
                            "term": {
                                "finalStatus": 1
                            }
                        }
                    ]
                };
                var isPermanent = true;

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, isPermanent, termFilterJSON);
            },
            getMmscUndeliveredCount: function (filter, additionalFilterFields) {
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "finalStatus": [2, 3, 4, 5, 8]
                            }
                        }
                    ]
                };
                var isPermanent = true;

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, isPermanent, termFilterJSON);
            },
            getMmscPermanentCount: function (filter, additionalFilterFields) {
                // var termFilterJSON = {
                //     "must_not": [
                //         {
                //             "terms": {
                //                 "finalStatus": [0, 7]
                //             }
                //         }
                //     ]
                // };
                var isPermanent = true;

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, isPermanent);
            },
            getMmscTransientCount: function (filter, additionalFilterFields) {
                // var termFilterJSON = {
                //     "must": [
                //         {
                //             "terms": {
                //                 "finalStatus": [0, 7]
                //             }
                //         }
                //     ]
                // };

                var isPermanent = false;

                return this.getMmscRecordCountByFilter(filter, additionalFilterFields, isPermanent);
            },
            // USC history methods
            findUSSDServiceCenterHistoryInitSessions: function (filter, additionalFilterFields) {
                var index = 'ussdbrowser-main', type = null; // type = 'cc';
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventtype": ["PssrReq", "MTRequest"]
                            }
                        }
                    ]
                };

                // Escape the * and # characters at the passed input value and add wildcard characters the begin and the end
                // of the string.
                if (additionalFilterFields && additionalFilterFields.input) {
                    termFilterJSON.must.push({
                        "regexp": {
                            "input": '.*' + additionalFilterFields.input.replace(/\*/g, '\\*').replace(/\#/g, '\\#') + '.*'
                        }
                    });

                    delete additionalFilterFields.input;
                }

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findUSSDServiceCenterHistoryAll: function (sessionId) {
                var index = 'ussdbrowser-main', type = null; // type = 'cc';
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {sessionId: sessionId};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findUSSDServiceCenterHistoryDetail: function (sessionId, application, event, timestamp) {
                var index = 'ussdbrowser-detail', type = null; // type = 'brw_detail';
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1
                };

                var additionalFilterFields = {
                    sessionId: sessionId,
                    application: application,
                    event: event,
                    timestamp: timestamp
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findUSSDServiceCenterHistoryDetailAll: function (sessionId) {
                var index = 'ussdbrowser-detail', type = null; // type = 'brw_detail';
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {sessionId: sessionId};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // USSI history methods
            findUSSIGatewayCenterHistoryInitSessions: function (filter, additionalFilterFields) {
                var index = 'ussigw-main', type = null;
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "cdrType": [
                                    31, // MAP_BEGIN_USSR_IND_RECEIVED
                                    34, // MAP_BEGIN_USSN_IND_RECEIVED
                                    49  // SIP_INVITE_RECEIVED
                                ]
                            }
                        }
                    ]
                };

                // Escape the * and # characters at the passed input value and add wildcard characters the begin and the end
                // of the string.
                if (additionalFilterFields && additionalFilterFields.input) {
                    termFilterJSON.must.push({
                        "regexp": {
                            "input": '.*' + additionalFilterFields.input.replace(/\*/g, '\\*').replace(/\#/g, '\\#') + '.*'
                        }
                    });

                    delete additionalFilterFields.input;
                }

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findUSSIGatewayCenterHistoryAll: function (ticket) {
                var index = 'ussigw-main', type = null;
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {ticket: ticket};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // SMSF history methods
            findSMSFCenterHistoryInitSessions: function (filter, additionalFilterFields) {
                var index = 'smsf-main', type = null;
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "cdrType": [
                                    13, // MESSAGE_REJECTED
                                    15, // MESSAGE_DELIVERY_SUCCESSFUL
                                    16  // MESSAGE_DELIVERY_FAILED
                                ]
                            }
                        }
                    ]
                };

                // Escape the * and # characters at the passed input value and add wildcard characters the begin and the end
                // of the string.
                if (additionalFilterFields && additionalFilterFields.input) {
                    termFilterJSON.must.push({
                        "regexp": {
                            "input": '.*' + additionalFilterFields.input.replace(/\*/g, '\\*').replace(/\#/g, '\\#') + '.*'
                        }
                    });

                    delete additionalFilterFields.input;
                }

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(SmsfESClient, index, type, filter, bodyPayload);
            },
            findSMSFCenterHistoryAll: function (ticket) {
                var index = 'smsf-main', type = null;
                var filter = {
                    sortFieldName: 'timestamp',
                    sortOrder: '"asc"',
                    offset: 0,
                    limit: 1000
                };
                var additionalFilterFields = {ticket: ticket};

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(SmsfESClient, index, type, filter, bodyPayload);
            },
            // Voice Mail
            findVMHistory: function (filter, additionalFilterFields) {
                var index = 'voicemail', type = null; // type = 'voicemail';

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventcode": [
                                    "RUNNING_VM_DEPOSIT_SERVICE",
                                    "RUNNING_VM_RETRIEVAL_SERVICE",
                                    "RUNNING_VM_RETRIEVAL_INDIRECT_SERVICE",
                                    "RUNNING_VM_INDIRECT_SERVICE",
                                    "RUNNING_VM_DEPOSIT_INDIRECT_SERVICE",
                                    "NOTIFICATION_SERVICE_STARTED"
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findVMDetailedHistory: function (sessionid) {
                var index = 'voicemail', type = null; // type = 'voicemail';

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionid": sessionid
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // Voice SMS
            findVSMSHistory: function (filter, additionalFilterFields) {
                var index = 'voicesms', type = null;

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventcode": [
                                    "RUNNING_VSMS_DEPOSIT_SERVICE",
                                    "RUNNING_VSMS_RETRIEVAL_SERVICE"
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findVSMSDetailedHistory: function (sessionid) {
                var index = 'voicesms', type = null;

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionid": sessionid
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // Collect Call
            findCCHistory: function (filter, additionalFilterFields) {
                var index = 'cc', type = null;

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventInfo": [
                                    "Session Ended",
                                    "Menu Request Finished"
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findCCDetailedHistory: function (sessionId) {
                var index = 'cc',  type = null;

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionId": sessionId
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // Call Me Back
            findCMBHistory: function (filter, additionalFilterFields) {
                var index = 'pcm', type = null;
                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventInfo": [
                                    "Request Received"
                                ]
                            }
                        }
                    ]
                };
                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);
                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findCMBDetailedHistory: function (sessionId) {
                var index = 'pcm', type = null;

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionId": sessionId
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(ESClient, index, type, filter, payload);
            },
            // MCA
            findMCAHistory: function (filter, additionalFilterFields) {
                var index = 'mcn', type = null; // type = 'mcn';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'edrTimestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Poke Call
            findPokeCallHistory: function (filter, additionalFilterFields) {
                // var index = 'payforme', type = 'poke';
                var index = 'poke', type = null;

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Ring Back Tone
            findRBTHistory: function (filter, additionalFilterFields) {
                var index = 'rbt-event', type = null;

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventcode": [
                                    "101"
                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(RbtESClient, index, type, filter, bodyPayload);
            },
            findRBTDetailedHistory: function (sessionid) {
                var index = 'rbt-event', type = null;

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionid": sessionid
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(RbtESClient, index, type, filter, payload);
            },
            // Screening Manager
            findScreeningManagerHistory: function (filter, additionalFilterFields) {
                var index = 'screeningmanager', type = 'rest';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            // Alarm Logs
            findAlarmLogs: function (filter, additionalFilterFields) {
                var index = 'alarm', type = null; // type = 'alarm';

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
                // var index = 'a3gw', type = 'auditlog';
                var index = 'a3gw', type = null;

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
                // var index = 'a3gw', type = 'auditlog';
                var index = 'a3gw', type = null;

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
            },

            // DSP related methods
            // Service and product methods.
            // Service Subscription Manager
            findSSMHistory: function (filter, additionalFilterFields) {
                var index = 'ssm-main', type = null; // type = 'ssm'; 

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

                return findHistoryRecords(SsmESClient, index, type, filter, bodyPayload);
            },
            findSSMDetailedHistory: function (subscriptionId, eventType) {
                var index = 'ssm-detail', type = null; // type = 'ssm'; 
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

                return findHistoryRecords(SsmESClient, index, type, filter, payload);
            },
            // Content Subscription Manager
            findCSMHistory: function (filter, additionalFilterFields) {
                var index = 'ssm-main', type = null; // type = 'ssm'; 

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

                return findHistoryRecords(SsmESClient, index, type, filter, bodyPayload);
            },
            findCSMDetailedHistory: function (subscriptionId, eventType) {
                var index = 'ssm-detail', type = null; // type = 'ssm'; 
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

                return findHistoryRecords(SsmESClient, index, type, filter, payload);
            },
            // Content Management Service
            findCMSHistory: function (filter, additionalFilterFields) {
                var index = 'cms', type = null;
                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'timestamp', additionalFilterFields);

                return findHistoryRecords(RbtESClient, index, type, filter, bodyPayload);
            },
            findCMSDetailedHistory: function (entityId) {
                var index = 'cms', type = null;

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "entityId": entityId
                                    }
                                }
                            ]
                        }
                    }
                };

                return findHistoryRecords(RbtESClient, index, type, filter, payload);

            },
            // API Manager
            findAPIManagerHistory: function (filter, additionalFilterFields) {
                var index = 'apigw-edr-main', type = null; // type = 'trx';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'trxTimestamp', additionalFilterFields);

                return findHistoryRecords(ApiManagerESClient, index, type, filter, bodyPayload);
            },
            findAPIManagerDetailedHistory: function (transactionId) {
                var index = 'apigw-edr-detail', type = null; // type = 'trx';

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
                var index = 'smartads-jobdetail', type = null; // type = 'jobdetail';

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

                return findHistoryRecords(BulkSmscESClient, index, type, filter, bodyPayload);
            },
            findBMSDetailedHistory: function (jobId) {
                var index = 'smartads-jobdetail', type = null; // type = 'jobdetail';

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

                return findHistoryRecords(BulkSmscESClient, index, type, filter, payload);
            },
            // Outbound IVR Service
            findOIVRHistory: function (filter, additionalFilterFields) {

                var index = 'oivr', type = null;

                var termFilterJSON = {
                    "must": [
                        {
                            "terms": {
                                "eventCode": [
                                    "SERVICE_SUCCESS",
                                    "SERVICE_FAILED",
                                    "SUBSCRIBER_ROAMING",
                                    "SRI_SUBSCRIBER_ABSENT",
                                    "ROAMING_CHECK_ERROR",
                                    "SRI_CALLED_IS_NOT_SUBSCRIBER"

                                ]
                            }
                        }
                    ]
                };

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'edrTimestamp', additionalFilterFields, termFilterJSON);

                return findHistoryRecords(ESClient, index, type, filter, bodyPayload);
            },
            findOIVRDetailedHistory: function (sessionId) {
                var index = 'oivr', type = null;

                var filter = {offset: 0, limit: 1000};
                var payload = {
                    "query": {
                        "bool": {
                            "must": [
                                {
                                    "term": {
                                        "sessionId": sessionId
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
                var index = 'elastic-search-adapter', type = null;

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields);

                return findHistoryRecords(ChargingGwESAdapterClient, index, type, filter, bodyPayload, true);
            },
            // Workflows
            findWorkflowsRecords: function (filter, additionalFilterFields) {
                var index = 'workflow-history', type = null; // type = 'history-edr';

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

                return findHistoryRecords(WorkflowsESClient, index, type, filter, bodyPayload);
            },
            findWorkflowsHistory: function (flowId) {
                var index = 'workflow-history', type = null; // type = 'history-edr';

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

                return findHistoryRecords(WorkflowsESClient, index, type, filter, payload);
            },
            findWorkflowsPayload: function (flowId) {
                var index = 'workflow-payload', type = null; // type = 'payload-edr';

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

                return findHistoryRecords(WorkflowsESClient, index, type, filter, bodyPayload);
            },
            // MessagingGw SMS
            findMessagingGwSMSRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'sms_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields);

                return findHistoryRecords(MessagingGwESAdapterClient, index, type, filter, bodyPayload, true);
            },
            findMessagingGwSMSMessageParts: function (origAddress, destAddress, partRef, timestamp) {
                var index = 'msggw-sms', type = null; // type = 'sms';

                var beginDate = moment(timestamp).subtract(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
                var endDate = moment(timestamp).add(2, 'hours').utcOffset(DateTimeConstants.OFFSET).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');

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

                return findHistoryRecords(RbtESClient, index, type, filter, bodyPayload);
            },
            findMessagingGwSMSDeliveryReports: function (cdrKey) {
                var index = 'msggw-dr-sms', type = null; // type = 'sms_dr';

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

                return findHistoryRecords(RbtESClient, index, type, filter, bodyPayload);
            },
            // MessagingGw MMS
            findMessagingGwMMSRecords: function (filter, additionalFilterFields) {
                var index = 'elastic-search-adapter', type = 'mms_edr';

                var bodyPayload = this.prepareMainEdrQueryPayload(filter, 'date', additionalFilterFields);

                return findHistoryRecords(MessagingGwESAdapterClient, index, type, filter, bodyPayload);
            },
            findMessagingGwMMSDeliveryReports: function (cdrKey) {
                var index = 'msggw-dr-mms', type= null; //type = 'mms_dr';

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

                return findHistoryRecords(RbtESClient, index, type, filter, bodyPayload);
            }
        };
    });

    ApplicationServices.factory('PentahoApiService', function ($q, $log, $filter, $locale, PentahoApiRestangular, UtilService, DateTimeConstants, DAYS_OF_WEEK) {
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
            USERNAME: 'vcp',
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
                                    dayStrArr.push(day.text);
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

})();
