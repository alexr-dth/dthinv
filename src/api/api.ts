import axios from 'axios'

const BASE_API = 'http://localhost:3001'

// emulate api requests, change this later

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

export const deleteOrderMutation = async (id) => {
  // await new Promise((res) => setTimeout(res, 1000))
  sampleOrders = sampleOrders.filter((p) => p.id != id)
  console.log(`%c>> Deleted order:'${JSON.stringify(id)}'`, 'color: #eb4034;')
}

export const editOrderMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  await axios.put(BASE_API + `/orders/${newData.id}`, newData)
}

export const removeOrderMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  await axios.delete(BASE_API + `/orders/${newData.id}`)
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
  if (Array.isArray(newData)) {
    await Promise.all(
      newData.map((d) => axios.post(BASE_API + '/suppliers', d)),
    )
  } else {
    await axios.post(BASE_API + '/suppliers', newData)
  }
}
export const editSupplierMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  await axios.put(BASE_API + `/suppliers/${newData.id}`, newData)
}
export const removeSupplierMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  await axios.delete(BASE_API + `/suppliers/${newData.id}`)
}
// #region

// #region ═══════════ ITEMS ═══════════ //
export const fetchItems = async () => {
  // await new Promise((res) => setTimeout(res, 1000))
  const { data } = await axios.get(BASE_API + '/items')
  return data
}
export const addItemMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  if (Array.isArray(newData)) {
    await Promise.all(newData.map((d) => axios.post(BASE_API + '/items', d)))
  } else {
    await axios.post(BASE_API + '/items', newData)
  }
}
export const editItemMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  await axios.put(BASE_API + `/items/${newData.id}`, newData)
}
export const removeItemMutation = async (newData) => {
  // await new Promise((res) => setTimeout(res, 1000))
  await axios.delete(BASE_API + `/items/${newData.id}`)
}
// #endregion

// {
//   data: {},        // Response body
//   status: 200,     // HTTP status code
//   statusText: "OK",
//   headers: {},     // Response headers
//   config: {},      // Request config
//   request: {}      // The actual request object
// }

let sampleOrders = [
  {
    id: '1',
    supplier: 'Home Depot',
    supplier_tracking_number: 'HD-4582391',
    internal_tracking_number: 'INT-2023-001',
    order_name: 'Lumber and Tools',
    status: 'open-order',
    total_price: 1250.75,
    approver: 'Jacob',
    approval_notes: '',
    notes: '',
  },
  {
    id: '2',
    supplier: "Lowe's",
    supplier_tracking_number: 'LW-9823746',
    internal_tracking_number: 'INT-2023-002',
    order_name: 'Paint Supplies',
    status: 'pending-approval',
    total_price: 430.0,
    approver: 'Michael',
    approval_notes: '',
    notes: '',
  },
  {
    id: '3',
    supplier: 'Amazon Business',
    supplier_tracking_number: 'AMZ-7461820',
    internal_tracking_number: 'INT-2023-003',
    order_name: 'Office Chairs',
    status: 'approved',
    total_price: 2100.99,
    approver: 'Jacob',
    approval_notes: '',
    notes: '',
  },
  {
    id: '4',
    supplier: 'Staples',
    supplier_tracking_number: 'STP-5639201',
    internal_tracking_number: 'INT-2023-004',
    order_name: 'Printer Paper & Ink',
    status: 'open-order',
    total_price: 299.49,
    approver: 'Michael',
    approval_notes: '',
    notes: '',
  },
  {
    id: '5',
    supplier: 'Costco Business',
    supplier_tracking_number: 'CST-8741923',
    internal_tracking_number: 'INT-2023-005',
    order_name: 'Kitchen Supplies',
    status: 'approved',
    total_price: 890.2,
    approver: 'Jacob',
    approval_notes: '',
    notes: '',
  },
]
