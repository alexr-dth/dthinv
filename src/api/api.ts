const sampleItems = [
  {
    id: '1',
    image: '/warehouse.jpg',
    vendor: 'HOME DEPOT',
    name: 'Heavy Duty Steel Hammer',
    sku: '21AA00001',
    internal_sku: 'DTH021AA00001',
    price: '5.98',
    stock: '44',
  },
  {
    id: '2',
    image: '/warehouse.jpg',
    vendor: "LOWE'S",
    name: 'Cordless Power Drill 18V',
    sku: '21AA00002',
    internal_sku: 'DTH021AA00002',
    price: '79.99',
    stock: '12',
  },
  {
    id: '3',
    image: '/warehouse.jpg',
    vendor: 'ACE HARDWARE',
    name: 'Adjustable Wrench 10in',
    sku: '21AA00003',
    internal_sku: 'DTH021AA00003',
    price: '14.49',
    stock: '30',
  },
  {
    id: '4',
    image: '/warehouse.jpg',
    vendor: 'MENARDS',
    name: 'PVC Pipe 3/4 in x 10 ft',
    sku: '21AA00004',
    internal_sku: 'DTH021AA00004',
    price: '3.25',
    stock: '120',
  },
  {
    id: '5',
    image: '/warehouse.jpg',
    vendor: 'HOME DEPOT',
    name: 'LED Bulb 60W Equivalent',
    sku: '21AA00005',
    internal_sku: 'DTH021AA00005',
    price: '2.99',
    stock: '250',
  },
  {
    id: '6',
    image: '/warehouse.jpg',
    vendor: "LOWE'S",
    name: 'Extension Cord 25 ft',
    sku: '21AA00006',
    internal_sku: 'DTH021AA00006',
    price: '12.75',
    stock: '67',
  },
  {
    id: '7',
    image: '/warehouse.jpg',
    vendor: 'ACE HARDWARE',
    name: 'Multipurpose Ladder 12 ft',
    sku: '21AA00007',
    internal_sku: 'DTH021AA00007',
    price: '149.99',
    stock: '8',
  },
  {
    id: '8',
    image: '/warehouse.jpg',
    vendor: 'MENARDS',
    name: 'Garden Hose 50 ft',
    sku: '21AA00008',
    internal_sku: 'DTH021AA00008',
    price: '24.95',
    stock: '54',
  },
  {
    id: '9',
    image: '/warehouse.jpg',
    vendor: 'HOME DEPOT',
    name: 'Paint Roller Set 9 in',
    sku: '21AA00009',
    internal_sku: 'DTH021AA00009',
    price: '10.49',
    stock: '36',
  },
  {
    id: '10',
    image: '/warehouse.jpg',
    vendor: "LOWE'S",
    name: 'Smart Thermostat Wi-Fi',
    sku: '21AA00010',
    internal_sku: 'DTH021AA00010',
    price: '199.00',
    stock: '5',
  },
]

const sampleSuppliers = [
  { id: '1', name: 'Home Depot' },
  { id: '2', name: 'Amazon' },
  { id: '3', name: 'Hardware Resources' },
  { id: '4', name: 'PAINT' },
  { id: '5', name: 'Ferguson Enterprises' },
  { id: '6', name: 'Acme Brick' },
  { id: '7', name: 'Sherwin-Williams' },
]

// emulate api requests, change this later

/* ===========START SUPPLIERS=========== */
export const fetchSuppliers = async () => {
  await new Promise((res) => setTimeout(res, 1000))
  return sampleSuppliers
}

export const addSupplierMutation = async (newData) => {
  await new Promise((res) => setTimeout(res, 1000))
  newData.id = Date.now();
  sampleSuppliers.push(newData);
  
  console.log(
    `%c>> Added supplier:'${JSON.stringify(newData)}'`,
    'color: #eb4034;',
  )
}
/* ===========END SUPPLIERS=========== */

/* ===========START ITEMS=========== */
export const fetchItems = async () => {
  await new Promise((res) => setTimeout(res, 1000))
  return sampleItems
}
export const addItemMutation = async (newData) => {
  await new Promise((res) => setTimeout(res, 1000))
  if (Array.isArray(newData)) {
    sampleItems.push(...newData)
    console.log(
      `%c>> Added multiple items: '${JSON.stringify(newData)}'`,
      'color: #eb4034;',
    )
  } else {
    sampleItems.push(newData)
    console.log(
      `%c>> Added item:'${JSON.stringify(newData)}'`,
      'color: #eb4034;',
    )
  }
}
export const editItemMutation = async (newData) => {
  await new Promise((res) => setTimeout(res, 1000))
  const targetIndex = sampleItems.findIndex(({ id }) => id == newData?.id)
  sampleItems[targetIndex] = newData
}
/* ===========END ITEMS=========== */
