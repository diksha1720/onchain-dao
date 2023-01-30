import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ADDRESS_ZERO } from '../helper-hardhat-config';
import { ethers } from "hardhat"

const setUpContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre
    const { deploy, log, get } = deployments
    const { deployer } = await getNamedAccounts()
    console.log("Deployer", deployer)
    const governor = await ethers.getContract("BoxGovernor", deployer)
    const timelockContract = await ethers.getContract("Timelock", deployer)

    log("Setting up roles.....")

    const proposerRole = await timelockContract.PROPOSER_ROLE()
    const executorRole = await timelockContract.EXECUTOR_ROLE()
    const adminRole = await timelockContract.TIMELOCK_ADMIN_ROLE()

    const proposerTx = await timelockContract.grantRole(proposerRole, governor.address)
    await proposerTx.wait(1)
    const executorTx = await timelockContract.grantRole(executorRole, ADDRESS_ZERO)
    await executorTx.wait(1)
    const revokeTx = await timelockContract.revokeRole(adminRole, deployer)
    await revokeTx.wait(1)
}


export default setUpContracts;