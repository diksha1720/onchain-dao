import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, upgrades, run } from "hardhat"

const deployBox: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    log("Deploying Box contract.....")
    const Contract = await ethers.getContractFactory('Box')
    const Box = await deploy("Box", {
        from: deployer,
        args:[],
        log: true
    })

    log(`Deployed Box to address ${Box.address}`)

    // const landContract = await ethers.getContractAt("Box", Box.address)
    // const timeLock = await ethers.getContract("TimeLock")
    // const transferTx = await landContract.transferOwnership(timeLock.address)
    // await transferTx.wait(1)
    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: Box.address,
            constructorArguments: [],
        })
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }

    log("Remember to transfer ownership to timelock")

}


export default deployBox;