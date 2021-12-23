import { useEffect, useState , useCallback} from 'react';
import Web3 from 'web3';

import detectEthereumProvider from '@metamask/detect-provider';

import './App.css';
import { loadContract } from './utils/loadContract';

const App  = () => {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    isProviderLoaded: false,
    web3: null,
    contract: null
  });
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [shouldReload, setShouldReload] = useState(false);

  const canConnectToContract = account && web3Api.contract;
  const reloadEffect = useCallback(() => setShouldReload(!shouldReload), [shouldReload]);


  const loadProvider = async () => {
    const provider = await detectEthereumProvider();
    if (provider) {
      const contract  = await loadContract("Faucet", provider)
      setWeb3Api({
        provider,
        web3: new Web3(provider),
        contract,
        isProviderLoaded: true
      })
    } else {
      setWeb3Api((api) => {
        return {
          ...api,
          isProviderLoaded: true
        }
      })
      console.log('You need to install metamask!')
    }
  }
  
  useEffect(() => {
    loadProvider()
  }, []);

  useEffect(() => {
    const getAccount = async () => {
      const accounts = await web3Api.web3.eth.getAccounts()
      setAccount(accounts[0])
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0])
      })
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
    web3Api.web3 && getAccount()
  }, [web3Api.web3])

  useEffect(() => {
    const loadBalance = async () => {
      const { web3, contract } = web3Api;
      const balance = await web3.eth.getBalance(contract.address)
      setBalance(web3.utils.fromWei(balance, 'ether'));
    }

    web3Api.contract && loadBalance()
  }, [web3Api, shouldReload])

  const addFunds = useCallback(async() => {
    const { contract, web3 } = web3Api;
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether")
    })
    // window.location.reload();
    reloadEffect()
  }, [web3Api, account, reloadEffect])

  const withDrawFunds = async() => {
    const { contract, web3 } = web3Api
    const withdrawAmount = web3.utils.toWei("0.1", "ether")
    await contract.withdraw( withdrawAmount, {
      from: account
    })
    reloadEffect()
  }

  return (
    <>
      <div className="faucet-wrapper">
        <div className="faucet">
          {
            web3Api.isProviderLoaded ?
            <>
              <span>
                <strong>Account:</strong>
              </span>
              <div>
                { 
                  account 
                  ? account 
                  : 
                    !web3Api.provider 
                    ? 
                    <>
                      <div className="notification is-warning is-small is-rounded">
                        Wallet is not detected!
                        <br/>
                        <a target="_blank" rel="noreferrer" href="https://metamask.io">Install Metamask</a>
                      </div>
                    </>
                    : 
                    <button 
                      className='button is-link' 
                      onClick={() => web3Api.provider.request({method: "eth_requestAccounts"})} 
                    >Connect your wallet</button>
                }
              </div>
            </>
            : <span> Looking for web3 provider</span>
          }
          <div className="balance-view is-size-2 mb-5">
            Current Balance <strong>{balance}</strong> ETH
          </div>
          {
            !canConnectToContract && (
              <i className='is-block'>Connect to Ganache</i>
            )
          }
          <button 
            disabled={!canConnectToContract}
            className="button is-primary mr-2"
            onClick={addFunds}
          >Donate 1 ETH</button>
          <button 
            disabled={!canConnectToContract}
            className="button is-danger"
            onClick={withDrawFunds}
          >Withdraw</button>
        </div>
      </div>
    </>
  );
}

export default App;




  // const loadProvider = async () => {
  //   // with metamask we have an access to window.ethereum & to window.web3
  //   // metamask injects a global API into our website
  //   // this API allows website to request users, accounts, read data to blockchain
  //   // sign messages and transactions
  //   let provider = null;
  //   if (window.ethereum) {
  //     provider = window.ethereum;
  //   }
  //   // legacy injected global API
  //   else if(window.web3) {
  //     provider = window.web3.currentProvider;
  //   } 
  //   else if(!process.env.production){
  //     provider = new Web3.providers.HttpProvider("http://localhost:7545")
  //   }

  //   setWeb3Api({
  //     web3: new Web3(provider),
  //     provider
  //   })
  // }