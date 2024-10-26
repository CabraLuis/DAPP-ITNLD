// SPDX-License-Identifier: MIT 
pragma solidity >= 0.8.0 < 0.9.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract NFTClass is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIDs;
    using Strings for uint256;
    mapping (uint256 => string) private _tokenURIs;

    constructor()ERC721("NFTYourMom", "NFTYourMom"){}
    string private _baseURIExtended;
    function setBaseURI(string memory baseURI) external onlyOwner(){
        _baseURIExtended = baseURI;
    }

    function _setTokenURI(uint256 tokenID, string memory _tokenURI) internal virtual{
        require(_exists(tokenID), "ERC721Meta: URI set of nonexistent token");
        _tokenURIs[tokenID] = _tokenURI;
    }

    function tokenURI(uint256 tokenID) public view virtual override returns(string memory){
        require(_exists(tokenID), "ERC721Meta: URI set of nonexistent token");
        string memory _tokenURI = _tokenURIs[tokenID];
        string memory base = _baseURI();

        if(bytes(base).length == 0){
            return _tokenURI;
        }

        if(bytes(_tokenURI).length > 0){
            return string(abi.encodePacked(base, _tokenURI));
        }

        return string(abi.encodePacked(base, tokenID.toString()));
    }

    function mintNFT(address recipient, string memory _tokenURI) public onlyOwner returns(uint256){
        _tokenIDs.increment();
        uint256 newItemID = _tokenIDs.current();
        _mint(recipient, newItemID);
        _setTokenURI(newItemID, _tokenURI);
        return newItemID;
    }


} 