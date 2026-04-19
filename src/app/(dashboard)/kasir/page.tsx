import { getMenus } from '../menu/actions'
import { KasirClient } from './KasirClient'

export default async function KasirPage() {
  const menus = await getMenus()
  return <KasirClient menus={menus || []} />
}
