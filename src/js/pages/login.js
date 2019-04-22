
Login = {
    web3Provider: null,
    contracts: {},
    account: '',
    init: async function() {
        return await Login.initWeb3();
    },

    initWeb3: async function() {
        if (window.ethereum) {
            Login.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dLogin browsers...
        else if (window.web3) {
            Login.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            Login.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(Login.web3Provider);

        return Login.initContract();
    },

    initContract: function() {
        $.getJSON('DM_Factory.json', function(data) {
            var RegiterDMFactory = data;
            Login.contracts.DM_Factory = TruffleContract(RegiterDMFactory);
            Login.contracts.DM_Factory.setProvider(Login.web3Provider);
        });
        $.getJSON('DM_Farm.json', function(data) {
            var RegiterDMFarm = data;
            Login.contracts.DM_Farm = TruffleContract(RegiterDMFarm);
            Login.contracts.DM_Farm.setProvider(Login.web3Provider);
        });
        $.getJSON('DM_Store.json', function(data) {
            var RegiterDMStore = data;
            Login.contracts.DM_Store = TruffleContract(RegiterDMStore);
            Login.contracts.DM_Store.setProvider(Login.web3Provider);
            return Login.bindEvents();
        });
    },

    bindEvents: function() {
        Login.onLoadPage();
        $(document).on('click', '#btn-login', Login.handleAdopt);
    },

    onLoadPage: function() {
        web3.eth.getAccounts(function(error, accounts) {
            if (error) {
                console.log(error);
            }
            var account = accounts[0];
            $('#log-address').val(account);
            Login.account = account;

            Login.contracts.DM_Factory.deployed().then(function(instance) {
                migrationsInstance = instance;
                return migrationsInstance.owner();
            }).then(function(result) {
                if(result == account){
                    var uer = {
                        position: 0,
                        account: Login.account
                    };
                    window.localStorage.setItem('authenticated', JSON.stringify(uer));
                    location.replace("master_page.html?page=manager");
                }
            }).catch(function(err) {
                console.log(err.message);
            });
        });
    },
    handleAdopt: function(event) {
        event.preventDefault();
        if(
            $('#log-address').val() == '' ||
            $('#log-password').val() == ''
        ){
            alert('Cần nhập dữ liệu đăng nhập!');
        }else{
            var objLogin = {
                address:      $('#log-address').val(),
                password:     $('#log-password').val()
            };
            Login.checkLoginFarm(objLogin);
        }
    },
    checkLoginFarm: function(objLogin) {
        Login.contracts.DM_Farm.deployed().then(function(instance) {
            farmInstance = instance;
            return farmInstance.loginFarm(objLogin.address, objLogin.password, {from: Login.account});
        }).then(function(result) {
            if(result[0].c[0] == 0){
                Login.checkLoginFactory(objLogin);
            }else if(result[1].c[0] == 0){
                alert('Tài khoản của bạn chưa được active!');
            }else if(result[1].c[0] == 2){
                alert('Tài khoản của bạn đã bị cấm hoạt động!');
            }else{
                var uer = {
                    position: 1,
                    account: Login.account
                };
                window.localStorage.setItem('authenticated', JSON.stringify(uer));
                location.replace("master_page.html?page=farm");
            }
        }).catch(function(err) {
            console.log(err.message);
        });
    },
    checkLoginFactory: function(objLogin) {
        Login.contracts.DM_Factory.deployed().then(function(instance) {
            factoryInstance = instance;
            return factoryInstance.loginFactory(objLogin.address, objLogin.password, {from: Login.account});
        }).then(function(result) {
            if(result[0].c[0] == 0){
                Login.checkLoginStore(objLogin);
            }else if(result[1].c[0] == 0){
                alert('Tài khoản của bạn chưa được active!');
            }else if(result[1].c[0] == 2){
                alert('Tài khoản của bạn đã bị cấm hoạt động!');
            }else{
                var uer = {
                    position: 2,
                    account: Login.account
                };
                window.localStorage.setItem('authenticated', JSON.stringify(uer));
                location.replace("master_page.html?page=factory");
            }
        }).catch(function(err) {
            console.log(err.message);
        });
    },

    checkLoginStore: function(objLogin) {
        Login.contracts.DM_Store.deployed().then(function(instance) {
            factoryInstance = instance;
            return factoryInstance.loginStore(objLogin.address, objLogin.password, {from: Login.account});
        }).then(function(result) {
            if(result[0].c[0] == 0){
                alert('Address hoặc mật khẩu không tồn tại!');
            }else if(result[1].c[0] == 0){
                alert('Tài khoản của bạn chưa được active!');
            }else if(result[1].c[0] == 2){
                alert('Tài khoản của bạn đã bị cấm hoạt động!');
            }else{
                var uer = {
                    position: 3,
                    account: Login.account
                };
                window.localStorage.setItem('authenticated', JSON.stringify(uer));
                location.replace("master_page.html?page=store");
            }
        }).catch(function(err) {
            console.log(err.message);
        });
    },
};

$(document).ready(function () {
    Login.init();
});
