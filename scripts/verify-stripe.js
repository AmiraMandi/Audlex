#!/usr/bin/env node

/**
 * Script de verificación de configuración de Stripe
 * Verifica que todas las variables de entorno y configuración están correctas
 */

const https = require('https');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark() {
  return `${colors.green}✓${colors.reset}`;
}

function cross() {
  return `${colors.red}✗${colors.reset}`;
}

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

const requiredVars = [
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_STARTER',
  'STRIPE_PRICE_BUSINESS',
  'STRIPE_PRICE_ENTERPRISE',
  'STRIPE_PRICE_CONSULTORA',
];

log('\n===========================================', 'blue');
log('🔍 VERIFICACIÓN DE CONFIGURACIÓN DE STRIPE', 'bold');
log('===========================================\n', 'blue');

let errors = 0;
let warnings = 0;

// 1. Verificar variables de entorno
log('1️⃣  Verificando variables de entorno...', 'bold');

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (!value) {
    log(`  ${cross()} ${varName} - NO DEFINIDA`, 'red');
    errors++;
  } else if (value.includes('xxx') || value === 'your-key-here') {
    log(`  ${cross()} ${varName} - Placeholder detectado (no configurada)`, 'yellow');
    warnings++;
  } else {
    // Ocultar la mayor parte de la clave por seguridad
    const masked = value.substring(0, 12) + '...' + value.substring(value.length - 4);
    log(`  ${checkmark()} ${varName} = ${masked}`);
  }
});

// 2. Verificar formato de las claves
log('\n2️⃣  Verificando formato de claves...', 'bold');

const secretKey = process.env.STRIPE_SECRET_KEY || '';
const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Detectar modo (test vs live)
const isTestMode = secretKey.startsWith('sk_test_') || publishableKey.startsWith('pk_test_');
const isLiveMode = secretKey.startsWith('sk_live_') || publishableKey.startsWith('pk_live_');

if (isTestMode) {
  log(`  ${checkmark()} Modo: TEST (desarrollo)`, 'green');
} else if (isLiveMode) {
  log(`  ${checkmark()} Modo: LIVE (producción)`, 'yellow');
} else {
  log(`  ${cross()} Formato de clave inválido`, 'red');
  errors++;
}

// Verificar consistencia entre claves
if (secretKey.includes('test') && publishableKey.includes('live')) {
  log(`  ${cross()} INCONSISTENCIA: Secret key es TEST pero Publishable key es LIVE`, 'red');
  errors++;
} else if (secretKey.includes('live') && publishableKey.includes('test')) {
  log(`  ${cross()} INCONSISTENCIA: Secret key es LIVE pero Publishable key es TEST`, 'red');
  errors++;
} else {
  log(`  ${checkmark()} Claves consistentes (ambas test o ambas live)`);
}

// Verificar formato de Price IDs
log('\n3️⃣  Verificando Price IDs...', 'bold');

const priceIds = {
  STARTER: process.env.STRIPE_PRICE_STARTER,
  BUSINESS: process.env.STRIPE_PRICE_BUSINESS,
  ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE,
  CONSULTORA: process.env.STRIPE_PRICE_CONSULTORA,
};

Object.entries(priceIds).forEach(([name, priceId]) => {
  if (!priceId) {
    log(`  ${cross()} ${name} - No definido`, 'red');
    errors++;
  } else if (!priceId.startsWith('price_')) {
    log(`  ${cross()} ${name} - Formato inválido (debe empezar con 'price_')`, 'red');
    errors++;
  } else {
    log(`  ${checkmark()} ${name} = ${priceId}`);
  }
});

// 4. Verificar webhook secret
log('\n4️⃣  Verificando Webhook Secret...', 'bold');

if (!webhookSecret) {
  log(`  ${cross()} Webhook secret no definido`, 'red');
  errors++;
} else if (!webhookSecret.startsWith('whsec_')) {
  log(`  ${cross()} Formato inválido (debe empezar con 'whsec_')`, 'red');
  errors++;
} else {
  log(`  ${checkmark()} Webhook secret configurado`);
}

// 5. Test de conexión con Stripe API (opcional)
if (secretKey && secretKey.startsWith('sk_')) {
  log('\n5️⃣  Probando conexión con Stripe API...', 'bold');
  
  const options = {
    hostname: 'api.stripe.com',
    path: '/v1/products?limit=4',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
    },
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        try {
          const products = JSON.parse(data);
          log(`  ${checkmark()} Conexión exitosa`);
          log(`  ${checkmark()} Productos encontrados: ${products.data.length}`);
          
          if (products.data.length < 4) {
            log(`  ⚠️  Solo se encontraron ${products.data.length} productos. Se esperan 4.`, 'yellow');
            warnings++;
          }

          // Mostrar resumen final
          showSummary();
        } catch (e) {
          log(`  ${cross()} Error parseando respuesta`, 'red');
          errors++;
          showSummary();
        }
      } else {
        log(`  ${cross()} Error de autenticación (código ${res.statusCode})`, 'red');
        log(`  Verifica que tu STRIPE_SECRET_KEY sea correcta`, 'yellow');
        errors++;
        showSummary();
      }
    });
  });

  req.on('error', (e) => {
    log(`  ${cross()} Error de conexión: ${e.message}`, 'red');
    errors++;
    showSummary();
  });

  req.end();
} else {
  log('\n5️⃣  Test de API omitido (clave no configurada)', 'yellow');
  showSummary();
}

function showSummary() {
  log('\n===========================================', 'blue');
  log('📊 RESUMEN', 'bold');
  log('===========================================', 'blue');

  if (errors === 0 && warnings === 0) {
    log(`\n${checkmark()} ${checkmark()} ${checkmark()} TODO CORRECTO ${checkmark()} ${checkmark()} ${checkmark()}`, 'green');
    log('\n✨ Tu configuración de Stripe está lista para usar.\n', 'green');
    process.exit(0);
  } else if (errors === 0 && warnings > 0) {
    log(`\n⚠️  ${warnings} advertencia(s) encontrada(s)`, 'yellow');
    log('Revisa las advertencias arriba.\n', 'yellow');
    process.exit(0);
  } else {
    log(`\n${cross()} ${errors} error(es) encontrado(s)`, 'red');
    if (warnings > 0) {
      log(`⚠️  ${warnings} advertencia(s) encontrada(s)`, 'yellow');
    }
    log('\n❌ Corrige los errores antes de continuar.', 'red');
    log('📖 Ver STRIPE_SETUP.md para instrucciones.\n', 'blue');
    process.exit(1);
  }
}
