// src/services/supabaseApi.js
import { supabase } from './supabaseClient';

// ============================================
// AUTHENTICATION
// ============================================

export const login = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Ambil profile dari tabel profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const userData = {
      id: data.user.id,
      email: data.user.email,
      full_name: profile?.full_name || data.user.email?.split('@')[0],
      role: profile?.role || 'customer',
    };

    localStorage.setItem('token', data.session.access_token);
    localStorage.setItem('user', JSON.stringify(userData));

    return { success: true, data: userData, token: data.session.access_token };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
};

export const register = async (email, password, fullName, role = 'customer') => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) throw error;

    return {
      success: true,
      data: {
        id: data.user.id,
        email: email,
        full_name: fullName,
        role: role,
      },
    };
  } catch (error) {
    console.error('Register error:', error);
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const userData = {
        id: data.user.id,
        email: data.user.email,
        full_name: profile?.full_name || data.user.email?.split('@')[0],
        role: profile?.role || 'customer',
      };
      return { success: true, data: userData };
    }
    return { success: false, data: null };
  } catch (error) {
    return { success: false, data: null };
  }
};

export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role === 'admin';
};

// ============================================
// PRODUCTS
// ============================================

export const getProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: { success: true, data: data } };
  } catch (error) {
    console.error('Get products error:', error);
    return { data: { success: false, data: [] } };
  }
};

export const getProductById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: { success: true, data: data } };
  } catch (error) {
    console.error('Get product error:', error);
    return { data: { success: false, data: null } };
  }
};

// ============================================
// COMBOS
// ============================================

export const getCombos = async () => {
  try {
    const { data, error } = await supabase
      .from('combos')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: { success: true, data: data } };
  } catch (error) {
    console.error('Get combos error:', error);
    return { data: { success: false, data: [] } };
  }
};

export const getComboById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('combos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return { data: { success: true, data: data } };
  } catch (error) {
    console.error('Get combo error:', error);
    return { data: { success: false, data: null } };
  }
};

// ============================================
// BANNERS
// ============================================

export const getBanners = async () => {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (error) throw error;
    return { data: { success: true, data: data } };
  } catch (error) {
    console.error('Get banners error:', error);
    return { data: { success: false, data: [] } };
  }
};

// ============================================
// TESTIMONIALS
// ============================================

export const getTestimonials = async () => {
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data: { success: true, data: data } };
  } catch (error) {
    console.error('Get testimonials error:', error);
    return { data: { success: false, data: [] } };
  }
};

// ============================================
// STORE INFO
// ============================================

export const getStoreInfo = async () => {
  try {
    const { data, error } = await supabase
      .from('store_settings')
      .select('*')
      .maybeSingle();  // Ganti .single() jadi .maybeSingle()

    if (error) throw error;
    
    // Kalo data kosong, return default
    if (!data) {
      return {
        data: {
          success: true,
          data: {
            operational_hours: "15.00 - Sold Out",
            address: "Jl. Hangtuah (Depan Plaza Kado), Pekanbaru, Riau",
            phone: "+62 813 7823 7282",
            delivery_partners: ["GoFood", "ShopeeFood"],
          },
        },
      };
    }
    
    return { data: { success: true, data: data } };
  } catch (error) {
    console.error("Get store info error:", error);
    // Return default data kalo error
    return {
      data: {
        success: true,
        data: {
          operational_hours: "15.00 - Sold Out",
          address: "Jl. Hangtuah (Depan Plaza Kado), Pekanbaru, Riau",
          phone: "+62 813 7823 7282",
          delivery_partners: ["GoFood", "ShopeeFood"],
        },
      },
    };
  }
};

// ============================================
// HOME DATA (Gabungan)
// ============================================

export const getHomeData = async () => {
  try {
    const [bannersRes, testimonialsRes, storeInfoRes] = await Promise.all([
      getBanners(),
      getTestimonials(),
      getStoreInfo(),
    ]);

    return {
      data: {
        success: true,
        data: {
          banners: bannersRes.data.data || [],
          testimonials: testimonialsRes.data.data || [],
          store_info: storeInfoRes.data.data,
        },
      },
    };
  } catch (error) {
    console.error('Get home data error:', error);
    return {
      data: {
        success: false,
        data: {
          banners: [],
          testimonials: [],
          store_info: null,
        },
      },
    };
  }
};

// ============================================
// CART
// ============================================

export const getCart = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('carts')
      .select('*, products(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return { data: { success: true, data: { items: data } } };
  } catch (error) {
    console.error('Get cart error:', error);
    return { data: { success: false, data: { items: [] } } };
  }
};

export const addToCart = async (userId, productId, quantity) => {
  try {
    // Cek apakah sudah ada
    const { data: existing } = await supabase
      .from('carts')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      // Update quantity
      const { data, error } = await supabase
        .from('carts')
        .update({ quantity: existing.quantity + quantity })
        .eq('id', existing.id)
        .select();

      if (error) throw error;
      return { data: { success: true, data: data } };
    } else {
      // Insert baru
      const { data, error } = await supabase
        .from('carts')
        .insert([{ user_id: userId, product_id: productId, quantity: quantity }])
        .select();

      if (error) throw error;
      return { data: { success: true, data: data } };
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    return { data: { success: false } };
  }
};

export const updateCartItem = async (cartId, quantity) => {
  try {
    const { error } = await supabase
      .from('carts')
      .update({ quantity: quantity })
      .eq('id', cartId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Update cart error:', error);
    return { success: false };
  }
};

export const removeFromCart = async (cartId) => {
  try {
    const { error } = await supabase
      .from('carts')
      .delete()
      .eq('id', cartId);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Remove from cart error:', error);
    return { success: false };
  }
};

// ============================================
// COMPLAINTS
// ============================================

export const submitComplaint = async (complaintData) => {
  try {
    const { data, error } = await supabase
      .from('complaints')
      .insert([complaintData])
      .select();

    if (error) throw error;
    return { data: { success: true, data: data[0] } };
  } catch (error) {
    console.error('Submit complaint error:', error);
    return { data: { success: false } };
  }
};