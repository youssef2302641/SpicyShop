document.addEventListener('DOMContentLoaded', function() {
  const authForm = document.getElementById('authForm');
  const authTitle = document.getElementById('authTitle');
  const authSubtitle = document.getElementById('authSubtitle');
  const submitBtn = document.getElementById('submitBtn');
  const switchAuth = document.getElementById('switchAuth');
  const switchText = document.getElementById('switchText');
  const nameGroup = document.getElementById('nameGroup');
  const confirmPasswordGroup = document.getElementById('confirmPasswordGroup');
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  const rememberCheckbox = document.getElementById('remember');

  let isLogin = true;

  // Toggle password visibility
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.parentElement.querySelector('input');
      const icon = this.querySelector('ion-icon');
      
      if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('name', 'eye-off-outline');
      } else {
        input.type = 'password';
        icon.setAttribute('name', 'eye-outline');
      }
    });
  });

  // Switch between login and signup
  switchAuth.addEventListener('click', function(e) {
    e.preventDefault();
    isLogin = !isLogin;
    
    // Update form fields
    nameGroup.style.display = isLogin ? 'block' : 'none';
    confirmPasswordGroup.style.display = isLogin ? 'block' : 'none';
    
    // Update text content
    authTitle.textContent = isLogin ? 'Login' : 'Sign Up';
    authSubtitle.textContent = isLogin ? 
      'Welcome back! Please enter your details.' : 
      'Create an account to get started.';
    submitBtn.textContent = isLogin ? 'Login' : 'Sign Up';
    switchText.innerHTML = isLogin ? 
      'Don\'t have an account? <a href="#" id="switchAuth">Sign up</a>' : 
      'Already have an account? <a href="#" id="switchAuth">Login</a>';
    
    // Update form validation
    const nameInput = document.getElementById('name');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    nameInput.required = !isLogin;
    confirmPasswordInput.required = !isLogin;
  });

  // Handle form submission
  submitBtn.addEventListener('click', function() {
    const isLogin = nameGroup.style.display === 'none';
    
    if (isLogin) {
      handleLogin();
    } else {
      handleSignup();
    }
  });

  // Check for remembered user
  const rememberedEmail = localStorage.getItem('rememberedEmail');
  if (rememberedEmail) {
    document.getElementById('email').value = rememberedEmail;
    rememberCheckbox.checked = true;
  }

  function handleLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Store current user
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      // Remember email if checkbox is checked
      if (remember) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Redirect based on user role
      if (user.isAdmin) {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'index.html';
      }
    } else {
      alert('Invalid email or password');
    }
  }

  function handleSignup() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
      alert('Email already registered');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      isAdmin: false
    };

    // Add to users array
    users.push(newUser);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Store current user
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    // Redirect to home page
    window.location.href = 'index.html';
  }
}); 