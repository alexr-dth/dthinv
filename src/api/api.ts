import axios from 'axios'

// const BASE_API = import.meta.env.VITE_JSON_SERVER_URL
const BASE_API = import.meta.env.VITE_API_SERVER_URL
const PAGE_SIZE = import.meta.env.VITE_PAGE_SIZE

export const authUser = {
  username: 'Alex',
  role: 'admin',
  id: 'c7b8779a-0c65-4b34-b60e-88135457b307',
}
// #region ═══════════ ITEMS ═══════════ //
export const fetchItems = async () => {
  const { data } = await axios.get(BASE_API + '/items')
  return data
}

export const fetchPaginatedItems = async ({ pageParam = 1 }) => {
  const res = await axios.get(
    BASE_API + `/items?page=${pageParam}&limit=${PAGE_SIZE}`,
  )
  console.log('Fetch page: ', pageParam)
  return {
    data: res.data,
    totalCount: Number(res.headers['x-total-count']),
    pageSize: res.data.length,
    pageParam: pageParam,
  }
}

export const showItem = async (id) => {
  const { data } = await axios.get(BASE_API + `/items/${id}`)
  return data
}
export const addItemMutation = async (data) => {
  const { data: newData } = await axios.post(BASE_API + '/items', data)
  return newData
}
export const editItemMutation = async (data) => {
  await axios.patch(BASE_API + `/items/${data.id}`, data)
}
export const removeItemMutation = async (data) => {
  await axios.delete(BASE_API + `/items/${data.id}`)
}
// #endregion

// #region ═══════════ REQUESTS ═══════════ //
export const fetchRequests = async () => {
  const { data } = await axios.get(BASE_API + '/requested-items')
  return data
}

export const fetchRequestsFormatted = async () => {
  const { data } = await axios.get(BASE_API + '/requested-items')

  const groupedDataArr = data.reduce((acc, row) => {
    const dateLabel = new Date(row.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    // Find existing date object
    let dateObj = acc.find((d) => d['label'] === dateLabel)
    if (!dateObj) {
      dateObj = { label: dateLabel, suppliers: [] }
      acc.push(dateObj)
    }
    // Find existing supplier object under that date
    const supplier = row.item?.supplier || {}
    let supplierObj = dateObj.suppliers.find((s) => s.name === supplier.name)
    if (!supplierObj) {
      supplierObj = { ...supplier, requested_items: [] }
      dateObj.suppliers.push(supplierObj)
    }
    // Push item
    supplierObj.requested_items.push(row)
    return acc
  }, [])

  return groupedDataArr
}
export const showRequest = async (id) => {
  const { data } = await axios.get(BASE_API + `/requested-items/${id}`)
  return data
}
export const addRequestMutation = async (data) => {
  const { data: newData } = await axios.post(
    BASE_API + '/requested-items',
    data,
  )
  return newData
}
export const editRequestMutation = async (data) => {
  await axios.patch(BASE_API + `/requested-items/${data.id}`, data)
}
export const removeRequestMutation = async (data) => {
  await axios.delete(BASE_API + `/requested-items/${data.id}`)
}
// #endregion

// #region ═══════════ ORDERS ═══════════ //
export const fetchOrders = async () => {
  // await new Promise((res) => setTimeout(res, 1000))
  const { data } = await axios.get(BASE_API + '/orders')
  return data
}
export const fetchOrderById = async (id) => {
  // await new Promise((res) => setTimeout(res, 1000))
  const { data } = await axios.get(BASE_API + `/orders/${id}`)
  return data
}
export const addOrderMutation = async (data) => {
  const { data: axiosData } = await axios.post(BASE_API + '/orders', data)
  const newData = axiosData.data[0]
  return newData
}
export const editOrderMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  // inc
  await axios.patch(BASE_API + `/orders/${newData.id}`, newData)
}
export const removeOrderMutation = async (id) => {
  // await new Promise((res) => setTimeout(res, 1000))
  // inc
  await axios.delete(BASE_API + `/orders/${id}`)
}
// #endregion

// #region ═══════════ SUPPLIERS ═══════════ //
export const fetchSuppliers = async () => {
  // await new Promise((res) => setTimeout(res, 1000))
  const { data } = await axios.get(BASE_API + '/suppliers')
  return data
}
export const addSupplierMutation = async (newData) => {
  const { data } = await axios.post(BASE_API + '/suppliers', newData)
  return data.data[0]
}
export const editSupplierMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  await axios.patch(BASE_API + `/suppliers/${newData.id}`, newData)
}
export const removeSupplierMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  await axios.delete(BASE_API + `/suppliers/${newData.id}`)
}
// #endregion

// #region ═══════════ LOCATIONS ═══════════ //
export const fetchLocations = async () => {
  const { data } = await axios.get(BASE_API + '/locations')

  const buildTree = (data, parentId = null) => {
    return data
      .filter((item) => item.parent_id == parentId)
      .map((item) => ({
        ...item,
        children: buildTree(data, item.id),
      }))
  }

  return buildTree(data)
}

export const fetchLocationById = async (id) => {
  const { data } = await axios.get(BASE_API + `/locations/${id}`)
  return data
}

export const addLocationMutation = async (data) => {
  const { data: newData } = await axios.post(BASE_API + '/locations', data)
  return newData
}

export const editLocationMutation = async (newData) => {
  await axios.patch(BASE_API + `/locations/${newData.id}`, newData)
}

export const removeLocationMutation = async (id) => {
  await axios.delete(BASE_API + `/locations/${id}`)
}
// #endregion
