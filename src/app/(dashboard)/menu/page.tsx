import { getMenus } from './actions'
import { getItems } from '../inventory/actions'
import { MenuClient } from './MenuClient'

export default async function MenuPage() {
  const menus = await getMenus()
  const items = await getItems()
  
  return <MenuClient initialMenus={menus || []} availableItems={items || []} />
}
