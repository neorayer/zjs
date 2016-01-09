/**
 * test branch
 */ 
(function zform() {

'use strict'


var app = angular.module('zform', ['ui.bootstrap', 'ui.select', 'ngSanitize', 'pascalprecht.translate']);

app.config(function($translateProvider) {
    $translateProvider.translations('en', {
        'VALIDATE_required': 'Required',
        'VALIDATE_mobile': 'Mobile number is invalid.',
        'VALIDATE_email': 'Email address is invalid.',
    });
    $translateProvider.translations('cn', {
        'VALIDATE_required': '必填',
        'VALIDATE_mobile': '手机号格式不正确',
        'VALIDATE_email': '电子邮件格式不正确',
        'VALIDATE_minlength': '长度不足',
    });

    $translateProvider.preferredLanguage('cn');
});

app.service('VLDT', function(){
    var URL_REGEXP = /^[a-z][a-z\d.+-]*:\/*(?:[^:@]+(?::[^@]+)?@)?(?:[^\s:/?#]+|\[[a-f\d:]+\])(?::\d+)?(?:\/[^?#]*)?(?:\?[^#]*)?(?:#.*)?$/i;
    var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    var NUMBER_REGEXP = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))([eE][+-]?\d+)?\s*$/;
    var DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})$/;
    var DATETIMELOCAL_REGEXP = /^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/;
    var WEEK_REGEXP = /^(\d{4})-W(\d\d)$/;
    var MONTH_REGEXP = /^(\d{4})-(\d\d)$/;
    var TIME_REGEXP = /^(\d\d):(\d\d)(?::(\d\d)(\.\d{1,3})?)?$/;

    var se = {};

    se.required = function(v) {
        if (!v) 
            return false;
        if (angular.isString(v) && v.trim().length === 0)
            return false;
        return true;
    }

    se.mobile = function(v) {
        if (!v) return true;
        return /^\d+$/.test(v);
    }



    return se;
    
});

app.service('zformServ', function(){
    var se = {};

    se.handleServerErr = function(form, err) { // form is formController
        var sErr = form.$serverError;
        for (var k in sErr) {
            delete sErr[k];
        }

        if (err ) {
            if (err.data) {
                if (err.data.field) {
                    sErr[err.data.field] = err.data.msg; 
                }else {
                    sErr['_global'] = err.data;
                    console.error(sErr['_global']);
                }
            }else {
                sErr['_global'] = err;
                console.error(sErr['_global']);
            }
        }
    }

    return se;
});

app.directive('zformError', function($rootScope){
    var Di = {
        restrict: 'E',
        replace: true,
        scope: {
            name: '=',
        },
        require: ['zformError', '^form'],
    }

    Di.template = '\
        <ul ng-show="hasError()" class="help-block" > \
            <li ng-repeat="(key, value) in form[name].$error" ng-if="value"> \
                {{("VALIDATE_" + key)|translate}} \
            </li> \
            <li ng-if="form.$serverError[name]">{{form.$serverError[name]}}</li> \
        </ul> \
    ';

    Di.link = function($scope, iElm, iAttrs, controller) {
        var ctrl = controller[0];
        var form = controller[1];

        ctrl.setForm(form);
    }

    Di.controller = function($scope) {
        var _this = this;
        if (!$scope.name)
            throw new Error('name is required by <zform-error>.' );

        this.setForm = function(form) {
            $scope.form = form;
            // add array $serverError to form properties at the firt time.
            // $ is required for letting form validate to ignore it.
            if (!form.$serverError)
                form.$serverError = {};

        }

        $scope.hasError = function() {
            if ($scope.form[$scope.name]) { // sometime hasError runs before subCtrol created.
                var err = $scope.form[$scope.name].$error;
                for (var k in err) {
                    if (err[k])
                        return true;
                }
            }

            if ($scope.form.$serverError[$scope.name])
                return true;

            return false;
        }

    }

    return Di;
})


/**
 * <div zform-row="rowDef" ng-model="XXX"></div>
 * rowDef {
 *   el: 'row',
 *   
 *   cols: [colDef, colDef...]
 * } or
 * rowDef [colDef, colDef...]
 */
app.directive('zformRow', function(){
    var Di = {
        restrict: 'A',
        scope: {
            rowDef: '=zformRow',
            ngModel: '=',
        },
        replace: true,
    }

    Di.template = '\
        <div class="form-group {{def.rowClass}}" \
             ng-hide="def.isHidden(ngModel)"> \
            <div zform-col="colDef"  \
                 ng-repeat="colDef in colDefs track by $index" \
                 ng-model="ngModel" \
                 ></div> \
        </div> \
    ';

    Di.link = function($scope, iElm, iAttrs, controller) {
    }

    Di.controller = function($scope) {
        // extend [colDef, colDef...] to a complete rowDef object.
        if (angular.isArray($scope.rowDef)) {
            $scope.def = {
                el: 'row',
                cols: $scope.rowDef,
            }
        }else {
            $scope.def = $scope.rowDef;
        }

        var cols = $scope.def.cols;

        $scope.colDefs = [];

        if (!cols)
            throw new Error('def.cols is required by <zform-row>');
        // get a new copy of rowDef to colDefs[] 
        for (var i=0,len=cols.length; i<len; i++) {
            // extend string col to object[el.label]
            if (angular.isString(cols[i])) {
                // string col will be extended to {el: 'label'} if at the first.
                // string col will be extended to {el: 'text'} if not at the first.
                if (i === 0)
                    cols[i] = {el: 'label', text: cols[i]};
                else
                    cols[i] = {el: 'text', text: cols[i]};
            }
            $scope.colDefs.push(cols[i]);
        }

        $scope.colClass = [];
        switch( cols.length) {
            case 2:
                $scope.colDefs[0].colClass = cols[0].colClass || 'col-sm-3';
                $scope.colDefs[1].colClass = cols[1].colClass || 'col-sm-9';
                break;
            case 3:
                $scope.colDefs[0].colClass = cols[0].colClass || 'col-sm-3';
                $scope.colDefs[1].colClass = cols[1].colClass || 'col-sm-5';
                $scope.colDefs[2].colClass = cols[2].colClass || 'col-sm-4';
                break;
            case 4:
                $scope.colDefs[0].colClass = cols[0].colClass || 'col-sm-3';
                $scope.colDefs[1].colClass = cols[1].colClass || 'col-sm-3';
                $scope.colDefs[2].colClass = cols[2].colClass || 'col-sm-3';
                $scope.colDefs[3].colClass = cols[3].colClass || 'col-sm-3';
                break;
            case 5:
                $scope.colDefs[0].colClass = cols[0].colClass || 'col-sm-3';
                $scope.colDefs[1].colClass = cols[1].colClass || 'col-sm-3';
                $scope.colDefs[2].colClass = cols[2].colClass || 'col-sm-2';
                $scope.colDefs[3].colClass = cols[3].colClass || 'col-sm-2';
                $scope.colDefs[4].colClass = cols[4].colClass || 'col-sm-2';
                break;
        }
    }

    return Di;
});

app.directive('zformCol', function($compile){
    var Di = {
        restrict: 'A',
        scope: {
            colDef: '=zformCol',
            ngModel: '=',
        },
        replace: true,
    }

    Di.template = '<div class="{{colDef.colClass}}" ng-class="ngClass" zform-show-error> </div>';

    Di.link = function($scope, iElm, iAttrs, controller) {
        // any try to recursive by template will cause loop calling.
        // so we have to use the method bellow. refer to: 
        // http://sporto.github.io/blog/2013/06/24/nested-recursive-directives-in-angular/
        var html;
        switch ($scope.colDef.el) {
            case 'rows':
                html = '<div zform-row="row" ng-repeat="row in colDef.rows" ng-model="ngModel"></div> </div>';
                break;
            case 'input-group':
                html = '<zform-ingrp ng-model="ngModel" def="colDef"></zform-ingrp>';
                break;
            case 'pics':
                html = '<div zform-pics="colDef" ng-model="ngModel"></div>';
                break;
            default:
                html = '<zform-edit ng-model="ngModel" def="colDef"></zform-edit>';
                break;
        }
        $compile(html)($scope, function(cloned, scope){
            iElm.append(cloned);
        });
    }

    Di.controller = function($scope) {
        var _this = this;
        // if col is string, it will be changed to {el: 'label'}.
        if (angular.isString($scope.colDef))
            $scope.colDef = {el: 'label', text: $scope.colDef};

        // if col is array, it should be a set of rows.
        if (angular.isArray($scope.colDef)) {
            var rows = $scope.colDef;

        }

        $scope.ngClass = {
            'control-label': !$scope.colDef.el || $scope.colDef.el === 'label',
        }
    }

    return Di;
})

app.directive('zformShowError', function($rootScope){
    var Di = {
        name: 'zformShowError',
        restrict: 'A',
        transclude: false,
        require: ['zformShowError', '^form'],
    }

    Di.link = function($scope, iElm, iAttrs, controller) {
        var ctrl = controller[0];
        var form = controller[1];
        ctrl.setForm(form);

        var el = angular.element(iElm[0]);

        $scope.$watch(function(){
            let hasError = ctrl.hasError();
            let hasBlured = ctrl.hasBlured();
            return hasError && hasBlured;
        }, function(hasErrorAndBlured){
            el.toggleClass('has-error', hasErrorAndBlured);
        })
        

    };

    Di.controller = function($scope) {
        var _this = this;

        var edits = [];
        this.addEdit = function(edit) {
            edits.push(edit);
        }
        this.setForm = function(form) {
            this.form = form;
        }

        this.hasError = function() {
            for (let i=0; i<edits.length; i++) {
                var field =_this.form[edits[i].def.name];
                // in init time, field has not been built
                if (!field) 
                    continue;
                if (field.$invalid) // && !field.$pristine )
                    return true;
                if (_this.form.$serverError && _this.form.$serverError[edits[i].def.name])
                    return true;
            }
            return false;
        }

        this.hasBlured = function() {
            // check if one of its edits has blured.
            for (let i=0; i<edits.length; i++) {
                if (edits[i].hasBlured)
                    return true;
            }
            return false;
        }
    }    

    return Di;
});

app.directive('zformIngrp', function($rootScope){
    var Di = {
        restrict: 'E',
        scope: {
            def: '=',
            ngModel: '=',
        }
    }

    // Notice: def.left and def.right are replaced by $scope.defLeft and $scope.defRight
    Di.template =  ' \
        <div class="input-group">  \
            <zform-edit ng-if="def.left" ng-model="ngModel" def="defLeft" class="{{defLeft.class}}" ></zform-edit> \
            <zform-edit ng-if="def.input" ng-model="ngModel" def="def.input"></zform-edit> \
            <zform-edit ng-if="def.right" ng-model="ngModel" def="defRight" class="{{defRight.class}}"></zform-edit> \
        </div>  \
        <zform-error name="def.input.name"></zform-error> \
    ';

    Di.link = function($scope, iElm, iAttrs, controller) {

    }

    Di.controller = function($scope) {
        if (!$scope.def)
            throw new Error('def is required by <zform-ingrp>');

        var def = $scope.def;

        if (!def.input)
            throw new Error('def.input is required by <zform-ingrp>');

        def.input.el = def.input.el || 'input';

        // We need replace def.left and def.right by Object defLeft or defRight
        // because they may by string.
        if (def.left) {
            if (angular.isString(def.left)) 
                $scope.defLeft = { el: 'text', text: def.left}
            else
                $scope.defLeft = def.left;
        }
        if (def.right) {
            if (angular.isString(def.right)) 
                $scope.defRight = { el: 'text', text: def.right}
            else
                $scope.defRight = def.right;
        }

        angular.forEach([$scope.defLeft, $scope.defRight], function(lrDef){
            if (!lrDef) return;
            switch (lrDef.el) {
                case 'text':
                    lrDef.class = 'input-group-addon';
                    break;
                case 'button':
                case 'dropdown-button':
                    lrDef.class = 'input-group-btn';
                    break;
            }
        });

    }

    return Di;
});

/**
 * optionLabel:   how to show the option label
 *      string,          // the property name of label
 *      function(option),// the function to get label
 *      null,            // JSON.stringify(option)
 *
 * selectedLabel: how to show the selected label (similar as optionLabel) 
 *
 * optionValue: how to get the value of option
 *      string,          // the property name of value         
 *      function(option),// the function to get value
 *      null,            // option self
 *
 */
app.directive('zformEdit', function($compile, $timeout, tpls){
    var Di = {
        restrict: 'E',
        scope: {
            def: '=',
            ngModel: '=',
        },
        require: ['zformEdit', '?^zformShowError', '^form'],
        replace: false,
        //templateUrl: '/zjs/zform/zform-edit.html',
    }

    Di.link = function($scope, iElm, iAttrs, controller) {
        var edit      = controller[0];
        var showError = controller[1];
        var form      = controller[2];

        edit.setForm(form);

        var el = angular.element(iElm[0]);
        if (el.parent().hasClass('input-group'))
            edit.setInGroup(true);

        var tplHtml = tpls[$scope.def.el];
        if (!tplHtml)
            throw new Error('no such template (for el=' + $scope.def.el + ') for <zform-edit>, def=' + JSON.stringify($scope.def));
        $compile(tplHtml)($scope, function(cloned, scope){
            iElm.append(cloned);
        });
        $compile(tpls['zform-error'])($scope, function(cloned, scope){
            iElm.append(cloned);
        });

        var insertValidators = function() {
            if (angular.isArray(edit.def.validators))
                throw new Error('validators is a object, isn\'t array.');
            angular.forEach(edit.def.validators, function(validator, name) {
                if (!form[edit.def.name])
                    throw new Error('Can\'t find form[' + edit.def.name + '] while setting validators');
                var $v = form[edit.def.name].$validators;
                $v[name] = validator;
            });
        };

        var transSetBluredToFormInput = function() {
            if (form[edit.def.name]) {
                form[edit.def.name].setBlured = edit.setBlured.bind(edit);
            }
        }

        if (edit.isEdit) {
            if (showError)
                showError.addEdit(edit);
            // $timeout is for waiting the form[fieldname] is built.
            $timeout(insertValidators, 1);
            $timeout(transSetBluredToFormInput, 1);
        }


        // Extend form controller
        //    form.$zform_validate
        if (!form.$zform_validate) {
            form.$zform_validate = function(){
                angular.forEach(form, function(subCtrl, key){
                    if (key.indexOf('$') === 0)
                        return;
                    // force to validate
                    subCtrl.$validate();
                    // set blured: ref to  transSetBluredToFormInput()
                    if (subCtrl.setBlured)
                        subCtrl.setBlured(true);
                })
            };
        }
        //    form.$zform_setBlured
        if (!form.$zform_setBlured) {
            form.$zform_setBlured = function(isBlured) {
                angular.forEach(form, function(subCtrl, key){
                    if (key.indexOf('$') === 0)
                        return;
                    if (subCtrl.setBlured)
                        subCtrl.setBlured(isBlured);
                });
            }
        }
        //    form.$zform_reset
        if (!form.$zform_reset)
            form.$zform_reset = form.$zform_setBlured;

    }

    Di.controller = function($scope) {
        if (!$scope.def)
            throw new Error('def is required by <zform-edit>');
        var _this = this;

        // save the orginal $scope.def, for debugging
        var oldDef = angular.copy($scope.def);

        // trans 'def:string' to 'def:{text : xxxxxx }'
        var def = _this.def =  angular.isString($scope.def) ? 
                        { text: $scope.def } : $scope.def;

        def.el        = def.el   || 'label';

        var editEls = [ 'input', 'select', 'ui-select', 'checkbox', 'radio', 'radio-buttons', 'textarea', 'checkboxs'];
        _this.isEdit = $scope.isEdit = editEls.indexOf(def.el) >= 0;

        if (_this.isEdit && !def.name)
            throw new Error('def.name is required by an editable ctrl, def=' + JSON.stringify(oldDef));

        def.text      = def.text || '';
        def.doingText = def.doingText || 'Waiting...';

        $scope.el        = def.el;
        $scope.text      = def.text;
        $scope.disabled  = def.isDisabled;
        $scope.doingText = def.doingText;

        var form;
        this.setForm = function(fm) {
            form = _this.form = fm;
        }

        this.setInGroup = function(isInGroup) {
            $scope.isInGroup = isInGroup;
        }

        _this.hasBlured = false;
        this.setBlured = $scope.setBlured = function(hasBlured) {
            _this.hasBlured = hasBlured;
        }

        $scope.getText = function() {
            if (angular.isFunction(def.text)) 
                return def.text($scope.ngModel);
            if ($scope.text)
                return $scope.text;
            if ($scope.ngModel && def.name)
                return $scope.ngModel[def.name];
        }

        var getLabel = function(labelDef, v) {
            if (!v)
                return;

            if (labelDef) {
                // string
                if (angular.isString(labelDef)) {
                    return v[labelDef];
                } // function
                else if (angular.isFunction((labelDef)))
                    return labelDef(v);
            }
            //default
            if (angular.isString(v) || angular.isNumber(v))
                return v;

            return JSON.stringify(v);
        }

        // var initOptions = function() {
        //     if (angular.isArray(def.options)) {
        //         for (let i=0, len=def.options.length; i< len; i++) {
        //             var option = def.options[i];
        //             // extends string option to object {label: xxxx, value: xxx}
        //             if (angular.isString(option))
        //                 def.options[i] = {label: option, value: option};
        //         }
        //     };
        // }
        // initOptions();

        $scope.getSelectedLabel = function(v) { 
            return getLabel(def.selectedLabel || def.optionLabel, v); 
        };

        $scope.getOptionLabel = function(v) { 
            return getLabel(def.optionLabel, v); 
        };

        $scope.getOptionValue = function(v) { 
            if (!v) return v;

            if (def.optionValue) {
                // string
                if (angular.isString(def.optionValue)) {
                    return v[def.optionValue];
                } // function
                else if (angular.isFunction((def.optionValue)))
                    return def.optionValue(v);
            }
            //default
            return v;  
        }

        $scope.onClick = function() {
            // check the form valid, while submit
            if (def.type === 'submit') {
                form.$zform_validate();

                if (_this.form.$invalid) {
                    console.log('the form is invalid')
                    return;
                }
            }

            var prepare = function() {
                $scope.text = $scope.doingText;
                $scope.disabled = true;
            }

            var recover = function() {
                $scope.text = def.text;
                $scope.disabled = false;
            }

            if (def.onClick) {
                prepare();
                def.onClick(recover, $scope.ngModel);
            } 
        } // onClick()

        if (def.el === 'checkboxs') {
            if (!$scope.cbsModel)
                $scope.cbsModel = {};

            $scope.checkboxsToModel = function() {
                if (!$scope.ngModel[def.name]) 
                    $scope.ngModel[def.name] = [];
                $scope.ngModel[def.name].length = 0;
                angular.forEach($scope.cbsModel, function(value, key) {
                    if (value)
                        $scope.ngModel[def.name].push(key);
                })
                form[def.name].$validate();
            }

            var modelToCheckboxs = function(newValue, oldValue){
                angular.forEach($scope.cbsModel, function(value, key) {
                    delete $scope.cbsModel[key];
                });

                angular.forEach($scope.ngModel[def.name], function(item) {
                    $scope.cbsModel[item] = true;
                })
            }

            // model for option checkboxs
            $scope.$watchCollection('ngModel[def.name]', modelToCheckboxs );
        } // if (def.el === 'checkboxs')

    }

    return Di;
}); // directive('zformEdit')


app.directive('zformPics', function($timeout){
    var Di = {
        restrict: 'A',
        scope: {
            zformPics: '=',
            ngModel: '=',
        },
        require: ['zformPics'],
        transclude: true,
        templateUrl: '/zjs/zform/zform-pics.html',
    }

    Di.link = function($scope, iElm, iAttrs, controller) {
    }

    Di.controller = function($scope) {
        var def = $scope.def = $scope.zformPics;
        $scope.ngModel[def.name] = $scope.ngModel[def.name] || [];

        $scope.onSelected = def.onSelected || function() {};

        $scope.picHovered = null; 
        $scope.picSelected = null;

        $scope.Select = function(pic) {
            if ($scope.IsSelected(pic))
                return;
            $scope.picSelected = pic;
            $scope.onSelected(pic);
        }

        $scope.Mouseover = function(pic) {
            $scope.picHovered = pic;
        }

        $scope.Mouseleave = function(pic) {
            if ($scope.picHovered === pic)
                $scope.picHovered = null;
        }

        $scope.IsSelected = function(pic) {
            return $scope.picSelected === pic;
        }

        $scope.IsHovered = function(pic) {
            return $scope.picHovered === pic;
        }

        //如果设置为只读，代码就到这里结束了。
        if (def.isViewOnly) 
            return;

        if (!def.qiniu)
            throw new Error('qiniu is required by the def of <div zform-pics="def">');

        //注意！！！后面的代码都是跟upload有关的！
        $scope.onDeleted = def.onDeleted || function() {};
        $scope.onAdded  = def.onAdded  || function() {};
        $scope.btnText  = def.text || '+上传图片';
        $scope.doingText = def.doingText || '正在上传';
        def.qiniu.thumbUrlQuery = def.qiniu.thumbUrlQuery || '?imageView2/1/w/180/h/180/q/77/format/jpg';
        $scope.ClickDelete = function(pic) {
            $scope.ngModel[def.name].Delete(pic);
            $scope.onDeleted(pic);
        }

        var uploader = Qiniu.uploader({
            runtimes: 'html5,flash,html4',    //上传模式,依次退化
            browse_button: 'thumb-upload-btn',       //上传选择的点选按钮，**必需**
            uptoken_url: def.qiniu.uptoken_url || '/u/qiniu/uptoken',
            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
            // uptoken : '<Your upload token>',
                //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
            unique_names: true,
                // 默认 false，key为文件名。若开启该选项，SDK会为每个文件自动生成key（文件名）
            // save_key: true,
                // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK在前端将不对key进行任何处理
            domain: def.qiniu.domain || 'http://7sbqgr.com1.z0.glb.clouddn.com/',
                //bucket 域名，下载资源时用到，**必需**
            //container: 'container',           //上传区域DOM ID，默认是browser_button的父元素，
            max_file_size: def.qiniu.max_file_size || '100mb',           //最大文件体积限制
            flash_swf_url: 'js/plupload/Moxie.swf',  //引入flash,相对路径
            max_retries: 3,                   //上传失败最大重试次数
            dragdrop: true,                   //开启可拖曳上传
            drop_element: 'container',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
            chunk_size: '4mb',                //分块上传时，每片的体积
            auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
            init: {
                'FilesAdded': function(up, files) {
                    // 文件添加进队列后,处理相关的事情
                   
                    //存放正在uploading的图片
                    if (!$scope.upPics)
                        $scope.upPics = {};

                    plupload.each(files, function(file) {
                        var newPic = {
                            src: 'about:blank',
                            thumbSrc: 'about:blank',
                            $_isUploading: true,
                            upPercent: 0,
                        }
                        $scope.upPics[file.id] = newPic;
                        $scope.ngModel[def.name].push(newPic);
                    });
                },
                'BeforeUpload': function(up, file) {
                       // 每个文件上传前,处理相关的事情
                },
                'UploadProgress': function(up, file) {
                    $timeout(function(){
                        $scope.upPics[file.id].upPercent = file.percent;
                    },1);
                },
                'FileUploaded': function(up, file, info) {
                    // 每个文件上传成功后,处理相关的事情
                    // 其中 info 是文件上传成功后，服务端返回的json，形式如
                    // {
                    //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
                    //    "key": "gogopher.jpg"
                    //  }
                    // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html
                    var domain = up.getOption('domain');
                    var res = JSON.parse(info);
                    var url = domain + res.key; ///获取上传成功后的文件的Url
                    //注意：这里一定要用$timeout，否则无法通知变量更改。
                    $timeout(function(){
                        if (!$scope.ngModel[def.name])
                            $scope.ngModel[def.name] = [];

                        var pic = $scope.upPics[file.id];
                        pic.src = url;
                        pic.thumbSrc = url + def.qiniu.thumbUrlQuery
                        pic.$_isUploading = false;

                        delete $scope.upPics[file.id];

                        $scope.onAdded(pic);
                    }, 1);
                },
                'Error': function(up, err, errTip) {
                       //上传出错时,处理相关的事情
                },
                'UploadComplete': function() {
                    //队列文件处理完毕后,处理相关的事情
                },
                'Key': function(up, file) {
                    // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
                    // 该配置必须要在 unique_names: false , save_key: false 时才生效
                    var key = "";
                    // do something with key here
                    return key
                }
            }
        }); //var uploader = Qiniu.uploader({
    } // Di.controller

    return Di;
}); // directive('zformPics')





app.directive('qiniuUploader', function($timeout){
    var Di = {
        restrict: 'A',
        scope: {
            qiniuUploader: '=',
            ngModel: '=',
        },
        require: ['qiniuUploader'],

    }

    Di.link = function($scope, iElm, iAttrs, controller) {
       var def = $scope.qiniuUploader;
        if (!def)
            throw new Error('def is required by qiniu-uploader');
        if (!def.onUploaded)
            throw new Error('def.onUploaded is required by qiniu-uploader');
        if (!iAttrs.id)
            throw new Error('attribute id is required by <a id="XXX" qiniu-uploader="def">ABC<a>');
        var uploader = Qiniu.uploader({
            runtimes: def.runtimes || 'html5,flash,html4',   
            browse_button: iAttrs.id, 
            uptoken_url: def.uptoken_url,
            unique_names: true, 
            domain: def.domain,
            max_file_size: def.max_file_size || '100mb',
            flash_swf_url: def.flash_swf_url || 'js/plupload/Moxie.swf',
            max_retries: def.max_retries || 3,
            dragdrop: false,
            drop_element: 'container',  
            chunk_size: '4mb',
            auto_start: true, 
            init: {
                FilesAdded: function(up, files) {
                    plupload.each(files, function(file) {
                        $timeout(function(){
                            //PreUploadFile(file)
                        }, 10);
                    });
                },
                BeforeUpload: function(up, file) {
                },
                UploadProgress: function(up, file) {
                },
                FileUploaded: function(up, file, info) {
                     var domain = up.getOption('domain');
                    var res = JSON.parse(info);
                    var url = domain + res.key; 
                    $timeout(function(){
                        def.onUploaded(url, file);
                    }, 1);
                },
                Error: function(up, err, errTip) {
                },
                UploadComplete: function() {
                },
                Key: function(up, file) {
                }
            }

        });
    }

    Di.controller = function($scope) {
    } // Di.controller

    return Di;
}); // directive('qiniuUploader')










})();  // function wrap