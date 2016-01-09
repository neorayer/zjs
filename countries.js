if (typeof CONSTS === 'undefined') {
  CONSTS = {};
}

CONSTS.countries = [ 
  {code: "HK", name: "Hong Kong", cn: "香港"},
  {code: "TW", name: "Taiwan", cn: "台湾"},
  {code: "MO", name: "Macao", cn: "澳门"},
  {code: "US", name: "United States of America (USA)", cn: "美国"},
  {code: "AR", name: "Argentina", cn: "阿根廷"},
  {code: "AD", name: "Andorra", cn: "安道尔"},
  {code: "AE", name: "United Arab Emirates", cn: "阿联酋"},
  {code: "AF", name: "Afghanistan", cn: "阿富汗"},
  {code: "AG", name: "Antigua & Barbuda", cn: "安提瓜和巴布达"},
  {code: "AI", name: "Anguilla", cn: "安圭拉"},
  {code: "AL", name: "Albania", cn: "阿尔巴尼亚"},
  {code: "AM", name: "Armenia", cn: "亚美尼亚"},
  {code: "AO", name: "Angola", cn: "安哥拉"},
  {code: "AQ", name: "Antarctica", cn: "南极洲"},
  {code: "AS", name: "American Samoa", cn: "美属萨摩亚"},
  {code: "AT", name: "Austria", cn: "奥地利"},
  {code: "AU", name: "Australia", cn: "澳大利亚"},
  {code: "AW", name: "Aruba", cn: "阿鲁巴"},
  {code: "AX", name: "Aland Island", cn: "奥兰群岛"},
  {code: "AZ", name: "Azerbaijan", cn: "阿塞拜疆"},
  {code: "BA", name: "Bosnia & Herzegovina", cn: "波黑"},
  {code: "BB", name: "Barbados", cn: "巴巴多斯"},
  {code: "BD", name: "Bangladesh", cn: "孟加拉"},
  {code: "BE", name: "Belgium", cn: "比利时"},
  {code: "BF", name: "Burkina", cn: "布基纳法索"},
  {code: "BG", name: "Bulgaria", cn: "保加利亚"},
  {code: "BH", name: "Bahrain", cn: "巴林"},
  {code: "BI", name: "Burundi", cn: "布隆迪"},
  {code: "BJ", name: "Benin", cn: "贝宁"},
  {code: "BL", name: "Saint Barthélemy", cn: "圣巴泰勒米岛"},
  {code: "BM", name: "Bermuda", cn: "百慕大"},
  {code: "BN", name: "Brunei", cn: "文莱"},
  {code: "BO", name: "Bolivia", cn: "玻利维亚"},
  {code: "BQ", name: "Caribbean Netherlands", cn: "荷兰加勒比区"},
  {code: "BR", name: "Brazil", cn: "巴西"},
  {code: "BS", name: "The Bahamas", cn: "巴哈马"},
  {code: "BT", name: "Bhutan", cn: "不丹"},
  {code: "BV", name: "Bouvet Island", cn: "布韦岛"},
  {code: "BW", name: "Botswana", cn: "博茨瓦纳"},
  {code: "BY", name: "Belarus", cn: "白俄罗斯"},
  {code: "BZ", name: "Belize", cn: "伯利兹"},
  {code: "CA", name: "Canada", cn: "加拿大"},
  {code: "CC", name: "Cocos (Keeling) Islands", cn: "科科斯群岛"},
  {code: "CD", name: "Democratic Republic of the Congo", cn: "刚果（金）"},
  {code: "CF", name: "Central African Republic", cn: "中非"},
  {code: "CG", name: "Republic of the Congo", cn: "刚果（布）"},
  {code: "CH", name: "Switzerland", cn: "瑞士"},
  {code: "CI", name: "Cote d'Ivoire", cn: "科特迪瓦"},
  {code: "CK", name: "Cook Islands", cn: "库克群岛"},
  {code: "CL", name: "Chile", cn: "智利"},
  {code: "CM", name: "Cameroon", cn: "喀麦隆"},
  {code: "CN", name: "China", cn: "中国"},
  {code: "CO", name: "Colombia", cn: "哥伦比亚"},
  {code: "CR", name: "Costa Rica", cn: "哥斯达黎加"},
  {code: "CU", name: "Cuba", cn: "古巴"},
  {code: "CV", name: "Cape Verde", cn: "佛得角"},
  {code: "CW", name: "Curacao", cn: "库拉索"},
  {code: "CX", name: "Christmas Island", cn: "圣诞岛"},
  {code: "CY", name: "Cyprus", cn: "塞浦路斯"},
  {code: "CZ", name: "Czech Republic", cn: "捷克"},
  {code: "DE", name: "Germany", cn: "德国"},
  {code: "DJ", name: "Djibouti", cn: "吉布提"},
  {code: "DK", name: "Denmark", cn: "丹麦"},
  {code: "DM", name: "Dominica", cn: "多米尼克"},
  {code: "DO", name: "Dominican Republic", cn: "多米尼加"},
  {code: "DZ", name: "Algeria", cn: "阿尔及利亚"},
  {code: "EC", name: "Ecuador", cn: "厄瓜多尔"},
  {code: "EE", name: "Estonia", cn: "爱沙尼亚"},
  {code: "EG", name: "Egypt", cn: "埃及"},
  {code: "EH", name: "Western Sahara", cn: "西撒哈拉"},
  {code: "ER", name: "Eritrea", cn: "厄立特里亚"},
  {code: "ES", name: "Spain", cn: "西班牙"},
  {code: "ET", name: "Ethiopia", cn: "埃塞俄比亚"},
  {code: "FI", name: "Finland", cn: "芬兰"},
  {code: "FJ", name: "Fiji", cn: "斐济群岛"},
  {code: "FK", name: "Falkland Islands", cn: "马尔维纳斯群岛（福克兰）"},
  {code: "FM", name: "Federated States of Micronesia", cn: "密克罗尼西亚联邦"},
  {code: "FO", name: "Faroe Islands", cn: "法罗群岛"},
  {code: "FR", name: "France", cn: "法国 法国"},
  {code: "GA", name: "Gabon", cn: "加蓬"},
  {code: "GB", name: "Great Britain (United Kingdom; England)", cn: "英国"},
  {code: "GD", name: "Grenada", cn: "格林纳达"},
  {code: "GE", name: "Georgia", cn: "格鲁吉亚"},
  {code: "GF", name: "French Guiana", cn: "法属圭亚那"},
  {code: "GG", name: "Guernsey", cn: "根西岛"},
  {code: "GH", name: "Ghana", cn: "加纳"},
  {code: "GI", name: "Gibraltar", cn: "直布罗陀"},
  {code: "GL", name: "Greenland", cn: "格陵兰"},
  {code: "GM", name: "Gambia", cn: "冈比亚"},
  {code: "GN", name: "Guinea", cn: "几内亚"},
  {code: "GP", name: "Guadeloupe", cn: "瓜德罗普"},
  {code: "GQ", name: "Equatorial Guinea", cn: "赤道几内亚"},
  {code: "GR", name: "Greece", cn: "希腊"},
  {code: "GS", name: "South Georgia and the South Sandwich Islands", cn: "南乔治亚岛和南桑威奇群岛"},
  {code: "GT", name: "Guatemala", cn: "危地马拉"},
  {code: "GU", name: "Guam", cn: "关岛"},
  {code: "GW", name: "Guinea-Bissau", cn: "几内亚比绍"},
  {code: "GY", name: "Guyana", cn: "圭亚那"},
  {code: "HM", name: "Heard Island and McDonald Islands", cn: "赫德岛和麦克唐纳群岛"},
  {code: "HN", name: "Honduras", cn: "洪都拉斯"},
  {code: "HR", name: "Croatia", cn: "克罗地亚"},
  {code: "HT", name: "Haiti", cn: "海地"},
  {code: "HU", name: "Hungary", cn: "匈牙利"},
  {code: "ID", name: "Indonesia", cn: "印尼"},
  {code: "IE", name: "Ireland", cn: "爱尔兰"},
  {code: "IL", name: "Israel", cn: "以色列"},
  {code: "IM", name: "Isle of Man", cn: "马恩岛"},
  {code: "IN", name: "India", cn: "印度"},
  {code: "IO", name: "British Indian Ocean Territory", cn: "英属印度洋领地"},
  {code: "IQ", name: "Iraq", cn: "伊拉克"},
  {code: "IR", name: "Iran", cn: "伊朗"},
  {code: "IS", name: "Iceland", cn: "冰岛"},
  {code: "IT", name: "Italy", cn: "意大利"},
  {code: "JE", name: "Jersey", cn: "泽西岛"},
  {code: "JM", name: "Jamaica", cn: "牙买加"},
  {code: "JO", name: "Jordan", cn: "约旦"},
  {code: "JP", name: "Japan", cn: "日本"},
  {code: "KE", name: "Kenya", cn: "肯尼亚"},
  {code: "KG", name: "Kyrgyzstan", cn: "吉尔吉斯斯坦"},
  {code: "KH", name: "Cambodia", cn: "柬埔寨"},
  {code: "KI", name: "Kiribati", cn: "基里巴斯"},
  {code: "KM", name: "The Comoros", cn: "科摩罗"},
  {code: "KN", name: "St. Kitts & Nevis", cn: "圣基茨和尼维斯"},
  {code: "KP", name: "North Korea", cn: "朝鲜"},
  {code: "KR", name: "South Korea", cn: "韩国"},
  {code: "KW", name: "Kuwait", cn: "科威特"},
  {code: "KY", name: "Cayman Islands", cn: "开曼群岛"},
  {code: "KZ", name: "Kazakhstan", cn: "哈萨克斯坦"},
  {code: "LA", name: "Laos", cn: "老挝"},
  {code: "LB", name: "Lebanon", cn: "黎巴嫩"},
  {code: "LC", name: "St. Lucia", cn: "圣卢西亚"},
  {code: "LI", name: "Liechtenstein", cn: "列支敦士登"},
  {code: "LK", name: "Sri Lanka", cn: "斯里兰卡"},
  {code: "LR", name: "Liberia", cn: "利比里亚"},
  {code: "LS", name: "Lesotho", cn: "莱索托"},
  {code: "LT", name: "Lithuania", cn: "立陶宛"},
  {code: "LU", name: "Luxembourg", cn: "卢森堡"},
  {code: "LV", name: "Latvia", cn: "拉脱维亚"},
  {code: "LY", name: "Libya", cn: "利比亚"},
  {code: "MA", name: "Morocco", cn: "摩洛哥"},
  {code: "MC", name: "Monaco", cn: "摩纳哥"},
  {code: "MD", name: "Moldova", cn: "摩尔多瓦"},
  {code: "ME", name: "Montenegro", cn: "黑山"},
  {code: "MF", name: "Saint Martin (France)", cn: "法属圣马丁"},
  {code: "MG", name: "Madagascar", cn: "马达加斯加"},
  {code: "MH", name: "Marshall islands", cn: "马绍尔群岛"},
  {code: "MK", name: "Republic of Macedonia (FYROM)", cn: "马其顿"},
  {code: "ML", name: "Mali", cn: "马里"},
  {code: "MM", name: "Myanmar (Burma)", cn: "缅甸"},
  {code: "MN", name: "Mongolia", cn: "蒙古国"},
  {code: "MP", name: "Northern Mariana Islands", cn: "北马里亚纳群岛"},
  {code: "MQ", name: "Martinique", cn: "马提尼克"},
  {code: "MR", name: "Mauritania", cn: "毛里塔尼亚"},
  {code: "MS", name: "Montserrat", cn: "蒙塞拉特岛"},
  {code: "MT", name: "Malta", cn: "马耳他"},
  {code: "MU", name: "Mauritius", cn: "毛里求斯"},
  {code: "MV", name: "Maldives", cn: "马尔代夫"},
  {code: "MW", name: "Malawi", cn: "马拉维"},
  {code: "MX", name: "Mexico", cn: "墨西哥"},
  {code: "MY", name: "Malaysia", cn: "马来西亚"},
  {code: "MZ", name: "Mozambique", cn: "莫桑比克"},
  {code: "NA", name: "Namibia", cn: "纳米比亚"},
  {code: "NC", name: "New Caledonia", cn: "新喀里多尼亚"},
  {code: "NE", name: "Niger", cn: "尼日尔"},
  {code: "NF", name: "Norfolk Island", cn: "诺福克岛"},
  {code: "NG", name: "Nigeria", cn: "尼日利亚"},
  {code: "NI", name: "Nicaragua", cn: "尼加拉瓜"},
  {code: "NL", name: "Netherlands", cn: "荷兰"},
  {code: "NO", name: "Norway", cn: "挪威"},
  {code: "NP", name: "Nepal", cn: "尼泊尔"},
  {code: "NR", name: "Nauru", cn: "瑙鲁"},
  {code: "NU", name: "Niue", cn: "纽埃"},
  {code: "NZ", name: "New Zealand", cn: "新西兰"},
  {code: "OM", name: "Oman", cn: "阿曼"},
  {code: "PA", name: "Panama", cn: "巴拿马"},
  {code: "PE", name: "Peru", cn: "秘鲁"},
  {code: "PF", name: "French polynesia", cn: "法属波利尼西亚"},
  {code: "PG", name: "Papua New Guinea", cn: "巴布亚新几内亚"},
  {code: "PH", name: "The Philippines", cn: "菲律宾"},
  {code: "PK", name: "Pakistan", cn: "巴基斯坦"},
  {code: "PL", name: "Poland", cn: "波兰"},
  {code: "PM", name: "Saint-Pierre and Miquelon", cn: "圣皮埃尔和密克隆"},
  {code: "PN", name: "Pitcairn Islands", cn: "皮特凯恩群岛"},
  {code: "PR", name: "Puerto Rico", cn: "波多黎各"},
  {code: "PS", name: "Palestinian territories", cn: "巴勒斯坦"},
  {code: "PT", name: "Portugal", cn: "葡萄牙"},
  {code: "PW", name: "Palau", cn: "帕劳"},
  {code: "PY", name: "Paraguay", cn: "巴拉圭"},
  {code: "QA", name: "Qatar", cn: "卡塔尔"},
  {code: "RE", name: "Réunion", cn: "留尼汪"},
  {code: "RO", name: "Romania", cn: "罗马尼亚"},
  {code: "RS", name: "Serbia", cn: "塞尔维亚"},
  {code: "RU", name: "Russian Federation", cn: "俄罗斯"},
  {code: "RW", name: "Rwanda", cn: "卢旺达"},
  {code: "SA", name: "Saudi Arabia", cn: "沙特阿拉伯"},
  {code: "SB", name: "Solomon Islands", cn: "所罗门群岛"},
  {code: "SC", name: "Seychelles", cn: "塞舌尔"},
  {code: "SD", name: "Sudan", cn: "苏丹"},
  {code: "SE", name: "Sweden", cn: "瑞典"},
  {code: "SG", name: "Singapore", cn: "新加坡"},
  {code: "SH", name: "St. Helena & Dependencies", cn: "圣赫勒拿"},
  {code: "SI", name: "Slovenia", cn: "斯洛文尼亚"},
  {code: "SJ", name: "Svalbard and Jan Mayen", cn: "斯瓦尔巴群岛和扬马延岛"},
  {code: "SK", name: "Slovakia", cn: "斯洛伐克"},
  {code: "SL", name: "Sierra Leone", cn: "塞拉利昂"},
  {code: "SM", name: "San Marino", cn: "圣马力诺"},
  {code: "SN", name: "Senegal", cn: "塞内加尔"},
  {code: "SO", name: "Somalia", cn: "索马里"},
  {code: "SR", name: "Suriname", cn: "苏里南"},
  {code: "SS", name: "South Sudan", cn: "南苏丹"},
  {code: "ST", name: "Sao Tome & Principe", cn: "圣多美和普林西比"},
  {code: "SV", name: "El Salvador", cn: "萨尔瓦多"},
  {code: "SX", name: "Sint Maarten", cn: "荷属圣马丁"},
  {code: "SY", name: "Syria", cn: "叙利亚"},
  {code: "SZ", name: "Swaziland", cn: "斯威士兰"},
  {code: "TC", name: "Turks & Caicos Islands", cn: "特克斯和凯科斯群岛"},
  {code: "TD", name: "Chad", cn: "乍得"},
  {code: "TF", name: "French Southern Territories", cn: "法属南部领地"},
  {code: "TG", name: "Togo", cn: "多哥"},
  {code: "TH", name: "Thailand", cn: "泰国"},
  {code: "TJ", name: "Tajikistan", cn: "塔吉克斯坦"},
  {code: "TK", name: "Tokelau", cn: "托克劳"},
  {code: "TL", name: "Timor-Leste (East Timor)", cn: "东帝汶"},
  {code: "TM", name: "Turkmenistan", cn: "土库曼斯坦"},
  {code: "TN", name: "Tunisia", cn: "突尼斯"},
  {code: "TO", name: "Tonga", cn: "汤加"},
  {code: "TR", name: "Turkey", cn: "土耳其"},
  {code: "TT", name: "Trinidad & Tobago", cn: "特立尼达和多巴哥"},
  {code: "TV", name: "Tuvalu", cn: "图瓦卢"},
  {code: "TZ", name: "Tanzania", cn: "坦桑尼亚"},
  {code: "UA", name: "Ukraine", cn: "乌克兰"},
  {code: "UG", name: "Uganda", cn: "乌干达"},
  {code: "UM", name: "United States Minor Outlying Islands", cn: "美国本土外小岛屿"},
  {code: "UY", name: "Uruguay", cn: "乌拉圭"},
  {code: "UZ", name: "Uzbekistan", cn: "乌兹别克斯坦"},
  {code: "VA", name: "Vatican City (The Holy See)", cn: "梵蒂冈"},
  {code: "VC", name: "St. Vincent & the Grenadines", cn: "圣文森特和格林纳丁斯"},
  {code: "VE", name: "Venezuela", cn: "委内瑞拉"},
  {code: "VG", name: "British Virgin Islands", cn: "英属维尔京群岛"},
  {code: "VI", name: "United States Virgin Islands", cn: "美属维尔京群岛"},
  {code: "VN", name: "Vietnam", cn: "越南"},
  {code: "VU", name: "Vanuatu", cn: "瓦努阿图"},
  {code: "WF", name: "Wallis and Futuna", cn: "瓦利斯和富图纳"},
  {code: "WS", name: "Samoa", cn: "萨摩亚"},
  {code: "YE", name: "Yemen", cn: "也门"},
  {code: "YT", name: "Mayotte", cn: "马约特"},
  {code: "ZA", name: "South Africa", cn: "南非"},
  {code: "ZM", name: "Zambia", cn: "赞比亚"},
  {code: "ZW", name: "Zimbabwe", cn: "津巴布韦"}
];