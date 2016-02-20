# ZJS

## What's zjs?
- Zjs is a lightweight framework for **rapid development** built on others 'Giant' frameworks.
- Zjs is a **tool kit** to make an full-stack javascript single page webapp development more simplified.
- Zjs is a set of **convention** for enterprise web app based on Angualar and Node.
- Zjs is one of the **best practice** of MEAN(MongoDB, Express, Angular, Node).

## Fetures on front-end

### route.js

StateCreater() specifies a set of convention to define routes in Angular 1.x. It depends on 'angular-ui/ui.router'.

Examples:
 
    app.config(function($stateProvider){
       var sc = new StateCreater('/ui-user/pc/m/', $stateProvider);
 
       sc.createStates('home', 'home');
       sc.createStates('dashboard', 'dashboard');
       sc.createStates('product', 'product', null, null, globalResolve);
       sc.createStates('product', 'product.category');
       sc.createStates('product', 'product.one.editwb');
    }


Each createState() will create 7 states of a module, they can cover most all the states of business logic.


### model.js

model.js is a tool kit to simplify Model implements in Angular 1.x Framework. 

It's almost the best part of zjs. The coolest features includes:

 - **CACHE**: Automatic local cache for single model object or collection.
 - **RESTful**: Compatible any RESTful back-end.
 - **FILTER**: Both remote and local data filter are supported.
 - **POPULATE**: local property populating.
 - **SIMPLE**: Define a model object by ONLY ONE statement like: 
 
Example:

    DefineCommonRS(app, '/u', 'product',    'products');


### service.js: ControllerHelper

ControllerHelper reduces 70%(I guess) code for angular controller. It injects the most useful methods and variables into $scope. likes:

 - $scope.isNew
 - $scope.formProduct
 - $scope.product
 - $scope.LoadList()
 - $scope.Delete()
 - $scope.DeleteChecked()
 - $scope.Save()
 - $scope.Edit()
 - $scope.Cancel()
 - and so on.

Ussage Example:

    ControllerHelper.Init({
        scope:     $scope,
        controller: 'ProductCategoryController',
        modelLabel: 'Categories of product',
        modelName:  'category',
        rs:         CategoryRS,
        restricts:  null,
        stateHead:  null,
        newTpl:     {},
    }).then(function(){
    });


### zform

Zform is a set of AngularJS directives to generate Bootstrap 3 ready forms from a JSON object. It's much more powerful than most popular similar solutions on Github. like: [angular-schema-form], [angular-dynamic-forms] and so on.

Read the source code in folder zform and try the demo in zform/demo, you will addicted in it.


### ztree

Ztree is an AngularJS directive to implement editable tree view. The algo is quite clever and neat, but the power is strong. 

### army-knife.js

Utils, still need optimize.


## Files convention of 'zjs app'
    + bower_components/
    + node_modules/ 
    + theme/            // theme templates
    + ui-admin/         // front-end sub application. 
                        // prefix with 'ui-', admin means it should be a administor console.
    + ui-user/          // user means it shoud be a application used by users.
        * js/
            - app.js    // define app object, and initialization
            - model.js  // define RESTful model objects.
            - route.js  // define states and routes.
        * pc/           // for PC, or
                        // responsive layout for multi devices.  
            - css/
            - img/
            - m/        // the folders of varity app modules
                + portal    // entrance and public module
                + home      // normally used as the default module after login
                + product   // module example, products management module 
                    * product.controller.js     
                    * product.html
                    * product.cover.html
                    * product.list.html
                    * product.one.html
                    * product.one.detail.html
                    * product.one.edit.html
                + user      // module example, user management module
                + payment   // module example, payment management module
            - tpl/      // some public templates 
        * ph/           // particular for phone devices.
            - css/
            - img/
            - m/
            - tpl/
        * ws/           // web service, back-end, server side, code for NodeJS
            - controllers/  // RESTful interface 
            - models/       // domain model, based on Mongoose
            - services/     
            - utils/
            - config.js     // configure file for App
        * zjs/          // HERE IS THE REAL zjs code

## Do you should use zjs?
**No, you shouldn't.**, unless you are the member of Rui Zhou's team. because:

1. Zjs is still in developing. Large, constructional alteration is quite possible.
2. No sufficient document to support your development.
3. Zjs is fit for single page webapp only.
