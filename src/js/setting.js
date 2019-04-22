for(var i = 0; i < 4; i++){
    $('li[data-position="'+i+'"]').hide();
}
var authenticated = window.localStorage.getItem('authenticated');

if(authenticated != null){
    var user = JSON.parse(authenticated);
    $('li[data-position="'+user.position+'"]').show();
    switch (user.position) {
        case 0:
            $('li[data-position="0"]').show();
            $('[data-home="loged"] a').attr('href', 'master_page.html?page=manager')
            break;
        case 1:
            $('li[data-position="1"]').show();
            $('[data-home="loged"] a').attr('href', 'master_page.html?page=farm')
            break;
        case 2:
            $('li[data-position="2"]').show();
            $('[data-home="loged"] a').attr('href', 'master_page.html?page=factory')
            break;
        case 3:
            $('li[data-position="3"]').show();
            $('[data-home="loged"] a').attr('href', 'master_page.html?page=store')
            break;
    }
    $('[data-home="login"]').hide();
    $('[data-home="register"]').hide();
    $('[data-home="loged"]').show();
}else{
    $('[data-home="login"]').show();
    $('[data-home="register"]').show();
    $('[data-home="loged"]').hide();
}

App = {
    web3Provider: null,
    contracts: {},
    account: '',
    init: async function() {
        return await App.initWeb3();
    },

    initWeb3: async function() {
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dApp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);

        return App.initContract();
    },

    initContract: function() {
        $.getJSON('DM_Factory.json', function(data) {
            var RegiterDM = data;
            App.contracts.DM_Factory = TruffleContract(RegiterDM);
            App.contracts.DM_Factory.setProvider(App.web3Provider);
            return App.bindEvents();
        });
    },

    bindEvents: function() {
        App.onLoadPage();
    },

    onLoadPage: function() {
        setInterval(function() {
	        web3.eth.getAccounts(function(error, accounts) {
	            if (error) {
	                console.log(error);
	            }
	            var account = accounts[0];
	            var authenticated = window.localStorage.getItem('authenticated');
	            if(authenticated != null){
	                user = JSON.parse(authenticated);
	                if(user.account != account){
	                    App.logout();
	                }
	            }
	        });
        }, 1000);
    },
    logout: function() {
            window.localStorage.clear();
            location.replace("/");
    },

    getTimeStamp: function(str_date) {
        var date = (new Date(str_date).getTime()/1000);
        return date;
    },

    formatTimeStampToDate: function (timestamp) {
        var date = new Date(timestamp*1000);
        return (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
    },
    utf8Decode: function (utf8String) {
        if (typeof utf8String != 'string') throw new TypeError('parameter ‘utf8String’ is not a string');
        // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
        const unicodeString = utf8String.replace(
            /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
            function(c) {  // (note parentheses for precedence)
                var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f);
                return String.fromCharCode(cc); }
        ).replace(
            /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
            function(c) {  // (note parentheses for precedence)
                var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
                return String.fromCharCode(cc); }
        );
        return unicodeString;
    }
};

$(document).ready(function () {
    App.init();
});
