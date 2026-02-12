// lib/shipping.ts
// Shipping zones and pricing configuration for La Aldea

import { ProductShippingType } from '@/types/database';

// Shipping zones based on departments in Uruguay
export type ShippingZone = 
  | 'local'        // Tala y alrededores (gratis o muy bajo)
  | 'canelones'    // Resto de Canelones
  | 'montevideo'   // Montevideo
  | 'interior'     // Resto del país

// Departments by zone
export const DEPARTMENT_ZONES: Record<string, ShippingZone> = {
  // Local zone (Tala area)
  'Tala': 'local',
  'San Ramón': 'local',
  'San Jacinto': 'canelones',
  'Pando': 'canelones',
  'Las Piedras': 'canelones',
  'La Paz': 'canelones',
  'Sauce': 'canelones',
  'Santa Rosa': 'canelones',
  'Atlántida': 'canelones',
  'Parque del Plata': 'canelones',
  
  // Canelones department (excluding local)
  'Canelones': 'canelones',
  
  // Montevideo
  'Montevideo': 'montevideo',
  
  // Interior (all other departments)
  'Artigas': 'interior',
  'Cerro Largo': 'interior',
  'Colonia': 'interior',
  'Durazno': 'interior',
  'Flores': 'interior',
  'Florida': 'interior',
  'Lavalleja': 'interior',
  'Maldonado': 'interior',
  'Paysandú': 'interior',
  'Río Negro': 'interior',
  'Rivera': 'interior',
  'Rocha': 'interior',
  'Salto': 'interior',
  'San José': 'interior',
  'Soriano': 'interior',
  'Tacuarembó': 'interior',
  'Treinta y Tres': 'interior',
};

// DAC official rates (nationwide, varies by weight/volume)
// These are for display reference only - actual cost paid on delivery
export const DAC_RATES = [
  { label: 'Paquete pequeño', price: 250 },
  { label: '40x40x40 - hasta 10 kg', price: 330 },
  { label: '50x50x50 - hasta 15 kg', price: 370 },
  { label: '60x60x60 - hasta 20 kg', price: 450 },
  { label: '70x70x70 - hasta 25 kg', price: 500 },
  { label: '80x80x80 - hasta 30 kg', price: 600 },
  { label: 'hasta 40 kg', price: 1050 },
];

export const DAC_MIN_PRICE = 250; // Minimum DAC shipping price

// Configuration
export const SHIPPING_CONFIG = {
  // Free shipping threshold (for local delivery only)
  freeShippingThreshold: 5000,
  
  // DAC info
  dacDeliveryTime: '24-48 horas hábiles',
  dacPaymentNote: 'Se paga al recibir el paquete',
  
  // Pickup location
  pickupAddress: 'José Alonso y Trelles y Av Artigas, Tala, Canelones',
  pickupPhone: '+598 92 744 725',
};

// Helper to get zone from department/city
export function getShippingZone(department: string, city?: string): ShippingZone {
  // Check city first (for local areas within Canelones)
  if (city && DEPARTMENT_ZONES[city]) {
    return DEPARTMENT_ZONES[city];
  }
  
  // Then check department
  if (DEPARTMENT_ZONES[department]) {
    return DEPARTMENT_ZONES[department];
  }
  
  // Default to interior for unknown
  return 'interior';
}

// Determine cart shipping type (the most restrictive type wins)
export function getCartShippingType(
  cartItems: { shippingType: ProductShippingType }[]
): ProductShippingType {
  // If any item is freight, whole cart needs freight
  if (cartItems.some(item => item.shippingType === 'freight')) {
    return 'freight';
  }
  
  // If all items are pickup_only
  if (cartItems.every(item => item.shippingType === 'pickup_only')) {
    return 'pickup_only';
  }
  
  // Default to DAC
  return 'dac';
}

// Get shipping options for checkout based on cart contents
export function getShippingOptions(
  cartShippingType: ProductShippingType,
  zone: ShippingZone
): {
  canDeliver: boolean;
  canPickup: boolean;
  deliveryLabel: string;
  deliveryNote: string;
  deliveryCost: number | null; // null means "to be determined"
  requiresQuote: boolean;
} {
  // Pickup only products
  if (cartShippingType === 'pickup_only') {
    return {
      canDeliver: false,
      canPickup: true,
      deliveryLabel: 'Solo retiro en local',
      deliveryNote: 'Estos productos no se envían',
      deliveryCost: null,
      requiresQuote: false,
    };
  }
  
  // Freight (large items)
  if (cartShippingType === 'freight') {
    return {
      canDeliver: true,
      canPickup: true,
      deliveryLabel: 'Flete (productos grandes)',
      deliveryNote: 'Coordinar fecha y costo por WhatsApp',
      deliveryCost: null,
      requiresQuote: true,
    };
  }
  
  // DAC (standard shipping)
  // Local zone is free
  if (zone === 'local') {
    return {
      canDeliver: true,
      canPickup: true,
      deliveryLabel: 'Envío local gratis',
      deliveryNote: 'Entrega en zona Tala/San Ramón',
      deliveryCost: 0,
      requiresQuote: false,
    };
  }
  
  // Rest of country - DAC with payment on delivery
  return {
    canDeliver: true,
    canPickup: true,
    deliveryLabel: `Envío DAC (desde $${DAC_MIN_PRICE})`,
    deliveryNote: `${SHIPPING_CONFIG.dacDeliveryTime} - ${SHIPPING_CONFIG.dacPaymentNote}`,
    deliveryCost: null, // Customer pays on delivery
    requiresQuote: false,
  };
}

// Get all departments for dropdown
export const URUGUAY_DEPARTMENTS = [
  'Canelones',
  'Montevideo',
  'Artigas',
  'Cerro Largo',
  'Colonia',
  'Durazno',
  'Flores',
  'Florida',
  'Lavalleja',
  'Maldonado',
  'Paysandú',
  'Río Negro',
  'Rivera',
  'Rocha',
  'Salto',
  'San José',
  'Soriano',
  'Tacuarembó',
  'Treinta y Tres',
];

// Get cities for Canelones (for more granular local detection)
export const CANELONES_CITIES = [
  'Tala',
  'San Ramón',
  'San Jacinto',
  'Pando',
  'Las Piedras',
  'La Paz',
  'Sauce',
  'Santa Rosa',
  'Atlántida',
  'Parque del Plata',
  'Ciudad de la Costa',
  'Canelones (ciudad)',
  'Otra localidad',
];

// Shipping type labels for display
export const SHIPPING_TYPE_LABELS: Record<ProductShippingType, string> = {
  dac: 'Envío estándar (DAC)',
  freight: 'Flete (productos grandes)',
  pickup_only: 'Solo retiro en local',
};

// Zone labels for display
export const ZONE_LABELS: Record<ShippingZone, string> = {
  local: 'Zona local (Tala y alrededores)',
  canelones: 'Canelones',
  montevideo: 'Montevideo',
  interior: 'Interior del país',
};
