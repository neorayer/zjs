{
    label: 'Password',
    name: 'password',
    type: 'Password',
    placeholder: '6 letters or numbers at least',
    validator: function(v) { if (!validator.isLength(v, 6)) return '6 letters or numbers at least'}
}

var formDefine = {
    id: String, // form的ID
    title: String, // the title of form
    sections: [     // form分为哪几个章节
        {
            title: String,
            items: [], // form-items;
        },
        {
            title: String,
            items: [], // form-items;
        }
    ],
    buttons: [
        {
            text: String,
            type: String, //'submit' 'cancel' 'goback', 'button'
        }
    ]


}