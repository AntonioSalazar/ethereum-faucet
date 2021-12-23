import contract from '@truffle/contract';

export const loadContract = async (contractName, provider) => {
    const res = await fetch(`/contracts/${contractName}.json`)
    const Artifact = await res.json();
    const _contract = contract(Artifact)
    _contract.setProvider(provider)
    let deployedcContract;
    try {
      deployedcContract = await _contract.deployed(); 
    } catch (error) {
        console.error('You are connected to the wrong network');
    }
    return deployedcContract
}