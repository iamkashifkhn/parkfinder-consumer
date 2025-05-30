import { User, UserRole } from '@/types/user'
import axios, { AxiosError } from 'axios';



const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://parkfinder-backend-piinu.ondigitalocean.app";

// Helper function to generate a secure random password
const generateSecurePassword = (): string => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  
  // Ensure at least one of each character type
  password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
  password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
  password += "0123456789"[Math.floor(Math.random() * 10)];
  password += "!@#$%^&*()_+"[Math.floor(Math.random() * 12)];
  
  // Fill the rest of the password
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

export const authService = {
  // Register new user with auto-generated credentials
  signup: async (fullName: string, email: string, role: UserRole = 'consumer'): Promise<{ user: User, generatedPassword: string }> => {
    try {
      // Generate a secure password
      const generatedPassword = generateSecurePassword();
      
      const response = await axios.post(`${API_URL}/auth/signup`, {
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        email,
        password: generatedPassword,
        userType: role.toUpperCase()
      });
      
      const data = response.data;
      
      // Store user in localStorage
      const userForStorage = {
        id: data.user.id,
        fullName: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: mapUserTypeToRole(data.user.userType),
      };
      
      localStorage.setItem('user', JSON.stringify(userForStorage));
      
      return { 
        user: userForStorage as User,
        generatedPassword
      };
    } catch (error) {
      console.error('Signup error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw error;
    }
  },
  
  // Register new user with custom password
  signupWithPassword: async (fullName: string, email: string, password: string, role: UserRole = 'consumer'): Promise<User> => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' ') || '',
        email,
        password,
        userType: role.toUpperCase()
      });
      
      const data = response.data;
      
      // Store user in localStorage
      const userForStorage = {
        id: data.user.id,
        fullName: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: mapUserTypeToRole(data.user.userType),
      };
      
      localStorage.setItem('user', JSON.stringify(userForStorage));
      
      return userForStorage as User;
    } catch (error: unknown) {
      console.error('Signup error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Registration failed');
      }
      throw error;
    }
  },

  // Login user with role restriction (admin & provider only)
  login: async (email: string, password: string, source?: 'consumer' | 'admin'): Promise<User> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { 
        email, 
        password 
      });
      
      const data = response.data;
      
      // Map the API response structure to our User type
      const userForStorage = {
        id: data.user.id,
        fullName: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: mapUserTypeToRole(data.user.userType),
        isEmailVerified: data.user.isEmailVerified
      };
      
      // Enforce role-based restrictions based on the source
      if (source === 'consumer' && userForStorage.role !== 'consumer') {
        throw new Error('Access denied. This login is only for consumers.');
      }
      if (source === 'admin' && userForStorage.role === 'consumer') {
        throw new Error('Access denied. This login is only for administrators and providers.');
      }

      // Only save to localStorage if email is verified
      if (data.user.isEmailVerified) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(userForStorage));
      }
      
      return userForStorage as User;
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Invalid credentials');
      }
      throw error;
    }
  },

  // Consumer login for header component (consumer role only)
  consumerLogin: async (email: string, password: string): Promise<User> => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      
      const data = response.data;
      
      // Check if the user is a consumer
      const role = mapUserTypeToRole(data.user.userType);
      if (role !== 'consumer') {
        throw new Error('Access denied. This login is only for consumers. Administrators and providers should use the admin portal.');
      }
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // Map the API response structure to our User type
      const userForStorage = {
        id: data.user.id,
        fullName: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role,
      };
      
      localStorage.setItem('user', JSON.stringify(userForStorage));
      
      return userForStorage as User;
    } catch (error: unknown) {
      console.error('Login error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Invalid credentials');
      }
      throw error;
    }
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get access token
  getAccessToken: () => {
    return localStorage.getItem('access_token');
  },

  // Get refresh token
  getRefreshToken: () => {
    return localStorage.getItem('refresh_token');
  },

  // Logout user
  logout: async () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Reset password
  requestPasswordReset: async (email: string): Promise<boolean> => {
    try {
      await axios.post(`${API_URL}/auth/request-password-reset`, {
        email
      });
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Password reset failed');
      }
      throw error;
    }
  },

  // Reset password with token
  resetPassword: async (token: string, newPassword: string): Promise<boolean> => {
    try {
      await axios.post(`${API_URL}/auth/reset-password`, {
        token,
        newPassword
      });
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Password reset failed');
      }
      throw error;
    }
  },

  // Google Sign In
  googleSignIn: async (role: UserRole = 'consumer'): Promise<User> => {
    try {
      // In a real implementation, this would involve Google OAuth
      // Here we're mocking the response from a Google OAuth login API
      
      const response = await axios.post(`${API_URL}/auth/google-login`, {
        userType: role.toUpperCase()
      });
      
      const data = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      
      // Map the API response structure to our User type
      const userForStorage = {
        id: data.user.id,
        fullName: `${data.user.firstName} ${data.user.lastName}`,
        email: data.user.email,
        role: mapUserTypeToRole(data.user.userType),
      };
      
      localStorage.setItem('user', JSON.stringify(userForStorage));
      
      return userForStorage as User;
    } catch (error: unknown) {
      console.error('Google sign in error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Google sign in failed');
      }
      throw error;
    }
  },
  
  // Change user role
  changeUserRole: async (userId: string, newRole: UserRole): Promise<User | null> => {
    try {
      const response = await axios.put(`${API_URL}/users/${userId}/role`, {
        role: newRole.toUpperCase()
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const data = response.data;
      
      // Update localStorage if this is the current user
      const currentUser = authService.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        const userForStorage = {
          id: data.id,
          fullName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          role: mapUserTypeToRole(data.userType),
        };
        localStorage.setItem('user', JSON.stringify(userForStorage));
        return userForStorage as User;
      }
      
      return null;
    } catch (error: unknown) {
      console.error('Change role error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Role change failed');
      }
      throw error;
    }
  },
  
  // Get all users (admin only function)
  getAllUsers: async (): Promise<User[]> => {
    try {
      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      // Map API response to our User interface
      return response.data.map((user: Record<string, unknown>) => ({
        id: user.id as string,
        fullName: `${user.firstName as string} ${user.lastName as string}`,
        email: user.email as string,
        role: mapUserTypeToRole(user.userType as string)
      })) as User[];
    } catch (error) {
      console.error('Get users error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch users');
      }
      throw error;
    }
  },

  async forgotPassword(email: string) {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, { email });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await axios.post(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      return true;
    } catch (error: unknown) {
      console.error('Change password error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to change password');
      }
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (data: { firstName: string; lastName: string; phoneNumber?: string }): Promise<User> => {
    try {
      const response = await axios.patch(`${API_URL}/users/me`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const updatedData = response.data;
      const userForStorage = {
        id: updatedData.id,
        email: updatedData.email,
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        phoneNumber: updatedData.phoneNumber,
        role: mapUserTypeToRole(updatedData.userType),
      };

      localStorage.setItem('user', JSON.stringify(userForStorage));
      
      return {
        ...userForStorage,
        fullName: `${updatedData.firstName} ${updatedData.lastName}`,
        password: ''
      } as User;
    } catch (error: unknown) {
      console.error('Update profile error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to update profile');
      }
      throw error;
    }
  },

  // Get current user details from API
  getMe: async (): Promise<User> => {
    try {
      const response = await axios.get(`${API_URL}/users/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const data = response.data;
      
      // Map the API response structure to our User type
      const userForStorage = {
        id: data.id,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        role: mapUserTypeToRole(data.userType),
      };

      // Update localStorage with fresh user data
      localStorage.setItem('user', JSON.stringify(userForStorage));
      
      return {
        ...userForStorage,
        fullName: `${data.firstName} ${data.lastName}`,
        password: ''
      } as User;
    } catch (error: unknown) {
      console.error('Get me error:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Failed to fetch user details');
      }
      throw error;
    }
  },
};

// Helper function to map API userType to application role
const mapUserTypeToRole = (userType: string): UserRole => {
  const typeMap: Record<string, UserRole> = {
    'SUPER_ADMIN': 'admin',
    'ADMIN': 'admin',
    'PROVIDER': 'provider',
    'USER': 'consumer',
    'CUSTOMER': 'consumer'
  };
  
  return typeMap[userType] || 'consumer';
}; 