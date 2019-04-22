pragma solidity ^0.5.0;

import "./Migrations.sol";
import "./Core.sol";

contract DM_Store is Migrations{
    event changeStatus(address _from, bool status);
    uint16 public idS = 1;
    Core core = new Core();

    struct DI_Store_Info {
        uint8 status;
        uint16 idStore;
        bytes32 name;
        bytes32 location;
        bytes32 password;
        bytes32 createdDate;
    }

    struct DI_Store_Product {
        address addressStore;
        uint16 idProduct;
        uint8 status;
        bytes32 dateSell;
    }

    mapping(address => uint16[]) addressToProducts;
    mapping(uint16 => DI_Store_Product) idToProducts;
    mapping(address => DI_Store_Info) addressToStores;
    mapping (uint16  => address) idToAddressStore;



    function addStore(string memory name, string memory location, string memory password, string memory createdDate) public {
        if(addressToStores[msg.sender].idStore != 0) return;
        addressToStores[msg.sender] = DI_Store_Info(0, idS, core.stringToBytes32(name), core.stringToBytes32(location), keccak256(abi.encodePacked(password)), core.stringToBytes32(createdDate));
        idToAddressStore[idS] = msg.sender;
        idS++;
    }

    function updateStore(address storeAddress, string memory name, string memory location) public {
        addressToStores[storeAddress].name = core.stringToBytes32(name);
        addressToStores[storeAddress].location = core.stringToBytes32(location);

    }

    function addProductToStore(uint16 idProduct) public {
        idToProducts[idProduct] = DI_Store_Product(msg.sender, idProduct, 0, 0);
        addressToProducts[msg.sender].push(idProduct);
    }

    function getInfoStore(address storeAddress) public view returns (string memory, string memory, string memory) {
        DI_Store_Info memory store = addressToStores[storeAddress];
        return (core.bytes32ToString(store.name), core.bytes32ToString(store.location), core.bytes32ToString(store.createdDate));
    }

    function getInfoProduct(uint16 idProduct) public view returns (uint8, string memory) {
        DI_Store_Product memory product = idToProducts[idProduct];

        return (product.status, core.bytes32ToString(product.dateSell));
    }

    function getListProduct() public view returns (uint16[] memory) {
        return addressToProducts[msg.sender];
    }

    function sellProduct(uint8 idProduct, string memory dateSell) public {
        // Update Product
        idToProducts[idProduct].status = 1;
        idToProducts[idProduct].dateSell = core.stringToBytes32(dateSell);
    }

    function changeStatusStore(address _addressStore, uint8 _status) public restricted{
        if(addressToStores[_addressStore].idStore != 0){
            addressToStores[_addressStore].status = _status;
            emit changeStatus(_addressStore, true);
        }
    }

    function getInfoStoreById(uint16 _idS) public view returns (
        uint8,   //status
        uint16,  //idStore
        bytes32, //name
        bytes32, //location
        address  //addressStore
    ){
        DI_Store_Info memory store = addressToStores[idToAddressStore[_idS]];
        return (store.status, store.idStore, store.name, store.location, idToAddressStore[_idS]);
    }

    function loginStore(address _addressStore, string memory _password) public view returns(
        uint,               // idStore
        uint8               // status
    ){
        DI_Store_Info memory store = addressToStores[_addressStore];
        if(store.password == keccak256(abi.encodePacked(_password))){
            return (store.idStore, store.status);
        }
    }
}
