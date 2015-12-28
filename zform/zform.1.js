'use strict'

var VALIDATOR_REQUIRE = {
    msg: '必填',
    Check: function(v) { 
        if (!v)
            return false;
        if (typeof(v) === 'string' &&v.trim().length === 0)
            return false;
        return true;
    }
}
    
var zformErrorsHandle = function(serverErrors, err) {
    for (var k in serverErrors) {
        delete serverErrors[k];
    }

    if (err ) {
        if (err.data) {
            if (err.data.field) {
                serverErrors[err.data.field] = err.data.msg; 
            }else {
                serverErrors['_global'] = err.data;
            }
        }else {
            serverErrors['_global'] = err;
        }
    }
}

//TODO 今后可以去掉这里
var app = app ? app: angular.module('zjs',[]);

app.directive('zform', function($rootScope) {
    return {
        restrict: 'A',
        scope: {
            serverErrors: '=', //服务端验证失败信息。
        },
        controller: function($scope) {
            if (!$scope.serverErrors)
                throw new Error('<form zform server-errors="serverErrors", serverErrors can not be null.>');

            this.serverErrors = $scope.serverErrors;
        },
        link: function(scope, element, attrs, controller) {

            //可编辑的控件。格式为ctlController
            var editCtlrs = {}; 

            controller.serverErrors = scope.serverErrors;

            controller.addEditCtlr = function(ctlController) {
                editCtlrs[ctlController.name] = ctlController;
            }


            /**
             * @param {null|[String]} 要执行验证的控件Controller名列表。无参数则表示所有的editCtlrs。
             */
            controller.validate = function() {
                var ctlrs = [];
                if (arguments.length === 0) {
                    //验证所有控件
                    for (var name in editCtlrs) {
                        ctlrs.push(editCtlrs[name]);
                    }
                }else {
                    //验证参数中指定的控件
                    var ctlrNames = arguments[0];
                    ctlrs = ctlrNames.map(function(name){
                        return editCtlrs[name];
                    });
                }
                var isAllPass = true;
                ctlrs.forEach(function(ctlr){
                    if (!ctlr.validate())
                        isAllPass = false;
                });
                return isAllPass;

            }
        },
    }
});

app.directive('zformRow', function($rootScope, $q){
    return {
        restrict: 'A',
        scope: {
            cols: '=zformRow', 
        },
        require: ['zformRow', '^zform'],
        transclude: true,
        templateUrl: '/zjs/zform/zform-row.html',
        link: function(scope, element, attrs, controllers) {
            scope.cols.forEach(function(col) {
                col.cssCol      = col.cssCol || 'col-sm-3';
            });

        },
        controller: function($scope) {
            if (!$scope.cols)
                throw new Error('<div zform-row="cols", cols can not be null.>');

            var _this = this;


        },
    }
});

/**
    define {
        ngModel:    Var, 
        type:       String, 'label', 'input', 'select'
        inputType:  String, 'text', 'password', 'checkbox', 'radio'
        options:    [{label: String, value: Object],  
        optionLabel:String|| function(){}  作为select option显示的属性名，或生成属性名的函数。//default: 'label'
        OnSelect:   function(option), for type='select'.
        text:       String,  , 
        isRequired: Boolean,
        cssCol:     String, 'col-sm-3',
        cssBtn:     String, 'btn-primary'
        Click:      function(done),  // done:function(){}
        placeholder:String, 
        name:       String, 
        doingText:  String, 'Waiting...',
        helpText:   String, 
        autocomplete: String, 'on', 'off'
        validators: [function(v)]
        height:     String, // '60px', for type='textarea'

    }

*/

app.directive('zformCol', function($rootScope, $q){
    return {
        restrict: 'EA',
        scope: {
            zformCol: '=',
        },
        require: ['zformCol', '^zform'],
        transclude: true,
        templateUrl: '/zjs/zform/zform-col.html',
        replace: true,
        link: function(scope, element, attrs, controllers) {
            var controller      = controllers[0];
            var zformController = controllers[1];            
            controller.setZform(zformController);
        },
        controller: function($scope) {
            var _this = this;
            //是否包含可编辑的控件。
            var hasEditor = false;

            _this.setZform = function(zformController) {
                _this.zformController = zformController;
                $scope.serverErrors = _this.zformController.serverErrors;
            }            

            var ctlCtlrs = {};
            this.addEditCtlr = function(ctlCtlr) {
                ctlCtlrs[ctlCtlr.name] = ctlCtlr;
                hasEditor = true;
            }

            $scope.validMsgs = [];
            this.setValidMsgs = function(msgs) {
                $scope.validMsgs.length = 0;
                $scope.validMsgs.PushArray(msgs);
            }

            $scope.myServerErrors = [];
            $scope.findMyServerErrors = function() {
                $scope.myServerErrors.length = 0;
                for(var name in ctlCtlrs) {
                    var err = $scope.serverErrors[name];
                    if (err)
                        $scope.myServerErrors.push(err);
                }
                return $scope.myServerErrors.length > 0;
            }

            var hasError = function() {
                //local validate msg
                if ($scope.validMsgs.length > 0)
                    return true;

                // remote server error
                if ($scope.findMyServerErrors())
                    return true;

                return false;
            }

            $scope.getNgClass = function() {
                if (!hasEditor)
                    return;
                var isHasError = hasError();
                return {
                    'has-feedback': hasEditor,
                    'has-error': isHasError,
                    'has-success': !isHasError,
                }
            }

        }
    }

});

/**
    $scope.formRows.email = [
        {},
        {
            cssCol: 'col-sm-9',
            type: 'input-group',
            left: {
                type: 'checkbox',
                ngModel: $scope.formData,
                text: '邮件',
                name: 'isEmail',
            input: {
                type: 'input',
                inputType: 'text',
                ngModel: $scope.formData,
                name: 'email',
                validators: [VALIDATOR_REQUIRE]
            },
            right: {
                type: 'button',
                btnType: 'button',
                text: '?',
            }
        },
    ]

    left和right的type可以是 text, checkbox, radio, button
    input 的type必须是input
 */
app.directive('zformIngrp', function($rootScope, $q){
    return {
        restrict: 'AE',
        scope: {
            zformIngrp: '=zformIngrp',
        },
        transclude: true,
        templateUrl: '/zjs/zform/zform-ingrp.html',
        link: function(scope, element, attrs, controllers) {
        },
        controller: function($scope) {
            $scope.def = $scope.zformIngrp;
            var def = $scope.def;

            var getGroupClass = function(ctl) {
                if (!ctl)
                    return '';
                switch (ctl.type) {
                    case 'button':
                        return 'input-group-btn';
                    case 'text':
                    case 'checkbox':
                    case 'radio':
                        return 'input-group-addon';
                }

            }
            $scope.leftClass = getGroupClass(def.left);
            $scope.rightClass = getGroupClass(def.right);
        }
    }
});

app.directive('zformCtl', function($rootScope, $q){
    return {
        restrict: 'AE',
        scope: {
            ctl: '=ctl',
            model: '=model',
        },
        require: ['zformCtl', '^zformCol', '^zform'],
        transclude: true,
        templateUrl: '/zjs/zform/zform-ctl.html',
        link: function(scope, element, attrs, controllers) {
            var controller   = controllers[0];
            var colController   = controllers[1];
            var zformController = controllers[2];
            const abc = 0;

            controller.setZform(zformController);
            controller.setCol(colController);
            if (controller.isEditCtl()) {
                colController.addEditCtlr(controller);
                zformController.addEditCtlr(controller);
            }

            //判断ctl是否包含在一个input-group内。
            if (element.parent().hasClass('input-group'))
                controller.setInGroup(true);

        },
        controller: function($scope) {
            var _this = this;
            var ctl = $scope.ctl;
            var col = $scope.col;
            $scope.ngModel = $scope.model;

            if ($scope.ngModel && ctl.ngModel) 
                throw new Error('you can\'t define ngModel in <zform-ctl model="model" and ctl.ngModel at the same time.');

            _this.name = ctl.name;

            $scope.serverErrors = this.serverErrors;

            var EDITABLE_CTLS = ['input', 'select', 'radio', 'radio-buttons', 'checkbox', 'textarea'];

            _this.isEditCtl = function() {
                return EDITABLE_CTLS.indexOf(ctl.type) >= 0;
            }

            _this.setZform = function(zformController) {
                _this.zformController = zformController;
                $scope.serverErrors = _this.zformController.serverErrors;
            }

            _this.setCol = function(colController) {
                _this.colController = colController;
            }

            _this.setInGroup = function(isIn) {
                $scope.ctl.isInGroup = isIn;
            }

            var validateRelatives = function() {
                if (!ctl.relatives) 
                    return true;

                return _this.zformController.validate(ctl.relatives);
            }

            if (_this.isEditCtl()) {
                // 可编辑控件必须包含name属性
                if (!ctl.name)
                    throw new Error('<div zform-ctl="data" require attribute "name" in the "data".' + JSON.stringify(ctl));
                // 可编辑控件必须包含ng-model属性
                if (!$scope.ngModel && !ctl.ngModel) 
                    throw new Error('you must define ngModel in <zform-ctl model="model" or ctl.ngModel.');
            }
            if (!$scope.ngModel)
                $scope.ngModel = ctl.ngModel;



            ctl.type        = (ctl.type  || 'label').toLowerCase();
            ctl.inputType   = ctl.inputType || 'text';
            ctl.height      = ctl.height || '80px';
            ctl.isRequired  = ctl.isRequired ? true : false;
            ctl.isVirgin    = true;
            ctl.isError     = false; 

            // return true - if every validator is passed.
            ctl.validate = _this.validate = function() {
                if (!ctl.validators)
                    return true;
                ctl.isVirgin = false;
                var msgs = [];

                var isAllPass = true;
                ctl.validators.forEach(function(validator) {
                    if (!validator.Check($scope.ngModel[ctl.name])) {
                        msgs.push(validator.msg);
                        isAllPass = false;
                    }                   
                });
                _this.colController.setValidMsgs(msgs);

                ctl.isError = !isAllPass;
                return isAllPass;
            }

            var hasError = function() {
                //local validate msg
                if (ctl.isError)
                    return true;
                // server validate msg
                if ($scope.serverErrors[ctl.name])
                    return true;
                return false;
            }

            $scope.getNgClass = function() {
                var ngClass = {
                    'has-feedback'    : ctl.type === 'input' && !(!ctl.validators),
                    'glyphicon-remove': !ctl.isVirgin && hasError(),
                    'glyphicon-ok'    : !ctl.isVirgin && !hasError(),
                }

                return ngClass;
            }

            ctl.isShowHelptext = function() {
                return false;
                return ctl.Virgin && !(!ctl.helpText);
            }

            // ctl.inputGroupClass = {};
            // if (col.type === 'input-group') {
            //     switch(ctl.type) {
            //         case 'label':
            //         case 'select':
            //             ctl.inputGroupClass['input-group-addon'] = true;
            //         break;
            //         case 'button':
            //         case 'dropdown-button':
            //             ctl.inputGroupClass['input-group-btn'] = true;
            //         break;

            //     }
            // }

          //返回select控件选项显示的内容
            ctl.getOptionLabel = function(option) {
                if (!option)
                    return null;
                if (!ctl.optionLabel)
                    return JSON.stringify(option);
                switch(typeof(ctl.optionLabel)) {
                    case 'string':
                        return option[ctl.optionLabel];
                    break;
                    case 'function':
                        return ctl.optionLabel(option);
                }
            }

            switch (ctl.type) {
                case 'label':
                    
                break;
                case 'radio':
                    if (!ctl.options)
                        throw new Error('ctl.options[] is required by by <zform-row> type="radio"');
                break;
                case 'radio-buttons':
                    ctl.cssBtn    = ctl.cssBtn    || 'btn-primary';
                break;
                case 'dropdown-button':
                    ctl.cssBtn    = ctl.cssBtn    || 'btn-primary';
                    if (!ctl.OnSelectItem)
                        throw new Error('<zform-ctl ctl="def">. def.OnSelectItem is required if def.type is "dropdown-button" ');
                  //  if (ctl.options && ctl.options.length > 0)
                  //      ctl.selectItem(ctl.options[0]);
                break;
                case 'button':
                    ctl.cssBtn    = ctl.cssBtn    || 'btn-primary';
                    ctl.btnType   = ctl.btnType   || 'button';
                    ctl.doingText = ctl.doingText || 'Waiting...';
                    ctl.btnText   = ctl.text;
                    ctl.isDoing   = false;
                    ctl.btnClick = function() {
                        if (!ctl.Click)
                            throw new Error('ctl.Click() is required by <zform-row> type="button"');

                        var isEnabled = true;
                        if (ctl.btnType === 'submit') {
                            if (!_this.zformController.validate())
                                isEnabled = false;
                        }else {
                            if (!validateRelatives())
                                isEnabled = false;
                        }

                        if (isEnabled) {
                            ctl.btnText = ctl.doingText;
                            ctl.isDoing = true;
                            ctl.Click(function() {
                                ctl.btnText = ctl.text;
                                ctl.isDoing = false;
                            });
                        }
                    };
                break;
                case 'select':
                      ctl.onSelect = function($item, $model) {
                        $scope.ngModel[ctl.name] = $model;
                        ctl.validate();
                        if (ctl.OnSelect)
                            ctl.OnSelect($model);
                    }
                break;

                case 'input':
                break;
            }

            // ctl.css
            ctl.css = ctl.cssCol + ' ';
        },

    }

});



/**
 * define {
 *  type: 'pictures',
 * isViewOnly: boolean, //只读，不上传
 *  qiniu: {},  //七牛uploader的相关参数
 *  OnSelect: function(pic) {}
 *  OnDelete: function(pic) {}
 * }
 */
app.directive('zformPics', function($rootScope, $q, $timeout){
    return {
        restrict: 'A',
        scope: {
            zformPics: '=',
        },
        require: ['zformPics'],
        transclude: true,
        templateUrl: '/zjs/zform/zform-pics.html',
        link: function(scope, element, attrs, controllers) {
            var controller   = controllers[0];
            //var rowController   = controllers[1];
            //var zformController = controllers[1];

        },
        controller: function($scope) {

            var def = $scope.def = $scope.zformPics;
            def.ngModel[def.name] = def.ngModel[def.name] || [];

            $scope.onSelect = def.OnSelect || function() {};


            $scope.picHovered = null; 
            $scope.picSelected = null;

            $scope.Select = function(pic) {
                if ($scope.IsSelected(pic))
                    return;
                $scope.picSelected = pic;
                $scope.onSelect(pic);
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
            $scope.onDelete = def.OnDelete || function() {};
            $scope.onAdded  = def.OnAdded  || function() {};
            $scope.btnText  = def.text || '+上传图片';
            $scope.doingText = def.doingText || '正在上传';
            def.qiniu.thumbUrlQuery = def.qiniu.thumbUrlQuery || '?imageView2/1/w/180/h/180/q/77/format/jpg';
            $scope.ClickDelete = function(pic) {
                def.ngModel[def.name].Delete(pic);
                $scope.onDelete(pic);
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
                            def.ngModel[def.name].push(newPic);
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
                            if (!def.ngModel[def.name])
                                def.ngModel[def.name] = [];

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
            });

        },
    }
});
