-- マイグレーション: favoritesテーブルに保有株式数を追加
-- 作成日: 2024-12-02
-- 説明: favoritesテーブルにshares_holdカラムを追加して、ユーザーの保有株式数を管理できるようにする

-- 1. favoritesテーブルにshares_heldカラムを追加
ALTER TABLE favorites 
ADD COLUMN shares_hold INTEGER DEFAULT 100 CHECK (shares_hold > 0);

-- 2. 既存データの更新（デフォルト値を100株に設定）
UPDATE favorites 
SET shares_hold = 100 
WHERE shares_hold IS NULL;

-- 3. shares_heldカラムをNOT NULLに変更
ALTER TABLE favorites 
ALTER COLUMN shares_hold SET NOT NULL;

-- 4. コメントを追加
COMMENT ON COLUMN favorites.shares_hold IS '保有株式数（株）';

-- 5. インデックスの追加（パフォーマンス向上のため）
CREATE INDEX idx_favorites_shares_hold ON favorites(shares_hold);

-- 6. 既存のRLSポリシーはそのまま有効（shares_holdカラムも含まれる）

-- 7. 更新日時を自動更新するトリガーを追加
CREATE TRIGGER update_favorites_updated_at BEFORE UPDATE ON favorites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. favoritesテーブルにupdated_atカラムを追加（まだ存在しない場合）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'favorites' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE favorites ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 9. 検証クエリ（マイグレーション後の確認用）
-- SELECT 
--     table_name, 
--     column_name, 
--     data_type, 
--     is_nullable, 
--     column_default
-- FROM information_schema.columns 
-- WHERE table_name = 'favorites' 
-- ORDER BY ordinal_position; 