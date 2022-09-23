/* global ethers */
/* eslint prefer-const: "off" */

import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types";
import { getSelectors, FacetCutAction } from "./libraries/diamond";

export let DiamondAddress: string;
export let cAddress: any;

export async function deployDiamond() {
  const accounts = await ethers.getSigners();
  const contractOwner = accounts[0];
  const address1 = accounts[1];
  const address2 = accounts[2];

  // deploy DiamondCutFacet
  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.deployed();
  console.log("DiamondCutFacet deployed:", diamondCutFacet.address);

  // deploy Diamond
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(
    contractOwner.address,
    diamondCutFacet.address
  );
  await diamond.deployed();
  console.log("Diamond deployed:", diamond.address);

  // deploy DiamondInit
  // DiamondInit provides a function that is called when the diamond is upgraded to initialize state variables
  // Read about how the diamondCut function works here: https://eips.ethereum.org/EIPS/eip-2535#addingreplacingremoving-functions
  const DiamondInit = await ethers.getContractFactory("DiamondInit");
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.deployed();
  console.log("DiamondInit deployed:", diamondInit.address);

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const FacetNames = ["DiamondLoupeFacet", "OwnershipFacet", "BlogFacet"];
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.deployed();
    console.log(`${FacetName} deployed: ${facet.address}`);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
  }

  // upgrade diamond with facets
  console.log("");
  console.log("Diamond Cut:", cut);
  const diamondCut = (await ethers.getContractAt(
    "IDiamondCut",
    diamond.address
  )) as DiamondCutFacet;
  let tx;
  let receipt: ContractReceipt;
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData("init");
  tx = await diamondCut.diamondCut(cut, diamondInit.address, functionCall);
  console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Completed diamond cut");
  DiamondAddress = diamond.address;
  

  // ADDRESS GOTTEN FROM DEPLOYMENT
  // DiamondCutFacet deployed: 0x8D49792b6EFa3e1719ca83073256eD93dE020c2F
  // Diamond deployed: 0x36d0E19b49a507d0913aF6CD6d586Bb1A5A33459
  // DiamondInit deployed: 0x666e48245c2da8f455D71eb55ea6a7e11F1f02E4

  // Deploying facets
  // DiamondLoupeFacet deployed: 0x7d42360Fd018ca14326cBcD4606511F2C6094A46
  // OwnershipFacet deployed: 0x517148AE76f517ca8DC66d7E6285272516928588
  // BlogFacet deployed: 0x67557C1BE2E56833Ba596F904e533953811D8c63
  
  // Diamond cut tx:  0x4ce595ee7a6e7fbab0c63eeba86b5a5be1f122d4fa208b2c49737b207315f24d




  // BlogFacet2: 0xbbd412Ed9D87AE726D5d54bDE63e699EEb2D2F96
  // Diamond cut tx updated: 0x065f2db9cb34312b8399d86d8aa07fb373ea5cd47879e8871dfe11be1eaa4c51





  // creating three blogs
  // const Blog = await ethers.getContractFactory("BlogFacet");
  // const blog = await Blog.attach(diamond.address);

  // const createBlog1 = await blog.writeBlog("Shade", "This is shade's time", "IMAGE_URI");
  // const createBlogg1 = await createBlog1.wait();
  // console.log("This is the result 1: ", createBlogg1);

  // const createBlog2 = await blog.connect(address1).writeBlog("Tunde", "This is Tunde's time", "IMAGE_URI1");
  // const createBlogg2 = await createBlog2.wait();
  // console.log("This is the result 2: ", createBlogg2);

  // const createBlog3 = await blog.connect(address2).writeBlog("Clinton", "This is Clinton's time", "IMAGE_URI2");
  // const createBlogg3 = await createBlog3.wait();
  // console.log("This is the result 3: ", createBlogg3);
  
  // const ReturnAllBlog = await blog.returnAllBlog();
  // console.log("Return all Blog: ", ReturnAllBlog);
  
  // const allPersonalBlog1 = await blog.allPersonalBlog(contractOwner.address);
  // console.log("Return all Blog 1: ", allPersonalBlog1);
  
  // const allPersonalBlog2 = await blog.allPersonalBlog(address1.address);
  // console.log("Return all Blog 2: ", allPersonalBlog2);
  
  // const allPersonalBlog3 = await blog.allPersonalBlog(address2.address);
  // console.log("Return all Blog 3: ", allPersonalBlog3);

  // const ReturnSingleBlog1 = await blog.returnSingleBlog(0);
  // console.log("Return Single Blog 1: ", ReturnSingleBlog1);
  
  // const ReturnSingleBlog2 = await blog.returnSingleBlog(1);
  // console.log("Return Single Blog 2: ", ReturnSingleBlog2);
  
  // const ReturnSingleBlog3 = await blog.returnSingleBlog(2);
  // console.log("Return Single Blog 3: ", ReturnSingleBlog3);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployDiamond = deployDiamond;
