(function () {
    'use strict';

    var filterFunc;
    var translate;

    var stringify = function (str) {
        str = s.clean(str);
        str = s.replaceAll(str, "'", '"');
        return str;
    };

    var base64 = function (s) {
        return window.btoa(unescape(encodeURIComponent(s)));
    };

    var format = function (s, c) {
        return s.replace(/{(\w+)}/g, function (m, p) {
            return c[p];
        })
    };

    var getHeaderArray = function (columns, isQuote, isEscapeHTML) {
        var rowData = [];
        _.each(columns, function (column) {
            var data = translate.instant(column.headerKey, column.headerParams);
            data = stringify(data);

            if (isQuote) {
                data = s.quote(data, '"');
            }

            if (isEscapeHTML) {
                data = s.escapeHTML(data);
            }

            rowData.push(data);
        });

        return rowData;
    };

    var getDataArray = function (columns, object, isQuote, isEscapeHTML) {
        var rowData = [];

        function getNestedValue(obj, path) {
            return path.split('.').reduce(function (acc, key) {
                return acc && acc[key];
            }, obj);
        }


        _.each(columns, function (column) {
            var fieldValue;

            try {
                fieldValue = getNestedValue(object, column.fieldName);
            } catch (e) {
                fieldValue = '';
                column.filter = undefined;
            }

            // If the filter is not an array put it in an array so we need array of filter.
            var filterArray = [];
            if (!_.isArray(column.filter)) {
                filterArray.push(column.filter);
            } else {
                filterArray = column.filter;
            }

            _.each(filterArray, function (filter) {
                if (!_.isUndefined(filter)) {
                    var params = [], param;
                    _.each(filter.params, function (param) {
                        try {
                            // to be able to taking value of the attribute of the object if passed no value.
                            param = eval('object.' + param);
                        } catch (e) {
                            // ignore not defined case
                        }

                        params.push(param);
                    });

                    var filterParams = (filter.params ? _.union([fieldValue], params) : [fieldValue]);
                    fieldValue = filterFunc(filter.name).apply(null, filterParams);
                }
            });

            var data = stringify(fieldValue);

            if (isQuote) {
                data = s.quote(data, '"');
            }

            if (isEscapeHTML) {
                data = s.escapeHTML(data);
            }

            rowData.push(data);
        });

        return rowData;
    };

    var generateCsvData = function (list, exportOptions, filename, scope) {
        var data = '';

        // Headers
        var rowData = getHeaderArray(exportOptions.columns, true);
        var rowDataStr = rowData.join(';') + "\n\n";
        data += rowDataStr;

        _.each(list, function (item) {
            var recordObject = (_.isObject(item._source) ? item._source : item); // object is going to evaluating in the below loop for each fields.

            // Datas
            rowData = getDataArray(exportOptions.columns, recordObject, true);
            rowDataStr = rowData.join(';') + "\n";
            data += rowDataStr;
        });

        scope.$broadcast('csvDataGenerated', filename, data);
    };

    var generateXlsData = function (list, exportOptions, filename, scope) {
        var data = '';

        // Headers
        var rowData = getHeaderArray(exportOptions.columns, false, true);
        var rowDataStr = '<Row><Cell ss:StyleID="headerStyle"><Data ss:Type="String">' + rowData.join('</Data></Cell><Cell ss:StyleID="headerStyle"><Data ss:Type="String">') + '</Data></Cell></Row>';
        data += rowDataStr + '<Row/>'; // Adding a blank row after the header line.

        _.each(list, function (item) {
            var recordObject = (_.isObject(item._source) ? item._source : item); // object is going to evaluating in the below loop for each fields.

            // Datas
            rowData = getDataArray(exportOptions.columns, recordObject, false, true);
            rowDataStr = '<Row><Cell ss:StyleID="textStyle"><Data ss:Type="String">' + rowData.join('</Data></Cell><Cell ss:StyleID="textStyle"><Data ss:Type="String">') + '</Data></Cell></Row>';
            data += rowDataStr;
        });

        scope.$broadcast('xlsDataGenerated', filename, data);
    };

    var generateFileName = function (filenamePrefix) {
        //getting values of current time for generating the file name
        var dt = new Date();
        var reportDate = filterFunc('date')(dt, 'yyyyMMddTHHmmss');

        return filenamePrefix + '-' + reportDate;
    };

    var downloadFile = function (content, filename, mimeType) {
        // Prepare blob content and url of the object.
        var blobContent = new Blob([content], {type: mimeType});

        if (window.navigator && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveOrOpenBlob(blobContent, filename);
        } else {
            // creating a temporary HTML link element (they support setting file names)
            var link = document.createElement('a');
            var _URL = window.URL || window.webkitURL || window.mozURL;
            link.download = filename;
            link.href = _URL.createObjectURL(blobContent);
            link.dataset.downloadurl = [mimeType, link.download, link.href].join(':');
            link.style.cssText = 'position: absolute;visibility: hidden;';

            // Add link to body.
            document.body.appendChild(link);

            link.onclick = function (e) {
                // Need a small delay for the revokeObjectURL to work properly.
                setTimeout(function () {
                    _URL.revokeObjectURL(link.href);

                    // Remove the link from body.
                    document.body.removeChild(link);
                }, 1500);
            };

            // Triggering the download function.
            link.click();
        }
    };

    angular.module('ngTableExport', [])
        .config(function ($compileProvider) {
            // allow data links
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|data):/);
        })
        .directive('exportCsv', function ($parse, $filter, $translate, UtilService) {
            return {
                restrict: 'A',
                scope: false,
                link: function (scope, element, attrs) {
                    if (_.isUndefined(filterFunc))
                        filterFunc = $filter;
                    if (_.isUndefined(translate))
                        translate = $translate;

                    var scopeEvalExportOptions = scope.$eval(attrs.exportOptions);
                    var evalExportOptions;
                    try {
                        evalExportOptions = eval('(' + attrs.exportOptions + ')');
                    } catch (e) {
                        // ignore not defined case
                    }

                    var defaultExportOptions = scopeEvalExportOptions ? scopeEvalExportOptions : (evalExportOptions ? evalExportOptions : {});

                    scope.$on('csvDataGenerated', function (event, filename, data) {
                        UtilService.hideDummySpinner();

                        var finalContext = data;
                        var finalFilename = generateFileName(filename) + '.csv';

                        downloadFile(finalContext, finalFilename, 'text/csv');
                    });
                    var csv = {
                        download: function (filename, exportingData, exportOptions) {
                            UtilService.showDummySpinner();

                            setTimeout(function () {
                                generateCsvData((exportingData ? exportingData : scope.$data), (exportOptions ? exportOptions : defaultExportOptions), filename, scope);
                            }, 100);
                        }
                    };

                    scope.$on('xlsDataGenerated', function (event, filename, data) {
                        UtilService.hideDummySpinner();

                        var templateHeader = '<?xml version="1.0" encoding="UTF-8"?>' +
                            '<?mso-application progid="Excel.Sheet"?>' +
                            '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"' +
                            '          xmlns:o="urn:schemas-microsoft-com:office:office"' +
                            '          xmlns:x="urn:schemas-microsoft-com:office:excel"' +
                            '          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"' +
                            '          xmlns:html="http://www.w3.org/TR/REC-html40">' +
                            '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">' +
                            '    <Author>Telenity</Author>' +
                            '    <Created>' + (new Date()).getTime() + '</Created>' +
                            '</DocumentProperties>' +
                            '<Styles>' +
                            '    <Style ss:ID="textStyle">' +
                            '        <NumberFormat ss:Format="@"/>' +
                            '    </Style>' +
                            '    <Style ss:ID="headerStyle">' +
                            '        <Font ss:FontName="Arial" x:Family="Swiss" ss:Size="10" ss:Color="#000000" ss:Bold="1"/>' +
                            '    </Style>' +
                            '</Styles>';
                        var templateBody = '<Worksheet ss:Name="{worksheet}"><Table>{table}</Table></Worksheet>';
                        var templateFooter = '</Workbook>';

                        var template = templateHeader + templateBody + templateFooter;
                        var ctx = {worksheet: 'Sheet1' || 'Worksheet', table: data};

                        var finalContext = format(template, ctx);
                        var finalFilename = generateFileName(filename) + '.xls';

                        downloadFile(finalContext, finalFilename, 'application/vnd.ms-excel');
                    });
                    var xls = {
                        download: function (filename, exportingData, exportOptions) {
                            UtilService.showDummySpinner();

                            setTimeout(function () {
                                generateXlsData((exportingData ? exportingData : scope.$data), (exportOptions ? exportOptions : defaultExportOptions), filename, scope);
                            }, 100);
                        }
                    };

                    $parse(attrs.exportCsv).assign(scope.$parent, csv);
                    $parse(attrs.exportXls).assign(scope.$parent, xls);
                }
            };
        });

})();
