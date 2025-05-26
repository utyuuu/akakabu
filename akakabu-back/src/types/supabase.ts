export type Database = {
    public: {
      Tables: {
        users: {
          Row: { id: number; user_name: string; email: string; password_hash: string }; // データベースの "users" テーブル
          Insert: { name: string; email: string };
          Update: { name?: string; email?: string };
        };
      };
    };
  };