'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getMenus() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menus')
    .select(`
      *,
      recipes (
        id,
        quantity,
        items (
          id,
          name,
          unit,
          cost_per_unit
        )
      )
    `)
    .order('name')
  
  if (error) throw error
  return data
}

export async function addMenu(formData: FormData, recipes: { item_id: string, quantity: number }[]) {
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const price = Number(formData.get('price'))

  // Calculate HPP
  // Since we have items with cost_per_unit, we need to fetch their costs to calculate HPP
  const itemIds = recipes.map(r => r.item_id)
  const { data: items } = await supabase.from('items').select('id, cost_per_unit').in('id', itemIds)
  
  let hpp_dasar = 0
  recipes.forEach(recipe => {
    const item = items?.find(i => i.id === recipe.item_id)
    if (item) {
      hpp_dasar += item.cost_per_unit * recipe.quantity
    }
  })
  
  const hpp_pokok = hpp_dasar * 1.25 // HPP Dasar + 25%

  // Insert Menu
  const { data: menuData, error: menuError } = await supabase
    .from('menus')
    .insert([{ name, category, price, hpp_dasar, hpp_pokok }])
    .select()
    .single()

  if (menuError) return { error: menuError.message }
  
  // Insert Recipes
  if (recipes.length > 0) {
    const recipeInserts = recipes.map(r => ({
      menu_id: menuData.id,
      item_id: r.item_id,
      quantity: r.quantity
    }))
    const { error: recipeError } = await supabase.from('recipes').insert(recipeInserts)
    if (recipeError) return { error: recipeError.message }
  }

  revalidatePath('/menu')
  return { success: true }
}
