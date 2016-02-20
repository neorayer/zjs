# ZJS

## What's zjs?
- Zjs is a lightweight framework for **rapid development** built on others 'Giant' frameworks.
- Zjs is a **tool kit** to make an full-stack javascript single page webapp development more simplified.
- Zjs is a set of **convention** for enterprise web app based on Angualar and Node.
- Zjs is one of the **best practice** of MEAN(MongoDB, Express, Angular, Node).


## Directories and files convention
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
