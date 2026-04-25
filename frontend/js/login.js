document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('loginPassword')?.addEventListener('keypress', e => { 
    if(e.key === 'Enter') handleLogin(); 
  });
});

async function handleLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) { toast.error('Please fill in all fields'); return; }
  
  const btn = document.getElementById('loginBtn');
  btn.disabled = true; 
  btn.textContent = 'Signing in...';
  
  try {
    const data = await api.post('/auth/login', { email, password });
    api.setAuth(data.token, data.user);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    window.location.href = '/dashboard.html';
  } catch (err) {
    toast.error(err.message);
    btn.disabled = false; 
    btn.textContent = 'Sign In';
  }
}
