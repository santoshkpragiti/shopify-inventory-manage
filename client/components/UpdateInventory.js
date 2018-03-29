import React, { Component } from 'react';
import { connect } from 'react-redux';

import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import Paper from 'material-ui/Paper';
import { FormLayout, TextField, Popover, ActionList, Button, Stack } from '@shopify/polaris';

import { addInventory, requestSuccessAction, startListenToFB } from '../actions/index';

class UpdateInventory extends React.Component {
  constructor(props) {
    super(props);
    this.handleAddInventory = this.handleAddInventory.bind(this);
    this.handleReset = this.handleReset.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
    this.state={
      inventoryInfo:{
        "id": '',
        "created_at": '',
        "image": '',
        "product_type": '',
        "tags": '',
        "title": '',
        "vendor": '',
        "variant": {
          "id": '',
          "weight": '',
          "weight_unit": '',
          "inventory_management": 'shopify',
          "inventory_policy": 'deny',
          "inventory_quantity": '',
          "inventory_quantity_adjustment": 0,
          "price": ''
        },
        "key": ''
      },
      expire: '',
      openEdit: false,
      openExpire: false
    };
  }

  handleAddInventory() {
    this.props.addInventory(this.state.inventoryInfo, this.state.expire);
    this.setState({openEdit: false});
    this.handleReset();
  }

  handleReset() {
    this.setState({
      inventoryInfo:{
        "id": '',
        "image": '',
        "product_type": '',
        "tags": '',
        "title": '',
        "vendor": '',
        "variant": {
          "id": '',
          "weight": '',
          "weight_unit": '',
          "inventory_management": 'shopify',
          "inventory_policy": 'deny',
          "inventory_quantity": '',
          "inventory_quantity_adjustment": 0,
          "price": ''
        },
        "key": ''
      },
      expire: '',
      openEdit: false,
      openSearchId: false,
      searchId: '',
      verb: ''
    })
  }

  handleSearch(callback) {
    const id = this.state.searchId;
    const inventory = this.props.allInventory;
    var flag = false;
    for(let k in inventory) {
      if(inventory[k].id == id) {
        this.setState({
          inventoryInfo:{
            "id": inventory[k].id,
            "created_at": '',
            "image": inventory[k].image || '',
            "product_type": inventory[k].type || '',
            "tags": inventory[k].tags || '',
            "title": inventory[k].name,
            "vendor": inventory[k].vendor || '',
            "variant": {
              "id": inventory[k].variant_id,
              "weight": inventory[k].weight || '',
              "weight_unit": inventory[k].weight_unit || '',
              "inventory_management": 'shopify',
              "inventory_policy": 'deny',
              "inventory_quantity": inventory[k].total_quantity,
              "inventory_quantity_adjustment": 0,
              "price": inventory[k].price || ''
            },
            "key": inventory[k].key
          },
          openEdit: true,
          openSearchId: false,
          searchId: '',
          verb: 'PUT'
        });
        flag=true;
      }
    }
    callback(flag);
  }

  handleOnChange(value, isVariant, key) {
    const obj = Object.assign({}, this.state.inventoryInfo);
    if(isVariant === false) {
      obj[key] = value;
      this.setState({inventoryInfo: obj});
    }
    else {
      obj['variant'][key] = value;
      this.setState({inventoryInfo: obj});
    }
  }

  render() {
    return (
      <Paper style={{margin: '5%'}}>
        <FlatButton
          primary
          label={'添加新物品'}
          onClick={() => {
            this.handleReset();
            this.setState({openEdit: true});
          }}
        />
        <FlatButton
          secondary
          label={'更新物品'}
          onClick={() => {
            this.handleReset();
            this.setState({openSearchId: true});
          }}
        />
        {!this.state.openSearchId ? null :
          <div style={{pading: '3%'}}>
            <TextField
              placeholder={"product ID (in inventory info)"}
              value={this.state.searchId}
              onChange={value => {this.setState({searchId: value})}}
            />
            <RaisedButton
              primary
              label={"搜索"}
              onClick={() => {
                this.handleSearch((success) => {
                  if(!success) this.props.gotErrorMessage('没有该产品！');
                })
                }
              }
            />
          </div>
        }
        {!this.state.openEdit ? null :
          <div style={{padding: 10}}>
            <FormLayout>
              <TextField
                label={'产品名称'}
                value={this.state.inventoryInfo['title']}
                onChange={value => {this.handleOnChange(value, false, 'title')}}
              />
              <TextField
                label={'产品图片'}
                value={this.state.inventoryInfo['images']}
                onChange={value => {this.handleOnChange(value, false, 'images')}}
              />
              <TextField
                label={'产品分类'}
                value={this.state.inventoryInfo['product_type']}
                onChange={value => {this.handleOnChange(value, false, 'product_type')}}
              />
              <TextField
                label={'产品标签'}
                value={this.state.inventoryInfo['tags']}
                onChange={value => {this.handleOnChange(value, false, 'tags')}}
              />
              <TextField
                label={'供货商'}
                value={this.state.inventoryInfo['vendor']}
                onChange={value => {this.handleOnChange(value, false, 'vendor')}}
              />
              <TextField
                label={'产品重量'}
                value={this.state.inventoryInfo['variant']['weight']}
                onChange={value => {this.handleOnChange(value, true, 'weight')}}
              />
              <TextField
                label={'重量单位'}
                value={this.state.inventoryInfo['variant']['weight_unit']}
                onChange={value => {this.handleOnChange(value, true, 'weight_unit')}}
              />
              <TextField
                disabled={this.state.verb==='PUT'}
                label={'产品数量'}
                value={this.state.inventoryInfo['variant']['inventory_quantity']}
                onChange={value => {this.handleOnChange(value, true, 'inventory_quantity')}}
              />
              <TextField
                label={'产品价格'}
                value={this.state.inventoryInfo['variant']['price']}
                onChange={value => {this.handleOnChange(value, true, 'price')}}
              />
              {this.state.verb==='PUT' ?
                <TextField
                  label={'添加数量'}
                  value={this.state.inventoryInfo['variant']['inventory_quantity_adjustment']}
                  onChange={value => {this.handleOnChange(value, true, 'inventory_quantity_adjustment')}}
                /> : null
              }
              <Stack>
                <TextField
                  label={'产品保质期(月／日／年)'}
                  value={this.state.expire}
                  onChange={value => {this.setState({expire: value})}}
                />
              </Stack>
              <Stack>
                <RaisedButton
                  primary
                  label={'确定'}
                  onClick={this.handleAddInventory}
                />
                <RaisedButton
                  secondary
                  label={'取消'}
                  onClick={this.handleReset}
                />
              </Stack>
            </FormLayout>
          </div>
        }
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
    addInventory: function(inventory, expireString) { dispatch(addInventory(inventory, expireString)); },
    startListenToFirebase: function() { dispatch(startListenToFB()); },
    gotErrorMessage: function(message) { dispatch(requestSuccessAction(message)) }
  }
}

export default connect(mapStateTpProps, mapDispatchToProps)(UpdateInventory);
