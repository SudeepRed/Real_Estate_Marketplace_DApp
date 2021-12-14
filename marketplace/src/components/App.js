/* eslint-disable react/jsx-pascal-case */
import React, { Component } from "react";
import { useState, useEffect } from "react";

import Web3 from "web3";
import Marketplace from "../abis/Marketplace.json";

import _form from "./Form";
import _navbar from "./Navbar"
import _card from "./Card"
import {BrowserRouter as Router, Routes, Route ,useNavigate} from "react-router-dom";

class App extends Component {
  // const [account, setAccount] = useState("");
  // const [listings, getListings] = useState([]);
  // const [countListings, getCount] = useState(0);
  // const [loading, setloading] = useState(true);
  // const [contract,setContract] = useState();
  constructor(props) {
    super(props);
    this.state = {
      account: "",
      listings: [],
      countListings: "",
      loading: false,
      contract: "",
    };
    this.createListing = this.createListing.bind(this);
    this.purchaceProperty = this.purchaceProperty.bind(this);
  }
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
    }
  }

  async loadBlockchainData() {
    const _web3 = window.web3;

    const acc = await _web3.eth.getAccounts();

    this.setState({ account: acc[0] });
    const networkId = await _web3.eth.net.getId();
    // console.log(networkId);
    const networkData = Marketplace.networks[networkId];
    if (networkData) {
      const contractM = new _web3.eth.Contract(
        Marketplace.abi,
        networkData.address
      );

      this.setState({ contract: contractM });
      const countListings = await contractM.methods.countListings().call();
      this.setState({ countListings: countListings });
      for (var i = 1; i <= countListings; i++) {
        const property = await contractM.methods.listings(i).call();
        console.log(property);
        this.setState({
          listings: this.state.listings.concat(property),
        });
      }
      console.log(this.state.listings);
    } else {
      window.alert("not deployed");
    }
  }

  createListing(title, desc, addr, pc, rPrice, sPrice) {
    let forRent = false;
    if (rPrice > 0) {
      forRent = true;
    }
    // sPrice = Number(sPrice);
    // rPrice = Number(rPrice);
    this.state.contract.methods
      .createListing(title, desc, addr, pc, true, forRent, rPrice, sPrice)
      .send({ from: this.state.account })
      .once("receipt", (receipt) => {
        this.state.loading = false;
      });
    console.log(title, desc, addr, pc, rPrice, sPrice);
  }

  purchaceProperty(id, price) {
    this.setState({ loading: true });
    this.state.contract.methods
      .purchaceProperty(id)
      .send({ from: this.state.account, value: price })
      .once("receipt", (receipt) => {
        this.setState({ loading: false });
      });
  }

  render() {
    return (
      
      <Router>
        <_navbar account = {this.state.account} />
      <Routes>
        <Route path="/" element = {<_form
          listings={this.state.listings}
          createListing={this.createListing}
          purchaceProperty={this.purchaceProperty}
        />}/>
        <Route path="/listings" element = {<_card listings={this.state.listings} purchaceProperty={this.purchaceProperty}/>} />
  
      </Routes>
    </Router>

    );
  }
}

export default App;
