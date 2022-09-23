// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../libraries/BlogAppStorage.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";

contract BlogFacet2 {
    AppStorage internal b;

    function updateBlog(uint256 _id, string memory _title, string memory _description, string memory _imageURI) external {
        
        address _owner = msg.sender;
        require(_owner != address(0), "Address(0) cannot edit blog!");

        /// @notice add all element into array
        BlogAppStorage storage ub = b.allBlogs[_id];
        ub.title = _title;
        ub.description = _description;
        ub.imageURI = _imageURI;
        ub.createdTime = ub.createdTime;
        ub.updatedTime = block.timestamp;

        /// @notice to blog to mapping so that, it will return
        BlogAppStorage storage blogger = b.singleBlog[_id];
        // blogger.blogOwner = _owner;
        blogger.title = _title;
        blogger.description = _description;
        blogger.imageURI = _imageURI;
        blogger.createdTime = blogger.createdTime;
        blogger.updatedTime = block.timestamp;


        /// @notice to blog to mapping so that, it will return
        BlogAppStorage storage ubb = b.personalBlog[_owner][_id];
        ubb.title = _title;
        ubb.description = _description;
        ubb.imageURI = _imageURI;
        ubb.createdTime = blogger.createdTime;
        ubb.updatedTime = block.timestamp;
    }


    function deleteBlog(uint256 _id) external {

        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();

        address _cOwner = ds.contractOwner;

        address _owner = msg.sender;

        BlogAppStorage storage blogger = b.singleBlog[_id];

        require(_owner != address(0) || _cOwner == _owner || blogger.blogOwner == _owner, "Permission to delete blog denied!");

        /// @notice to blog to mapping so that, it will return
        delete b.singleBlog[_id];

        /// @notice add all element into array
        delete b.allBlogs[_id];

        /// @notice to blog to mapping so that, it will return
        delete b.personalBlog[_owner][_id];
    }
}


// DiamondCutFacet deployed: 0x5FbDB2315678afecb367f032d93F642f64180aa3
// Diamond deployed: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
// DiamondInit deployed: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

// Deploying facets
// DiamondLoupeFacet deployed: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
// OwnershipFacet deployed: 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
// BlogFacet deployed: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
