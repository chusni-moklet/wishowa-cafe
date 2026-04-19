import { getItems } from './actions'
import { InventoryClient } from './InventoryClient'

export default async function InventoryPage() {
  const items = await getItems()
  return <InventoryClient initialItems={items || []} />
}
