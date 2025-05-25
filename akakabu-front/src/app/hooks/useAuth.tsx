import { useEffect, useState } from "react";

const apiBaseUrl = import.meta.env.VITE_API_URL;

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [load, setLoad] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/check`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("認証確認エラー:", err);
        setUser(null);
      } finally {
        setLoad(false);
      }
    };
    checkAuth();
  }, []);

  return { user, load };
};

export default useAuth;
