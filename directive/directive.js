app.directive('setBreadcrumb', function($rootScope){
    return {
        restrict: 'E',
        scope: {
            level: '=',
            title: '@',
        },
        link: function(scope,  element, attrs, ngModeCtl) {
            //这里有BUG,有时候title如果是用{{}}动态加入的，则总是''
            $rootScope.SetBreadcrumb(scope.level, scope.title);
        }
    }
});

//<breadcrumb bc-class="breadcrumb"></breadcrumb>
app.directive('breadcrumb', function($rootScope, $state){
    return {
        restrict: 'A',
        scope: {
        },
        transclude: true,
        templateUrl: '/zjs/directive/breadcrumb.html',
        link: function(scope,  element, attrs, ngModeCtl) {
            scope.breadcrumbs = $rootScope.breadcrumbs;

            scope.GotoBreadcrumb = function(level) {
                var bc = scope.breadcrumbs[level];
                $state.go(bc.srefTo, bc.srefParams);
            }

        }
    }
});


/** 自动生成表单输入项目 **
    用法：
        <form>
          <formitems form-attrs="attrs" form-error="error" ng-model="formSupplier"></formitems>
          <button>保存</button>
        </form> 

    formAttrs的格式:
    [
        {
            label: 'Email',
            name: 'email',
            placeholder: 'The email is you account ID',
            validator: function(v) { if (!validator.isEmail(v)) return 'The email address is invalid.' },
        },
        {
            id: 'password-ipt',
            label: 'Password',
            name: 'password',
            type: 'Password',
            placeholder: '6 letters or numbers at least',
            validator: function(v) { if (v.length < 6) return '6 letters or numbers at least'}
        },
        {
          label: String , 标题
          name: String, 对应的ngModel的属性名
          type: 'Select'|'Radio'|'Text'|'Article|'Password'|'Html', 表单项的输入类型。default='String'。当有options时='Select'。
          options: [], 选项，格式如下：
            1. {
              label: '国家',
              options: ['China', 'Australia', 'United Kindom']
            }
            2. {
              label: '国家',  
              options: [ {label: '中国', value: 'China'}, {label: '澳大利亚', value: 'Australia'}]
            }
            3. {
              label: '国家',  
              options: [ {cn: '中国', en: 'China'}, {cn: '澳大利亚', en: 'Australia'}]
              optionLabelName: 'cn',
              optionValueName: 'en',
            }
        }
  ]  

  type: ['Text', 'Password', 'Article', 'Tele', 'PersonName', 'Number', 'Select', 'Radio']

  formError对应$scope里的一个对象，格式为 {field: xxxx, msg: xxxx, ...}
**/
app.directive('formitems', function($rootScope, $state) {
    return {
        restrict: 'E',
        scope: {
            formAttrs: '=',
            ngModel: '=',
            formError: '=', 
        },
        transclude: true,
        templateUrl: '/zjs/directive/formitems.html',
        link: function(scope,  element, attrs, ngModeCtl) {
            if (!scope.formAttrs)
                throw new Error('<formitems> does not define attribute "formAttrs".');
            scope.formAttrs.forEach(function(formAttr){
                if (formAttr.options) {
                    formAttr.type = formAttr.type || 'Select';
                    formAttr.isSimpleOption = (typeof formAttr.options[0] === 'string')
                            || (typeof formAttr.options[0] === 'number' );
                    //当options为简单类型['选项1', '选项2', '选项3']时，
                    // 补充options[x].label和options[x].value
                    if (typeof formAttr.options[0] === 'string') {
                        for(var i=0, len = formAttr.options.length; i<len; i++) {
                            var v = formAttr.options[i];
                            formAttr.options[i] = {label: v, value: v};
                        }

                    }

                    formAttr.optionLabelName = formAttr.optionLabelName || 'label';
                    formAttr.optionValueName = formAttr.optionValueName || 'value';
                }
                // type: String | Article; default Text.
                formAttr.type = formAttr.type || 'Text';
                // convert all type to lower case.
                formAttr.type = formAttr.type.toLowerCase();
            })

            scope.IsAttrError = function(attr) {
                return scope.formError 
                        && scope.formError.field 
                        && scope.formError.field === attr.name;
            }

            scope.AttrId = function(attr) {
                if (attr.id)
                    return attr.id;
                return attr.name + "-input";
            }

            scope.SwitchDatePicker = function($event, attr) {
                $event.preventDefault();
                $event.stopPropagation();
                attr.$_isOpened = !attr.$_isOpened;
            }

            scope.Validate = function(attr) {
                if (!attr.validator)
                    return;

                var errMsg = attr.validator(scope.ngModel[attr.name]);
                if (errMsg) {
                    scope.formError = {
                        field: attr.name,
                        msg: errMsg,
                    }
                }else {
                    scope.formError = null;
                }

            }
        }
    }
});

// 注：必须放在<table>里,最为<tr>的attribute。
//     <tr propitems attrs="clientAttrs" ng-model="client"></tr>
app.directive('propitems', function($rootScope, $state){
    return {
        restrict: 'A',
        scope: {
            attrs: '=',
            filter: '=',
            ngModel: '=',
        },
        transclude: true,
        templateUrl: '/zjs/directive/propitems.html',
        link: function(scope,  element, attrs, ngModeCtl) {
            scope.myAttrs = scope.attrs.filter(function(attr){
                if (!scope.filter)
                    return true;
                for (var key in scope.filter) {
                    if (attr[key] !== scope.filter[key]) { 
                        return false;
                    }
                }
                return true;
            })

            scope.myAttrs.forEach(function(attr){
                if (attr.options) {
                    attr.type = 'Select';
                    var labelName = attr.optionLabelName || 'label';
                    var valueName = attr.optionValueName || 'value';

                    attr.realOptions = attr.options.map(function(opt){
                        return {
                            label: (opt[labelName] || opt).toString(),
                            value: (opt[valueName] || opt),
                        }
                    });
                }
                // type: String | Article; default Text.
                attr.type = attr.type || 'Text';
            })
        }
    }
});

// Example:
//  <thumbmgr ng-model="supplier" 
//            pic-property="pictures" 
//            on-delete="DeletePicture"
//            on-select="SelectPicture"
//  >
//  </thumbmgr>
app.directive('thumbmgr', function($rootScope, $state){
    return {
        restrict: 'E',
        scope: {
            pictures: '=',
            onDelete: '=',
            onSelect: '=',
            afterLink: '=',
        },
        transclude: true,
        templateUrl: '/zjs/directive/thumbmgr.html',
        link: function(scope,  element, attrs, ngModeCtl) {
            scope.picHovered = null; 
            scope.picSelected = null;

            scope.Select = function(pic) {
                if (scope.IsSelected(pic))
                    return;
                scope.picSelected = pic;
                if (scope.onSelect)
                    scope.onSelect(pic);
            }

            scope.Mouseover = function(pic) {
                scope.picHovered = pic;
                
            }

            scope.Mouseleave = function(pic) {
                if (scope.picHovered === pic)
                    scope.picHovered = null;
            }

            scope.IsSelected = function(pic) {
                return scope.picSelected === pic;
            }

            scope.IsHovered = function(pic) {
                return scope.picHovered === pic;
                console.log(scope.picHovered, pic)
            }

            scope.ClickDelete = function(pic) {
                scope.pictures.Delete(pic);
                scope.onDelete(pic);
            }

            if (scope.afterLink)
                scope.afterLink();
        }
    }
});


app.directive('bootstrapNav', function($rootScope, $state){
    return {
        restrict: 'A',
        scope: {
            items: '=',
        },
        transclude: true,
        templateUrl: '/zjs/directive/bootstrap-nav.html',
        link: function(scope,  element, attrs, ngModeCtl) {

            scope.IsActive = function(item) {
                item.stateGroup =  item.stateGroup || item.state;
                var idx = item.stateGroup.indexOf('(');
                if (idx >= 0)
                    item.stateGroup = item.stateGroup.substring(0, idx - 1);
                return $state.current.name.indexOf(item.stateGroup) === 0;
            }
        }
    }
});


/*
    <ul mainmenu class="menu" menus="menus"></ul>
    必须放在 <ul>或<ol>内。
*/
app.directive('mainmenu', function($rootScope, $state){
    return {
        restrict: 'A',
        scope: {
            menus : '=',
        },
        transclude: true,
        templateUrl: '/zjs/directive/mainmenu.html',
        link: function(scope,  element, attrs, ngModeCtl) {

            scope.IsActive = function(item) {
                item.stateGroup =  item.stateGroup || item.state;
                var idx = item.stateGroup.indexOf('(');
                if (idx >= 0)
                    item.stateGroup = item.stateGroup.substring(0, idx - 1);
                return $state.current.name.indexOf(item.stateGroup) === 0;
            }
        }
    }
});

/** Example:
    <navtabs tabs="tabs"></navtabs>

    if ($scope.company) {
        var stateParams = '({company:"' + $scope.company._id + '"})';
        $scope.tabs = [
            {   
                text: '公司', 
                color: 'orange',
                stateGroup:'company.one.detail', 
                state: 'company.one.detail' + stateParams,
                icon: 'fa fa-home',
            },
            {   text: '用户帐号', 
                color:'purple', 
                stateGroup: 'company.one.user',
                state: 'company.one.user.list' + stateParams,
                icon: 'fa fa-cube',
            },
            {
                text: '编辑', 
                color:'purple', 
                state: 'company.one.edit' + stateParams,
                icon: 'fa fa-cube',
            }
        ];
     }
*/
app.directive('navtabs', function($rootScope, $state){
    return {
        restrict: 'E',
        scope: {
            tabs : '=',
        },
        transclude: true,
        templateUrl: '/zjs/directive/navtabs.html',
        link: function(scope,  element, attrs, ngModeCtl) {

            scope.IsActive = function(item) {
                item.stateGroup =  item.stateGroup || item.state;
                var idx = item.stateGroup.indexOf('(');
                if (idx >= 0)
                    item.stateGroup = item.stateGroup.substring(0, idx - 1);
                return $state.current.name.indexOf(item.stateGroup) === 0;
            }
        }
    }
})

app.directive('teleinput', function($rootScope, $state){
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
        },
        transclude: true,
        templateUrl: '/zjs/directive/teleinput.html',
        link: function(scope,  element, attrs, ngModeCtl) {
            var update = function() {
                var s = '';

                var c = scope.tele.country;
                var a = scope.tele.area;
                var l = scope.tele.local;
                if (c) {
                    c = c.trim();
                    if (c.indexOf('+') !== 0)
                        s = '+' + s;
                    if (c.length > 0)
                        s += c;
                }
                if (a) {
                    a = a.trim();
                    if (a.length > 0)
                        s += ' ' + a;
                }
                if (l) {
                    l = l.trim();
                    if (l.length > 0)
                        s += ' ' + l;
                }

                scope.ngModel = s;
            }

            // parse tele
            var s = scope.ngModel;
            var tele = {};
            if (s) {
                s = s.trim();
                var ss = s.split(' ');
                switch(ss.length) {
                    case 1:
                        tele.local = s;
                        break;
                    case 2:
                        tele.local = ss[1];
                        tele.area = ss[0];
                        break;
                    case 3:
                        tele.local = ss[2];
                        tele.area = ss[1];
                        tele.country = ss[0];
                        break;
                    default:
                        tele.area = ss[1];
                        tele.country = ss[0];
                        tele.local = s.substring(ss[0].length + ss[1].length + 1);
                        break;
                }
            }

            scope.tele = tele;

            scope.$watch('tele.country', update);
            scope.$watch('tele.area', update);
            scope.$watch('tele.local', update);
        }
    }
});

app.directive('personName', function($rootScope, $state){
    return {
        restrict: 'E',
        scope: {
            ngModel: '=',
            isMidHidden: '=',
        },
        transclude: true,
        templateUrl: '/zjs/directive/person-name.html',
        link: function(scope,  element, attrs, ngModeCtl) {
        }
    }
});


app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
