import { fireRef } from './firebase';

export function updateVerb(verb) {
  return {
    type: 'UPDATE_VERB',
    payload: {
      verb,
    },
  };
}

export function updatePath(path) {
  return {
    type: 'UPDATE_PATH',
    payload: {
      path,
    },
  };
}

export function updateParams(params) {
  return {
    type: 'UPDATE_PARAMS',
    payload: {
      params,
    },
  };
}

export function sendRequest(requestFields) {
  const { verb, path, params } = requestFields;

  const fetchOptions = {
    method: verb,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    credentials: 'include',
  }

  if (verb !== 'GET') {
    fetchOptions['body'] = params
  }
  return dispatch => {
    dispatch(requestStartAction());

    return fetch(`/api${path}`, fetchOptions)
      .then(response => response.json())
      .then(json => dispatch(requestCompleteAction(json)))
      .catch(error => {
        dispatch(requestErrorAction(error));
      });
  };
}

function requestStartAction() {
  return {
    type: 'REQUEST_START',
    payload: {},
  };
}

function requestCompleteAction(json) {
  const responseBody = JSON.stringify(json, null, 2);
  return {
    type: 'REQUEST_COMPLETE',
    payload: {
      responseBody
    },
  };
}

function requestErrorAction(requestError) {
  return {
    type: 'REQUEST_ERROR',
    payload: {
      requestError,
    },
  };
}

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
    const product = data.product;
    const variants = product.variants[0];
    const update = {
      name: product.title,
      id: product.id,
      variant_id: variants.id,
      image: product.image || null,
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
    console.log(variantUpdate);
    const newProdKey = fireRef.child('products').push().key;
    fireRef.child('products').child(newProdKey).update(update, function(error) {
      if(error) alert(error);
    });
    fireRef.child('products').child(newProdKey).child('stock').push(variantUpdate, function(error) {
      if(error) alert(error);
    })
}

function updateToFirebase(data, expire, key, inventory) {
  const product = data.product;
  const variants = product.variants[0];
  const update = {
    name: product.title,
    id: product.id,
    variant_id: variants.id,
    image: product.image || null,
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
      if(error) alert(error);
    });
  }
  else if(adjust > 0) {
    const variantUpdate = {
      create_date: product.updated_at,
      expire_date: expire,
      quantity: adjust
    };
    fireRef.child('products').child(key).update(update, function(error) {
      if(error) alert(error);
    });
    fireRef.child('products').child(key).child('stock').push(variantUpdate, function(error) {
      if(error) alert(error);
    })
  }
}

function updateAllToFirebase(data, cur_products) {
  const products = data.products;
  for(let i in products) {
    for(let j in cur_products) {
      if(products[i].id===cur_products[j].id) {
        let sub = cur_products[j].total_quantity - products[i].variants[0].inventory_quantity;
        if(sub==0) break;
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
  fireRef.child('products').update(cur_products, function(error) {
    if(error) alert(error);
  });
}

export function getPresentProductsInfo(){
  const fetchOptions = {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    method: 'GET',
    credentials: 'include',
  };
  return function(dispatch, getState) {
    return fetch('api/products.json', fetchOptions)
      .then(response => response.json())
      .then(json => { updateAllToFirebase(json, getState().all_inventory); })
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
  const path = key === '' ? 'api/products.json' : 'api/products/' + inventory.id + '.json';
  return function(dispatch, getState) {
    return fetch(path, fetchOptions)
      .then(response => response.json())
      .then(json => {
        if(key==='') pushToFirebase(json, expire);
        else updateToFirebase(json, expire, key, getState().all_inventory);
      }).catch(error => {
        dispatch(requestErrorAction(error));
      });
  }
}
