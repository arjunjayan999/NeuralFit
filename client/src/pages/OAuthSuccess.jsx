import AppLoader from '../components/AppLoader';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from "../api/client";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const exchange = async () => {
      const exchangeToken = searchParams.get('exchangeToken');

      if (!exchangeToken) {
        navigate('/login');
        return;
      }
      window.history.replaceState({}, document.title, '/oauth/success');
      try {
        const data = await api.post('/auth/oauth/exchange', {
          exchangeToken
        });
        login(data.data.user);
      } catch (err) {
        console.error('Error during OAuth token exchange:', err);
        navigate('/login');
      }
    };

    exchange();
  }, [navigate, searchParams]);

  return <AppLoader />;
}