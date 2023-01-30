import * as fs from "fs"
import { network, ethers } from "hardhat"

const index = 0

async function main(proposalIndex: number) {
    const proposals = JSON.parse(fs.readFileSync('proposals.json', 'utf8'))
    const proposalId = proposals[network.config.chainId!][index]
    const voteWay = 1
    const reason = "reason to vote"
    const governor = await ethers.getContractAt("BoxGovernor", '0xbD9f3507E6f350CCda7B6b325589352c2c64c64b')

    const proposalState = await governor.state(proposalId)
    console.log("Current proposal state", proposalState)
    const voteTxResponse = await governor.castVoteWithReason(proposalId, voteWay, reason)

    await voteTxResponse.wait(1)

    console.log('Voted!!!! Ready to go')
    let votes = await governor.proposalVotes(proposalId)
    console.log("Current proposal votes", (votes["forVotes"].toString()) / 1e18)
}

main(index)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })