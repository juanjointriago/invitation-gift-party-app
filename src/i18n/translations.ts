/**
 * Diccionario de traducciones
 * Estructura: { [idioma]: { [clave.anidada]: valor } }\n */

export const translations = {
  es: {
    // Branding global
    app: {
      name: 'PartyGifts',
      description: 'Gestiona tus fiestas y regalos de forma fácil',
      tagline: 'Invitaciones, regalos y celebraciones en un solo lugar',
    },

    // Navegación
    nav: {
      home: 'Inicio',
      myParties: 'Mis fiestas',
      dashboard: 'Dashboard',
      admin: 'Administración',
      profile: 'Perfil',
      logout: 'Cerrar sesión',
      login: 'Iniciar sesión',
      register: 'Registrarse',
    },

    // Autenticación
    auth: {
      login: 'Iniciar sesión',
      register: 'Crear cuenta',
      resetPassword: 'Restablecer contraseña',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      rememberMe: 'Recuérdame',
      forgotPassword: 'Olvidé mi contraseña',
      noAccount: '¿No tienes cuenta?',
      alreadyAccount: '¿Ya tienes cuenta?',
      signUp: 'Regístrate aquí',
      loginInstead: 'Inicia sesión aquí',
      validationEmail: 'Correo inválido',
      validationPassword: 'Mínimo 6 caracteres',
      validationPasswordMatch: 'Las contraseñas no coinciden',
    },

    // Fiestas
    party: {
      title: 'Título de la fiesta',
      description: 'Descripción',
      date: 'Fecha',
      location: 'Ubicación',
      createParty: 'Crear fiesta',
      editParty: 'Editar fiesta',
      myParties: 'Mis fiestas',
      allParties: 'Todas las fiestas',
      publishParty: 'Publicar fiesta',
      draft: 'Borrador',
      published: 'Publicada',
      archived: 'Archivada',
      noParties: 'Aún no tienes fiestas creadas',
      createdAt: 'Creada el',
      guests: 'invitados',
      questions: 'preguntas',
      gifts: 'regalos',
      viewDetails: 'Ver detalles',
      shareLink: 'Compartir enlace',
      copyLink: 'Copiar enlace',
      linkCopied: 'Enlace copiado al portapapeles',
      configureTheme: 'Configurar tema',
      configureQuestions: 'Configurar preguntas',
      configureGifts: 'Configurar regalos',
    },

    // Temas
    theme: {
      primaryColor: 'Color primario',
      secondaryColor: 'Color secundario',
      accentColor: 'Color de acento',
      backgroundColor: 'Color de fondo',
      coverImage: 'Imagen de portada',
      loginBanner: 'Banner de login',
      galleryImages: 'Fotos de la galería',
      customTexts: 'Textos personalizados',
      welcomeTitle: 'Título de bienvenida',
      welcomeSubtitle: 'Subtítulo de bienvenida',
      extraInfo: 'Información adicional',
    },

    // Preguntas
    question: {
      addQuestion: 'Agregar pregunta',
      question: 'Pregunta',
      questionText: 'Texto de la pregunta',
      questionType: 'Tipo de pregunta',
      singleChoice: 'Opción única',
      multiChoice: 'Múltiple opción',
      textAnswer: 'Texto libre',
      required: 'Requerida',
      optional: 'Opcional',
      addOption: 'Agregar opción',
      answerOptions: 'Opciones de respuesta',
      deleteQuestion: 'Eliminar pregunta',
      noQuestions: 'Sin preguntas configuradas',
    },

    // Regalos
    gift: {
      addGift: 'Agregar regalo',
      giftName: 'Nombre del regalo',
      giftDescription: 'Descripción',
      category: 'Categoría',
      maxQuantity: 'Máximo disponible',
      remainingQuantity: 'Disponibles',
      selectGift: 'Seleccionar regalo',
      giftSelected: 'Regalo seleccionado',
      giftList: 'Lista de regalos',
      noGifts: 'Sin regalos configurados',
      deleteGift: 'Eliminar regalo',
      unavailable: 'No disponible',
      remaining: 'quedan',
      toSelect: 'por seleccionar',
    },

    // Invitados
    guest: {
      confirmAttendance: 'Confirmar asistencia',
      attendanceConfirmed: 'Asistencia confirmada',
      responses: 'Respuestas',
      guestList: 'Lista de invitados',
      confirmedGuests: 'Invitados confirmados',
      selectedGifts: 'Regalos seleccionados',
      guestName: 'Nombre del invitado',
    },

    // Botones y acciones
    actions: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      add: 'Agregar',
      create: 'Crear',
      update: 'Actualizar',
      submit: 'Enviar',
      next: 'Siguiente',
      previous: 'Anterior',
      skip: 'Saltar',
      close: 'Cerrar',
      confirm: 'Confirmar',
      continue: 'Continuar',
      download: 'Descargar',
      export: 'Exportar',
      print: 'Imprimir',
      filter: 'Filtrar',
      search: 'Buscar',
      loading: 'Cargando...',
    },

    // Estados y mensajes
    states: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      warning: 'Advertencia',
      info: 'Información',
      empty: 'Sin resultados',
      noData: 'No hay datos disponibles',
      tryAgain: 'Intenta de nuevo',
      backHome: 'Volver al inicio',
    },

    // Errores
    errors: {
      fieldRequired: 'Este campo es requerido',
      invalidEmail: 'Correo electrónico inválido',
      passwordTooShort: 'Contraseña muy corta',
      passwordMismatch: 'Las contraseñas no coinciden',
      networkError: 'Error de conexión',
      notFound: 'No encontrado',
      unauthorized: 'No autorizado',
      forbidden: 'Acceso denegado',
      serverError: 'Error del servidor',
    },
  },

  en: {
    // Branding global
    app: {
      name: 'PartyGifts',
      description: 'Manage your parties and gifts easily',
      tagline: 'Invitations, gifts and celebrations in one place',
    },

    // Navigation
    nav: {
      home: 'Home',
      myParties: 'My Parties',
      dashboard: 'Dashboard',
      admin: 'Administration',
      profile: 'Profile',
      logout: 'Logout',
      login: 'Login',
      register: 'Sign Up',
    },

    // Authentication
    auth: {
      login: 'Login',
      register: 'Create Account',
      resetPassword: 'Reset Password',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      noAccount: 'Don\'t have an account?',
      alreadyAccount: 'Already have an account?',
      signUp: 'Sign up here',
      loginInstead: 'Login here',
      validationEmail: 'Invalid email',
      validationPassword: 'Minimum 6 characters',
      validationPasswordMatch: 'Passwords do not match',
    },

    // Parties
    party: {
      title: 'Party Title',
      description: 'Description',
      date: 'Date',
      location: 'Location',
      createParty: 'Create Party',
      editParty: 'Edit Party',
      myParties: 'My Parties',
      allParties: 'All Parties',
      publishParty: 'Publish Party',
      draft: 'Draft',
      published: 'Published',
      archived: 'Archived',
      noParties: 'You don\'t have any parties yet',
      createdAt: 'Created on',
      guests: 'guests',
      questions: 'questions',
      gifts: 'gifts',
      viewDetails: 'View Details',
      shareLink: 'Share Link',
      copyLink: 'Copy Link',
      linkCopied: 'Link copied to clipboard',
      configureTheme: 'Configure Theme',
      configureQuestions: 'Configure Questions',
      configureGifts: 'Configure Gifts',
    },

    // Themes
    theme: {
      primaryColor: 'Primary Color',
      secondaryColor: 'Secondary Color',
      accentColor: 'Accent Color',
      backgroundColor: 'Background Color',
      coverImage: 'Cover Image',
      loginBanner: 'Login Banner',
      galleryImages: 'Gallery Images',
      customTexts: 'Custom Texts',
      welcomeTitle: 'Welcome Title',
      welcomeSubtitle: 'Welcome Subtitle',
      extraInfo: 'Extra Information',
    },

    // Questions
    question: {
      addQuestion: 'Add Question',
      question: 'Question',
      questionText: 'Question Text',
      questionType: 'Question Type',
      singleChoice: 'Single Choice',
      multiChoice: 'Multiple Choice',
      textAnswer: 'Free Text',
      required: 'Required',
      optional: 'Optional',
      addOption: 'Add Option',
      answerOptions: 'Answer Options',
      deleteQuestion: 'Delete Question',
      noQuestions: 'No questions configured',
    },

    // Gifts
    gift: {
      addGift: 'Add Gift',
      giftName: 'Gift Name',
      giftDescription: 'Description',
      category: 'Category',
      maxQuantity: 'Max Available',
      remainingQuantity: 'Available',
      selectGift: 'Select Gift',
      giftSelected: 'Gift Selected',
      giftList: 'Gift List',
      noGifts: 'No gifts configured',
      deleteGift: 'Delete Gift',
      unavailable: 'Unavailable',
      remaining: 'remaining',
      toSelect: 'to select',
    },

    // Guests
    guest: {
      confirmAttendance: 'Confirm Attendance',
      attendanceConfirmed: 'Attendance Confirmed',
      responses: 'Responses',
      guestList: 'Guest List',
      confirmedGuests: 'Confirmed Guests',
      selectedGifts: 'Selected Gifts',
      guestName: 'Guest Name',
    },

    // Buttons and Actions
    actions: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      create: 'Create',
      update: 'Update',
      submit: 'Submit',
      next: 'Next',
      previous: 'Previous',
      skip: 'Skip',
      close: 'Close',
      confirm: 'Confirm',
      continue: 'Continue',
      download: 'Download',
      export: 'Export',
      print: 'Print',
      filter: 'Filter',
      search: 'Search',
      loading: 'Loading...',
    },

    // States and Messages
    states: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      warning: 'Warning',
      info: 'Information',
      empty: 'No results',
      noData: 'No data available',
      tryAgain: 'Try again',
      backHome: 'Back to home',
    },

    // Errors
    errors: {
      fieldRequired: 'This field is required',
      invalidEmail: 'Invalid email address',
      passwordTooShort: 'Password is too short',
      passwordMismatch: 'Passwords do not match',
      networkError: 'Network connection error',
      notFound: 'Not found',
      unauthorized: 'Unauthorized',
      forbidden: 'Access denied',
      serverError: 'Server error',
    },
  },
};

/**
 * Obtener valor de traducción por clave
 * Ejemplo: t('auth.login') -> 'Iniciar sesión'
 */
export const getTranslation = (key: string, language: 'es' | 'en' = 'es'): string => {
  const keys = key.split('.');
  let value: any = translations[language];

  for (const k of keys) {
    value = value?.[k];
    if (typeof value !== 'object' && !Array.isArray(value) && typeof value !== 'string') {
      return key; // Retornar la clave si no encuentra la traducción
    }
  }

  return typeof value === 'string' ? value : key;
};
