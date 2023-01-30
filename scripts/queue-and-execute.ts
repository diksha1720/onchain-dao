import { ethers, network } from "hardhat"

export async function queueAndExecute() {
    const args = [10]
    const functionToCall = "store"
    const BoxNft = await ethers.getContractAt("Box", '0x43Bf92b9631663dCBe0E4B110D17047B0894b3Ce')
   
    const encodedFunctionCall = BoxNft.interface.encodeFunctionData(functionToCall, args)
    const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("Requesting to store value of 10 in Box"))
    // could also use ethers.utils.id(PROPOSAL_DESCRIPTION)

    const governor = await ethers.getContractAt("BoxGovernor", '0xbD9f3507E6f350CCda7B6b325589352c2c64c64b')
    console.log("Encode function call", encodedFunctionCall)
    console.log("Description", descriptionHash)
    console.log("Queueing...")
    const queueTx = await governor.queue([BoxNft.address], [0], [encodedFunctionCall], descriptionHash)
    await queueTx.wait(1)
    console.log("Queued!!")
    console.log("Executing...")
    // this will fail on a testnet because you need to wait for the MIN_DELAY!

    const executeTx = await governor.execute([BoxNft.address], [0], [encodedFunctionCall], descriptionHash, { value: ethers.utils.parseEther('0.001') })
    // console.log("executeTx", executeTx)
    // const executeTx = await BoxNft.createPlanet(25, 5, 'some planet', { value: ethers.utils.parseEther('0.001') })
    await executeTx.wait(1)
    console.log(`Box value stored`)
    console.log(`Box value: ${await BoxNft.retrieve()}`)
}

queueAndExecute()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })