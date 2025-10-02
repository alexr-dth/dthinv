export default function createInventoryPerLocation(locationPerInventory) {
  const newArr = []
  locationPerInventory?.forEach((inv) => {
    const locIndex = newArr.findIndex(({ id }) => id === inv.location.id)
    const selectedLocation =
      locIndex < 0 ? { ...inv.location, inventory: [] } : newArr[locIndex]

    const { location, ...newInv } = inv
    selectedLocation.inventory.push(newInv)

    if (locIndex < 0) newArr.push(selectedLocation)
  })
  return newArr
}
