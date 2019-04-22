Register = {
    web3Provider: null,
    contracts: {},
    timestamp_now: Math.round(+new Date()/1000),
    init: async function() {
        return await Register.initWeb3();
    },

    initWeb3: async function() {
        if (window.ethereum) {
            Register.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dRegister browsers...
        else if (window.web3) {
            Register.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            Register.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(Register.web3Provider);

        return Register.initContract();
    },

    initContract: function() {
        $.getJSON('DM_Factory.json', function(data) {
            var RegiterDMFactory = data;
            Register.contracts.DM_Factory = TruffleContract(RegiterDMFactory);
            Register.contracts.DM_Factory.setProvider(Register.web3Provider);
        });
        $.getJSON('DM_Farm.json', function(data) {
            var RegiterDMFarm = data;
            Register.contracts.DM_Farm = TruffleContract(RegiterDMFarm);
            Register.contracts.DM_Farm.setProvider(Register.web3Provider);
        });
        $.getJSON('DM_Store.json', function(data) {
            var RegiterDMStore = data;
            Register.contracts.DM_Store = TruffleContract(RegiterDMStore);
            Register.contracts.DM_Store.setProvider(Register.web3Provider);
        });

        return Register.bindEvents();
    },

    bindEvents: function() {
        $(document).on('click', '#btn-register', Register.handleAdopt);
    },

    handleAdopt: function(event) {
        event.preventDefault();
        if($('#reg-password').val() != $('#reg-second-password').val()){
            alert('Nhập lại mật khẩu không đúng!');
        }else{
            var objPosition = {
                name:         $('#reg-name').val(),
                location:     $('#reg-location').val(),
                password:     $('#reg-password').val(),
            };
            var flag = true;
            if(objPosition.name == ""){
                alert('Cần nhập tên!');
                flag = false;
            }else if(objPosition.location == ""){
                alert('Cần nhập địa chỉ!');
                flag = false;
            }else if(objPosition.password == ""){
                alert('Cần nhập password!');
                flag = false;
            }else if(objPosition.password != $('#reg-second-password').val()){
                alert('Nhập lại mật khẩu không đúng!');
                flag = false;
            }else if(!$('#reg-agree').is(":checked")){
                alert('Cần đồng ý vỡi những điều khoản!');
                flag = false;
            }

            if(!flag){
                return;
            }

            var position = $('#reg-position').val();
            // Farm
            if(position == 1){
                web3.eth.getAccounts(function(error, accounts) {
                    if (error) {
                        console.log(error);
                    }
                    var account = accounts[0];

                    Register.contracts.DM_Farm.deployed().then(function(instance) {
                        adoptionFarmInstance = instance;
                        return adoptionFarmInstance.getFarm(account, {from: account});
                    }).then(function(result) {
                        if(result[0].c[0]){
                            alert('Address đã được đăng ký!');
                        }else{
                            Register.contracts.DM_Farm.deployed().then(function(instance) {
                                adoptionFarmInstance = instance;
                                return adoptionFarmInstance.addFarm(objPosition.name, objPosition.location, objPosition.password, {from: account});
                            }).then(function(result) {
                                if(["0x01", "0x1"].indexOf(result.receipt.status) > -1){
                                    $('#form-register').hide();
                                    $('#form-msg-success').show();
                                }else{
                                    alert('Đăng ký không thành công!');
                                }
                            }).catch(function(err) {
                                console.log(err.message);
                            });
                        }
                    }).catch(function(err) {
                        console.log(err.message);
                    });

                });
            }
            // Factory
            else if(position == 2){
                web3.eth.getAccounts(function(error, accounts) {
                    if (error) {
                        console.log(error);
                    }
                    var account = accounts[0];

                    Register.contracts.DM_Factory.deployed().then(function(instance) {
                        adoptionFactoryInstance = instance;
                        return adoptionFactoryInstance.getFactoryInfoByAddress(account, {from: account});
                    }).then(function(result) {
                        if(result[1].c[0]){
                            alert('Address đã được đăng ký!');
                        }else{
                            Register.contracts.DM_Factory.deployed().then(function(instance) {
                                adoptionInstance = instance;
                                return adoptionInstance.addFactory(objPosition.name, objPosition.location, objPosition.password, {from: account});
                            }).then(function(result) {
                                if(["0x01", "0x1"].indexOf(result.receipt.status) > -1){
                                    $('#form-register').hide();
                                    $('#form-msg-success').show();
                                }else{
                                    alert('Đăng ký không thành công!');
                                }
                            }).catch(function(err) {
                                console.log(err.message);
                            });
                        }
                    }).catch(function(err) {
                        alert(err.message);
                    });
                });
            }
            // Store
            else{
                web3.eth.getAccounts(function(error, accounts) {
                    if (error) {
                        console.log(error);
                    }
                    var account = accounts[0];

                    Register.contracts.DM_Store.deployed().then(function(instance) {
                        adoptionStoreInstance = instance;
                        return adoptionStoreInstance.getInfoStore(account, {from: account});
                    }).then(function(result) {
                        if(result[0] != ""){
                            alert('Address đã được đăng ký!');
                        }else{
                            Register.contracts.DM_Store.deployed().then(function(instance) {
                                storeInstance = instance;
                                return storeInstance.addStore(objPosition.name, objPosition.location, objPosition.password, Register.timestamp_now.toString(), {from: account});
                            }).then(function(result) {
                                if(["0x01", "0x1"].indexOf(result.receipt.status) > -1){
                                    $('#form-register').hide();
                                    $('#form-msg-success').show();
                                }else{
                                    alert('Đăng ký không thành công!');
                                }
                            }).catch(function(err) {
                                console.log(err.message);
                            });
                        }
                    }).catch(function(err) {
                        console.log(err.message);
                    });
                });
            }
        }
    }
};

$(function() {
    $(window).load(function() {
        Register.init();
    });
});
