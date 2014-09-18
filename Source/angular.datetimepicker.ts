angular.module('eonasdan', [])
    .directive('bsDatetimePicker', [
        '$timeout',
        ($timeout) => {
            return {
                restrict: 'EA',
                template: (tElm, tAttrs) => {
                    if (tAttrs.bsDateTimePicker) return null;
                    if (tAttrs.bsIcon === undefined && tAttrs.bsClearIcon === undefined) return null;

                    var clearIcon = tAttrs.bsClearIcon ? tAttrs.bsClearIcon : 'remove';
                    var dateIcon = tAttrs.bsIcon ? tAttrs.bsIcon : 'calendar';

                    var tmpl = '<div class="input-group date">';

                    var getInput = () => {
                        var input = '<input type="text" class="form-control" NGMODEL />';
                        input = input.replace('NGMODEL', tAttrs.bsModel ? ('ng-model="' + tAttrs.bsModel + '"') : '');
                        return input;
                    };

                    //if both icons are present position bsIcon to the left and clearIcon to the right
                    if (tAttrs.bsIcon !== undefined && tAttrs.bsClearIcon !== undefined) {
                        tmpl += '<span class="input-group-addon datepickerbutton">' +
                            '<span class="glyphicon glyphicon-' + dateIcon + '" ></span>' +
                            '</span>';
                        tmpl += getInput();
                        tmpl += '<span class="input-group-addon datepickerclear">' +
                            '<span class="glyphicon glyphicon-' + clearIcon + '" ></span>' +
                            '</span>';
                    } else { //only one icon is present, position it to the left
                        tmpl += getInput();
                        tmpl += '<span class="input-group-addon ' + (tAttrs.bsClearIcon !== undefined ? 'datepickerclear' : '') + '">' +
                            '<span class="glyphicon glyphicon-' + (tAttrs.bsClearIcon !== undefined ? clearIcon : dateIcon) + '" ></span>' +
                            '</span>';
                    }
                    tmpl += "</div>";

                    return tmpl;
                },
                require: "?ngModel",
                compile: (tElm, tAttrs) => {
                    var isInput = tElm.is('input'),
                        dtInstance = null,
                        ignoreAttrs = ['ngModel', 'bsSettings', 'bsIcon', 'bsClearIcon', 'bsDateTimePicker'],
                        tInput = isInput ? tElm : angular.element('input', tElm),
                        key,
                        propVal,
                        momentDate;

                    if (!isInput) { //copy the attributes to the input
                        for (key in tAttrs) {
                            if (!key || key[0] == '$' || ignoreAttrs.indexOf(key) >= 0 || key.indexOf('dp') === 0) continue;
                            tInput.attr(key, tAttrs[key]);
                        }
                    }

                    return {
                        pre: (scope, elm, attrs, controller) => {
                            var dtElem = isInput ? elm : angular.element('div.input-group', elm),
                                input = isInput ? elm : angular.element('input', elm);

                            dtElem.on('change', (e) => { //we have to stop popragating the change event so that we wont have string in the model
                                e.stopImmediatePropagation();
                            });

                            if (!controller) return;
                            
                            // Update valid and dirty statuses
                            controller.$parsers.push((value) => {
                                input
                                    .toggleClass('ng-invalid', !controller.$valid)
                                    .toggleClass('ng-valid', controller.$valid)
                                    .toggleClass('ng-invalid-required', !controller.$valid)
                                    .toggleClass('ng-valid-required', controller.$valid)
                                    .toggleClass('ng-dirty', controller.$dirty)
                                    .toggleClass('ng-pristine', controller.$pristine);
                                return value;
                            });

                            dtElem.on('dp.change', (e) => {
                                e.stopImmediatePropagation(); //isolate

                                if (scope.$$phase || scope.$root.$$phase) {
                                    return;
                                }
                                scope.$apply(() => {
                                    controller.$setViewValue(momentDate ? e.date : e.date.toDate());
                                });
                            });
                        },
                        post: (scope, elm, attrs, controller) => {
                            var settings = attrs.bsSettings ? scope.$eval(attrs.bsSettings) : (attrs.bsDateTimePicker ? scope.$eval(attrs.bsDateTimePicker) : {}),
                                dtElem = isInput ? elm : angular.element('div.input-group', elm);

                            if (controller) {
                                controller.$render = () => {
                                    if (dtInstance)
                                        dtInstance.setValue(controller.$viewValue !== undefined ? controller.$viewValue : null);
                                };

                                // Watch the model for programmatic changes
                                scope.$watch(tAttrs.ngModel, (current, old) => {
                                    if (current === undefined)
                                        return;
                                    momentDate = current && current._isAMomentObject === true;

                                    controller.$render();
                                });
                            }

                            //attributes have higher priority
                            for (key in tAttrs) {
                                if (!key || key.indexOf('dp') !== 0 || key.length < 3) continue;
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

                            $timeout(() => {
                                dtElem.datetimepicker(settings);
                                dtInstance = dtElem.data("DateTimePicker");
                                elm.on("$destroy", () => {
                                    dtInstance.destroy();
                                });

                                if (controller)
                                    controller.$render();

                                attrs.$observe('disabled', (value) => {
                                    if (value !== undefined)
                                        dtInstance.disable();
                                    else
                                        dtInstance.enable();
                                });

                                attrs.$observe('readonly', (value) => {
                                    if (!angular.isFunction(dtInstance.readonly)) return;
                                    if (value !== undefined)
                                        dtInstance.readonly(true);
                                    else
                                        dtInstance.readonly(false);
                                });

                                //watch the fieldset if present
                                var fieldset = elm.closest('fieldset');
                                if (fieldset.length && fieldset.attr('ng-disabled')) {
                                    scope.$watch(fieldset.attr('ng-disabled'), (newVal) => {
                                        if (newVal === undefined) return;
                                        newVal ? dtInstance.disable() : dtInstance.enable();
                                    });
                                } else if (fieldset.length && fieldset.prop('disabled')) {
                                    dtInstance.disable();
                                }
                            });
                        },
                    }
                }
            }
        }
    ]);