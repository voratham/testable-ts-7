import * as MongoDb from 'mongodb'
import * as MongoConnection from '../connections/mongodb'
import { Cart, CartItem } from './cart_type'
import { MongoIdParams } from '../types'
import * as IdHelper from '../../helpers/id_helper'

export async function create (now = new Date()): Promise<Cart> {
  const mongoConnection = await MongoConnection.getClient()
  const cart: Cart = {
    id: new MongoDb.ObjectId(),
    hash: IdHelper.generateRandomId(),
    created: now,
    items: []
  }
  await mongoConnection.collection('carts').insertOne(cart)
  return cart
}

export async function getById(id: MongoIdParams): Promise<Cart | null> {
  if (!MongoDb.ObjectId.isValid(id)) {
    return null
  }
  const mongoConnection = await MongoConnection.getClient()
  const cart = await mongoConnection.collection('carts').findOne<Cart>({ id: new MongoDb.ObjectId(id) })
  if (!cart) {
    return null
  }
  const cartItems = await mongoConnection.collection('cart_items').find<CartItem>({ cartId: id }).toArray()
  return {
    ...cart,
    items: cartItems
  }
}

export async function add (cartId: MongoIdParams, productId: MongoIdParams): Promise<Cart | null> {
  const mongoConnection = await MongoConnection.getClient()
  if (!(await cartExists(cartId))) {
    return null
  }
  await mongoConnection.collection('cart_items').findOneAndUpdate({
    cartId, productId
  }, {
    $inc: {
      quantity: 1
    }
  }, { upsert: true })

  return getById(cartId)
}

export async function remove (cartId: MongoIdParams, productId: MongoIdParams): Promise<Cart | null> {
  const mongoConnection = await MongoConnection.getClient()
  if (!(await cartExists(cartId))) {
    return null
  }
  await mongoConnection.collection('cart_items').findOneAndUpdate({
    cartId, productId
  }, {
    $inc: {
      quantity: -1
    }
  }, { upsert: true })
  await mongoConnection.collection('cart_items').deleteOne({
    cartId,
    productId,
    quantity: {
      $lte: 0
    }
  })

  return getById(cartId)
}

async function cartExists (cartId: MongoIdParams): Promise<boolean> {
  const mongoConnection = await MongoConnection.getClient()
  if (!MongoDb.ObjectId.isValid(cartId)) {
    return false
  }
  const count = await mongoConnection.collection('carts').count({ id: cartId })
  return count > 0
}
