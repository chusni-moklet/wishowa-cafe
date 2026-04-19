-- ==========================================
-- CAFE WISHOWA POS & INVENTORY SYSTEM
-- SUPABASE SCHEMA SCRIPT
-- ==========================================

-- 1. Create custom enum types
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'kasir');
CREATE TYPE movement_type AS ENUM ('in_gudang', 'transfer_kafe', 'out_gudang', 'out_kafe', 'adjustment', 'sale');
CREATE TYPE expense_category AS ENUM ('bahan', 'operasional', 'lainnya');
CREATE TYPE income_source AS ENUM ('transaction', 'manual');

-- 2. Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'kasir',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to create profile after user sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'kasir'); -- Default role
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Items (Bahan Baku)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- e.g., gr, ml, pcs
  cost_per_unit NUMERIC NOT NULL DEFAULT 0,
  stock_gudang NUMERIC NOT NULL DEFAULT 0 CHECK (stock_gudang >= 0),
  stock_kafe NUMERIC NOT NULL DEFAULT 0 CHECK (stock_kafe >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Stock Movements
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES items(id) ON DELETE RESTRICT,
  type movement_type NOT NULL,
  quantity NUMERIC NOT NULL,
  note TEXT,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Menus
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  hpp_dasar NUMERIC NOT NULL DEFAULT 0,
  hpp_pokok NUMERIC NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Recipes (BOM)
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id) ON DELETE RESTRICT,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cashier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Transaction Details
CREATE TABLE transaction_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  menu_id UUID REFERENCES menus(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC NOT NULL DEFAULT 0,
  hpp_total NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Income
CREATE TABLE income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source income_source NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  reference_id UUID, -- Can link to transactions.id
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category expense_category NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Helper Function to check role
CREATE OR REPLACE FUNCTION check_user_role(required_roles user_role[])
RETURNS BOOLEAN AS $$
DECLARE
  user_current_role user_role;
BEGIN
  SELECT role INTO user_current_role FROM profiles WHERE id = auth.uid();
  RETURN user_current_role = ANY(required_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can read their own profile, Super Admin can read all
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Super Admin can manage all profiles" ON profiles FOR ALL USING (check_user_role(ARRAY['super_admin'::user_role]));

-- Items, Menus, Recipes: Admin & Super Admin can manage. Kasir can read.
CREATE POLICY "Kasir can read items" ON items FOR SELECT USING (true);
CREATE POLICY "Admin can manage items" ON items FOR ALL USING (check_user_role(ARRAY['super_admin'::user_role, 'admin'::user_role]));

CREATE POLICY "Kasir can read menus" ON menus FOR SELECT USING (true);
CREATE POLICY "Admin can manage menus" ON menus FOR ALL USING (check_user_role(ARRAY['super_admin'::user_role, 'admin'::user_role]));

CREATE POLICY "Kasir can read recipes" ON recipes FOR SELECT USING (true);
CREATE POLICY "Admin can manage recipes" ON recipes FOR ALL USING (check_user_role(ARRAY['super_admin'::user_role, 'admin'::user_role]));

-- Transactions: Kasir can insert & select. Admin & Super Admin can manage.
CREATE POLICY "Kasir can create transactions" ON transactions FOR INSERT WITH CHECK (check_user_role(ARRAY['super_admin'::user_role, 'admin'::user_role, 'kasir'::user_role]));
CREATE POLICY "Kasir can read transactions" ON transactions FOR SELECT USING (true);

CREATE POLICY "Kasir can create transaction details" ON transaction_details FOR INSERT WITH CHECK (check_user_role(ARRAY['super_admin'::user_role, 'admin'::user_role, 'kasir'::user_role]));
CREATE POLICY "Kasir can read transaction details" ON transaction_details FOR SELECT USING (true);

-- Income & Expenses: Admin & Super Admin can manage.
CREATE POLICY "Kasir can insert income" ON income FOR INSERT WITH CHECK (check_user_role(ARRAY['super_admin'::user_role, 'admin'::user_role, 'kasir'::user_role]));
CREATE POLICY "Admin can manage income" ON income FOR ALL USING (check_user_role(ARRAY['super_admin'::user_role, 'admin'::user_role]));

CREATE POLICY "Admin can manage expenses" ON expenses FOR ALL USING (check_user_role(ARRAY['super_admin'::user_role, 'admin'::user_role]));

-- Stock Movements: Admin & Super Admin can manage. Kasir can only read.
CREATE POLICY "Kasir can read stock_movements" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Kasir can insert stock_movements (sales)" ON stock_movements FOR INSERT WITH CHECK (check_user_role(ARRAY['super_admin'::user_role, 'admin'::user_role, 'kasir'::user_role]));
CREATE POLICY "Admin can manage stock_movements" ON stock_movements FOR ALL USING (check_user_role(ARRAY['super_admin'::user_role, 'admin'::user_role]));


-- ==========================================
-- RPC FUNCTIONS
-- ==========================================

-- Function: process_transaction
-- Handles checkout atomically: validates stock, reduces stock_kafe, inserts transaction & details, logs income
CREATE OR REPLACE FUNCTION process_transaction(
  p_cashier_id UUID,
  p_total_amount NUMERIC,
  p_payment_method TEXT,
  p_items JSONB -- Array of { menu_id, quantity, subtotal, hpp_total }
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_item JSONB;
  v_recipe RECORD;
  v_menu_id UUID;
  v_qty INTEGER;
  v_subtotal NUMERIC;
  v_hpp_total NUMERIC;
  v_stock_kafe NUMERIC;
BEGIN
  -- 1. Loop through items to validate stock first
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_menu_id := (v_item->>'menu_id')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;

    -- Get all recipes for this menu
    FOR v_recipe IN SELECT item_id, quantity FROM recipes WHERE menu_id = v_menu_id
    LOOP
      -- Check stock_kafe for each item in recipe
      SELECT stock_kafe INTO v_stock_kafe FROM items WHERE id = v_recipe.item_id FOR UPDATE;

      IF v_stock_kafe < (v_recipe.quantity * v_qty) THEN
        RAISE EXCEPTION 'Stok tidak mencukupi untuk bahan ID % pada menu ID %', v_recipe.item_id, v_menu_id;
      END IF;
    END LOOP;
  END LOOP;

  -- 2. Insert transaction
  INSERT INTO transactions (cashier_id, total_amount, payment_method)
  VALUES (p_cashier_id, p_total_amount, p_payment_method)
  RETURNING id INTO v_transaction_id;

  -- 3. Loop through items to reduce stock and insert details
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_menu_id := (v_item->>'menu_id')::UUID;
    v_qty := (v_item->>'quantity')::INTEGER;
    v_subtotal := (v_item->>'subtotal')::NUMERIC;
    v_hpp_total := (v_item->>'hpp_total')::NUMERIC;

    -- Insert transaction detail
    INSERT INTO transaction_details (transaction_id, menu_id, quantity, subtotal, hpp_total)
    VALUES (v_transaction_id, v_menu_id, v_qty, v_subtotal, v_hpp_total);

    -- Reduce stock and log movement
    FOR v_recipe IN SELECT item_id, quantity FROM recipes WHERE menu_id = v_menu_id
    LOOP
      -- Reduce stock_kafe
      UPDATE items
      SET stock_kafe = stock_kafe - (v_recipe.quantity * v_qty),
          updated_at = NOW()
      WHERE id = v_recipe.item_id;

      -- Insert stock movement
      INSERT INTO stock_movements (item_id, type, quantity, note, user_id)
      VALUES (v_recipe.item_id, 'sale', (v_recipe.quantity * v_qty), 'Pengurangan dari transaksi ' || v_transaction_id, p_cashier_id);
    END LOOP;
  END LOOP;

  -- 4. Insert Income
  INSERT INTO income (source, amount, reference_id, note)
  VALUES ('transaction', p_total_amount, v_transaction_id, 'Pemasukan dari Kasir');

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
