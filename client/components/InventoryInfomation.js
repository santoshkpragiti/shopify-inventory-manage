import React, { Component } from 'react';
import { connect } from 'react-redux';
import { List, ListItem } from 'material-ui/List';
import Paper from 'material-ui/Paper';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import ActionLabel from 'material-ui/svg-icons/action/label';
import RaisedButton from 'material-ui/RaisedButton';
import Avatar from 'material-ui/Avatar';
import { green400, green300 } from 'material-ui/styles/colors';
import Divider from 'material-ui/Divider';
import { getPresentProductsInfo, requestSuccessAction } from '../actions/index';

class InventoryInfomation extends React.Component{

    constructor(props) {
      super(props);
      this.handleGetProductsInfo = this.handleGetProductsInfo.bind(this);
      this.state={
        inProgress: false
      };
    }

    handleGetProductsInfo() {
      this.props.getPresentProductsInfo((success) => {
        if(!success) this.props.gotErrorMessage('获取最新货品信息失败!');
      })
    }

    render() {
      var items = [];
      const allInventory = this.props.allInventory;
      for(let i in allInventory) {
        var nest = [];
        for(let j in allInventory[i].stock) {
          nest.push(
            <ListItem
            key={j}
              primaryText={'有效期至: ' + allInventory[i].stock[j].expire_date}
              secondaryText={'剩余库存: ' + allInventory[i].stock[j].quantity}
              disabled
              leftIcon={<ActionLabel color={green300}/>}
            />
          )
        }
        items.push(
          <ListItem
            key={i}
            primaryText={allInventory[i].name}
            secondaryText={<span>{'id: ' + allInventory[i].id + ', 总库存: ' + allInventory[i].total_quantity + ', 单价: $' + allInventory[i].price}</span>}
            nestedItems={nest}
            primaryTogglesNestedList={true}
            leftIcon={<ActionGrade color={green400}/>}
          />
        )
      }
      return (
        <Paper>
          <RaisedButton
            style={{marginTop: 5, marginLeft: 5}}
            primary
            label={'更新最新产品信息'}
            onClick={this.handleGetProductsInfo}
          />
          <List>
            {items}
          </List>
        </Paper>
      )
    }
}


function mapStateTpProps(state) {
  return {
    allInventory: state.all_inventory
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getPresentProductsInfo: function(callback) { dispatch(getPresentProductsInfo(callback)); },
    gotErrorMessage: function(message) { dispatch(requestSuccessAction(message)) }
  }
}

export default connect(mapStateTpProps, mapDispatchToProps)(InventoryInfomation);
