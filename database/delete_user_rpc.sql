-- JALANKAN KODE INI DI SQL EDITOR SUPABASE

CREATE OR REPLACE FUNCTION delete_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Pastikan yang mengeksekusi adalah super_admin
  IF NOT check_user_role(ARRAY['super_admin'::user_role]) THEN
    RAISE EXCEPTION 'Unauthorized: Only super_admin can delete users';
  END IF;

  -- Hapus dari auth.users (akan otomatis menghapus data di tabel profiles karena ada aturan ON DELETE CASCADE)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
