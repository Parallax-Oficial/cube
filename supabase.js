// =====================================================
// CONFIGURACIÓN — Proyecto CUBE
// =====================================================
const SUPABASE_URL = 'https://ziozmghwqjoqmhuzsnan.supabase.co';
const SUPABASE_CLAVE_PUBLICA = 'sb_publishable_kIj6qqFRBpeq59bI39DeQg_WWWuvFRt';
// =====================================================

const { createClient } = supabase;
const supabase = createClient(SUPABASE_URL, SUPABASE_CLAVE_PUBLICA);

/**
 * Registrar usuario
 * El perfil se crea automáticamente con tu trigger en Supabase
 */
async function registrarUsuario(usuario, email, clave) {
  if (!usuario || !email || !clave) {
    return { exito: false, texto: 'Completa todos los campos.' };
  }
  if (clave.length < 6) {
    return { exito: false, texto: 'La contraseña debe tener al menos 6 caracteres.' };
  }
  if (usuario.length < 2) {
    return { exito: false, texto: 'El nombre de usuario es demasiado corto.' };
  }

  try {
    // Verificar que el nombre de usuario no esté en uso
    const { data: existente, error: errBusq } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', usuario)
      .maybeSingle();

    if (existente) {
      return { exito: false, texto: 'Ese nombre de usuario ya está en uso.' };
    }

    // Crear usuario en Auth con el username en los metadatos
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: clave,
      options: {
        data: { username: usuario }
      }
    });

    if (error) throw error;

    return {
      exito: true,
      texto: '✅ ¡Cuenta creada! Revisa tu correo para verificarlo.'
    };

  } catch (err) {
    console.error('Error registro:', err.message);
    let mensaje = '❌ No pudimos crear tu cuenta. Inténtalo de nuevo.';
    if (err.message.includes('email')) mensaje = '❌ El correo no es válido o ya está registrado.';
    if (err.message.includes('password')) mensaje = '❌ La contraseña es muy débil (mínimo 6 caracteres).';
    return { exito: false, texto: mensaje };
  }
}

/**
 * Iniciar sesión: busca el correo según el nombre de usuario, luego inicia sesión
 */
async function iniciarSesion(usuario, clave) {
  if (!usuario || !clave) {
    return { exito: false, texto: 'Completa todos los campos.' };
  }

  try {
    // 1. Buscar el correo asociado al nombre de usuario
    const { data: perfil, error: errPerfil } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', usuario)
      .maybeSingle();

    if (!perfil) {
      return { exito: false, texto: '❌ Nombre de usuario o contraseña incorrectos.' };
    }

    // 2. Iniciar sesión con ese correo
    const { data, error } = await supabase.auth.signInWithPassword({
      email: perfil.email,
      password: clave
    });

    if (error) throw error;

    return { exito: true, texto: '✅ ¡Bienvenido de nuevo!' };

  } catch (err) {
    console.error('Error inicio sesión:', err.message);
    return {
      exito: false,
      texto: '❌ Nombre de usuario o contraseña incorrectos.'
    };
  }
}

/** Obtener usuario actual */
async function obtenerUsuarioActual() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/** Cerrar sesión */
async function cerrarSesion() {
  await supabase.auth.signOut();
  window.location.href = 'cuenta.html';
}

// Hacer disponible globalmente
window.cubeAuth = { registrarUsuario, iniciarSesion, obtenerUsuarioActual, cerrarSesion };
