export interface SriLankaArea {
  id: string;
  name: string;
  district: string;
  latitude: number;
  longitude: number;
}

/** Curated towns/cities for manual area search — Western & major hubs first. */
export const SRI_LANKA_AREAS: SriLankaArea[] = [
  { id: 'colombo', name: 'Colombo', district: 'Colombo', latitude: 6.9271, longitude: 79.8612 },
  { id: 'dehiwala', name: 'Dehiwala-Mount Lavinia', district: 'Colombo', latitude: 6.8561, longitude: 79.8612 },
  { id: 'moratuwa', name: 'Moratuwa', district: 'Colombo', latitude: 6.773, longitude: 79.882 },
  { id: 'negombo', name: 'Negombo', district: 'Gampaha', latitude: 7.2083, longitude: 79.8358 },
  { id: 'gampaha', name: 'Gampaha', district: 'Gampaha', latitude: 7.0917, longitude: 80.0083 },
  { id: 'wattala', name: 'Wattala', district: 'Gampaha', latitude: 6.9897, longitude: 79.8917 },
  { id: 'panadura', name: 'Panadura', district: 'Kalutara', latitude: 6.7133, longitude: 79.9028 },
  { id: 'kalutara', name: 'Kalutara', district: 'Kalutara', latitude: 6.5833, longitude: 79.9667 },
  { id: 'beruwala', name: 'Beruwala', district: 'Kalutara', latitude: 6.4755, longitude: 79.9867 },
  { id: 'bentota', name: 'Bentota', district: 'Gampaha', latitude: 6.426, longitude: 80.001 },
  { id: 'horana', name: 'Horana', district: 'Kalutara', latitude: 6.715, longitude: 80.052 },
  { id: 'galle', name: 'Galle', district: 'Galle', latitude: 6.0535, longitude: 80.221 },
  { id: 'matara', name: 'Matara', district: 'Matara', latitude: 5.9549, longitude: 80.555 },
  { id: 'hambantota', name: 'Hambantota', district: 'Hambantota', latitude: 6.124, longitude: 81.118 },
  { id: 'kandy', name: 'Kandy', district: 'Kandy', latitude: 7.2906, longitude: 80.6337 },
  { id: 'kurunegala', name: 'Kurunegala', district: 'Kurunegala', latitude: 7.4863, longitude: 80.3623 },
  { id: 'anuradhapura', name: 'Anuradhapura', district: 'Anuradhapura', latitude: 8.3114, longitude: 80.4037 },
  { id: 'jaffna', name: 'Jaffna', district: 'Jaffna', latitude: 9.6615, longitude: 80.0255 },
  { id: 'trincomalee', name: 'Trincomalee', district: 'Trincomalee', latitude: 8.5874, longitude: 81.2152 },
  { id: 'batticaloa', name: 'Batticaloa', district: 'Batticaloa', latitude: 7.7102, longitude: 81.6924 },
  { id: 'ratnapura', name: 'Ratnapura', district: 'Ratnapura', latitude: 6.6828, longitude: 80.3992 },
  { id: 'badulla', name: 'Badulla', district: 'Badulla', latitude: 6.9934, longitude: 81.055 },
  { id: 'nuwara-eliya', name: 'Nuwara Eliya', district: 'Nuwara Eliya', latitude: 6.9497, longitude: 80.7891 },
  { id: 'polonnaruwa', name: 'Polonnaruwa', district: 'Polonnaruwa', latitude: 7.9403, longitude: 81.0188 },
  { id: 'puttalam', name: 'Puttalam', district: 'Puttalam', latitude: 8.0362, longitude: 79.8283 },
  { id: 'chilaw', name: 'Chilaw', district: 'Puttalam', latitude: 7.575, longitude: 79.7958 },
  { id: 'avissawella', name: 'Avissawella', district: 'Colombo', latitude: 6.953, longitude: 80.213 },
  { id: 'homagama', name: 'Homagama', district: 'Colombo', latitude: 6.8403, longitude: 80.0022 },
];
