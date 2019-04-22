pragma solidity >=0.4.22 <0.6.0;
contract Core {
    function stringToBytes16(string memory source) public pure returns (bytes16 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 16))
        }
    }

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    function sumBytes32(bytes32 x, bytes32 y) public pure returns (bytes memory){
        bytes memory bytesSum = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesSum[charCount] = char;
                charCount++;
            }
        }
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(y) * 2 ** (8 * j)));
            if (char != 0) {
                bytesSum[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesSum[j];
        }
        return bytesStringTrimmed;
    }

    function bytes32ToString(bytes32 x) public pure returns (string memory){
        bytes memory bytesSum = new bytes(32);
        uint charCount = 0;
        for (uint j = 0; j < 32; j++) {
            byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
            if (char != 0) {
                bytesSum[charCount] = char;
                charCount++;
            }
        }
        bytes memory bytesStringTrimmed = new bytes(charCount);
        for (uint j = 0; j < charCount; j++) {
            bytesStringTrimmed[j] = bytesSum[j];
        }
        return string(bytesStringTrimmed);
    }
}