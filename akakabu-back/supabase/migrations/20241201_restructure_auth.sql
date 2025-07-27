-- 1. 既存のテーブルを削除（外部キー制約があるため順序に注意）
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS jquants_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. 基本情報(supabaseとの認証情報と連携)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ユーザープロフィール拡張テーブル(まだ実装の予定なし)
CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. J-Quantsトークンテーブル（認証情報はSupabaseで管理）
CREATE TABLE jquants_tokens (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL,
    api_token TEXT,
    plan TEXT NOT NULL DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. お気に入りテーブル
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stock_code TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    company_name TEXT NOT NULL,
    close_price NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, stock_code)
);

-- 6. 配当情報テーブル
CREATE TABLE IF NOT EXISTS dividend (
    stock_code TEXT NOT NULL,
    company_name TEXT NOT NULL,
    fiscal_year INTEGER NOT NULL,
    dividend_type TEXT,
    dividend_per_share NUMERIC CHECK (dividend_per_share IS NULL OR dividend_per_share >= 0),
    source TEXT DEFAULT 'free',
    PRIMARY KEY (stock_code, fiscal_year)
);

-- 7. インデックスの作成（パフォーマンス向上）
CREATE INDEX idx_users_user_name ON users(user_name);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_jquants_tokens_user_id ON jquants_tokens(user_id);

-- 8. Row Level Security (RLS) の設定
-- Supabaseのダッシュボードで有効化する

-- usersテーブルのRLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- user_profilesテーブルのRLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- jquants_tokensテーブルのRLS
ALTER TABLE jquants_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own tokens" ON jquants_tokens
    FOR ALL USING (auth.uid() = user_id);

-- favoritesテーブルのRLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own favorites" ON favorites
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 9. トリガー関数（updated_atの自動更新）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jquants_tokens_updated_at BEFORE UPDATE ON jquants_tokens
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. 関数：ユーザー作成時の自動プロフィール作成
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, user_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'user_name', 'User' || substr(NEW.id::text, 1, 8))
    );
    
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'user_name', 'User' || substr(NEW.id::text, 1, 8))
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成（auth.usersテーブルに新規ユーザーが作成された時）
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 11. ビューの作成（便利なクエリ用）
CREATE VIEW user_summary AS
SELECT 
    u.id,
    u.user_name,
    up.display_name,
    up.avatar_url,
    jt.plan as jquants_plan,
    COUNT(f.id) as favorite_count,
    u.created_at,
    u.updated_at
FROM users u
LEFT JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN jquants_tokens jt ON u.id = jt.user_id
LEFT JOIN favorites f ON u.id = f.user_id
GROUP BY u.id, u.user_name, up.display_name, up.avatar_url, jt.plan, u.created_at, u.updated_at;

-- ビューのRLS
ALTER VIEW user_summary SET (security_invoker = true); 