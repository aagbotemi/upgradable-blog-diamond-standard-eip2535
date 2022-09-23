// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct BlogAppStorage {
    address blogOwner;
    string title;
    string description;
    string imageURI;
    uint createdTime;
    uint updatedTime;
}


struct AppStorage {
    uint ID;
    mapping(uint => BlogAppStorage) singleBlog;
    mapping(address => BlogAppStorage[]) personalBlog;
    BlogAppStorage[] allBlogs;
}