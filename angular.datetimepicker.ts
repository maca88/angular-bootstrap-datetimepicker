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
                        dtElem = isInput ? tElm : angular.element('div.input-group', tElm),
                        input = isInput ? tElm : angular.element('input', tElm);

                    if (!isInput) { //copy the attributes to the input
                        for (var key in tAttrs) {
                            if (!key || key[0] == '$' || ignoreAttrs.indexOf(key) >= 0) continue;
                            input.attr(key, tAttrs[key]);
                        }
                    }

                    return (scope, elm, attrs, controller) => {
                        var settings = attrs.bsSettings ? scope.$eval(attrs.bsSettings) : (attrs.bsDateTimePicker ? scope.$eval(attrs.bsDateTimePicker) : {});

                        var setDate = () => {
                            if (dtInstance)
                                dtInstance.setDate(controller.$viewValue !== undefined ? controller.$viewValue : null);
                        };

                        if (controller) { //ModelCtrl
                            // Watch the model for programmatic changes
                            scope.$watch(tAttrs.ngModel, (current, old) => {
                                if (current === undefined) 
                                    return;
                                if (current === old) {
                                    return;
                                }
                                controller.$render();
                            }, true);
                            controller.$render = setDate;

                            dtElem.on('dp.change', (e) => {
                                e.stopImmediatePropagation(); //isolate

                                if (scope.$$phase || scope.$root.$$phase) {
                                    return;
                                }
                                scope.$apply(() => {
                                    controller.$setViewValue(e.date);
                                });
                            });

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
                        }

                        $timeout(() => {
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

                            scope.$on('$destroy', () => {
                                dtInstance.destroy();
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
                    }
                }
            }
        }
    ]);