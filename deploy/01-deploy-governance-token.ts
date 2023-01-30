import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, run } from 'hardhat';

const deployGovernanceToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    console.log("Deployer", deployer)
    log("Deploying governance token.....")
    const governanceToken = await deploy("GovernanceToken", {
        from: deployer,
        args: [],
        log: true
    })
    log(`Deployed GovernanceToken to address ${governanceToken.address}`)

    console.log("Verifying contract...")
    try {
        await run("verify:verify", {
            address: governanceToken.address,
            constructorArguments: [],
        })
    } catch (e: any) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }

    await delegate(governanceToken.address, deployer)
    log("Delegated!")
}

const delegate = async (governanceTokenAddress: string, delegatedAccount: string) => {
    const governanceToken = await ethers.getContractAt("GovernanceToken", governanceTokenAddress)
    const tx = await governanceToken.delegate(delegatedAccount)
    await tx.wait(1)
    console.log(`Checkpoints ${await governanceToken.numCheckpoints(delegatedAccount)}`)
}
export default deployGovernanceToken;