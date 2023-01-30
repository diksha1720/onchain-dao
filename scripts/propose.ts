import { ethers, network } from "hardhat";
import { VOTING_DELAY } from "../helper-hardhat-config";
import * as fs from "fs"

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
    const governor = await ethers.getContractAt("BoxGovernor", '0xbD9f3507E6f350CCda7B6b325589352c2c64c64b')
    const BoxNft = await ethers.getContractAt("Box", '0x43Bf92b9631663dCBe0E4B110D17047B0894b3Ce')

    const encodedFunctionCall = BoxNft.interface.encodeFunctionData(
        functionToCall,
        args
    )
    console.log(`Proposing ${functionToCall} on ${BoxNft.address} with ${args}`)
    console.log(`Proposal Description:\n  ${proposalDescription}`)

    const proposeTx = await governor.propose([BoxNft.address], [0], [encodedFunctionCall], proposalDescription)

    // remove this for non-local networks
    // let amount = VOTING_DELAY + 1
    // console.log("Moving blocks...")
    // for (let index = 0; index < amount; index++) {
    //     await network.provider.request({
    //         method: "evm_mine",
    //         params: [],
    //     })
    // }
    // console.log(`Moved ${amount} blocks`)

    const proposeReceipt = await proposeTx.wait(1)
    const proposalId = proposeReceipt.events[0].args.proposalId
    console.log(`Proposed with proposal ID:\n  ${proposalId}`)

    const proposalState = await governor.state(proposalId)
    const proposalSnapShot = await governor.proposalSnapshot(proposalId)
    const proposalDeadline = await governor.proposalDeadline(proposalId)

    storeProposalId(proposalId);

    console.log(`Current Proposal State: ${proposalState}`)
    // What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`)
    // The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`)
}

function storeProposalId(proposalId: any) {
    const chainId = network.config.chainId!.toString();
    let proposals: any;

    if (fs.existsSync('proposals.json')) {
        proposals = JSON.parse(fs.readFileSync('proposals.json', "utf8"));
    } else {
        proposals = {};
        proposals[chainId] = [];
    }
    proposals[chainId].push(proposalId.toString());
    fs.writeFileSync('proposals.json', JSON.stringify(proposals), "utf8");
}

// propose([3600, 60, "Planet8"], "createPlanet", "I request the community to let me create 60x60 planet named planet8").then(() => process.exit(0)).catch((error) => {
//     console.log(error)
//     process.exit(1)
// })

propose([10], "store", "Requesting to store value of 10 in Boxxxx")
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
