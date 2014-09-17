﻿angular.module('eonasdan', []).directive('bsDatetimePicker', [
    '$timeout',
    function ($timeout) {
        return {
            restrict: 'EA',
            template: function (tElm, tAttrs) {
                if (tAttrs.bsDateTimePicker)
                    return null;
                if (tAttrs.bsIcon === undefined && tAttrs.bsClearIcon === undefined)
                    return null;

                var clearIcon = tAttrs.bsClearIcon ? tAttrs.bsClearIcon : 'remove';
                var dateIcon = tAttrs.bsIcon ? tAttrs.bsIcon : 'calendar';

                var tmpl = '<div class="input-group date">';

                var getInput = function () {
                    var input = '<input type="text" class="form-control" NGMODEL />';
                    input = input.replace('NGMODEL', tAttrs.bsModel ? ('ng-model="' + tAttrs.bsModel + '"') : '');
                    return input;
                };

                //if both icons are present position bsIcon to the left and clearIcon to the right
                if (tAttrs.bsIcon !== undefined && tAttrs.bsClearIcon !== undefined) {
                    tmpl += '<span class="input-group-addon datepickerbutton">' + '<span class="glyphicon glyphicon-' + dateIcon + '" ></span>' + '</span>';
                    tmpl += getInput();
                    tmpl += '<span class="input-group-addon datepickerclear">' + '<span class="glyphicon glyphicon-' + clearIcon + '" ></span>' + '</span>';
                } else {
                    tmpl += getInput();
                    tmpl += '<span class="input-group-addon ' + (tAttrs.bsClearIcon !== undefined ? 'datepickerclear' : '') + '">' + '<span class="glyphicon glyphicon-' + (tAttrs.bsClearIcon !== undefined ? clearIcon : dateIcon) + '" ></span>' + '</span>';
                }
                tmpl += "</div>";

                return tmpl;
            },
            require: "?ngModel",
            compile: function (tElm, tAttrs) {
                var isInput = tElm.is('input'), dtInstance = null, ignoreAttrs = ['ngModel', 'bsSettings', 'bsIcon', 'bsClearIcon', 'bsDateTimePicker'], settings = {}, dtElem = isInput ? tElm : angular.element('div.input-group', tElm), input = isInput ? tElm : angular.element('input', tElm), key, propVal;

                if (!isInput) {
                    for (key in tAttrs) {
                        if (!key || key[0] == '$' || ignoreAttrs.indexOf(key) >= 0 || key.indexOf('dp') === 0)
                            continue;
                        input.attr(key, tAttrs[key]);
                    }
                }

                return function (scope, elm, attrs, controller) {
                    settings = angular.extend({}, attrs.bsSettings ? scope.$eval(attrs.bsSettings) : (attrs.bsDateTimePicker ? scope.$eval(attrs.bsDateTimePicker) : {}), settings);

                    for (key in tAttrs) {
                        if (!key || key.indexOf('dp') !== 0 || key.length < 3)
                            continue;
                        propVal = tAttrs[key];
                        key = key.substring(2);
                        key = key[0].toLowerCase() + key.slice(1); //lower the first letter
                        if (propVal.toUpperCase() == 'TRUE')
                            propVal = true;
                        else if (propVal.toUpperCase() == 'FALSE')
                            propVal = false;
                        else if (propVal.length && (propVal[0] == '{' || propVal[0] == '['))
                            propVal = scope.$eval(propVal);
                        settings[key] = propVal;
                    }

                    var setDate = function () {
                        if (dtInstance)
                            dtInstance.setDate(controller.$viewValue !== undefined ? controller.$viewValue : null);
                    };

                    if (controller) {
                        // Watch the model for programmatic changes
                        scope.$watch(tAttrs.ngModel, function (current, old) {
                            if (current === undefined)
                                return;
                            if (current === old) {
                                return;
                            }
                            controller.$render();
                        }, true);
                        controller.$render = setDate;

                        dtElem.on('dp.change', function (e) {
                            e.stopImmediatePropagation(); //isolate

                            if (scope.$$phase || scope.$root.$$phase) {
                                return;
                            }
                            scope.$apply(function () {
                                controller.$setViewValue(e.date);
                            });
                        });

                        // Update valid and dirty statuses
                        controller.$parsers.push(function (value) {
                            input.toggleClass('ng-invalid', !controller.$valid).toggleClass('ng-valid', controller.$valid).toggleClass('ng-invalid-required', !controller.$valid).toggleClass('ng-valid-required', controller.$valid).toggleClass('ng-dirty', controller.$dirty).toggleClass('ng-pristine', controller.$pristine);
                            return value;
                        });
                    }

                    $timeout(function () {
                        dtElem.datetimepicker(settings);
                        dtInstance = dtElem.data("DateTimePicker");

                        //var origSetValue = dtInstance.setValue;
                        //dtInstance.setValue = function (val) {
                        //    var currVal = dtInstance.getDate();
                        //    if ((!val && !currVal) || (val && currVal && val.toString() === currVal.toString()))
                        //        return;
                        //    origSetValue.call(this, val);
                        //    if (val !== null) return; //clear fn will not trigger a notification so we have to do this manually
                        //    if (scope.$$phase || scope.$root.$$phase) {
                        //        return;
                        //    }
                        //    scope.$apply(() => {
                        //        controller.$setViewValue(val);
                        //    });
                        //};
                        if (controller)
                            controller.$render();

                        attrs.$observe('disabled', function (value) {
                            if (value !== undefined)
                                dtInstance.disable();
                            else
                                dtInstance.enable();
                        });

                        attrs.$observe('readonly', function (value) {
                            if (!angular.isFunction(dtInstance.readonly))
                                return;
                            if (value !== undefined)
                                dtInstance.readonly(true);
                            else
                                dtInstance.readonly(false);
                        });

                        scope.$on('$destroy', function () {
                            dtInstance.destroy();
                        });

                        //watch the fieldset if present
                        var fieldset = elm.closest('fieldset');
                        if (fieldset.length && fieldset.attr('ng-disabled')) {
                            scope.$watch(fieldset.attr('ng-disabled'), function (newVal) {
                                if (newVal === undefined)
                                    return;
                                newVal ? dtInstance.disable() : dtInstance.enable();
                            });
                        } else if (fieldset.length && fieldset.prop('disabled')) {
                            dtInstance.disable();
                        }
                    });
                };
            }
        };
    }
]);
//# sourceMappingURL=angular.datetimepicker.js.map