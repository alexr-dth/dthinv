export default function totalUnits(items = [], identifier = 'quoted') {
  return items.reduce((sum, rItem) => sum + parseInt(rItem[`${identifier}_quantity`]) || 0, 0)
}
