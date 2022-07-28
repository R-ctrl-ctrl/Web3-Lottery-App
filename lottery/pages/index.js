import styles from '../styles/Home.module.css'
import Web3 from 'web3'
import { useEffect, useState } from 'react'
import lotteryContract from '../blockchain/lottery'

export default function Home() {
  const [web3, setweb3] = useState()
  const [address, setaddress] = useState()
  const [lcContract, setLcContract] = useState()
  const [lotteryPot, setLotteryPot] = useState()
  const [lotteryPlayers, setLotteryPlayers] = useState([])
  const [error, seterror] = useState('')
  const [requestId, setrequestId] = useState()
  const [lotteryId, setlotteryId] = useState(0)
  const [lotteryHistory,setLotteryHistory] = useState([])

  useEffect(() => {
      updateState()
  }, [lcContract])

  const updateState = ()=>{
    if (lcContract) getPot()
    if (lcContract) getplayers()
    if (lcContract) getLotteryId()
  }

  const getPot = async () => {
    const pot = await lcContract.methods.getBalance().call() * 10 ** -18
    setLotteryPot(pot)
  }

  const getplayers = async () => {
    const players = await lcContract.methods.getplayers().call()
    setLotteryPlayers(players)
  }

  const enterLotteryHandler = async () => {
    try {
      await lcContract.methods.enter().send({
        from: address,
        value: web3.utils.toWei('0.1', 'ether'),
        gas: 300000,
        gasPrice: null
      })
      seterror('')
    }
    catch (err) {
      seterror(err.message)
    }
  }

  const getHistory = async(Lid)=>{
    setLotteryHistory([])
    for(let i = parseInt(Lid) - 1;i>=0;i--){
      const winnerAddress = await lcContract.methods.getLotteryHistory(i).call()
      console.log(winnerAddress)
      const historyObj = {}
      historyObj.id = i
      historyObj.winner = winnerAddress
      setLotteryHistory(lotteryHistory => [...lotteryHistory,historyObj])
    }

  }

  const getLotteryId = async ()=>{
    const lotid = await lcContract.methods.lotteryId().call()
    setlotteryId(lotid)
    await getHistory(lotteryId)
  }



  const pickWinnerHandler = async () => {
    try {
      await lcContract.methods.requestRandomWords().send({
        from: address,
        gas: 300000,
        gasPrice: null
      })

      const reqid = await lcContract.methods.s_requestId().call()
      setrequestId(reqid)


      const owner = await lcContract.methods.owner().call()
      console.log(owner)
      setTimeout(async () => {
        await lcContract.methods.payWinner().send({
          from: address,
          gas: 300000,
          gasPrice: null
        })
      }, 100000);

      setTimeout(() => {
        updateState()
      }, 20000);
      

    } catch (err) {
      seterror(err.message)
    }
  }










  const connectWalletHandler = async () => {
    if (typeof window != 'undefined' && typeof window.ethereum != 'undefined') {
      try {
        // request wallet connection
        await window.ethereum.request({ method: 'eth_requestAccounts' })

        // Create web3 instance
        const web3 = new Web3(window.ethereum)
        setweb3(web3)

        // get accounts and set 1st account
        const accounts = await web3.eth.getAccounts()
        setaddress(accounts[0])

        // create loacl contract copy
        const lc = lotteryContract(web3)
        setLcContract(lc)
        seterror('')
      } catch (err) {
        seterror(err.message)
      }
    }
    else {
      console.log("please install metamask")
    }

  }
  return (
    <div className={styles.container}>
      <div className={styles.first}>
        <p className={styles.heading}>Ether Lottery</p>
        <div className={styles.compo1}>
          <p>Enter into lottery by sending 0.1 Ether</p>
          <button onClick={enterLotteryHandler} className={styles.playbtn}>Play Now</button>
        </div>
        <div className={styles.compo2}>
          <p><b>Admins only:</b> Pick Winner</p>
          <button onClick={pickWinnerHandler} className={styles.pickbtn}>Pick Winner</button>
          <p>{error}</p>
        </div>
      </div>


      <div className={styles.second}>
        <button className={styles.connectbtn} onClick={connectWalletHandler}>Connect Wallet</button>

        <div className={styles.card1}>
          <p className={styles.cardheading}>Lottery history</p>
          {
            lotteryHistory.map((history,key)=>{
              return (
                <div key={key}>
                    <p> winner of Lottery #{history.id + 1}</p>
                    <p>{history.winner}</p>
                </div>
              )
            })
          }
        </div>


        <div className={styles.card2}>
          <p className={styles.cardheading}>Players</p>
          {
            lotteryPlayers.map((player, key) => {
              return (
                <div key={key}>
                  <span className={styles.address}>{player}</span>
                </div>
              )
            })
          }
        </div>



        <div className={styles.card3}>
          <p className={styles.cardheading}>Pot</p>
          <span>{lotteryPot} ethers</span>
        </div>

      </div>
    </div>
  )
}
