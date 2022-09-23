/* global ethers */
/* eslint prefer-const: "off" */

import { ContractReceipt, Transaction } from "ethers";
import { TransactionDescription, TransactionTypes } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { DiamondCutFacet } from "../typechain-types";
import { getSelectors, FacetCutAction } from "./libraries/diamond";

export async function interactionDiamond2() {
  const diamondInit = await ethers.getContractAt("DiamondInit", "0x666e48245c2da8f455D71eb55ea6a7e11F1f02E4");

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const cut = [];
  const Facet = await ethers.getContractFactory("BlogFacet2");
  const facet = await Facet.deploy();
  await facet.deployed();
  console.log(`BlogFacet2 deployed: ${facet.address}`);
  cut.push({
    facetAddress: facet.address,
    action: FacetCutAction.Add,
    functionSelectors: getSelectors(facet),
  });

  // upgrade diamond with facets
  console.log("");
  console.log("Diamond Cut:", cut);
  const diamondCut = (await ethers.getContractAt(
    "IDiamondCut",
    "0x36d0E19b49a507d0913aF6CD6d586Bb1A5A33459"
  )) as DiamondCutFacet;
  let tx;
  let receipt: ContractReceipt;
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData("init");
  tx = await diamondCut.diamondCut(cut, "0x666e48245c2da8f455D71eb55ea6a7e11F1f02E4", functionCall);
  console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Completed diamond cut");
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  interactionDiamond2()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.interactionDiamond2 = interactionDiamond2;
