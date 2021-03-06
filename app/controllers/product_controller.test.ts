jest.mock('../services/product/product_service')
import { mocked } from 'ts-jest/utils'
import * as ProductService from '../services/product/product_service'
import * as ProductController from './product_controller'
import * as ProductTestHelper from '../services/product/product_test_helper'

describe('getById', () => {
  it('return not found if not provide id', async () => {
    try {
      await ProductController.getById({ }, { }, { })
      throw Error('Should not pass')
    } catch (err) {
      expect(err.name).toEqual('NotFoundError')
    }
  })

  it('return product value provided id', async () => {
    const mockProduct = ProductTestHelper.generateMockProduct()
    mocked(ProductService).getById.mockResolvedValue(mockProduct)
    const product = await ProductController.getById({ }, { }, { id: 3 })
    expect(product).toEqual(mockProduct)
  })

  it('return not found given product not exists', async () => {
    mocked(ProductService).getById.mockResolvedValue(null)
    try {
      await ProductController.getById({ }, { }, { id: 3 })
      throw Error('Should not pass')
    } catch (err) {
      expect(err.name).toEqual('NotFoundError')
    }

  })
})

describe('post', () => {
  it('return validation error for invalid input', async () => {
    try {
      await ProductController.post({ something: 'not right' })
      throw Error('Should not pass')
    } catch (err) {
      expect(err.name).toEqual('ValidationError')
    }
  })

  it('return product value for invalid input', async () => {
    const mockProduct = ProductTestHelper.generateMockProduct()
    mocked(ProductService).insert.mockResolvedValue(mockProduct)
    const product = await ProductController.post({
      ...mockProduct,
      id: undefined
    })
    expect(product).toEqual(mockProduct)
  })

  describe('list', () => {
    it('return list of products', async () => {
      const mockProducts = [
        ProductTestHelper.generateMockProduct(),
        ProductTestHelper.generateMockProduct(),
        ProductTestHelper.generateMockProduct()
      ]
      mocked(ProductService).findAll.mockResolvedValue(mockProducts)
      const products = await ProductController.getAll()
      expect(products).toEqual(mockProducts)
    })
  })

  describe('remove', () => {
    it('return success when delete success', async () => {
      mocked(ProductService).removeById.mockResolvedValue(true)
      const deleteResult = await ProductController.deleteById({ }, { }, { id: 'haha' })
      expect(deleteResult).toEqual({
        success: true
      })
    })

    it('return failed when delete failed', async () => {
      mocked(ProductService).removeById.mockResolvedValue(false)
      const deleteResult = await ProductController.deleteById({ }, { }, { id: 'haha' })
      expect(deleteResult).toEqual({
        success: false
      })
    })
  })
})
