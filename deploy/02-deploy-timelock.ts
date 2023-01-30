import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { MIN_DELAY } from '../helper-hardhat-config';
import { run } from "hardhat"
const deployTimeLock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    log("Deploying TimeLock.....")
    const timlockContract = await deploy("Timelock", {
        from: deployer,
        args: [MIN_DELAY, [], []],
        log: true
    })
    log(`Deployed TimeLock to address ${timlockContract.address}`)

    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: timlockContract.address,
            constructorArguments: [MIN_DELAY, [], []],
        })
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}


export default deployTimeLock;