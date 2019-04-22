pragma solidity >=0.4.22 <0.6.0;
import "./Migrations.sol";
import "./Core.sol";

contract DM_Factory is Migrations{
    uint16 idF = 1;
    uint16 idP = 1;
    Core core = new Core();
    event changeStatus(address _from, bool status);

    struct Factory {
        uint8 status;
        uint16 idFactory;
        bytes32 name;
        bytes32 location;
        bytes32 password;
    }

    struct Product {
        uint16 quantity;
        uint16 idMilk;
        uint16 idProduct;
        uint16 idType;
        address addressFactory;
        bytes ingredients;  // Thành phần bổ sung
        bytes32 dateCreat;  // Ngày sản xuất
        bytes32 dateEnd;    // Ngày hết hạng
    }

    mapping (address => Factory) addressToFactory;
    mapping (uint16  => address) idToAddressFactory;
    mapping (uint16  => Product) public idProductToInfo;
    mapping (address => uint16[]) addressTolistIdProduct; // addressFactoryTolistIdProduct
    address[] public listIdFactoryActive;

    function getListFactory() public view returns(address [] memory){
        return listIdFactoryActive;
    }

    modifier onlyFactory() {
        require(isFactory());
        _;
    }

    function isFactory() private view returns(bool){
        if(addressToFactory[msg.sender].idFactory != 0 && addressToFactory[msg.sender].status == 1){
            return true;
        }
        return false;
    }

    function addFactory(
        string memory _name,
        string memory _location,
        string memory _password
    ) public {
        if(addressToFactory[msg.sender].idFactory != 0) return;
        addressToFactory[msg.sender] = Factory(0, idF, core.stringToBytes32(_name), core.stringToBytes32(_location), keccak256(abi.encodePacked(_password)));
        idToAddressFactory[idF] = msg.sender;
        listIdFactoryActive.push(msg.sender);
        idF++;
    }

    function changeStatusFactory(address _addressFactory, uint8 _status) public restricted{
        if(addressToFactory[_addressFactory].idFactory != 0){
            addressToFactory[_addressFactory].status = _status;
            emit changeStatus(_addressFactory, true);
        }
    }

    function getProductInfoFactory(uint16 _idProduct) public view returns(
        uint8,          // status
        uint16,         // quantity;
        uint16,         // idMilk
        uint16,         // idFactory
        uint16,         // idType
        bytes32,        // name
        bytes32,        // location
        bytes32,        // dateCreate
        bytes32,        // dateEnd
        string memory,  // ingredients
        address         // adrFactory
    ){
        Product memory pro = idProductToInfo[_idProduct];
        Factory memory fac = addressToFactory[pro.addressFactory];
        return (fac.status, pro.quantity, pro.idMilk, fac.idFactory, pro.idType, fac.name, fac.location, pro.dateCreat, pro.dateEnd,  string(pro.ingredients), pro.addressFactory);
    }

    function getFactoryLength() public view returns (uint16){
        return idF;
    }

    function getFactoryInfoById(uint16 _idF) public view returns (
        uint8,   //status
        uint16,  //idFactory
        bytes32, //name
        bytes32, //location
        address  //addressFactory
    ){
        Factory memory fac = addressToFactory[idToAddressFactory[_idF]];
        return (fac.status, fac.idFactory, fac.name, fac.location, idToAddressFactory[_idF]);
    }

    function getFactoryInfoByAddress(address _address) public view returns (
        uint8,   //status
        uint16,  //idFactory
        bytes32, //name
        bytes32, //location
        address  //addressFactory
    ){
        Factory memory fac = addressToFactory[_address];
        return (fac.status, fac.idFactory, fac.name, fac.location, _address);
    }

    function loginFactory(address _addressFactory, string memory _password) public view returns(
        uint,               // idFactory
        uint8               // status
    ){
        Factory memory factory = addressToFactory[_addressFactory];
        if(factory.password == keccak256(abi.encodePacked(_password))){
            return (factory.idFactory, factory.status);
        }
    }

    function addProduct
        (
            uint16 _idMilk,
            uint16 _idType,
            string memory _ingredients,
            uint16 _quantity,
            string memory _dateCreate,
            string memory _dateEnd
        )
        public onlyFactory{
        Product memory pro = Product(
            _quantity,
            _idMilk,
            idP,
            _idType,
            msg.sender,
            bytes(_ingredients),
            core.stringToBytes32(_dateCreate),
            core.stringToBytes32(_dateEnd)
        );
        idProductToInfo[idP] = pro;
        addressTolistIdProduct[msg.sender].push(idP);
        idP++;
    }

    function getListProduct() public view returns(uint16[] memory){
        return addressTolistIdProduct[msg.sender];
    }
}