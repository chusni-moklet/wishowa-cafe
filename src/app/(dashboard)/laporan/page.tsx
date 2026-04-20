import { getFinancialData } from './actions'
import { LaporanClient } from './LaporanClient'

export default async function LaporanPage() {
  const { income, expenses, transactions } = await getFinancialData()
  return <LaporanClient income={income} expenses={expenses} transactions={transactions} />
}
