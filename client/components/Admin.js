import React, { Component } from 'react';
import { connect } from 'react-redux';

import {Tabs, Tab} from 'material-ui/Tabs';
import Snackbar from 'material-ui/Snackbar';
import { Button } from '@shopify/polaris';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import UpdateInventory from './UpdateInventory';
import InventoryInfomation from './InventoryInfomation';

import { requestSuccessAction, startListenToFB } from '../actions/index';

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.props.startListenToFirebase();
  }

  render() {
    const empty_message = "";
    return(
      <MuiThemeProvider>
        <div>
          <Button plain>Admin Panel</Button>
          <Tabs>
            <Tab label="Update Inventory" >
              <UpdateInventory />
            </Tab>
            <Tab label="Inventory Info" >
              <InventoryInfomation />
            </Tab>
          </Tabs>
          <Snackbar
            open={this.props.message!==""}
            message={this.props.message}
            autoHideDuration={3000}
            onRequestClose={(empty_message) => this.props.resetSnackbar(empty_message)}
          />
        </div>
      </MuiThemeProvider>
    )
  }
}

function mapStateToProps(state) {
  return {
    message: state.message
  }
}

function mapDispatchToProps(dispatch) {
  return {
    resetSnackbar: function(message) { dispatch(requestSuccessAction(message)) },
    startListenToFirebase: function() { dispatch(startListenToFB()); }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
