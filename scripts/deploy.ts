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

  ////// ADDRESS GOTTEN FROM DEPLOYMENT
  // DiamondCutFacet deployed: 0x2b9732824FB79C1a50676cd6BeAe9aCDFC37966D
  // Diamond deployed: 0xcFa9D7AC279ea6F8c33A8b55158Ad5F73DF5f1d1
  // DiamondInit deployed: 0x7bbC30BA8ACFaEb0ba84a380157B4856b7e1D121

  // Deploying facets
  // DiamondLoupeFacet deployed: 0xAc536c874DDf2EF1A9D992df5Fc81B7cAa624D75
  // OwnershipFacet deployed: 0x22CEe9E82BE98300CA3fC966716004DCD23bbfA2
  // BlogFacet deployed: 0x433d5EcDf809ee33f1d512a0e109aBF75a6DaC5F

  // Diamond cut tx:  0x48cfc7ae84d8c90bd112ff8bcb310a3c2b5a93ab2d06542c3db6f03ba45d2286

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
  // console.log("Return all Blog 1: ", ReturnSingleBlog1);
  
  // const ReturnSingleBlog2 = await blog.returnSingleBlog(1);
  // console.log("Return all Blog 2: ", ReturnSingleBlog2);
  
  // const ReturnSingleBlog3 = await blog.returnSingleBlog(2);
  // console.log("Return all Blog 3: ", ReturnSingleBlog3);
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
