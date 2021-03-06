import { fireRef } from './firebase';

export function requestSuccessAction(message) {
  return {
    type: 'REQUEST_SUCCESS',
    payload: {
      message
    },
  };
}

export function gotAllInventoryAction(all_inventory) {
  return {
    type: 'GOT_ALL_INVENTORY',
    payload: {
      all_inventory
    }
  }
}

export function startListenToFB() {
  return function(dispatch, getState) {
    const prodRef = fireRef.child('products');
    prodRef.off();
    prodRef.on("value", function(snapshot) {
      const products = snapshot.val();
      for(let i in products) {
        products[i].key = i;
        for(let j in products[i].stock) {
          products[i].stock[j].expire_date = new Date(products[i].stock[j].expire_date);
        }
      }
      dispatch(gotAllInventoryAction(products));
    }, function(error) {
      alert(error);
    });
  }
}

function pushToFirebase(data, expire) {
  return function(dispatch, getState){
    const product = data.product;
    const variants = product.variants[0];
    const update = {
      name: product.title,
      id: product.id,
      variant_id: variants.id,
      images: product.images || null,
      type: product.product_type || null,
      tags: product.tags || null,
      vendor: product.vendor || null,
      weight: variants.weight || null,
      weight_unit: variants.weight_unit || null,
      total_quantity: variants.inventory_quantity,
      price: variants.price || null
    };
    const variantUpdate = {
      create_date: product.created_at,
      expire_date: expire,
      quantity: variants.inventory_quantity,
    };
    const newProdKey = fireRef.child('products').push().key;
    fireRef.child('products').child(newProdKey).update(update, function(error) {
      if(error) {
        console.log('error1');
        dispatch(requestSuccessAction("添加失败！"))
        console.log(error);
      };
    });
    fireRef.child('products').child(newProdKey).child('stock').push(variantUpdate, function(error) {
      if(error) {
        console.log('error1');
        dispatch(requestSuccessAction("添加失败！"))
        console.log(error);
      };
    })
  }
}

function updateToFirebase(data, expire, key, inventory) {
  return function(dispatch, getState) {
    const product = data.product;
    const variants = product.variants[0];
    const update = {
      name: product.title,
      id: product.id,
      variant_id: variants.id,
      images: product.images || null,
      type: product.product_type || null,
      tags: product.tags || null,
      vendor: product.vendor || null,
      weight: variants.weight || null,
      weight_unit: variants.weight_unit || null,
      total_quantity: variants.inventory_quantity,
      price: variants.price || null
    };
    const allInventory = inventory;
    var adjust = 0;
    for(let k in allInventory) {
      if(allInventory[k].key === key) {
        adjust = variants.inventory_quantity - allInventory[k].total_quantity;
        break;
      }
    }
    if(adjust === 0) {
      fireRef.child('products').child(key).update(update, function(error) {
        if(error) {
          dispatch(requestSuccessAction("更新失败！"))
          console.log(error);
        };
      });
    }
    else if(adjust > 0) {
      const variantUpdate = {
        create_date: product.updated_at,
        expire_date: expire,
        quantity: adjust
      };
      fireRef.child('products').child(key).update(update, function(error) {
        if(error) {
          dispatch(requestSuccessAction("更新失败！"))
          console.log(error);
        };
      });
      fireRef.child('products').child(key).child('stock').push(variantUpdate, function(error) {
        if(error) {
          dispatch(requestSuccessAction("更新失败！"))
          console.log(error);
        };
      })
    }
  }
}

function updateAllToFirebase(data, cur_products, callback) {
  const products = data.products;
  for(let i in products) {
    for(let j in cur_products) {
      if(products[i].id===cur_products[j].id) {
        let sub = cur_products[j].total_quantity - products[i].variants[0].inventory_quantity;
        if(sub==0) break;
        else if(sub>0){
          cur_products[j].total_quantity = products[i].variants[0].inventory_quantity;
          const stock = cur_products[j].stock;
          const prior = [];
          for(let k in stock){
            prior.push([k, stock[k].quantity, stock[k].expire_date]);
          }
          prior.sort(function(a, b) {
            return a[2] - b[2];
          });
          for(let c in prior) {
            if(sub < prior[c][1]) {
              cur_products[j].stock[prior[c][0]].quantity = prior[c][1] - sub;
              break;
            }
            else if(sub == prior[c][1]) {
              delete cur_products[j].stock[prior[c][0]];
              break;
            }
            else {
              sub = sub - prior[c][1];
              delete cur_products[j].stock[prior[c][0]];
            }
          }
        }
      }
    }
  }
  fireRef.child('products').update(cur_products, function(error) {
    if(error) {
      console.log(error);
      callback(false);
    }
    else callback(true);
  });
}

export function getPresentProductsInfo(callback){
  const fetchOptions = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'GET',
    credentials: 'include',
  };
  return function(dispatch, getState) {
    return fetch('shopify/api/products.json', fetchOptions)
      .then(response => response.json())
      .then(json => { updateAllToFirebase(json, getState().all_inventory, callback); })
      .catch(error => {alert(error)});
  }
}

export function addInventory(inventory, expireString) {
  const key = inventory.key;
  const expire = new Date(expireString).getTime();
  const fetchOptions = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({product: inventory}),
    credentials: 'include',
  };
  fetchOptions.method = key === '' ? 'POST' : 'PUT';
  const path = key === '' ? 'shopify/api/products.json' : 'shopify/api/products/' + inventory.id + '.json';
  return function(dispatch, getState) {
    return fetch(path, fetchOptions)
      .then(response => response.json())
      .then(json => {
        if(key==='') dispatch(pushToFirebase(json, expire));
        else dispatch(updateToFirebase(json, expire, key, getState().all_inventory));
      }).catch(error => {
        dispatch(requestSuccessAction(error));
      });
  }
}
