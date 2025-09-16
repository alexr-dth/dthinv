import axios from 'axios'

// const BASE_API = import.meta.env.VITE_JSON_SERVER_URL
const BASE_API = import.meta.env.VITE_API_SERVER_URL
/** AXIOS BODY
 * {
 *    data: {},        // Response body
 *    status: 200,     // HTTP status code
 *    statusText: "OK",
 *    headers: {},     // Response headers
 *    config: {},      // Request config
 *    request: {}      // The actual request object
 * }
 */

// emulate api requests, change this later

// #region ═══════════ ITEMS ═══════════ //
export const fetchItems = async () => {
  const { data } = await axios.get(BASE_API + '/items')
  return data
}
export const addItemMutation = async (newData) => {
  const { data } = await axios.post(BASE_API + '/items', newData)
  return data
}
export const editItemMutation = async (newData) => {
  await axios.patch(BASE_API + `/items/${newData.id}`, newData)
}
export const removeItemMutation = async (newData) => {
  await axios.delete(BASE_API + `/items/${newData.id}`)
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
export const addOrderMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  if (Array.isArray(newData)) {
    await Promise.all(newData.map((d) => axios.post(BASE_API + '/orders', d)))
  } else {
    await axios.post(BASE_API + '/orders', newData)
  }
}
export const editOrderMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  // inc
  await axios.put(BASE_API + `/orders/${newData.id}`, newData)
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
  // await new Promise((res) => setTimeout(res, 1000))
  const { data } = await axios.post(BASE_API + '/suppliers', newData)
  return data
}
export const editSupplierMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  await axios.put(BASE_API + `/suppliers/${newData.id}`, newData)
}
export const removeSupplierMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  await axios.delete(BASE_API + `/suppliers/${newData.id}`)
}
// #endregion

// #region ═══════════ LOCATIONS ═══════════ //
export const fetchLocations = async () => {
  // await new Promise((res) => setTimeout(res, 1000))
  const { data } = await axios.get(BASE_API + '/locations')
  return data
}

export const fetchLocationById = async (id) => {
  // await new Promise((res) => setTimeout(res, 1000))
  const { data } = await axios.get(BASE_API + `/locations/${id}`)
  return data
}

export const addLocationMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  if (Array.isArray(newData)) {
    await Promise.all(
      newData.map((d) => axios.post(BASE_API + '/locations', d)),
    )
  } else {
    await axios.post(BASE_API + '/locations', newData)
  }
}

export const editLocationMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  // inc
  await axios.patch(BASE_API + `/locations/${newData.id}`, newData)
}

export const removeLocationMutation = async (id) => {
  await new Promise((res) => setTimeout(res, 5000))
  await axios.delete(BASE_API + `/locations/${id}`)
}
// #endregion
