const isProd = () => process.env.NODE_ENV === 'production';

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: isProd(),
  sameSite: isProd() ? 'strict' : 'lax',
});

export const setAuthCookies = (res, accessToken, refreshToken) => {
  const base = baseCookieOptions();
  res.cookie('accessToken', accessToken, {
    ...base,
    path: '/',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    ...base,
    path: '/api/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res) => {
  const base = baseCookieOptions();
  res.clearCookie('accessToken', { ...base, path: '/' });
  res.clearCookie('refreshToken', { ...base, path: '/api/auth' });
};
