app = angular.module('zform');

app.factory('tpls', function(){

var tpls = {};

tpls['dropdown-button'] = `
<button 
        type="button" 
        class="btn btn-block dropdown-toggle {{def.btnClass}} "
        uib-tooltip="{{def.tip}}"
        ng-disabled="disabled"
        data-toggle="dropdown" >
  <i ng-if="def.icon" class="{{def.icon}}"></i>
  <span ng-bind="getText()"></span>
  <span class="caret"></span>
</button>
<ul 
    class="dropdown-menu"> 
  <li ng-repeat="option in def.options"
      ng-class="{divider: option === '-'}">
      <a href ng-click="def.onSelectItem(getOptionValue(option))">{{getOptionLabel(option)}}</a>
  </li>
</ul>
`;

tpls['button'] = `
<button 
        type="{{def.type || 'button'}}" 
        class="btn btn-block {{def.btnClass || 'btn-primary'}} " 
        ng-disabled="disabled"
        uib-tooltip="{{def.tip}}"
        ng-click="onClick()">
  <i ng-if="def.icon" class="{{def.icon}}"></i>
  <span ng-if="def.isHtml" ng-bind-html="getText()"></span>
  <span ng-if="!def.isHtml" ng-bind="getText()"></span>
</button>
`;

tpls['text'] = `
<span ng-if="isInGroup"
      uib-tooltip="{{def.tip}}">
  <i ng-if="def.icon" class="{{def.icon}}"></i>
  <span ng-if="def.isHtml" ng-bind-html="getText()"></span>
  <span ng-if="!def.isHtml" ng-bind="getText()"></span>
</span>
<p ng-if="!isInGroup"
   uib-tooltip="{{def.tip}}"
   class="form-control-static">
  <i ng-if="def.icon" class="{{def.icon}}"></i>
  <span ng-if="def.isHtml" ng-bind-html="getText()"></span>
  <span ng-if="!def.isHtml" ng-bind="getText()"></span>
</p>
`;

tpls['html'] = `
<div 
     ng-bind-html="def.html">
</div>
`;

tpls['link'] = `
<p 
    class="form-control-static">
  <a href="{{def.url}}"
     uib-tooltip="{{def.tip}}"
     ng-click="def.onClick(ngModel)"
     target="{{def.target ||'_self'}}"
     >
    <i ng-if="def.icon" class="{{def.icon}}"></i>
    <span ng-bind="getText()"></span>
  </a>
</p>
`;

tpls['label'] = `
<label 
      uib-tooltip="{{def.tip}}">
  <i ng-if="def.icon" class="{{def.icon}}"></i>
  <span ng-if="def.isHtml" ng-bind-html="getText()"></span>
  <span ng-if="!def.isHtml" ng-bind="getText()"></span>
</label>
`;

//<!--- editors ---------->

tpls['input'] = `
<input 
       type="{{def.type}}"  
       name="{{def.name}}"  
       ng-model="ngModel[def.name]"  
       class="form-control"
       placeholder="{{def.placeholder}}"
       ng-blur="setBlured(true)"
       ng-maxlength="def.maxlength"
       maxlength="{{def.maxlength}}"
       ng-minlength="def.minlength"
       min="{{def.min}}"
       max="{{def.max}}"
       uib-tooltip="{{def.tip}}"
       ng-disabled="disabled"
       >
`;

tpls['textarea'] = `
<textarea 
          name="{{def.name}}"  
          ng-model="ngModel[def.name]"  
          class="form-control"
          placeholder="{{def.placeholder}}"
          uib-tooltip="{{def.tip}}"
          ng-disabled="disabled"
          ng-blur="setBlured(true)">
</textarea>
`;

tpls['checkbox'] = `
<div 
     ng-class="{checkbox: !isInGroup}"
     >
  <label uib-tooltip="{{def.tip}}">
    <input type="checkbox" 
           name="{{def.name}}" 
           ng-disabled="disabled"
           ng-model="ngModel[def.name]"/>
    <i ng-if="def.icon" class="{{def.icon}}"></i>
    <span ng-if="def.isHtml" ng-bind-html="getText()"></span>
    <span ng-if="!def.isHtml" ng-bind="getText()"></span>
  </label>
</div>
`;

tpls['checkboxs'] = `
<div >
  <input type="hidden" name="{{def.name}}" ng-model="ngModel[def.name]" ng-model-options="{allowInvalid:true}">
  <div ng-if="!def.isInline"
        ng-repeat="option in def.options"
        class="checkbox">
    <label uib-tooltip="{{option.tip}}">
      <input type="checkbox" 
             ng-model="cbsModel[option.value]"
             ng-disabled="disabled"
             ng-change="checkboxsToModel()" />
      <span ng-if="!option.isHtml" ng-bind="option.label|translate"></span>
      <span ng-if="option.isHtml" ng-bind-html="option.label|translate"></span>
    </label>
  </div>

  <label ng-if="def.isInline"
         ng-repeat="option in def.options"
         uib-tooltip="{{option.tip}}"
         class="checkbox-inline">
    <input type="checkbox" 
           ng-model="cbsModel[option.value]"
           ng-disabled="disabled"
           ng-change="checkboxsToModel()"/>
    <span ng-if="!option.isHtml" ng-bind="option.label|translate"></span>
    <span ng-if="option.isHtml" ng-bind-html="option.label|translate"></span>
  </label>
</div>
`;

tpls['radio'] = `
<span ng-if="!def.isInline">
  <div ng-class="{radio: !isInGroup}"
       ng-repeat="option in def.options">
    <label uib-tooltip="{{option.tip}}">
      <input type="radio" 
             name="{{def.name}}" 
             ng-model="ngModel[def.name]"
             ng-disabled="disabled"
             uib-tooltip="{{option.tip}}"
             value="{{option.value}}"/>
      <span ng-if="!option.isHtml" ng-bind="option.label|translate"></span>
      <span ng-if="option.isHtml" ng-bind-html="option.label|translate"></span>
    </label>
  </div>
</span>
<span ng-if="def.isInline">
  <label class="radio-inline"
         uib-tooltip="{{option.tip}}"
         ng-repeat="option in def.options">
    <input type="radio" 
           name="{{def.name}}" 
           ng-disabled="disabled"
           ng-model="ngModel[def.name]"
           uib-tooltip="{{option.tip}}"
           value="{{option.value}}"/>
    <span ng-if="!option.isHtml" ng-bind="option.label|translate"></span>
    <span ng-if="option.isHtml" ng-bind-html="option.label|translate"></span>
  </label>
</span>
`;

tpls['radio-buttons'] = `
<div 
     class="btn-group">
  <label ng-repeat="option in def.options"
         btn-radio="option.value"
         ng-disabled="disabled"
         uib-tooltip="{{option.tip}}"
         class="btn {{def.btnClass||'btn-default'}}"
         ng-model="ngModel[def.name]">
      {{option.label|translate}}
  </label>
</div>
`;

tpls['select'] = `
<select 
        name="{{def.name}}"  
        ng-model="ngModel[def.name]"  
        class="form-control"
        uib-tooltip="{{def.tip}}"
        ng-blur="setBlured(true)"
        ng-disabled="disabled"
        ng-options="getOptionValue(item) as getOptionLabel(item) for item in def.options ">
        <option value="" disabled selected>{{def.placeholder}}</option>
</select>
`;

tpls['ui-select'] = `
<ui-select 
           ng-model="ngModel[def.name]"
           name="{{def.name}}"
           uib-tooltip="{{def.tip}}"
           ng-disabled="disabled"
           on-select="def.onSelect($item,$model)"
           theme="bootstrap">
  <ui-select-match placeholder="{{def.placeholder}}">
    {{getSelectedLabel($select.selected)}}
  </ui-select-match>
  <ui-select-choices repeat="getOptionValue(option) as option in def.options|filter:$select.search">
    <div ng-bind-html="getOptionLabel(option)"></div>
  </ui-select-choices>
</ui-select>
`;

tpls['text-angular'] = `
<text-angular 
              ng-model="ngModel[def.name]"
              ng-disabled="disabled"></text-angular>
`;

tpls['zform-error'] = `
<zform-error ng-if="!isInGroup && isEdit" name="def.name"></zform-error>
`;



return tpls;

});
