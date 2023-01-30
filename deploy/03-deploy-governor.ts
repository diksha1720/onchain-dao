import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE } from '../helper-hardhat-config';
import { run } from "hardhat"

const deployGovernorContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()

    const governanceToken = await get("GovernanceToken")
    const TimelockContract = await get("Timelock")
    log("Deploying Governor Contract.....")
    const args = [governanceToken.address, TimelockContract.address, VOTING_DELAY, VOTING_PERIOD, QUORUM_PERCENTAGE]

    const governorContract = await deploy("BoxGovernor", {
        from: deployer,
        args: args,
        log: true
    })
    log(`Deployed Governor Contract to address ${governorContract.address}`)

    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: governorContract.address,
            constructorArguments: args,
        })
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}


export default deployGovernorContract;