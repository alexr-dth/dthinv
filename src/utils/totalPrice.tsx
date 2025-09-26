export default function totalPrice(items = [], identifier = 'quoted') {
  return items.reduce(
    (sum, rItem) =>
      sum + parseFloat(rItem[`${identifier}_price`]) * parseInt(rItem[`${identifier}_quantity`]) || 0,
    0,
  )
}
